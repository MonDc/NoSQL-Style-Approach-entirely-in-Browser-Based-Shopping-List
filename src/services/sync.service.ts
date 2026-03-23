import { UUID } from '../types/shopping-list.types';

export type SyncEvent = {
    type: 'ADD_ITEM' | 'UPDATE_ITEM' | 'DELETE_ITEM' | 'TOGGLE_ITEM' | 'CLEAR_COMPLETED' | 'DELIVERY_CONFIRMATION';
    listId: UUID;
    data: any;
    timestamp: number;
    sourceId: string;
    sequence?: number; // ← NEW: sequence number from server for tracking
};

export class SyncService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnect = 5;
    private listeners: ((event: SyncEvent) => void)[] = [];
    
    // ← NEW: last-seen sync properties
    private currentListId: string = '';
    private lastSequence: number = 0;

    constructor(private serverUrl: string, private clientId: string, listId: string) {
        this.currentListId = listId;
        this.loadLastSequence(); // ← NEW: restore last known sequence
        console.log('🔌 SyncService created with URL:', serverUrl);
        this.connect();
    }

    // ← NEW: load last sequence from localStorage
    private loadLastSequence(): void {
        const stored = localStorage.getItem(`last_sequence_${this.currentListId}`);
        this.lastSequence = stored ? parseInt(stored) : 0;
        console.log(`📊 Last sequence: ${this.lastSequence}`);
    }

    // ← NEW: save sequence to localStorage
    private saveLastSequence(seq: number): void {
        if (seq > this.lastSequence) {
            this.lastSequence = seq;
            localStorage.setItem(`last_sequence_${this.currentListId}`, seq.toString());
        }
    }

    // ← NEW: fetch missed events from server
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
            console.log(`📥 Fetched ${data.events?.length || 0} missed events`);
            return data.events || [];
        } catch (error) {
            console.error('Failed to fetch missed events:', error);
            return [];
        }
    }

    private connect(): void {
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = async () => {
            console.log('✅ Connected to sync server');
            this.reconnectAttempts = 0;
            
            // ← NEW: fetch missed events on reconnect
            const missed = await this.fetchMissedEvents();
            missed.forEach(event => {
                console.log(`🔄 Replaying missed event: ${event.type}`);
                this.listeners.forEach(cb => cb(event));
            });
        };

        this.ws.onmessage = (event) => {
            console.log('📩 RAW:', event.data);
            try {
                const data = JSON.parse(event.data);
                console.log('📦 PARSED:', data);
                console.log('🔍 Type:', data.type);
                console.log('🎯 Source:', data.sourceId, 'vs Client:', this.clientId);
                
                // ← NEW: update sequence if present
                if (data.sequence) {
                    this.saveLastSequence(data.sequence);
                }
                
                if (data.sourceId === this.clientId) {
                    console.log('⏭️ Ignoring own message');
                    return;
                }
                
                console.log('📢 Forwarding to listeners');
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

    public broadcast(event: any): void {
        if (!this.ws || this.ws.readyState !== 1) {
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

    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === 1;
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