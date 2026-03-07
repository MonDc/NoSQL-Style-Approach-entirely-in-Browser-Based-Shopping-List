import { CatalogProduct } from '../../../types/shopping-list.types';

export interface SwipeableGridConfig {
    rows: number;        // 2
    columns: number;     // 2
    itemsPerPage: number; // rows * columns = 4
    showDots?: boolean;
    infinite?: boolean;
    swipeThreshold?: number;
}

export interface SwipeableGridCallbacks {
    onItemClick: (product: CatalogProduct) => void;
    onPageChange?: (page: number) => void;
}