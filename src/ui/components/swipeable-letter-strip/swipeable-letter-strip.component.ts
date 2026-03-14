export interface SwipeableLetterStripCallbacks {
    onLetterSelect: (letter: string) => void;
    onPageChange?: (page: number) => void;
}

export class SwipeableLetterStrip {
    private element: HTMLElement;
    private letters: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
    private callbacks: SwipeableLetterStripCallbacks;
    
    // Dimensions
    private itemWidth = 70; // 60px tomato + 10px gap
    private visibleCount = 3;
    private totalItems: number;
    
    // Swipe state - exactly like SwipeableGrid
    private currentPage: number = 0;
    private totalPages: number;
    private startX: number = 0;
    private isSwiping: boolean = false;
    private currentTranslate: number = 0;
    private track!: HTMLElement;

    constructor(containerId: string, callbacks: SwipeableLetterStripCallbacks) {
        this.callbacks = callbacks;
        this.totalItems = this.letters.length;
        this.totalPages = Math.ceil(this.totalItems / this.visibleCount);
        
        const container = document.getElementById(containerId);
        if (!container) throw new Error(`Container ${containerId} not found`);
        
        this.element = this.render();
        container.appendChild(this.element);
        this.attachEvents();
    }










    private render(): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'swipeable-letter-strip';
        wrapper.style.cssText = `
            width: 100%;
            position: relative;
            overflow: hidden;
            touch-action: pan-y pinch-zoom;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            margin: 10px 0;
        `;

        // Track that moves
        this.track = document.createElement('div');
        this.track.style.cssText = `
            display: flex;
            transition: transform 0.3s ease-out;
            transform: translateX(0);
            will-change: transform;
        `;

        // Create pages
        for (let i = 0; i < this.totalPages; i++) {
            this.track.appendChild(this.createPage(i));
        }

        wrapper.appendChild(this.track);
        return wrapper;
    }

    private createPage(pageIndex: number): HTMLElement {
        const page = document.createElement('div');
        page.style.cssText = `
            flex: 0 0 100%;
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 10px 0;
            gap: 10px;
        `;

        const startIdx = pageIndex * this.visibleCount;
        const pageLetters = this.letters.slice(startIdx, startIdx + this.visibleCount);

        pageLetters.forEach(letter => {
            page.appendChild(this.createLetterButton(letter));
        });

        return page;
    }

    private createLetterButton(letter: string): HTMLElement {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.setAttribute('data-letter', letter);
        btn.style.cssText = `
            flex: 1;
            aspect-ratio: 1;
            max-width: 70px;
            border: none;
            background: transparent;
            cursor: pointer;
            padding: 0;
            transition: transform 0.2s;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        // Draw tomato with letter using canvas or HTML
        btn.innerHTML = `
            <div style="position: relative; width: 60px; height: 60px;">
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a);
                    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                "></div>
                <div style="
                    position: absolute;
                    top: 10%;
                    left: 20%;
                    width: 20%;
                    height: 20%;
                    background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
                    border-radius: 50%;
                "></div>
                <div style="
                    position: absolute;
                    top: -5px;
                    left: 45%;
                    width: 8px;
                    height: 15px;
                    background: #2b8c3e;
                    border-radius: 20% 20% 50% 50%;
                    transform: rotate(-10deg);
                "></div>
                <div style="
                    position: absolute;
                    top: -8px;
                    left: 42%;
                    width: 10px;
                    height: 6px;
                    background: #51cf66;
                    border-radius: 50%;
                    transform: rotate(-20deg);
                "></div>
                <span style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-weight: bold;
                    font-size: 24px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    z-index: 2;
                ">${letter.toUpperCase()}</span>
            </div>
        `;

        btn.addEventListener('click', () => {
            this.callbacks.onLetterSelect(letter);
        });

        return btn;
    }

    private attachEvents(): void {
        // Touch events - exactly like SwipeableGrid
        this.track.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.track.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.track.addEventListener('touchend', this.handleTouchEnd.bind(this));

        // Mouse events for desktop
        this.track.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.track.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.track.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.track.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

        this.track.addEventListener('dragstart', (e) => e.preventDefault());
    }

    private handleTouchStart(e: TouchEvent): void {
        this.startX = e.touches[0].clientX;
        this.isSwiping = true;
        this.track.style.transition = 'none';
    }

    private handleTouchMove(e: TouchEvent): void {
        if (!this.isSwiping) return;
        e.preventDefault();

        const currentX = e.touches[0].clientX;
        const diff = currentX - this.startX;
        this.currentTranslate = diff;

        const baseTransform = -this.currentPage * 100;
        const newTransform = baseTransform + (this.currentTranslate / this.track.parentElement!.offsetWidth) * 100;
        this.track.style.transform = `translateX(${newTransform}%)`;
    }

    private handleTouchEnd(e: TouchEvent): void {
        if (!this.isSwiping) return;

        const diff = e.changedTouches[0].clientX - this.startX;
        const threshold = 30;

        this.track.style.transition = 'transform 0.3s ease-out';

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.goToPage(this.currentPage - 1);
            } else {
                this.goToPage(this.currentPage + 1);
            }
        } else {
            this.goToPage(this.currentPage);
        }

        this.isSwiping = false;
    }

    // Mouse events (mirror touch events)
    private handleMouseDown(e: MouseEvent): void {
        this.startX = e.clientX;
        this.isSwiping = true;
        this.track.style.transition = 'none';
    }

    private handleMouseMove(e: MouseEvent): void {
        if (!this.isSwiping) return;
        e.preventDefault();

        const currentX = e.clientX;
        const diff = currentX - this.startX;
        this.currentTranslate = diff;

        const baseTransform = -this.currentPage * 100;
        const newTransform = baseTransform + (this.currentTranslate / this.track.parentElement!.offsetWidth) * 100;
        this.track.style.transform = `translateX(${newTransform}%)`;
    }

    private handleMouseUp(e: MouseEvent): void {
        if (!this.isSwiping) return;

        const diff = e.clientX - this.startX;
        const threshold = 30;

        this.track.style.transition = 'transform 0.3s ease-out';

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.goToPage(this.currentPage - 1);
            } else {
                this.goToPage(this.currentPage + 1);
            }
        } else {
            this.goToPage(this.currentPage);
        }

        this.isSwiping = false;
    }

    private handleMouseLeave(): void {
        if (this.isSwiping) {
            this.goToPage(this.currentPage);
            this.isSwiping = false;
        }
    }

    private goToPage(page: number): void {
        let newPage = page;

        // Infinite loop
        if (page < 0) {
            newPage = this.totalPages - 1;
        } else if (page >= this.totalPages) {
            newPage = 0;
        }

        if (newPage !== this.currentPage) {
            this.currentPage = newPage;
            if (this.callbacks.onPageChange) {
                this.callbacks.onPageChange(newPage);
            }
        }

        this.track.style.transform = `translateX(-${this.currentPage * 100}%)`;
    }

    public getElement(): HTMLElement {
        return this.element;
    }

    public destroy(): void {
        this.element.remove();
    }
}