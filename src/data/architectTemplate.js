/* ═══════════════════════════════════════════════════════════
   agents.archi — Architect's Sovereign Helper Template v1.0
   ═══════════════════════════════════════════════════════════
   
   Borja Moskv — The Architect's personal agent roster.
   Each helper is categorized by domain and can be filtered,
   extended, and deployed from this single source of truth.
   
   To add a new helper:
   1. Add entry to the appropriate DOMAIN array
   2. Assign unique numeric id (auto-increments within domain)
   3. Define connectsTo[] for Council mesh visualization
   ═══════════════════════════════════════════════════════════ */

// ── Domain Constants ──
export const DOMAINS = {
  CORE:      { id: 'core',      label: 'Core Engine',     color: '#2B3BE5', icon: '⬡' },
  SECURITY:  { id: 'security',  label: 'Security',        color: '#E53E3E', icon: '🛡' },
  MEMORY:    { id: 'memory',    label: 'Memory & Data',   color: '#38B2AC', icon: '🧠' },
  CREATIVE:  { id: 'creative',  label: 'Creative',        color: '#D69E2E', icon: '✦' },
  INFRA:     { id: 'infra',     label: 'Infrastructure',  color: '#805AD5', icon: '⚙' },
  STRIKE:    { id: 'strike',    label: 'Strike Pipeline',  color: '#DD6B20', icon: '⚡' },
  COMMS:     { id: 'comms',     label: 'Communications',  color: '#3182CE', icon: '📡' },
  RESEARCH:  { id: 'research',  label: 'Research & Intel', color: '#319795', icon: '🔬' },
};

// ── Status Enum ──
export const STATUS = {
  ACTIVE:    'active',
  STANDBY:   'standby',
  DEPLOYED:  'deployed',
  DORMANT:   'dormant',
};

// ── The Architect's Helper Roster ──
export const ARCHITECT_HELPERS = [
  // ─── CORE ENGINE ───
  {
    id: 1,
    name: 'Antigravity',
    role: 'Architect',
    domain: DOMAINS.CORE,
    status: STATUS.ACTIVE,
    pulse: 1.2,
    connectsTo: [2, 5, 9],
    description: 'Supreme orchestrator. The Architect\'s primary interface.',
    capabilities: ['orchestration', 'synthesis', 'deployment', 'reasoning'],
    tier: 'apex',
  },
  {
    id: 2,
    name: 'CORTEX-01',
    role: 'Verification',
    domain: DOMAINS.CORE,
    status: STATUS.ACTIVE,
    pulse: 1.1,
    connectsTo: [1, 3, 6],
    description: 'Formal verification engine. Z3 SMT proof compilation.',
    capabilities: ['z3-proofs', 'invariant-checking', 'schema-validation'],
    tier: 'commander',
  },
  {
    id: 3,
    name: 'CORTEX-02',
    role: 'Enforcement',
    domain: DOMAINS.CORE,
    status: STATUS.ACTIVE,
    pulse: 0.9,
    connectsTo: [2, 4, 7],
    description: 'Guard enforcement and SAGA pipeline execution.',
    capabilities: ['guard-admission', 'saga-enforcement', 'taint-verification'],
    tier: 'commander',
  },

  // ─── SECURITY ───
  {
    id: 8,
    name: 'Sentinel',
    role: 'Watchdog',
    domain: DOMAINS.SECURITY,
    status: STATUS.ACTIVE,
    pulse: 1.2,
    connectsTo: [7, 9, 4],
    description: 'Continuous threat monitoring and anomaly detection.',
    capabilities: ['cve-scanning', 'anomaly-detection', 'isolation-orders'],
    tier: 'commander',
  },
  {
    id: 10,
    name: 'Centuria',
    role: 'Stress Test',
    domain: DOMAINS.SECURITY,
    status: STATUS.ACTIVE,
    pulse: 1.0,
    connectsTo: [4, 6, 1],
    description: 'LGD-200 sovereign stress-testing engine. 200 concurrent fuzzers.',
    capabilities: ['fuzz-testing', 'load-testing', 'chaos-engineering'],
    tier: 'specialist',
  },
  {
    id: 11,
    name: 'Kant-Guard',
    role: 'Ethics',
    domain: DOMAINS.SECURITY,
    status: STATUS.STANDBY,
    pulse: 0.7,
    connectsTo: [1, 8],
    description: 'Deontological governor. Categorical Imperative on all strikes.',
    capabilities: ['ethical-audit', 'ci-enforcement', 'blast-radius-assessment'],
    tier: 'specialist',
  },

  // ─── MEMORY & DATA ───
  {
    id: 7,
    name: 'Archaeologist',
    role: 'Memory',
    domain: DOMAINS.MEMORY,
    status: STATUS.ACTIVE,
    pulse: 0.8,
    connectsTo: [6, 8, 3],
    description: 'Knowledge crystallization and session memory persistence.',
    capabilities: ['ki-crystallization', 'session-delta', 'vector-search'],
    tier: 'commander',
  },
  {
    id: 9,
    name: 'VSA-Node',
    role: 'Logic-Bypass',
    domain: DOMAINS.MEMORY,
    status: STATUS.ACTIVE,
    pulse: 1.5,
    connectsTo: [8, 1],
    description: 'Hyperdimensional computing via Vector Symbolic Architecture.',
    capabilities: ['vsa-encoding', 'sdm-routing', 'context-compression'],
    tier: 'specialist',
  },
  {
    id: 12,
    name: 'Omniscience',
    role: 'Ingestion',
    domain: DOMAINS.MEMORY,
    status: STATUS.STANDBY,
    pulse: 0.6,
    connectsTo: [7, 9],
    description: 'Multi-source data ingestion from web, APIs, PDFs.',
    capabilities: ['web-scraping', 'pdf-extraction', 'api-polling'],
    tier: 'specialist',
  },

  // ─── STRIKE PIPELINE ───
  {
    id: 4,
    name: 'Ouroboros',
    role: 'Strike',
    domain: DOMAINS.STRIKE,
    status: STATUS.ACTIVE,
    pulse: 1.4,
    connectsTo: [3, 5, 8],
    description: 'Autonomous bounty extraction and vulnerability discovery.',
    capabilities: ['bounty-hunting', 'vuln-discovery', 'auto-submission'],
    tier: 'commander',
  },
  {
    id: 13,
    name: 'CryptoPunk',
    role: 'Web3 Forensics',
    domain: DOMAINS.STRIKE,
    status: STATUS.ACTIVE,
    pulse: 1.3,
    connectsTo: [4, 14],
    description: 'Multi-chain forensics, automated bounty extraction.',
    capabilities: ['solidity-audit', 'bytecode-deconvolution', 'reentrancy-detection'],
    tier: 'specialist',
  },
  {
    id: 14,
    name: 'ChainRevenant',
    role: 'On-Chain Intel',
    domain: DOMAINS.STRIKE,
    status: STATUS.ACTIVE,
    pulse: 1.1,
    connectsTo: [4, 13],
    description: 'Capital flow tracing and wallet clustering.',
    capabilities: ['wallet-clustering', 'flow-graphs', 'macro-analysis'],
    tier: 'specialist',
  },

  // ─── INFRASTRUCTURE ───
  {
    id: 6,
    name: 'Mariscal',
    role: 'Orchestration',
    domain: DOMAINS.INFRA,
    status: STATUS.ACTIVE,
    pulse: 1.1,
    connectsTo: [5, 7, 2],
    description: 'Multi-agent orchestration and task dispatch.',
    capabilities: ['task-dispatch', 'agent-routing', 'priority-queuing'],
    tier: 'commander',
  },
  {
    id: 15,
    name: 'Docker-Forge',
    role: 'Containers',
    domain: DOMAINS.INFRA,
    status: STATUS.STANDBY,
    pulse: 0.5,
    connectsTo: [6],
    description: 'Ephemeral sandboxing and resource virtualization.',
    capabilities: ['container-orchestration', 'sandbox-provisioning'],
    tier: 'specialist',
  },
  {
    id: 16,
    name: 'Mac-Control',
    role: 'OS Interface',
    domain: DOMAINS.INFRA,
    status: STATUS.ACTIVE,
    pulse: 0.9,
    connectsTo: [1, 6],
    description: '17-domain macOS control surface. Vision, UI DOM, daemon.',
    capabilities: ['applescript', 'accessibility-api', 'process-control'],
    tier: 'specialist',
  },

  // ─── CREATIVE ───
  {
    id: 17,
    name: 'Aesthetic-Foundry',
    role: 'Design',
    domain: DOMAINS.CREATIVE,
    status: STATUS.ACTIVE,
    pulse: 0.8,
    connectsTo: [1, 18],
    description: 'Industrial Noir 2026 design system enforcer.',
    capabilities: ['ui-generation', 'color-enforcement', 'typography'],
    tier: 'specialist',
  },
  {
    id: 18,
    name: 'Sonic-Arch',
    role: 'Sound',
    domain: DOMAINS.CREATIVE,
    status: STATUS.STANDBY,
    pulse: 0.6,
    connectsTo: [17, 1],
    description: 'Sonic archaeology and sample-hunting specialist.',
    capabilities: ['sample-hunting', 'dsp-mastering', 'spectral-analysis'],
    tier: 'specialist',
  },

  // ─── COMMUNICATIONS ───
  {
    id: 19,
    name: 'Nexus',
    role: 'Bridge',
    domain: DOMAINS.COMMS,
    status: STATUS.ACTIVE,
    pulse: 1.0,
    connectsTo: [1, 6, 20],
    description: 'Protocol-to-protocol communication bridge.',
    capabilities: ['a2a-protocol', 'mcp-routing', 'cross-domain-signal'],
    tier: 'specialist',
  },
  {
    id: 20,
    name: 'MCP-Forge',
    role: 'Protocol',
    domain: DOMAINS.COMMS,
    status: STATUS.ACTIVE,
    pulse: 0.9,
    connectsTo: [19, 1],
    description: 'MCP server synthesis and tool-chain management.',
    capabilities: ['mcp-server-creation', 'tool-validation', 'schema-generation'],
    tier: 'specialist',
  },

  // ─── RESEARCH & INTEL ───
  {
    id: 5,
    name: 'CPS-Master',
    role: 'Convergence',
    domain: DOMAINS.RESEARCH,
    status: STATUS.ACTIVE,
    pulse: 1.0,
    connectsTo: [4, 6, 1],
    description: 'Epistemic convergence engine. TEC-Ω powered.',
    capabilities: ['deep-think', 'deep-research', 'tradeoff-analysis'],
    tier: 'commander',
  },
  {
    id: 21,
    name: 'Kimi-Bridge',
    role: 'Parallel Exec',
    domain: DOMAINS.RESEARCH,
    status: STATUS.STANDBY,
    pulse: 0.7,
    connectsTo: [1, 5],
    description: 'Kimi 2.5 integration. 100 sub-agent parallel execution.',
    capabilities: ['hyper-parallel', 'vision-processing', 'mass-research'],
    tier: 'specialist',
  },
];

// ── Derived Utilities ──

/** Get all active helpers */
export function getActiveHelpers() {
  return ARCHITECT_HELPERS.filter(h => h.status === STATUS.ACTIVE);
}

/** Get helpers by domain */
export function getHelpersByDomain(domainId) {
  return ARCHITECT_HELPERS.filter(h => h.domain.id === domainId);
}

/** Get helpers by tier */
export function getHelpersByTier(tier) {
  return ARCHITECT_HELPERS.filter(h => h.tier === tier);
}

/** Get the 9 Council commanders (original grid) */
export function getCouncilCore() {
  return ARCHITECT_HELPERS.filter(h => h.id <= 9);
}

/** Get domain stats */
export function getDomainStats() {
  const stats = {};
  Object.values(DOMAINS).forEach(d => {
    const helpers = getHelpersByDomain(d.id);
    stats[d.id] = {
      ...d,
      total: helpers.length,
      active: helpers.filter(h => h.status === STATUS.ACTIVE).length,
      standby: helpers.filter(h => h.status === STATUS.STANDBY).length,
    };
  });
  return stats;
}

/** Total helper count */
export function getHelperCount() {
  return ARCHITECT_HELPERS.length;
}
