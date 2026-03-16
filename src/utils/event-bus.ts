type EventCallback = () => void;

class EventBus {
    private listeners: Set<EventCallback> = new Set();

    onEditStart(callback: EventCallback): () => void {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    emitEditStart(): void {
        this.listeners.forEach(cb => cb());
    }
}

export const editModeBus = new EventBus();