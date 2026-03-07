export interface DotsIndicatorConfig {
    totalPages: number;
    currentPage: number;
    onDotClick?: (page: number) => void;
    activeColor?: string;
    inactiveColor?: string;
    dotSize?: number;
    activeDotSize?: number;
}

export class DotsIndicator {
    private element: HTMLElement;
    private config: Required<DotsIndicatorConfig>;

    constructor(config: DotsIndicatorConfig) {
        this.config = {
            activeColor: '#4CAF50',
            inactiveColor: '#ccc',
            dotSize: 8,
            activeDotSize: 10,
            onDotClick: () => {},
            ...config
        };
        this.element = this.render();
    }

    private render(): HTMLElement {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 20px;
            margin-bottom: 8px;
        `;

        for (let i = 0; i < this.config.totalPages; i++) {
            const dot = this.createDot(i);
            container.appendChild(dot);
        }

        return container;
    }

    private createDot(index: number): HTMLElement {
        const dot = document.createElement('span');
        this.updateDotStyle(dot, index === this.config.currentPage);
        
        dot.addEventListener('click', () => {
            this.config.onDotClick(index);
        });

        return dot;
    }

    private updateDotStyle(dot: HTMLElement, isActive: boolean): void {
        const size = isActive ? this.config.activeDotSize : this.config.dotSize;
        const color = isActive ? this.config.activeColor : this.config.inactiveColor;
        
        dot.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: ${color};
            transition: all 0.3s ease;
            cursor: pointer;
            display: inline-block;
        `;
    }

    public setActivePage(page: number): void {
        const dots = this.element.children;
        for (let i = 0; i < dots.length; i++) {
            this.updateDotStyle(dots[i] as HTMLElement, i === page);
        }
    }

    public getElement(): HTMLElement {
        return this.element;
    }
}