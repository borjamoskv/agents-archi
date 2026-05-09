/* ═══════════════════════════════════════════════════════════
   Sovereign Council — 9-Node CORTEX Swarm Engine
   [C4-SIMULACIÓN] — All agent activity is simulated
   ═══════════════════════════════════════════════════════════ */

const COUNCIL_AGENTS = [
  { id: 'alpha',   icon: '⬡', name: 'ALPHA-09',   role: 'Orchestrator' },
  { id: 'beta',    icon: '🛡️', name: 'BETA-07',    role: 'Guardian' },
  { id: 'gamma',   icon: '🔍', name: 'GAMMA-03',   role: 'Auditor' },
  { id: 'delta',   icon: '⚡', name: 'DELTA-11',   role: 'Executor' },
  { id: 'epsilon', icon: '🧠', name: 'EPSILON-04', role: 'Validator' },
  { id: 'zeta',    icon: '📡', name: 'ZETA-08',    role: 'Sentinel' },
  { id: 'eta',     icon: '🔗', name: 'ETA-02',     role: 'Bridge' },
  { id: 'theta',   icon: '💎', name: 'THETA-06',   role: 'Crystallizer' },
  { id: 'iota',    icon: '🔥', name: 'IOTA-05',    role: 'Annihilator' },
];

const MISSION_LOG = [
  { agent: 'ALPHA-09', action: 'Swarm topology loaded. 9/9 nodes online.', type: '' },
  { agent: 'GAMMA-03', action: 'Hash-chain integrity verified — 247 blocks.', type: 'log-success' },
  { agent: 'ZETA-08',  action: 'Scanning CVE-2026-30615 (Windsurf MCP RCE)…', type: '' },
  { agent: 'BETA-07',  action: 'Guard admission check PASSED — tenant isolation confirmed.', type: 'log-success' },
  { agent: 'DELTA-11', action: 'Executing SAGA-6: Write committed to SQLite ledger.', type: '' },
  { agent: 'EPSILON-04', action: 'Z3 proof complete: PaymentBot invariants hold (SAT).', type: 'log-success' },
  { agent: 'THETA-06', action: 'Knowledge crystallized → KI: firedancer_vm_bypass.', type: '' },
  { agent: 'IOTA-05',  action: 'Entropy purge: 3 stale facts annihilated.', type: 'log-warning' },
  { agent: 'ETA-02',   action: 'MCP bridge sync — 9 servers connected.', type: 'log-success' },
  { agent: 'ALPHA-09', action: 'Byzantine consensus achieved. Yield: Σ 14.7.', type: 'log-success' },
  { agent: 'ZETA-08',  action: 'ALERT: New agentic CVE detected — triaging…', type: 'log-critical' },
  { agent: 'GAMMA-03', action: 'Audit trail exported — 0 anomalies.', type: 'log-success' },
  { agent: 'DELTA-11', action: 'Strike pipeline ready. Ouroboros cycle complete.', type: '' },
];

let logIndex = 0;
let logInterval = null;
let meshFrame = null;

/** Render the 9-agent grid */
function renderAgentGrid() {
  const grid = document.getElementById('council-grid');
  if (!grid) return;

  grid.innerHTML = '';

  COUNCIL_AGENTS.forEach((agent, i) => {
    const card = document.createElement('div');
    card.className = 'council-agent reveal';
    card.id = `agent-${agent.id}`;
    card.style.transitionDelay = `${i * 80}ms`;

    const icon = document.createElement('span');
    icon.className = 'agent-icon';
    icon.textContent = agent.icon;

    const name = document.createElement('div');
    name.className = 'agent-name';
    name.textContent = agent.name;

    const role = document.createElement('div');
    role.className = 'agent-role';
    role.textContent = agent.role;

    const status = document.createElement('span');
    status.className = 'agent-status';

    card.append(icon, name, role, status);
    grid.appendChild(card);
  });
}

/** Animate mission log entries one by one */
function startMissionLog() {
  const log = document.getElementById('council-log');
  if (!log) return;

  logIndex = 0;
  log.innerHTML = '';

  logInterval = setInterval(() => {
    if (logIndex >= MISSION_LOG.length) {
      logIndex = 0;
      log.innerHTML = '';
    }

    const entry = MISSION_LOG[logIndex];
    const row = document.createElement('div');
    row.className = `log-entry ${entry.type}`;

    const time = document.createElement('span');
    time.className = 'log-time';
    const now = new Date();
    time.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const agent = document.createElement('span');
    agent.className = 'log-agent';
    agent.textContent = `[${entry.agent}] `;

    const action = document.createElement('span');
    action.className = 'log-action';
    action.textContent = entry.action;

    row.append(time, agent, action);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;

    // Highlight the active agent card
    highlightAgent(entry.agent);

    // Update yield metric
    if (entry.action.includes('Yield')) {
      const yieldEl = document.getElementById('metric-yield');
      if (yieldEl) yieldEl.textContent = 'Σ 14.7';
    }

    logIndex++;
  }, 2200);
}

/** Briefly highlight an agent card */
function highlightAgent(name) {
  const agent = COUNCIL_AGENTS.find(a => a.name === name);
  if (!agent) return;
  const card = document.getElementById(`agent-${agent.id}`);
  if (!card) return;

  card.classList.add('active');
  setTimeout(() => card.classList.remove('active'), 1800);
}

/** Generate animated SVG mesh background */
function initCouncilMesh() {
  const svg = document.getElementById('council-svg');
  if (!svg) return;

  const nodes = [];
  const nodeCount = 12;

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.03,
      vy: (Math.random() - 0.5) * 0.03,
    });
  }

  function drawMesh() {
    const w = svg.clientWidth;
    const h = svg.clientHeight;
    if (!w || !h) {
      meshFrame = requestAnimationFrame(drawMesh);
      return;
    }

    let markup = '';

    // Move nodes
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > 100) n.vx *= -1;
      if (n.y < 0 || n.y > 100) n.vy *= -1;
    });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40) {
          const opacity = (1 - dist / 40) * 0.5;
          markup += `<line x1="${nodes[i].x}%" y1="${nodes[i].y}%" x2="${nodes[j].x}%" y2="${nodes[j].y}%" style="opacity:${opacity.toFixed(2)}"/>`;
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      markup += `<circle cx="${n.x}%" cy="${n.y}%" r="2"/>`;
    });

    svg.innerHTML = markup;
    meshFrame = requestAnimationFrame(drawMesh);
  }

  drawMesh();
}

/** IntersectionObserver: start/stop council animation on visibility */
export function initCouncil() {
  renderAgentGrid();

  const section = document.getElementById('sovereign-council');
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startMissionLog();
        initCouncilMesh();
      } else {
        if (logInterval) {
          clearInterval(logInterval);
          logInterval = null;
        }
        if (meshFrame) {
          cancelAnimationFrame(meshFrame);
          meshFrame = null;
        }
      }
    });
  }, { threshold: 0.1 });

  observer.observe(section);

  // Cleanup on page unload
  window.addEventListener('pagehide', () => {
    if (logInterval) clearInterval(logInterval);
    if (meshFrame) cancelAnimationFrame(meshFrame);
  });
}
