import { ShoppingList, ShoppingListItem, UUID } from '../types/shopping-list.types';

export type SyncEvent = {
    type: 'ADD_ITEM' | 'UPDATE_ITEM' | 'DELETE_ITEM' | 'TOGGLE_ITEM' | 'CLEAR_COMPLETED';
    listId: UUID;
    data: any;
    timestamp: number;
    sourceId: string;
};

export class SyncService {
    private ws: WebSocket | null = null;
    private clientId: string;
    private reconnectAttempts = 0;
    private maxReconnect = 5;
    private listeners: ((event: SyncEvent) => void)[] = [];

    constructor(private serverUrl: string) {
        this.connect();
    }

    private generateClientId(): string {
        return 'client_' + Math.random().toString(36).substr(2, 9);
    }

    private connect(): void {
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = () => {
            console.log('✅ Connected to sync server');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            try {
                const syncEvent: SyncEvent = JSON.parse(event.data);
                
                // Ignore events from this client
                if (syncEvent.sourceId === this.clientId) return;
                
                console.log('📨 Received sync event:', syncEvent.type);
                this.listeners.forEach(cb => cb(syncEvent));
                
            } catch (error) {
                console.error('Failed to parse sync message:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('🔌 Disconnected from sync server');
            this.reconnect();
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    /**
     * Check if WebSocket is connected and ready
     */
    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    private reconnect(): void {
        if (this.reconnectAttempts < this.maxReconnect) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... attempt ${this.reconnectAttempts}`);
            setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
    }

    public broadcast(event: Omit<SyncEvent, 'sourceId' | 'timestamp'>): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('⚠️ Not connected to sync server');
            return;
        }

        const fullEvent: SyncEvent = {
            ...event,
            sourceId: this.clientId,
            timestamp: Date.now()
        };

        this.ws.send(JSON.stringify(fullEvent));
    }

    public onSync(callback: (event: SyncEvent) => void): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    public disconnect(): void {
        this.ws?.close();
    }
}