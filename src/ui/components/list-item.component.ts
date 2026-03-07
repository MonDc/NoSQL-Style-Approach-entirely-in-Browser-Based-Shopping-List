import { ShoppingListItem, UUID } from '../../types/shopping-list.types';
import { SwipeDetector, SwipeCallbacks } from './swipeable-grid/swipe-detector';

export interface ListItemCallbacks {
    onToggle: (itemId: UUID) => Promise<void>;
    onDelete: (itemId: UUID) => Promise<void>;
}

export class ListItemComponent {
    private element: HTMLElement;
    private item: ShoppingListItem;
    private callbacks: ListItemCallbacks;
    private swipeDetector: SwipeDetector | null = null;
    private isProcessing: boolean = false;
    private contentElement: HTMLElement | null = null;

    constructor(item: ShoppingListItem, callbacks: ListItemCallbacks) {
        this.item = item;
        this.callbacks = callbacks;
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

        div.innerHTML = `
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
                
                <!-- Item details - swipeable area -->
                <div class="item-details" style="flex: 1; min-width: 0;">
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
                        <span>📦 ${this.item.quantity} ${this.item.unit}</span>
                        ${this.item.category ? `<span>🏷️ ${this.item.category}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
        return div;
    }

    private attachEvents(): void {
        this.contentElement = this.element.querySelector('.item-content') as HTMLElement;
        const toggleBtn = this.element.querySelector('.toggle-btn') as HTMLButtonElement;

        // Toggle button click (classic way)
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleToggle();
        });

        // Swipe detection on the content area (excluding the button)
        if (this.contentElement) {
            const swipeCallbacks: SwipeCallbacks = {
                onDragMove: (offset) => {
                    if (this.isProcessing) return;
                    // Limit movement to 100px
                    const limitedOffset = Math.min(Math.abs(offset), 100) * Math.sign(offset);
                    this.contentElement!.style.transform = `translateX(${limitedOffset}px)`;
                },
                onDragEnd: () => {
                    // Reset position if no swipe
                    if (this.contentElement && !this.isProcessing) {
                        this.contentElement.style.transform = 'translateX(0)';
                    }
                },
                onSwipeRight: () => this.handleSwipeRight(),
                onSwipeLeft: () => this.handleSwipeLeft()
            };
            this.swipeDetector = new SwipeDetector(this.contentElement, swipeCallbacks, 70);
        }
    }

    private async handleToggle(): Promise<void> {
        if (this.isProcessing) return;
        this.isProcessing = true;
        try {
            await this.callbacks.onToggle(this.item.id);
            // Brief visual feedback on the button
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
        if (this.isProcessing) return;
        this.isProcessing = true;

        // Green flash and slide out
        this.element.style.backgroundColor = '#4CAF50';
        this.element.style.transition = 'all 0.3s';
        if (this.contentElement) {
            this.contentElement.style.transform = 'translateX(100%)';
        }

        try {
            await this.callbacks.onToggle(this.item.id);
            // Fade out and remove after 700ms
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
        if (this.isProcessing) return;
        this.isProcessing = true;

        // Red flash and slide out
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
        // Reset styles and processing flag
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
        this.swipeDetector?.destroy();
        this.element.remove();
    }
}