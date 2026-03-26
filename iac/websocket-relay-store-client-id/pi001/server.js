const WebSocket = require('ws');
const http = require('http');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const PORT = 8080;
const PING_INTERVAL = 30000;
const MAX_MESSAGE_SIZE = 1024 * 100;

// Database setup with new event_id column
const DB_FILE = 'swipetomaten_sync_sqlite.db';

// Delete existing database to start fresh
const fs = require('fs');
if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
    console.log('🗑️ Removed old database, starting fresh');
}

const db = new sqlite3.Database(DB_FILE);
db.run(`
    CREATE TABLE IF NOT EXISTS sync_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT UNIQUE NOT NULL,
        list_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        source_id TEXT NOT NULL
    )
`, (err) => {
    if (err) console.error('❌ Database init error:', err);
    else console.log('✅ SQLite database ready with event_id column');
});

// Store clientId mapping (WebSocket -> clientId)
const clientIdMap = new Map();

// Function to save events with event_id
function saveEvent(event, sourceId) {
    const { type, listId, data, timestamp, eventId } = event;
    const eventData = JSON.stringify(data);
    
    // Generate eventId if not provided (for backward compatibility)
    const finalEventId = eventId || crypto.randomUUID();
    
    console.log(`💾 Saving event: ${type} for list ${listId} from ${sourceId} (eventId: ${finalEventId})`);
    
    db.run(
        `INSERT OR IGNORE INTO sync_events 
        (event_id, list_id, event_type, event_data, timestamp, source_id)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [finalEventId, listId, type, eventData, timestamp || Date.now(), sourceId],
        (err) => {
            if (err) console.error('❌ Save error:', err);
            else console.log(`💾 Saved (or ignored duplicate) event: ${finalEventId}`);
        }
    );
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // ===== CORS HEADERS =====
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // ===== HEALTH CHECK ENDPOINT =====
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy', 
            clients: clients.size,
            timestamp: Date.now() 
        }));
        return;
    }
    
    // ===== SYNC ENDPOINT (MISSED EVENTS) =====
    if (req.url === '/sync' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { listId, lastSequence } = JSON.parse(body);
                
                db.all(
                    `SELECT id, event_id, list_id, event_type, event_data, timestamp, source_id 
                     FROM sync_events 
                     WHERE list_id = ? AND id > ? 
                     ORDER BY id ASC`,
                    [listId, lastSequence || 0],
                    (err, rows) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: err.message }));
                            return;
                        }
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            events: rows.map(row => ({
                                type: row.event_type,
                                listId: row.list_id,
                                data: JSON.parse(row.event_data),
                                timestamp: row.timestamp,
                                sourceId: row.source_id,
                                sequence: row.id,
                                eventId: row.event_id
                            }))
                        }));
                    }
                );
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
        return;
    }
    
    // ===== DEFAULT HTML PAGE =====
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <html>
            <head><title>WebSocket Relay Server</title></head>
            <body>
                <h1>✅ WebSocket Relay Server</h1>
                <p>Status: Running</p>
                <p>Connected clients: ${clients.size}</p>
                <p>Port: ${PORT}</p>
                <p><a href="/health">Health Check</a></p>
            </body>
        </html>
    `);
});

// Attach WebSocket to HTTP server
const wss = new WebSocket.Server({ 
    server,
    maxPayload: MAX_MESSAGE_SIZE,
    clientTracking: true,
    perMessageDeflate: false
});

const clients = new Map();

// Log network interfaces
console.log('\n📡 Server IP addresses:');
const interfaces = os.networkInterfaces();
Object.keys(interfaces).forEach((iface) => {
    interfaces[iface].forEach((addr) => {
        if (addr.family === 'IPv4' && !addr.internal) {
            console.log(`   ${iface}: ${addr.address}`);
        }
    });
});
console.log('');

// Start server
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WebSocket Relay Server started`);
    console.log(`=================================`);
    console.log(`📡 HTTP endpoint: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}`);
    console.log(`🌐 Connect from other devices using your Pi's IP address`);
    console.log(`💓 Ping interval: ${PING_INTERVAL/1000}s`);
    console.log(`📊 Max message size: ${MAX_MESSAGE_SIZE/1024}KB`);
    console.log(`=================================\n`);
});

wss.on('connection', (ws, req) => {
    const clientAddress = req.socket.remoteAddress;
    const clientPort = req.socket.remotePort;
    const ipClientId = `${clientAddress}:${clientPort}`;
    const connectTime = Date.now();
    
    console.log(`🔌 [${ipClientId}] New client connected`);
    console.log(`   📍 Address: ${clientAddress}`);
    console.log(`   🔢 Total clients: ${clients.size + 1}`);

    clients.set(ws, {
        id: ipClientId,
        address: clientAddress,
        port: clientPort,
        connectTime,
        lastSeen: Date.now(),
        messageCount: 0
    });

    ws.send(JSON.stringify({
        type: 'WELCOME',
        message: 'Connected to relay server',
        timestamp: Date.now(),
        clientId: ipClientId,
        clientCount: clients.size,
        serverTime: Date.now()
    }));

    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
            console.log(`💓 [${ipClientId}] Ping sent`);
        }
    }, PING_INTERVAL);

    ws.on('message', (message) => {
        try {
            const client = clients.get(ws);
            if (client) {
                client.lastSeen = Date.now();
                client.messageCount++;
            }

            const messageStr = message.toString();
            const logMsg = messageStr.length > 200 
                ? messageStr.substring(0, 200) + '...' 
                : messageStr;
            console.log(`📨 [${ipClientId}] Received: ${logMsg}`);

            let parsed;
            try {
                parsed = JSON.parse(messageStr);
            } catch (e) {
                console.error(`❌ [${ipClientId}] Invalid JSON received:`, e.message);
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    error: 'Invalid JSON format',
                    timestamp: Date.now()
                }));
                return;
            }

            if (!parsed.type || !parsed.listId) {
                console.error(`❌ [${ipClientId}] Missing required fields in message`);
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    error: 'Message must contain type and listId',
                    timestamp: Date.now()
                }));
                return;
            }

            // Extract or store the client's unique ID
            let storedClientId = ipClientId;
            if (parsed.clientId) {
                storedClientId = parsed.clientId;
                // Store the mapping for future messages
                if (!clientIdMap.has(ws)) {
                    clientIdMap.set(ws, storedClientId);
                    console.log(`🏷️ [${ipClientId}] Registered clientId: ${storedClientId}`);
                }
            } else if (clientIdMap.has(ws)) {
                storedClientId = clientIdMap.get(ws);
            }

            if (!parsed.timestamp) {
                parsed.timestamp = Date.now();
            }

            // Save to database using the real clientId (skip CLIENT_COUNT_UPDATE)
            if (parsed.type !== 'CLIENT_COUNT_UPDATE') {
                saveEvent(parsed, storedClientId);
            }

            // Relay to all other clients
            let relayCount = 0;
            
            // Create message with the proper sourceId and eventId
            const messageToRelay = JSON.stringify({
                ...parsed,
                sourceId: storedClientId,
                 eventId: parsed.eventId
            });
            
            clients.forEach((clientData, client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(messageToRelay);
                    relayCount++;
                }
            });

            console.log(`📤 [${ipClientId}] Relayed ${relayCount} client(s) - Type: ${parsed.type} (sourceId: ${storedClientId})`);

            // Send delivery confirmation for critical messages
            if (parsed.type === 'ADD_ITEM' || parsed.type === 'DELETE_ITEM') {
                ws.send(JSON.stringify({
                    type: 'DELIVERY_CONFIRMATION',
                    originalType: parsed.type,
                    listId: parsed.listId,
                    timestamp: Date.now(),
                    relayCount
                }));
            }

        } catch (error) {
            console.error(`❌ [${ipClientId}] Error processing message:`, error.message);
            ws.send(JSON.stringify({
                type: 'ERROR',
                error: 'Internal server error',
                timestamp: Date.now()
            }));
        }
    });

    ws.on('pong', () => {
        console.log(`💓 [${ipClientId}] Pong received`);
        const client = clients.get(ws);
        if (client) {
            client.lastSeen = Date.now();
        }
    });

    ws.on('close', (code, reason) => {
        clearInterval(pingInterval);
        
        // Clean up mapping
        clientIdMap.delete(ws);
        
        const client = clients.get(ws);
        const duration = client ? ((Date.now() - client.connectTime) / 1000).toFixed(1) : '?';
        const msgCount = client ? client.messageCount : 0;
        
        clients.delete(ws);
        console.log(`🔌 [${ipClientId}] Disconnected`);
        console.log(`   ⏱️  Duration: ${duration}s`);
        console.log(`   📊 Messages handled: ${msgCount}`);
        console.log(`   🔢 Total clients: ${clients.size}`);
        console.log(`   ℹ️  Code: ${code}, Reason: ${reason || 'none'}`);
    });

    ws.on('error', (error) => {
        console.error(`❌ [${ipClientId}] WebSocket error:`, error.message);
    });
});

// Broadcast client count updates
setInterval(() => {
    const count = clients.size;
    const countMessage = JSON.stringify({
        type: 'CLIENT_COUNT_UPDATE',
        count,
        timestamp: Date.now()
    });

    clients.forEach((client, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(countMessage);
        }
    });
}, 5000);

// Clean up stale connections
setInterval(() => {
    const now = Date.now();
    clients.forEach((client, ws) => {
        if (now - client.lastSeen > 120000) {
            console.log(`🧹 [${client.id}] Closing stale connection`);
            ws.terminate();
        }
    });
}, 60000);

server.on('error', (error) => {
    console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    
    db.close((err) => {
        if (err) console.error('❌ Error closing database:', err);
        else console.log('✅ Database closed');
    });
    
    clients.forEach((client, ws) => {
        ws.close(1000, 'Server shutting down');
    });

    server.close(() => {
        console.log('✅ Server shut down gracefully');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    process.exit(0);
});

console.log(`🚀 Server starting... Press Ctrl+C to stop\n`);