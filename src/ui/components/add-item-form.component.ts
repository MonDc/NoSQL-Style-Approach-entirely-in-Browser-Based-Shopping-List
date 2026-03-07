import { Unit, Priority } from '../../types/shopping-list.types';

export interface AddItemFormCallbacks {
    onSubmit: (itemData: {
        name: string;
        quantity: number;
        unit: Unit;
        priority?: Priority;
        category?: string;
        notes?: string;
    }) => Promise<void>;
}

/**
 * Component for adding new items to the shopping list
 * Provides form inputs with validation
 */
export class AddItemFormComponent {
    private element: HTMLElement;
    private callbacks: AddItemFormCallbacks;
    private isSubmitting: boolean = false;

    constructor(callbacks: AddItemFormCallbacks) {
        this.callbacks = callbacks;
        this.element = this.render();
        this.attachEvents();
    }

    /**
     * Render the form HTML
     */
    private render(): HTMLElement {
        const form = document.createElement('form');
        form.className = 'add-item-form';
        form.style.cssText = `
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        `;
        
        form.innerHTML = `
            <h4 style="margin: 0 0 15px 0;">Add New Item</h4>
            
            <div style="display: grid; gap: 12px;">
                <!-- Name input -->
                <div>
                    <label style="display: block; margin-bottom: 4px; font-size: 14px;">
                        Item Name *
                    </label>
                    <input 
                        type="text" 
                        id="item-name" 
                        required
                        placeholder="e.g., Milk, Eggs, Bread"
                        style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            font-size: 14px;
                        "
                    />
                </div>
                
                <!-- Quantity and Unit row -->
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px;">
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-size: 14px;">
                            Quantity *
                        </label>
                        <input 
                            type="number" 
                            id="item-quantity" 
                            required
                            min="0.1"
                            step="0.1"
                            value="1"
                            style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                font-size: 14px;
                            "
                        />
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-size: 14px;">
                            Unit *
                        </label>
                        <select 
                            id="item-unit"
                            style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                font-size: 14px;
                                background: white;
                            "
                        >
                            ${Object.values(Unit).map(unit => 
                                `<option value="${unit}">${unit}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- Category and Priority row -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-size: 14px;">
                            Category
                        </label>
                        <input 
                            type="text" 
                            id="item-category"
                            placeholder="e.g., Dairy"
                            style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                font-size: 14px;
                            "
                        />
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 4px; font-size: 14px;">
                            Priority
                        </label>
                        <select 
                            id="item-priority"
                            style="
                                width: 100%;
                                padding: 8px;
                                border: 1px solid #ddd;
                                border-radius: 4px;
                                font-size: 14px;
                                background: white;
                            "
                        >
                            <option value="">None</option>
                            ${Object.values(Priority).map(priority => 
                                `<option value="${priority}">${priority}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- Notes -->
                <div>
                    <label style="display: block; margin-bottom: 4px; font-size: 14px;">
                        Notes
                    </label>
                    <textarea 
                        id="item-notes"
                        rows="2"
                        placeholder="Additional notes..."
                        style="
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            font-size: 14px;
                            resize: vertical;
                        "
                    ></textarea>
                </div>
                
                <!-- Submit button -->
                <button 
                    type="submit"
                    id="submit-item"
                    style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 12px;
                        border-radius: 4px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        margin-top: 8px;
                    "
                >
                    ➕ Add to List
                </button>
            </div>
        `;
        
        return form;
    }

    /**
     * Attach form submission handler
     */
    private attachEvents(): void {
        this.element.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (this.isSubmitting) return;
            
            try {
                this.isSubmitting = true;
                const submitBtn = this.element.querySelector('#submit-item') as HTMLButtonElement;
                submitBtn.textContent = 'Adding...';
                submitBtn.disabled = true;
                
                // Get form values
                const name = (this.element.querySelector('#item-name') as HTMLInputElement).value.trim();
                const quantity = parseFloat((this.element.querySelector('#item-quantity') as HTMLInputElement).value);
                const unit = (this.element.querySelector('#item-unit') as HTMLSelectElement).value as Unit;
                const category = (this.element.querySelector('#item-category') as HTMLInputElement).value.trim() || undefined;
                const priority = (this.element.querySelector('#item-priority') as HTMLSelectElement).value as Priority || undefined;
                const notes = (this.element.querySelector('#item-notes') as HTMLTextAreaElement).value.trim() || undefined;
                
                // Validate
                if (!name) {
                    alert('Please enter an item name');
                    return;
                }
                
                if (isNaN(quantity) || quantity <= 0) {
                    alert('Please enter a valid quantity');
                    return;
                }
                
                // Submit
                await this.callbacks.onSubmit({
                    name,
                    quantity,
                    unit,
                    category,
                    priority,
                    notes
                });
                
                // Clear form on success
                this.clearForm();
                
            } catch (error) {
                console.error('Error adding item:', error);
                alert('Failed to add item. Please try again.');
            } finally {
                this.isSubmitting = false;
                const submitBtn = this.element.querySelector('#submit-item') as HTMLButtonElement;
                submitBtn.textContent = '➕ Add to List';
                submitBtn.disabled = false;
            }
        });
    }

    /**
     * Clear all form fields
     */
    private clearForm(): void {
        (this.element.querySelector('#item-name') as HTMLInputElement).value = '';
        (this.element.querySelector('#item-quantity') as HTMLInputElement).value = '1';
        (this.element.querySelector('#item-category') as HTMLInputElement).value = '';
        (this.element.querySelector('#item-notes') as HTMLTextAreaElement).value = '';
        (this.element.querySelector('#item-priority') as HTMLSelectElement).value = '';
    }

    /**
     * Get the component's DOM element
     */
    public getElement(): HTMLElement {
        return this.element;
    }

    /**
     * Clean up
     */
    public destroy(): void {
        this.element.remove();
    }
}