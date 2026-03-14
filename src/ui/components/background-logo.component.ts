import { ASSETS } from '../../config/assets.config';

export class BackgroundLogo {
    private element: HTMLElement;

    constructor(containerId: string, opacity: number = 0.1) {
        this.element = this.render(opacity);
        this.mount(containerId);
    }

    private render(opacity: number): HTMLElement {
        const div = document.createElement('div');
        div.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: ${opacity};
            pointer-events: none;
            z-index: 0;
        `;
        div.innerHTML = ASSETS.SHOPPING_CART_SVG;
        return div;
    }

    private mount(containerId: string): void {
        const container = document.getElementById(containerId);
        if (container) {
            // Ensure container has position relative for absolute positioning
            container.style.position = 'relative';
            container.appendChild(this.element);
        }
    }

    public destroy(): void {
        this.element.remove();
    }
}