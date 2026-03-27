/**
 * Reset application data
 * Clears IndexedDB and localStorage, then reloads
 */
export function resetApp(confirmMessage?: string): void {
    const defaultMessage = '⚠️ Reset ALL data?\n\nThis will clear your shopping lists and sync history.';
    
    if (confirm(confirmMessage || defaultMessage)) {
        console.log('🧹 Resetting application data...');
        
        const dbDeleteRequest = indexedDB.deleteDatabase('shopping-list-app');
        dbDeleteRequest.onsuccess = () => {
            console.log('✅ IndexedDB cleared');
            localStorage.clear();
            console.log('✅ localStorage cleared');
            console.log('🔄 Reloading page...');
            location.reload();
        };
        dbDeleteRequest.onerror = () => {
            console.error('❌ Failed to delete database');
            alert('Failed to reset. Please refresh manually.');
        };
    }
}