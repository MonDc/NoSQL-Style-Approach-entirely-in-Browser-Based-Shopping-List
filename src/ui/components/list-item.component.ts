import { ShoppingListItem, UUID } from '../../types/shopping-list.types';

export interface ListItemCallbacks {
    onToggle: (itemId: UUID) => Promise<void>;
    onEdit: (itemId: UUID) => void;
    onDelete: (itemId: UUID) => Promise<void>;
}

/**
 * Component for rendering a single shopping list item
 * Handles its own DOM events and appearance
 */
export class ListItemComponent {
    private element: HTMLElement;
    private item: ShoppingListItem;
    private callbacks: ListItemCallbacks;

    constructor(item: ShoppingListItem, callbacks: ListItemCallbacks) {
        this.item = item;
        this.callbacks = callbacks;
        this.element = this.render();
        this.attachEvents();
    }

    /**
     * Render the item HTML
     * @returns HTMLElement
     */
    public render(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #eee;
            background: ${this.item.status === 'completed' ? '#f9f9f9' : 'white'};
        `;
        
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <button class="toggle-btn" style="
                    background: none;
                    border: 2px solid ${this.item.status === 'completed' ? '#4CAF50' : '#ddd'};
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: ${this.item.status === 'completed' ? '#4CAF50' : 'transparent'};
                ">
                    ${this.item.status === 'completed' ? '✓' : ''}
                </button>
                
                <div style="flex: 1;">
                    <div style="
                        font-weight: bold;
                        text-decoration: ${this.item.status === 'completed' ? 'line-through' : 'none'};
                        color: ${this.item.status === 'completed' ? '#999' : '#333'};
                    ">
                        ${this.item.name}
                    </div>
                    
                    <div style="font-size: 12px; color: #666; display: flex; gap: 8px; margin-top: 4px;">
                        <span>📦 ${this.item.quantity} ${this.item.unit}</span>
                        ${this.item.category ? `<span>🏷️ ${this.item.category}</span>` : ''}
                        ${this.item.notes ? `<span>📝 ${this.item.notes}</span>` : ''}
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 8px;">
                <button class="edit-btn" style="
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 4px 8px;
                ">✏️</button>
                
                <button class="delete-btn" style="
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 4px 8px;
                    color: #ff4444;
                ">🗑️</button>
            </div>
        `;
        
        return div;
    }

    /**
     * Attach event listeners to the element
     */
    private attachEvents(): void {
        const toggleBtn = this.element.querySelector('.toggle-btn');
        const editBtn = this.element.querySelector('.edit-btn');
        const deleteBtn = this.element.querySelector('.delete-btn');

        toggleBtn?.addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.callbacks.onToggle(this.item.id);
        });

        editBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.callbacks.onEdit(this.item.id);
        });

        deleteBtn?.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`Delete "${this.item.name}"?`)) {
                await this.callbacks.onDelete(this.item.id);
            }
        });
    }

    /**
     * Get the component's DOM element
     */
    public getElement(): HTMLElement {
        return this.element;
    }

    /**
     * Update the item data and re-render
     */
    public update(item: ShoppingListItem): void {
        this.item = item;
        const newElement = this.render();
        this.element.replaceWith(newElement);
        this.element = newElement;
        this.attachEvents();
    }

    /**
     * Remove the component from DOM
     */
    public destroy(): void {
        this.element.remove();
    }
}