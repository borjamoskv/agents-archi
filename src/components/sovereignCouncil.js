/* ═══════════════════════════════════════════════════════════
   agents.archi — Sovereign Council Component
   ═══════════════════════════════════════════════════════════ */

const COUNCIL_AGENTS = [
  { id: 1, name: 'Antigravity', role: 'Architect', status: 'active', pulse: 1.2 },
  { id: 2, name: 'CORTEX-01', role: 'Verification', status: 'active', pulse: 1.1 },
  { id: 3, name: 'CORTEX-02', role: 'Enforcement', status: 'active', pulse: 0.9 },
  { id: 4, name: 'Ouroboros', role: 'Strike', status: 'active', pulse: 1.4 },
  { id: 5, name: 'Centuria', role: 'Stress Test', status: 'active', pulse: 1.0 },
  { id: 6, name: 'Mariscal', role: 'Orchestration', status: 'active', pulse: 1.1 },
  { id: 7, name: 'Archaeologist', role: 'Memory', status: 'active', pulse: 0.8 },
  { id: 8, name: 'Sentinel', role: 'Watchdog', status: 'active', pulse: 1.2 },
  { id: 9, name: 'VSA-Node', role: 'Logic-Bypass', status: 'active', pulse: 1.5 },
];

export function initSovereignCouncil() {
  const grid = document.getElementById('council-grid');
  const log = document.getElementById('council-log');
  if (!grid || !log) return;

  renderCouncilGrid(grid);
  startMissionLog(log);
  updateMetrics();
  initCouncilSVG();
}

function renderCouncilGrid(container) {
  container.innerHTML = '';
  COUNCIL_AGENTS.forEach((agent, i) => {
    const node = document.createElement('div');
    node.className = 'council-node reveal';
    node.style.transitionDelay = `${i * 100}ms`;
    node.id = `node-${agent.id}`;
    
    node.innerHTML = `
      <div class="node-icon">⬡</div>
      <div class="node-info">
        <div class="node-name">${agent.name}</div>
        <div class="node-role">${agent.role}</div>
      </div>
      <div class="node-status">
        <span class="status-pulse" style="animation-duration: ${agent.pulse}s"></span>
        <span class="status-text">${agent.status.toUpperCase()}</span>
      </div>
    `;
    
    container.appendChild(node);
  });
}

function startMissionLog(container) {
  const messages = [
    { type: 'info', text: 'Initializing Sovereign Reunion Protocol Ω₃...' },
    { type: 'cmd', text: 'LEGIØN-1 node heartbeat detected.' },
    { type: 'success', text: 'Byzantine Consensus achieved across 9 nodes.' },
    { type: 'warn', text: 'Threat Vector [V09] attempting exfiltration bypass.' },
    { type: 'info', text: 'Antigravity deploying counter-measures...' },
    { type: 'success', text: 'Sovereign Guard active. Zero-entropy maintained.' },
  ];

  let index = 0;
  const addMessage = () => {
    const msg = messages[index % messages.length];
    const div = document.createElement('div');
    div.className = `log-entry log-${msg.type}`;
    div.innerHTML = `<span class="log-time">[${new Date().toLocaleTimeString()}]</span> ${msg.text}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    
    index++;
    setTimeout(addMessage, Math.random() * 3000 + 2000);
  };

  addMessage();
}

function updateMetrics() {
  const yieldEl = document.getElementById('metric-yield');
  if (!yieldEl) return;

  let currentYield = 0;
  setInterval(() => {
    currentYield += Math.random() * 0.05;
    yieldEl.textContent = `Σ ${currentYield.toFixed(4)}`;
  }, 1000);
}

function initCouncilSVG() {
  const svg = document.getElementById('council-svg');
  if (!svg) return;

  // Simple reactive lines between nodes (visual only)
  function updateLines() {
    svg.innerHTML = '';
    const rect = svg.getBoundingClientRect();
    const nodes = document.querySelectorAll('.council-node');
    
    const nodeCenters = Array.from(nodes).map(node => {
      const r = node.getBoundingClientRect();
      return {
        x: r.left - rect.left + r.width / 2,
        y: r.top - rect.top + r.height / 2
      };
    });

    for (let i = 0; i < nodeCenters.length; i++) {
      for (let j = i + 1; j < nodeCenters.length; j++) {
        if (Math.random() > 0.6) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', nodeCenters[i].x);
          line.setAttribute('y1', nodeCenters[i].y);
          line.setAttribute('x2', nodeCenters[j].x);
          line.setAttribute('y2', nodeCenters[j].y);
          line.setAttribute('stroke', 'rgba(43, 59, 229, 0.1)');
          line.setAttribute('stroke-width', '1');
          svg.appendChild(line);
        }
      }
    }
  }

  window.addEventListener('resize', updateLines);
  setTimeout(updateLines, 500);
}
