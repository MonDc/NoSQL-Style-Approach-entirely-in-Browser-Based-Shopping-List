import { UUID } from '../types/shopping-list.types';

export type SyncEvent = {
    type: 'ADD_ITEM' | 'UPDATE_ITEM' | 'DELETE_ITEM' | 'TOGGLE_ITEM' | 'CLEAR_COMPLETED' | 'DELIVERY_CONFIRMATION';
    listId: UUID;
    data: any;
    timestamp: number;
    sourceId: string;
    sequence?: number;
};

export class SyncService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnect = 5;
    private listeners: ((event: SyncEvent) => void)[] = [];
    private currentListId: string = '';
    private lastSequence: number = 0;
    private isConnected = false;

    constructor(private serverUrl: string, private clientId: string) {
        console.log('🔌 SyncService created');
    }

    public setListId(listId: string): void {
        this.currentListId = listId;
        this.loadLastSequence();
        console.log(`📊 SyncService listId set to: ${listId}, lastSequence: ${this.lastSequence}`);
        
        // If already connected, fetch missed events immediately
        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
            this.fetchAndReplayMissed();
        }
    }

    private loadLastSequence(): void {
        const stored = localStorage.getItem(`last_sequence_${this.currentListId}`);
        this.lastSequence = stored ? parseInt(stored) : 0;
    }

    private saveLastSequence(seq: number): void {
        if (seq > this.lastSequence) {
            this.lastSequence = seq;
            localStorage.setItem(`last_sequence_${this.currentListId}`, seq.toString());
        }
    }

    private async fetchAndReplayMissed(): Promise<void> {
        if (!this.currentListId) {
            console.log('⏭️ No listId set, skipping missed events fetch');
            return;
        }

        const missed = await this.fetchMissedEvents();
        if (missed.length > 0) {
            console.log(`📥 Replaying ${missed.length} missed events`);
            missed.forEach(event => {
                this.listeners.forEach(cb => cb(event));
                if (event.sequence) this.saveLastSequence(event.sequence);
            });
        }
    }

    private async fetchMissedEvents(): Promise<SyncEvent[]> {
        try {
            const host = this.serverUrl.replace('ws://', '').replace('wss://', '').split(':')[0];
            const response = await fetch(`http://${host}:8080/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listId: this.currentListId,
                    lastSequence: this.lastSequence
                })
            });
            const data = await response.json();
            console.log(`📥 Fetched ${data.events?.length || 0} missed events (lastSequence: ${this.lastSequence})`);
            return data.events || [];
        } catch (error) {
            console.error('Failed to fetch missed events:', error);
            return [];
        }
    }

    public connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) return;
        
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = async () => {
            console.log('✅ Connected to sync server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Only fetch if listId is already set
            if (this.currentListId) {
                await this.fetchAndReplayMissed();
            }
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Ignore server control messages
                if (data.type === 'WELCOME' || data.type === 'CLIENT_COUNT_UPDATE' || data.type === 'DELIVERY_CONFIRMATION') {
                    return;
                }
                
                // Ignore own messages
                if (data.sourceId === this.clientId) {
                    return;
                }
                
                // Update sequence
                if (data.sequence) {
                    this.saveLastSequence(data.sequence);
                }
                
                // Forward to listeners
                this.listeners.forEach(cb => cb(data));
            } catch (e) {
                console.error('Parse error:', e);
            }
        };

        this.ws.onclose = () => {
            console.log('🔌 Disconnected from sync server');
            this.isConnected = false;
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

    public broadcast(event: any): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('⚠️ WebSocket not ready');
            return;
        }
        
        try {
            this.ws.send(JSON.stringify(event));
            console.log('📤 Broadcast sent:', event.type);
        } catch (error) {
            console.error('❌ Broadcast failed:', error);
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

    public updateListId(listId: string): void {
        console.log('🔄 SyncService updating listId to:', listId);
        this.currentListId = listId;
        this.loadLastSequence();
        
        // If already connected, fetch missed events immediately
        if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
            this.fetchAndReplayMissed();
        }
    }
}