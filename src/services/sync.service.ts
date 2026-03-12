import { UUID } from '../types/shopping-list.types';

export type SyncEvent = {
    type: 'ADD_ITEM' | 'UPDATE_ITEM' | 'DELETE_ITEM' | 'TOGGLE_ITEM' | 'CLEAR_COMPLETED';
    listId: UUID;
    data: any;
    timestamp: number;
    sourceId: string;
};

export class SyncService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnect = 5;
    private listeners: ((event: SyncEvent) => void)[] = [];


    constructor(private serverUrl: string, private clientId: string) {
       console.log('🔌 Relay-Server services created with URL:', serverUrl);
       this.connect();
    }

    private connect(): void {
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = () => {
            console.log('✅ Connected to sync server');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            console.log('📩 RAW:', event.data);
            try {
                const data = JSON.parse(event.data);
                console.log('📦 PARSED:', data);
                console.log('🔍 Type:', data.type);
                console.log('🎯 Source:', data.sourceId, 'vs Client:', this.clientId);
                
                if (data.sourceId === this.clientId) {
                    console.log('⏭️ Ignoring own message');
                    return;
                }
                
                this.listeners.forEach(cb => cb(data));
            } catch (e) {
                console.error('Parse error:', e);
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

        try {
            this.ws.send(JSON.stringify(fullEvent));
            console.log('📤 Broadcast sent:', event.type); // Add this log
        } catch (error) {
            console.error('Failed to send:', error);
        }
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

    /**
     * Check if WebSocket is connected and ready
     */
    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}