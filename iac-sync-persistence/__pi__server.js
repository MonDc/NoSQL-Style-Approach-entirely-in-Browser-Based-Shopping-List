const WebSocket = require('ws');
const http = require('http');
const os = require('os');
const sqlite3 = require('sqlite3').verbose(); // ✅ NEW

const PORT = 8080;
const PING_INTERVAL = 30000; // 30 seconds
const MAX_MESSAGE_SIZE = 1024 * 100; // 100KB limit

// ✅ NEW: Database setup
const db = new sqlite3.Database('swipetomaten_sync_sqlite.db');
db.run(`
    CREATE TABLE IF NOT EXISTS sync_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        source_id TEXT NOT NULL
    )
`, (err) => {
    if (err) console.error('❌ Database init error:', err);
    else console.log('✅ SQLite database ready');
});

// ✅ NEW: Function to save events
function saveEvent(event, sourceId) {
    const { type, listId, data, timestamp } = event;
    const eventData = JSON.stringify(data);
    
    db.run(
        'INSERT INTO sync_events (list_id, event_type, event_data, timestamp, source_id) VALUES (?, ?, ?, ?, ?)',
        [listId, type, eventData, timestamp || Date.now(), sourceId],
        (err) => {
            if (err) console.error('❌ Save error:', err);
        }
    );
}

// Create HTTP server first (for health checks)
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ 
            status: 'healthy', 
            clients: clients.size,
            timestamp: Date.now() 
        }));
    } else {
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
    }
});

// Attach WebSocket to HTTP server with configuration
const wss = new WebSocket.Server({ 
    server,
    maxPayload: MAX_MESSAGE_SIZE,
    clientTracking: true,
    perMessageDeflate: false // Disable compression for lower latency
});

const clients = new Map(); // Store client metadata

// Log all network interfaces for debugging
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

// Start the server
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
    const clientId = `${clientAddress}:${clientPort}`;
    const connectTime = Date.now();
    
    console.log(`🔌 [${clientId}] New client connected`);
    console.log(`   📍 Address: ${clientAddress}`);
    console.log(`   🔢 Total clients: ${clients.size + 1}`);

    // Store client metadata
    clients.set(ws, {
        id: clientId,
        address: clientAddress,
        port: clientPort,
        connectTime,
        lastSeen: Date.now(),
        messageCount: 0
    });

    // Send welcome message with connection info
    ws.send(JSON.stringify({
        type: 'WELCOME',
        message: 'Connected to relay server',
        timestamp: Date.now(),
        clientId: clientId,
        clientCount: clients.size,
        serverTime: Date.now()
    }));

    // Set up ping interval to keep connection alive
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
            console.log(`💓 [${clientId}] Ping sent`);
        }
    }, PING_INTERVAL);

    ws.on('message', (message) => {
        try {
            // Update client metadata
            const client = clients.get(ws);
            if (client) {
                client.lastSeen = Date.now();
                client.messageCount++;
            }

            // Log received message (truncate if too long)
            const messageStr = message.toString();
            const logMsg = messageStr.length > 200 
                ? messageStr.substring(0, 200) + '...' 
                : messageStr;
            console.log(`📨 [${clientId}] Received: ${logMsg}`);

            // Parse and validate message
            let parsed;
            try {
                parsed = JSON.parse(messageStr);
            } catch (e) {
                console.error(`❌ [${clientId}] Invalid JSON received:`, e.message);
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    error: 'Invalid JSON format',
                    timestamp: Date.now()
                }));
                return;
            }

            // Validate required fields
            if (!parsed.type || !parsed.listId) {
                console.error(`❌ [${clientId}] Missing required fields in message`);
                ws.send(JSON.stringify({
                    type: 'ERROR',
                    error: 'Message must contain type and listId',
                    timestamp: Date.now()
                }));
                return;
            }

            // Add server timestamp if not present
            if (!parsed.timestamp) {
                parsed.timestamp = Date.now();
            }

            // ✅ NEW: Save to database (skip CLIENT_COUNT_UPDATE to avoid noise)
            if (parsed.type !== 'CLIENT_COUNT_UPDATE') {
                saveEvent(parsed, parsed.sourceId || clientId);
            }

            // Relay to all other clients
            let relayCount = 0;
            const messageStrRelay = JSON.stringify(parsed);
            
            clients.forEach((clientData, client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(messageStrRelay);
                    relayCount++;
                }
            });

            console.log(`📤 [${clientId}] Relayed ${relayCount} client(s) - Type: ${parsed.type}`);

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
            console.error(`❌ [${clientId}] Error processing message:`, error.message);
            ws.send(JSON.stringify({
                type: 'ERROR',
                error: 'Internal server error',
                timestamp: Date.now()
            }));
        }
    });

    ws.on('pong', () => {
        console.log(`💓 [${clientId}] Pong received`);
        const client = clients.get(ws);
        if (client) {
            client.lastSeen = Date.now();
        }
    });

    ws.on('close', (code, reason) => {
        clearInterval(pingInterval);
        
        const client = clients.get(ws);
        const duration = client ? ((Date.now() - client.connectTime) / 1000).toFixed(1) : '?';
        const msgCount = client ? client.messageCount : 0;
        
        clients.delete(ws);
        console.log(`🔌 [${clientId}] Disconnected`);
        console.log(`   ⏱️  Duration: ${duration}s`);
        console.log(`   📊 Messages handled: ${msgCount}`);
        console.log(`   🔢 Total clients: ${clients.size}`);
        console.log(`   ℹ️  Code: ${code}, Reason: ${reason || 'none'}`);
    });

    ws.on('error', (error) => {
        console.error(`❌ [${clientId}] WebSocket error:`, error.message);
    });
});

// Broadcast client count updates periodically
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
        // If no message for 2 minutes, consider stale
        if (now - client.lastSeen > 120000) {
            console.log(`🧹 [${client.id}] Closing stale connection`);
            ws.terminate();
        }
    });
}, 60000);

// Handle server errors
server.on('error', (error) => {
    console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    
    // ✅ NEW: Close database connection
    db.close((err) => {
        if (err) console.error('❌ Error closing database:', err);
        else console.log('✅ Database closed');
    });
    
    // Close all WebSocket connections
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

