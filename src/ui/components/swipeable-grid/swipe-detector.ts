export interface SwipeCallbacks {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onDragMove?: (offset: number) => void; // for visual feedback
    onDragEnd?: () => void; // when drag ends without swipe
}

/**
 * Detects horizontal swipes on an element, ignoring vertical scrolls.
 * Emits callbacks for swipe left/right and drag movement.
 */
export class SwipeDetector {
    private element: HTMLElement;
    private callbacks: SwipeCallbacks;
    private threshold: number = 70;
    private startX: number = 0;
    private startY: number = 0;
    private currentX: number = 0;
    private isSwiping: boolean = false;
    private isDragging: boolean = false;
    private boundTouchStart: (e: TouchEvent) => void;
    private boundTouchMove: (e: TouchEvent) => void;
    private boundTouchEnd: (e: TouchEvent) => void;
    private boundMouseDown: (e: MouseEvent) => void;
    private boundMouseMove: (e: MouseEvent) => void;
    private boundMouseUp: (e: MouseEvent) => void;
    private boundMouseLeave: () => void;

    constructor(element: HTMLElement, callbacks: SwipeCallbacks, threshold?: number) {
        this.element = element;
        this.callbacks = callbacks;
        if (threshold) this.threshold = threshold;

        this.boundTouchStart = this.handleTouchStart.bind(this);
        this.boundTouchMove = this.handleTouchMove.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);
        this.boundMouseDown = this.handleMouseDown.bind(this);
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);
        this.boundMouseLeave = this.handleMouseLeave.bind(this);

        this.attachEvents();
    }

    private attachEvents(): void {
        this.element.addEventListener('touchstart', this.boundTouchStart, { passive: false });
        this.element.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        this.element.addEventListener('touchend', this.boundTouchEnd);
        this.element.addEventListener('mousedown', this.boundMouseDown);
        this.element.addEventListener('mousemove', this.boundMouseMove);
        this.element.addEventListener('mouseup', this.boundMouseUp);
        this.element.addEventListener('mouseleave', this.boundMouseLeave);
    }

    private handleTouchStart(e: TouchEvent): void {
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.currentX = this.startX;
        this.isSwiping = true;
        this.isDragging = false;
    }

    private handleTouchMove(e: TouchEvent): void {
        if (!this.isSwiping) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - this.startX;
        const diffY = currentY - this.startY;

        // If horizontal movement dominates, consider it a swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
            e.preventDefault(); // prevent scrolling
            this.isDragging = true;
            this.currentX = currentX;
            this.callbacks.onDragMove?.(diffX);
        } else {
            // Vertical scroll – stop swipe detection
            this.isSwiping = false;
        }
    }

    private handleTouchEnd(e: TouchEvent): void {
        if (!this.isSwiping) return;
        const diffX = e.changedTouches[0].clientX - this.startX;
        if (this.isDragging && Math.abs(diffX) > this.threshold) {
            if (diffX > 0) {
                this.callbacks.onSwipeRight?.();
            } else {
                this.callbacks.onSwipeLeft?.();
            }
        } else {
            // Not a swipe – maybe a tap, but we ignore it (no callback)
            this.callbacks.onDragEnd?.();
        }
        this.reset();
    }

    private handleMouseDown(e: MouseEvent): void {
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.currentX = this.startX;
        this.isSwiping = true;
        this.isDragging = false;
    }

    private handleMouseMove(e: MouseEvent): void {
        if (!this.isSwiping) return;
        const diffX = e.clientX - this.startX;
        const diffY = e.clientY - this.startY;
        if (Math.abs(diffX) > Math.abs(diffY)) {
            e.preventDefault();
            this.isDragging = true;
            this.currentX = e.clientX;
            this.callbacks.onDragMove?.(diffX);
        } else {
            this.isSwiping = false;
        }
    }

    private handleMouseUp(e: MouseEvent): void {
        if (!this.isSwiping) return;
        const diffX = e.clientX - this.startX;
        if (this.isDragging && Math.abs(diffX) > this.threshold) {
            if (diffX > 0) {
                this.callbacks.onSwipeRight?.();
            } else {
                this.callbacks.onSwipeLeft?.();
            }
        } else {
            this.callbacks.onDragEnd?.();
        }
        this.reset();
    }

    private handleMouseLeave(): void {
        if (this.isSwiping) {
            this.callbacks.onDragEnd?.();
        }
        this.reset();
    }

    private reset(): void {
        this.isSwiping = false;
        this.isDragging = false;
    }

    public destroy(): void {
        this.element.removeEventListener('touchstart', this.boundTouchStart);
        this.element.removeEventListener('touchmove', this.boundTouchMove);
        this.element.removeEventListener('touchend', this.boundTouchEnd);
        this.element.removeEventListener('mousedown', this.boundMouseDown);
        this.element.removeEventListener('mousemove', this.boundMouseMove);
        this.element.removeEventListener('mouseup', this.boundMouseUp);
        this.element.removeEventListener('mouseleave', this.boundMouseLeave);
    }
}