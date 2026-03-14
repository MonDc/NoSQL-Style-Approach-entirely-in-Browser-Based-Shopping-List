// export interface TomatoLetterStripCallbacks {
//     onLetterSelect: (letter: string) => void;
// }

// export class TomatoLetterStrip {
//     private canvas: HTMLCanvasElement;
//     private ctx: CanvasRenderingContext2D;
//     private container: HTMLElement;
//     private letters: string[] = 'abcdefghijklmnopqrstuvwxyz'.split('');
    
//     // Dimensions
//     private tomatoSize = 60;
//     private tomatoGap = 20;
//     private visibleCount = 3;
//     private totalWidth: number;
    
//     // Swipe state
//     private offset = 0;
//     private minOffset: number;
//     private maxOffset: number;
//     private startX = 0;
//     private isDragging = false;
//     private animationFrame: number | null = null;
    
//     // Callbacks
//     private callbacks: TomatoLetterStripCallbacks;

//     // Track velocity for momentum
//     private lastVelocity: number = 0;

//     private touchStartX: number = 0;
//     private touchStartY: number = 0;
//     private isTap: boolean = true;

//     constructor(containerId: string, callbacks: TomatoLetterStripCallbacks) {
//         this.callbacks = callbacks;
//         this.container = document.getElementById(containerId)!;
        
//         // Calculate dimensions
//         this.totalWidth = (this.tomatoSize + this.tomatoGap) * this.letters.length;
//         this.minOffset = 0;
//         this.maxOffset = this.totalWidth - (this.tomatoSize * this.visibleCount);
        
//         // Create canvas
//         this.canvas = document.createElement('canvas');
//         this.canvas.width = this.container.clientWidth || 350;
//         this.canvas.height = 80;
//         this.canvas.style.width = '100%';
//         this.canvas.style.height = '80px';
//         this.canvas.style.display = 'block';
//         this.canvas.style.touchAction = 'none';
//         this.canvas.style.cursor = 'grab';
        
//         this.container.appendChild(this.canvas);
//         this.ctx = this.canvas.getContext('2d')!;
        
//         this.setupEvents();
//         this.draw();
//     }









//     private setupEvents(): void {

//         // Touch events
//         this.canvas.addEventListener('touchend', this.handleTouchTap.bind(this));

//         this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
//         this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
//         this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
//         // Mouse events
//         this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
//         this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
//         this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
//         this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
//         // Click detection
//         this.canvas.addEventListener('click', this.handleClick.bind(this));
        
//         // Resize
//         window.addEventListener('resize', this.handleResize.bind(this));
//     }

//     private handleTouchTap(e: TouchEvent): void {
//         // Only trigger if it wasn't a swipe
//         if (Math.abs(this.startX - e.changedTouches[0].clientX) < 10) {
//             const rect = this.canvas.getBoundingClientRect();
//             const scaleX = this.canvas.width / rect.width;
//             const touchX = e.changedTouches[0].clientX;
            
//             // Reuse click detection logic
//             const clickX = (touchX - rect.left) * scaleX;
//             this.detectTomatoHit(clickX);
//         }
//     }

// private detectTomatoHit(clickX: number): void {
//     const startX = 10; // Left margin
    
//     // The key fix: Use the SAME offset that's used for drawing
//     for (let i = 0; i < this.letters.length; i++) {
//         // This must match EXACTLY how draw() positions tomatoes
//         const tomatoX = startX + (i * (this.tomatoSize + this.tomatoGap)) - this.offset;
        
//         if (clickX >= tomatoX && clickX <= tomatoX + this.tomatoSize) {
//             console.log('✅ Selected:', this.letters[i]);
//             this.callbacks.onLetterSelect(this.letters[i]);
//             this.highlightTomato(i);
//             return;
//         }
//     }
// }

//     private handleTouchStart(e: TouchEvent): void {
//     e.preventDefault();
//     this.touchStartX = e.touches[0].clientX;
//     this.touchStartY = e.touches[0].clientY;
//     this.isTap = true; // Assume it's a tap until proven otherwise
//     this.canvas.style.cursor = 'grabbing';
//     }

//     private handleTouchMove(e: TouchEvent): void {
//         e.preventDefault();
        
//         const currentX = e.touches[0].clientX;
//         const diffX = Math.abs(currentX - this.touchStartX);
        
//         // If moved more than 10px, it's a swipe not a tap
//         if (diffX > 10) {
//             this.isTap = false;
            
//             const moveDiff = currentX - this.touchStartX;
//             this.offset = Math.max(this.minOffset, Math.min(this.maxOffset, this.offset - moveDiff * 1.5));
//             this.touchStartX = currentX;
            
//             if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
//             this.animationFrame = requestAnimationFrame(() => this.draw());
//         }
//     }

//     private handleTouchEnd(e: TouchEvent): void {
//         e.preventDefault();
        
//         // Only trigger tap if it was a tap (not a swipe)
//         if (this.isTap) {
//             const rect = this.canvas.getBoundingClientRect();
//             const scaleX = this.canvas.width / rect.width;
//             const touchX = e.changedTouches[0].clientX;
//             const clickX = (touchX - rect.left) * scaleX;
//             this.detectTomatoHit(clickX);
//         }
        
//         this.canvas.style.cursor = 'grab';
//         this.isDragging = false;
//     }

//     private handleMouseDown(e: MouseEvent): void {
//         e.preventDefault();
//         this.startX = e.clientX;
//         this.isDragging = true;
//         this.canvas.style.cursor = 'grabbing';
//     }

//     private handleMouseMove(e: MouseEvent): void {
//         if (!this.isDragging) return;
//         e.preventDefault();
        
//         const currentX = e.clientX;
//         const diff = currentX - this.startX;
        
//         this.offset = Math.max(this.minOffset, Math.min(this.maxOffset, this.offset - diff));
//         this.startX = currentX;
        
//         if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
//         this.animationFrame = requestAnimationFrame(() => this.draw());
//     }

//     private handleMouseUp(e: MouseEvent): void {
//         e.preventDefault();
//         this.isDragging = false;
//         this.canvas.style.cursor = 'grab';
//     }

//     private handleMouseLeave(): void {
//         this.isDragging = false;
//         this.canvas.style.cursor = 'grab';
//     }

//     private handleClick(e: MouseEvent): void {
//         console.log('🍅 Canvas clicked'); // ADD THIS
//         const rect = this.canvas.getBoundingClientRect();
//         const scaleX = this.canvas.width / rect.width;
//         const clickX = (e.clientX - rect.left) * scaleX;

//         this.detectTomatoHit(clickX);

//         console.log('🍅 Clicked at X:', clickX); // ADD THIS
//         // Calculate which tomato was clicked
//         const startX = this.canvas.width / 2 - (this.tomatoSize * this.visibleCount) / 2;
//         console.log('Start X:', startX); // ADD THIS

//         for (let i = 0; i < this.letters.length; i++) {
//             const tomatoX = startX + (i * (this.tomatoSize + this.tomatoGap)) - this.offset;
//             console.log(`Tomato ${i} (${this.letters[i]}) at x:`, tomatoX); // ADD THIS

//             if (clickX >= tomatoX && clickX <= tomatoX + this.tomatoSize) {
//                 console.log('✅ Hit!', this.letters[i]); // ADD THIS

//                 this.callbacks.onLetterSelect(this.letters[i]);
//                 this.highlightTomato(i);
//                 break;
//             }
//         }
//     }

//     private highlightTomato(index: number): void {
//         // Visual feedback - flash the tomato
//         let flashCount = 0;
//         const flash = () => {
//             this.draw(index);
//             flashCount++;
//             if (flashCount < 2) {
//                 setTimeout(flash, 100);
//             } else {
//                 this.draw();
//             }
//         };
//         flash();
//     }

//     private handleResize(): void {
//         this.canvas.width = this.container.clientWidth || 350;
//         this.draw();
//     }

// private draw(highlightIndex: number = -1): void {
//     this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
//     const startX = 10; // Must match detectTomatoHit
    
//     for (let i = 0; i < this.letters.length; i++) {
//         const letter = this.letters[i];
//         // MUST match the calculation in detectTomatoHit
//         const x = startX + (i * (this.tomatoSize + this.tomatoGap)) - this.offset;
        
//         if (x > -this.tomatoSize && x < this.canvas.width) {
//             this.drawTomato(x, letter, i === highlightIndex);
//         }
//     }
// }

//     private drawTomato(x: number, letter: string, highlight: boolean): void {
//         const y = 15;
//         const size = this.tomatoSize;
        
//         // Warmer, more tomato-like colors
//         const gradient = this.ctx.createRadialGradient(
//             x + size * 0.3, y + size * 0.2, 5,
//             x + size * 0.5, y + size * 0.5, size * 0.6
//         );

//         gradient.addColorStop(0, '#ff4d4d');  // Bright red center
//         gradient.addColorStop(0.5, '#e03a3a'); // Medium red
//         gradient.addColorStop(1, '#b32d2d');  // Slightly darker edge
        
//         if (highlight) {
//             gradient.addColorStop(0, '#ff8a8a');  // Lighter red
//             gradient.addColorStop(1, '#e03a3a');  // Medium red
//         } else {
//             gradient.addColorStop(0, '#ff6b6b');  // Bright red
//             gradient.addColorStop(0.5, '#e04e4e'); // Medium red
//             gradient.addColorStop(1, '#c92a2a');  // Deep red
//         }
//         this.ctx.beginPath();
//         this.ctx.ellipse(x + size/2, y + size/2, size/2, size/2.2, 0, 0, Math.PI * 2);
//         this.ctx.fillStyle = gradient;
//         this.ctx.fill();
        
//         // Add stem
//         this.ctx.beginPath();
//         this.ctx.moveTo(x + size/2 - 5, y + 5);
//         this.ctx.lineTo(x + size/2, y - 3);
//         this.ctx.lineTo(x + size/2 + 5, y + 5);
//         this.ctx.fillStyle = '#2b8c3e';
//         this.ctx.fill();
        
//         // Add leaf
//         this.ctx.beginPath();
//         this.ctx.ellipse(x + size/2 - 2, y - 2, 4, 2, -0.2, 0, Math.PI * 2);
//         this.ctx.fillStyle = '#51cf66';
//         this.ctx.fill();
        
//         // Draw letter
//         this.ctx.font = `bold ${size * 0.35}px 'Arial', sans-serif`;
//         this.ctx.fillStyle = 'white';
//         this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
//         this.ctx.shadowBlur = 8;
//         this.ctx.shadowOffsetY = 2;
//         this.ctx.textAlign = 'center';
//         this.ctx.textBaseline = 'middle';
//         this.ctx.fillText(letter, x + size/2, y + size/2 - 2);
        
//         // Reset shadow
//         this.ctx.shadowColor = 'transparent';
             
//         // Add highlight for shine
//         this.ctx.beginPath();
//         this.ctx.arc(x + size * 0.25, y + size * 0.2, size * 0.1, 0, Math.PI * 2);
//         this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
//         this.ctx.fill();
//     }

//     public destroy(): void {
//         if (this.animationFrame) {
//             cancelAnimationFrame(this.animationFrame);
//         }
//         this.canvas.remove();
//     }
// }