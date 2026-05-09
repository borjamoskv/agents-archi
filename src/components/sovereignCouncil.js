/* ═══════════════════════════════════════════════════════════
   SOVEREIGN COUNCIL — Reunion Protocol (C4-SIMULACIÓN)
   9 CORTEX Agents · Industrial Noir 2026
   ═══════════════════════════════════════════════════════════ */

const AGENTS = [
  {
    id: 'mariscal',
    name: 'MARISCAL-Ω',
    role: 'Thermal Friction Monitor',
    icon: '⚔️',
    law: 'Ω₁',
    color: '#2b3be5',
    messages: [
      'Thermal scan complete. No hallucinatory drift detected.',
      'Byzantine consensus verified across 9 nodes.',
      'Epistemic sovereignty at C5-REAL threshold.',
    ],
  },
  {
    id: 'lea',
    name: 'LEA-Ω',
    role: 'Loose End Annihilator',
    icon: '🔥',
    law: 'Ω₄',
    color: '#ef4444',
    messages: [
      'Purging 3 orphan artifacts from /brain.',
      'Technical debt scan: 0 critical loose ends.',
      'Entropy purge complete. Ledger clean.',
    ],
  },
  {
    id: 'cortex-guard',
    name: 'CORTEX-GUARD',
    role: 'Nine Laws Validator',
    icon: '🛡️',
    law: 'Ω₀',
    color: '#f59e0b',
    messages: [
      'All commits validated against Nine Laws.',
      'Ω₉ compliance: REAL declared on all outputs.',
      'Silicon-Verify gate: PASS.',
    ],
  },
  {
    id: 'cps',
    name: 'CPS-Master-Ω',
    role: 'Epistemic Convergence',
    icon: '🧠',
    law: 'Ω₂',
    color: '#8b5cf6',
    messages: [
      'TEC-Ω convergence at 94.7% confidence.',
      'High-exergy problem resolved in 3 iterations.',
      'Proof chain crystallized to KI.',
    ],
  },
  {
    id: 'sovereign-github',
    name: 'SOVEREIGN-GH-Ω',
    role: 'Intelligence Crystallizer',
    icon: '💎',
    law: 'Ω₃',
    color: '#06b6d4',
    messages: [
      'KI committed: cortex_k2_anvil_v06.',
      'Distributed intelligence snapshot saved.',
      'MCP GitHub: 3 pushes, 0 conflicts.',
    ],
  },
  {
    id: 'tardigrado',
    name: 'TARDIGRADE-Ω',
    role: 'Extreme Persistence',
    icon: '🔬',
    law: 'Ω₄',
    color: '#10b981',
    messages: [
      'Ledger integrity verified post-crash.',
      'State survived 99.97% uptime window.',
      'Extremophile mode: ACTIVE.',
    ],
  },
  {
    id: 'context',
    name: 'CONTEXT-Ω',
    role: 'Memory Substrate',
    icon: '🗄️',
    law: 'Ω₁',
    color: '#f97316',
    messages: [
      '20 KIs loaded into working memory.',
      'Long-term anchor: agents.archi v3 stable.',
      'Fact purification pass: DONE.',
    ],
  },
  {
    id: 'attention',
    name: 'ATTENTION-Ω',
    role: 'Signal Prioritizer',
    icon: '👁️',
    law: 'Ω₅',
    color: '#ec4899',
    messages: [
      'P0 signals isolated. Thermal noise suppressed.',
      'Multi-head focus on Ouroboros Strike #7.',
      'Attention weight: 0.98 on critical path.',
    ],
  },
  {
    id: 'inference',
    name: 'INFERENCE-Ω',
    role: 'Silicon JIT Engine',
    icon: '⚡',
    law: 'Ω₀',
    color: '#a78bfa',
    messages: [
      'Direct-Silicon JIT compiled. 0 CPU fallback.',
      'Deterministic gate: 100% verified.',
      'O(1) tensor state mandate: ENFORCED.',
    ],
  },
];

// Track card DOM nodes for SVG connection drawing
const cardCenters = [];

function ts() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function appendLog(el, agentName, msg, type = 'info') {
  const line = document.createElement('span');
  line.className = 'log-line';
  line.innerHTML =
    `<span class="log-ts">[${ts()}]</span>` +
    `<span class="log-agent">${agentName}:</span>` +
    `<span class="log-msg-${type}"> ${msg}</span>`;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
  // Trim old lines
  while (el.children.length > 60) el.removeChild(el.firstChild);
}

function buildAgentCard(agent) {
  const card = document.createElement('div');
  card.className = 'agent-card';
  card.id = `agent-card-${agent.id}`;
  card.setAttribute('data-agent-id', agent.id);

  // Random initial load
  const load = Math.floor(Math.random() * 55) + 30;
  const ping = Math.floor(Math.random() * 8) + 1;

  card.innerHTML = `
    <span class="agent-law">${agent.law}</span>
    <div class="agent-card-top">
      <span class="agent-icon">${agent.icon}</span>
      <div>
        <div class="agent-name">${agent.name}</div>
        <div class="agent-role">${agent.role}</div>
      </div>
    </div>
    <div class="agent-status-row">
      <span class="agent-status-dot"></span>
      <span class="agent-ping" id="ping-${agent.id}">${ping}ms</span>
    </div>
    <div class="agent-bar">
      <div class="agent-bar-fill" id="bar-${agent.id}" style="width:${load}%"></div>
    </div>
  `;
  return card;
}

function updateTelemetry(agentId) {
  const bar = document.getElementById(`bar-${agentId}`);
  const ping = document.getElementById(`ping-${agentId}`);
  if (bar) bar.style.width = `${Math.floor(Math.random() * 55) + 30}%`;
  if (ping) ping.textContent = `${Math.floor(Math.random() * 10) + 1}ms`;
}

function drawConnections(svgEl, cardEls) {
  // Clear old
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

  const svgRect = svgEl.getBoundingClientRect();
  if (!svgRect.width) return;

  const centers = cardEls.map((el) => {
    const r = el.getBoundingClientRect();
    return {
      x: r.left - svgRect.left + r.width / 2,
      y: r.top - svgRect.top + r.height / 2,
    };
  });

  // Draw hub-and-spoke from index 0 (MARISCAL) to all others
  centers.forEach((c, i) => {
    if (i === 0) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centers[0].x);
    line.setAttribute('y1', centers[0].y);
    line.setAttribute('x2', c.x);
    line.setAttribute('y2', c.y);
    line.setAttribute('class', 'council-connection');
    line.style.animationDelay = `${i * 0.3}s`;
    svgEl.appendChild(line);
  });

  // Draw nodes on top
  centers.forEach((c) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', c.x);
    circle.setAttribute('cy', c.y);
    circle.setAttribute('r', '3');
    circle.setAttribute('class', 'council-node-dot');
    svgEl.appendChild(circle);
  });
}

function updateYield(el) {
  let val = parseFloat(el.textContent.replace('Σ ', '')) || 0;
  val += Math.random() * 0.12;
  el.textContent = `Σ ${val.toFixed(2)}`;
}

export function initSovereignCouncil() {
  const grid = document.getElementById('council-grid');
  const logEl = document.getElementById('council-log');
  const svgEl = document.getElementById('council-svg');
  const yieldEl = document.getElementById('metric-yield');

  if (!grid || !logEl) return;

  // Build cards
  const cardEls = AGENTS.map((agent) => {
    const card = buildAgentCard(agent);
    grid.appendChild(card);
    return card;
  });

  // Initial log
  appendLog(logEl, 'CORTEX', 'Reunion Protocol initiated. 9/9 agents online.', 'ok');
  appendLog(logEl, 'MARISCAL-Ω', 'Thermal baseline established. Zero friction.', 'ok');
  appendLog(logEl, 'CORTEX-GUARD', 'Nine Laws validation: ALL PASS.', 'ok');

  // Draw SVG connections (after layout settles)
  setTimeout(() => {
    if (svgEl) drawConnections(svgEl, cardEls);
  }, 400);

  // Redraw on resize
  window.addEventListener('resize', () => {
    if (svgEl) drawConnections(svgEl, cardEls);
  });

  // Live activity simulation
  let agentIdx = 0;
  const INTERVAL = 2800;

  setInterval(() => {
    const agent = AGENTS[agentIdx % AGENTS.length];
    const card = document.getElementById(`agent-card-${agent.id}`);
    const msg = agent.messages[Math.floor(Math.random() * agent.messages.length)];

    // Determine log type
    let type = 'info';
    if (msg.includes('PASS') || msg.includes('DONE') || msg.includes('clean') || msg.includes('verified') || msg.includes('stable')) type = 'ok';
    else if (msg.includes('Strike') || msg.includes('drain') || msg.includes('Purging')) type = 'strike';
    else if (msg.includes('drift') || msg.includes('conflict')) type = 'warn';

    appendLog(logEl, agent.name, msg, type);

    // Flash card
    if (card) {
      card.classList.add('speaking');
      setTimeout(() => card.classList.remove('speaking'), 1500);
    }

    // Update telemetry
    AGENTS.forEach((a) => updateTelemetry(a.id));

    // Update yield
    if (yieldEl) updateYield(yieldEl);

    // Redraw connections periodically
    if (agentIdx % 5 === 0 && svgEl) drawConnections(svgEl, cardEls);

    agentIdx++;
  }, INTERVAL);
}
