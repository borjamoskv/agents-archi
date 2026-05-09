/* ═══════════════════════════════════════════════════════════
   agents.archi — Telemetry Service (C5-REAL)
   ───────────────────────────────────────────────────────────
   Handles WebSocket connection to the MOSKV-10k-RS engine.
   ═══════════════════════════════════════════════════════════ */

let socket = null;
const listeners = new Set();

export function connectTelemetry(url = 'ws://localhost:8081') {
  if (socket) return;

  console.log(`[TELEMETRY] Conectando a la matriz real: ${url}...`);
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('[TELEMETRY] [C5-REAL] Enlace establecido con el Motor Rust.');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      listeners.forEach(callback => callback(data));
    } catch (e) {
      console.error('[TELEMETRY] Error parseando frame:', e);
    }
  };

  socket.onclose = () => {
    console.warn('[TELEMETRY] Conexión perdida. Reintentando en 5s...');
    socket = null;
    setTimeout(() => connectTelemetry(url), 5000);
  };

  socket.onerror = (err) => {
    console.error('[TELEMETRY] Error de socket:', err);
  };
}

export function onTelemetryData(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
