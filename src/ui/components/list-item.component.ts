import { ShoppingListItem, UUID, Unit } from '../../types/shopping-list.types';
import { editModeBus } from '../../utils/event-bus';
import { SwipeDetector, SwipeCallbacks } from './swipeable-grid/swipe-detector';
import { ProductCardFactory } from '../components/swipeable-grid/product-card.factory';

export interface ListItemCallbacks {
    onToggle: (itemId: UUID) => Promise<void>;
    onDelete: (itemId: UUID) => Promise<void>;
    onUpdate?: (itemId: UUID, newName: string, newQuantity?: number, newUnit?: string) => Promise<void>;
}

export class ListItemComponent {
    private element: HTMLElement;
    private item: ShoppingListItem;
    private callbacks: ListItemCallbacks;
    private swipeDetector: SwipeDetector | null = null;
    private isProcessing: boolean = false;
    private contentElement: HTMLElement | null = null;
    private isEditing: boolean = false;
    private documentClickHandler: ((e: MouseEvent) => void) | null = null;
    private longPressTimer: number | null = null;
    private readonly LONG_PRESS_DURATION = 500; // 500ms
    private unsubscribeFromBus: (() => void) | null = null;

    constructor(item: ShoppingListItem, callbacks: ListItemCallbacks) {
        this.item = item;
        this.callbacks = callbacks;
        // Listen for other items starting edit
        this.unsubscribeFromBus = editModeBus.onEditStart(() => {
            if (this.isEditing) {
                this.saveEdit(); // Or cancelEdit() based on preference
            }
        });
    
        this.element = this.render();
        this.attachEvents();
    }










    public render(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.setAttribute('data-item-id', this.item.id);
        div.style.cssText = `
            position: relative;
            width: 100%;
            margin-bottom: 8px;
            border-radius: 12px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: opacity 0.3s ease, transform 0.3s ease;
        `;

        // Always render the view mode content first
        div.innerHTML = this.renderViewMode();

        // If in edit mode, add the overlay on top
        if (this.isEditing) {
            const overlay = document.createElement('div');
            overlay.className = 'edit-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10;
                pointer-events: auto;
            `;
            overlay.innerHTML = this.renderEditOverlay();
            div.appendChild(overlay);

            // Make the original content semi-transparent to preserve layout
            const itemContent = div.querySelector('.item-content') as HTMLElement;
            if (itemContent) {
                itemContent.style.opacity = '0.3';
                itemContent.style.pointerEvents = 'none';
            }
        }
        
        return div;
    }

    private renderViewMode(): string {
        return `
            <div class="item-content" style="
                position: relative;
                background: white;
                padding: 16px;
                display: flex;
                align-items: center;
                border: 1px solid #eee;
                border-radius: 12px;
                transition: transform 0.2s ease;
                will-change: transform;
            ">
                <!-- Toggle button - always clickable -->
                <button class="toggle-btn" style="
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 2px solid ${this.item.status === 'completed' ? '#4CAF50' : '#ddd'};
                    background: ${this.item.status === 'completed' ? '#4CAF50' : 'transparent'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    padding: 0;
                    outline: none;
                    margin-right: 12px;
                    flex-shrink: 0;
                ">
                    ${this.item.status === 'completed' ? '✓' : ''}
                </button>
                
                <!-- Item details - double-click to edit -->
                <div class="item-details" style="flex: 1; min-width: 0; cursor: text;">
                    <div style="
                        font-weight: 600;
                        text-decoration: ${this.item.status === 'completed' ? 'line-through' : 'none'};
                        color: ${this.item.status === 'completed' ? '#999' : '#333'};
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    ">
                        ${this.item.name}
                    </div>
                    <div style="font-size: 12px; color: #666; display: flex; gap: 8px; margin-top: 4px;">
                        <span>🏷️ ${this.item.quantity} ${this.item.unit}</span>
                        ${this.item.category ? `<span>${ProductCardFactory.getEmoji(this.item.name)} ${this.item.category}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    private renderEditOverlay(): string {
        return `
            <div class="item-content edit-mode" style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: white;
                padding: 16px;
                display: flex;
                align-items: center;
                border: 2px solid #2196F3;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
                z-index: 10;
            ">
                <!-- Toggle placeholder (same size as original) -->
                <div style="
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 2px solid #ddd;
                    background: transparent;
                    margin-right: 12px;
                    flex-shrink: 0;
                "></div>

                <!-- Edit fields -->
                <div style="flex: 1; min-width: 0;">
                    <input
                        type="text"
                        class="edit-name"
                        value="${this.item.name}"
                        style="
                            width: 100%;
                            font-weight: 600;
                            font-size: 16px;
                            border: none;
                            border-bottom: 1px solid #2196F3;
                            outline: none;
                            background: transparent;
                            padding: 0;
                            margin: 0;
                            line-height: 1.4;
                            color: #333;
                        "
                    />
                    <div style="font-size: 12px; color: #666; display: flex; gap: 8px; margin-top: 4px;">
                        <span>📦</span>
                        <input
                            type="number"
                            class="edit-quantity"
                            value="${this.item.quantity}"
                            min="0.1"
                            step="0.1"
                            style="
                                width: 50px;
                                padding: 2px 4px;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                font-size: 12px;
                            "
                        />
                        <select class="edit-unit" style="
                            padding: 2px 4px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            font-size: 12px;
                            background: white;
                        ">
                            <option value="piece" ${this.item.unit === Unit.PIECE ? 'selected' : ''}>piece</option>
                            <option value="kg" ${this.item.unit === Unit.KILOGRAM ? 'selected' : ''}>kg</option>
                            <option value="g" ${this.item.unit === Unit.GRAM ? 'selected' : ''}>g</option>
                            <option value="liter" ${this.item.unit === Unit.LITER ? 'selected' : ''}>liter</option>
                            <option value="ml" ${this.item.unit === Unit.MILLILITER ? 'selected' : ''}>ml</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    private attachEvents(): void {
        this.contentElement = this.element.querySelector('.item-content') as HTMLElement;
        const toggleBtn = this.element.querySelector('.toggle-btn') as HTMLButtonElement;
        const details = this.element.querySelector('.item-details');

        // Toggle button click
        toggleBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleToggle();
        });

        // Double-click on details to edit (desktop)
        details?.addEventListener('dblclick', (e: MouseEvent) => {
            e.stopPropagation();
            this.enterEditMode();
        });

        // EDIT MODE EVENTS
        if (this.isEditing) {
            const nameInput = this.element.querySelector('.edit-name') as HTMLInputElement;
            // @ts-ignore
            const quantityInput = this.element.querySelector('.edit-quantity') as HTMLInputElement;
            // @ts-ignore
            const unitSelect = this.element.querySelector('.edit-unit') as HTMLSelectElement;
            
            nameInput?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveEdit();
                }
            });
            
            this.documentClickHandler = this.handleDocumentClick.bind(this);
            setTimeout(() => {
                document.addEventListener('click', this.documentClickHandler!);
            }, 0);
        }

        // SWIPE + LONG-PRESS (only when not editing)
        if (this.contentElement && !this.isEditing) {
            let isPotentialSwipe = false;
            let startX = 0;
            let startY = 0;
            
            // Unified touch start handler
            const touchStartHandler = (e: TouchEvent) => {
                e.stopPropagation();
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isPotentialSwipe = false;
                
                // Start long-press timer
                this.longPressTimer = window.setTimeout(() => {
                    // Only trigger if we haven't moved much (not a swipe)
                    if (!isPotentialSwipe) {
                        this.enterEditMode();
                    }
                    this.longPressTimer = null;
                }, this.LONG_PRESS_DURATION);
            };
            
            // Unified touch move handler
            const touchMoveHandler = (e: TouchEvent) => {
                if (!this.longPressTimer && !this.swipeDetector) return;
                
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const diffX = Math.abs(currentX - startX);
                const diffY = Math.abs(currentY - startY);
                
                // If horizontal movement dominates, it's a swipe attempt
                if (diffX > diffY && diffX > 10) {
                    isPotentialSwipe = true;
                    
                    // Cancel long-press
                    if (this.longPressTimer) {
                        clearTimeout(this.longPressTimer);
                        this.longPressTimer = null;
                    }
                }
                
                // Let swipe detector handle the movement
                if (this.swipeDetector) {
                    // The swipe detector will process via its own handlers
                    // We just need to ensure we're not blocking it
                }
            };
            
            // Unified touch end handler
            const touchEndHandler = () => {
                if (this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                }
                
                // If it wasn't a swipe, it might be a tap - do nothing special
                // Swipe detector will handle swipe completion
            };
            
            // Attach unified touch handlers
            this.contentElement.addEventListener('touchstart', touchStartHandler);
            this.contentElement.addEventListener('touchmove', touchMoveHandler);
            this.contentElement.addEventListener('touchend', touchEndHandler);
            this.contentElement.addEventListener('touchcancel', touchEndHandler);

            // Swipe detection (still works independently)
            const swipeCallbacks: SwipeCallbacks = {
                onDragMove: (offset) => {
                    if (this.isProcessing || this.isEditing) return;
                    const limitedOffset = Math.min(Math.abs(offset), 100) * Math.sign(offset);
                    this.contentElement!.style.transform = `translateX(${limitedOffset}px)`;
                },
                onDragEnd: () => {
                    if (this.contentElement && !this.isProcessing && !this.isEditing) {
                        this.contentElement.style.transform = 'translateX(0)';
                    }
                },
                onSwipeRight: () => this.handleSwipeRight(),
                onSwipeLeft: () => this.handleSwipeLeft()
            };
            
            this.swipeDetector = new SwipeDetector(this.contentElement, swipeCallbacks, 70);
        } else if (this.swipeDetector) {
            this.swipeDetector.destroy();
            this.swipeDetector = null;
        }
    }

    private handleDocumentClick(e: MouseEvent): void {
        if (this.isEditing && !this.element.contains(e.target as Node)) {
            this.saveEdit();
        }
    }

    private enterEditMode(): void {
        if (this.isProcessing || this.isEditing) return;
        
        // Notify all other items that we're starting edit
        editModeBus.emitEditStart();
        
        this.isEditing = true;
        this.reRender();
    }

    private async saveEdit(): Promise<void> {
        if (this.documentClickHandler) {
            document.removeEventListener('click', this.documentClickHandler);
            this.documentClickHandler = null;
        }

        const nameInput = this.element.querySelector('.edit-name') as HTMLInputElement;
        const quantityInput = this.element.querySelector('.edit-quantity') as HTMLInputElement;
        const unitSelect = this.element.querySelector('.edit-unit') as HTMLSelectElement;
        
        const newName = nameInput?.value.trim();
        const newQuantity = quantityInput ? parseFloat(quantityInput.value) : this.item.quantity;
        const newUnit = unitSelect?.value as any || this.item.unit;
        
        console.log('💾 saveEdit called', { newName, newQuantity, newUnit });

        // Save even if name didn't change (quantity/unit might have changed)
        if (newName && this.callbacks.onUpdate) {
            const nameChanged = newName !== this.item.name;
            const quantityChanged = newQuantity !== this.item.quantity;
            const unitChanged = newUnit !== this.item.unit;
            
            if (nameChanged || quantityChanged || unitChanged) {
                console.log('💾 Calling onUpdate with changes:', { nameChanged, quantityChanged, unitChanged });
                await this.callbacks.onUpdate(this.item.id, newName, newQuantity, newUnit);
            } else {
                console.log('💾 No changes detected, skipping save');
            }
        }
        
        this.isEditing = false;
        this.reRender();
    }

    private reRender(): void {
        const newElement = this.render();
        this.element.replaceWith(newElement);
        this.element = newElement;
        this.attachEvents();
    }

    private async handleToggle(): Promise<void> {
        if (this.isProcessing) return;
        this.isProcessing = true;
        try {
            await this.callbacks.onToggle(this.item.id);
            const btn = this.element.querySelector('.toggle-btn') as HTMLElement;
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
                this.isProcessing = false;
            }, 200);
        } catch (error) {
            console.error('Toggle failed:', error);
            this.isProcessing = false;
        }
    }

    private async handleSwipeRight(): Promise<void> {
        if (this.isProcessing || this.isEditing) return;
        this.isProcessing = true;

        this.element.style.backgroundColor = '#4CAF50';
        this.element.style.transition = 'all 0.3s';
        if (this.contentElement) {
            this.contentElement.style.transform = 'translateX(100%)';
        }

        try {
            await this.callbacks.onToggle(this.item.id);
            setTimeout(() => {
                this.element.style.opacity = '0';
                this.element.style.transform = 'translateX(20px)';
                setTimeout(() => this.element.remove(), 300);
            }, 700);
        } catch (error) {
            console.error('Swipe right failed:', error);
            this.resetAfterFailedSwipe();
        }
    }

    private async handleSwipeLeft(): Promise<void> {
        if (this.isProcessing || this.isEditing) return;
        this.isProcessing = true;

        this.element.style.backgroundColor = '#ff4444';
        this.element.style.transition = 'all 0.3s';
        if (this.contentElement) {
            this.contentElement.style.transform = 'translateX(-100%)';
        }

        try {
            await this.callbacks.onDelete(this.item.id);
            setTimeout(() => {
                this.element.style.opacity = '0';
                this.element.style.transform = 'translateX(-20px)';
                setTimeout(() => this.element.remove(), 300);
            }, 700);
        } catch (error) {
            console.error('Swipe left failed:', error);
            this.resetAfterFailedSwipe();
        }
    }

    private resetAfterFailedSwipe(): void {
        this.element.style.backgroundColor = '';
        this.element.style.transition = '';
        if (this.contentElement) {
            this.contentElement.style.transform = 'translateX(0)';
        }
        this.isProcessing = false;
    }

    public getElement(): HTMLElement {
        return this.element;
    }

    public update(item: ShoppingListItem): void {
        this.item = item;
        const newElement = this.render();
        this.element.replaceWith(newElement);
        this.element = newElement;
        this.attachEvents();
    }

    public destroy(): void {
        if (this.unsubscribeFromBus) {
            this.unsubscribeFromBus();
        }

        if (this.documentClickHandler) {
            document.removeEventListener('click', this.documentClickHandler);
        }
        this.swipeDetector?.destroy();
        this.element.remove();
    }
}