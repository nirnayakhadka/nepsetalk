/**
 * services/stockSocket.js
 *
 * Pushes live market updates to connected frontend clients via Socket.IO.
 * Clients subscribe to the "market" room and receive updates every 30 seconds
 * during market hours, or every 5 minutes outside hours.
 */

const { getCachedMarketData, isMarketHours } = require('../jobs/nepseScheduler');

let connectedClients = 0;
let broadcastInterval = null;

function stockSocket(io) {
  // Namespace: /nepse  (avoids collision with other socket namespaces)
  const nepse = io.of('/nepse');

  nepse.on('connection', (socket) => {
    connectedClients++;
    console.log(`[Socket] Client connected. Total: ${connectedClients}`);

    // Send immediately on connect
    sendUpdate(socket);

    // Client can request a manual refresh
    socket.on('requestUpdate', () => sendUpdate(socket));

    socket.on('disconnect', () => {
      connectedClients--;
      console.log(`[Socket] Client disconnected. Total: ${connectedClients}`);
    });
  });

  // ── Broadcast loop ─────────────────────────────────────────────────────
  // Only runs when there are active clients to save resources
  function startBroadcast() {
    if (broadcastInterval) return;

    broadcastInterval = setInterval(async () => {
      if (connectedClients === 0) return;

      try {
        const data = await getCachedMarketData();
        if (data) {
          nepse.emit('marketUpdate', {
            isMarketOpen: isMarketHours(),
            data,
            ts: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('[Socket] Broadcast error:', err.message);
      }
    }, isMarketHours() ? 30_000 : 5 * 60_000);
  }

  // Restart interval when market status changes
  setInterval(() => {
    if (broadcastInterval) {
      clearInterval(broadcastInterval);
      broadcastInterval = null;
    }
    if (connectedClients > 0) startBroadcast();
  }, 60_000);

  startBroadcast();
}

async function sendUpdate(socket) {
  try {
    const data = await getCachedMarketData();
    socket.emit('marketUpdate', {
      isMarketOpen: isMarketHours(),
      data,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    socket.emit('marketError', { message: 'Could not fetch market data' });
  }
}

module.exports = { stockSocket };