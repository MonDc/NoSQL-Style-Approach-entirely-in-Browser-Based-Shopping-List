import { CatalogProduct } from '../../../types/shopping-list.types';

// ============ CONFIGURATION ============
export interface GridDimensions {
    rows: number;
    columns: number;
    gap?: number;
}

export interface GridBehavior {
    infinite?: boolean;
    swipeThreshold?: number;
    showDots?: boolean;
    transitionDuration?: number;
}

export interface GridStyling {
    // Card styling
    cardBackground?: string;
    cardBorder?: string;
    cardShadow?: string;
    cardPadding?: string;        // ← Add this
    cardBorderRadius?: string;    // ← Add this
    cardHoverScale?: number;
    cardTapScale?: number;
    
    // Text styling
    emojiSize?: string;
    nameFontSize?: string;
    categoryFontSize?: string;
    
    // Colors
    dotActiveColor?: string;
    dotInactiveColor?: string;
}

// ============ CALLBACKS ============
export interface SwipeableGridCallbacks {
    onItemClick: (product: CatalogProduct) => void;
    onPageChange?: (page: number) => void;
    onSwipeStart?: () => void;
    onSwipeEnd?: () => void;
}

// ============ CONFIG ============
export interface SwipeableGridConfig {
    dimensions: GridDimensions;
    behavior?: GridBehavior;
    styling?: GridStyling;
}

// ============ STATE ============
export interface SwipeableGridState {
    currentPage: number;
    totalPages: number;
    isSwiping: boolean;
    startX: number;
    currentTranslate: number;
}

// ============ FACTORY ============
export interface ProductCardConfig {
    product: CatalogProduct;
    styling: Required<GridStyling>;  // Now includes cardPadding
    callbacks: {
        onClick: (product: CatalogProduct) => void;
        onTouchStart?: () => void;
        onTouchEnd?: () => void;
    };
}