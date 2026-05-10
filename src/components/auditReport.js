/* ═══════════════════════════════════════════════════════════
   agents.archi — Audit Report Component
   ═══════════════════════════════════════════════════════════ */

import '../css/auditReport.css';

export const REPORTS = {
  'firedancer-funk-01': {
    title: 'Firedancer fd_funk Ghosting',
    subtitle: 'Transient Consensus Inconsistency',
    id: 'OUROBOROS-FD-FUNK-01',
    severity: 'CRITICAL',
    status: 'SUBMITTED',
    reality: 'C5-REAL',
    date: 'May 5, 2026',
    platform: 'Immunefi (Firedancer V1)',
    bounty: '$1M Pool',
    summary: 'Critical consensus vulnerability in Firedancer fd_funk/fd_accdb. fd_accdb_txn_publish_one atomically swaps the last_publish pointer to the new transaction BEFORE calling fd_funk_txn_publish (record migration). During this ghosting window, readers querying keys modified in TXN_A are redirected to ROOT state which contains stale or null data.',
    evidence: [
      {
        type: 'Logic-Race',
        label: 'fd_accdb.c:txn_publish_one',
        content: `// Atomic swap happens too early
void fd_accdb_txn_publish_one(fd_accdb_t * acc_db, fd_funk_txn_t * txn) {
  acc_db->last_publish = txn; // [!] Pointer swapped here
  fd_funk_txn_publish(acc_db->funk, txn, 1); // [!] Record migration happens later
}`
      },
      {
        type: 'PoC',
        label: 'test_ghosting_poc.c',
        content: `// Banking tile reads NULL for a queried record during the window
record = fd_accdb_record_query(acc_db, key);
if (record == NULL && is_active_txn(TXN_A)) {
    // [GHOSTING DETECTED]
    trigger_consensus_fork();
}`
      }
    ],
    merkleRoot: '0x3a7f2c1b9e4d6a8f5c0b2e7d1a3f9c6b',
    tags: ['Consensus', 'Race Condition', 'Solana', 'Firedancer', 'Ghosting']
  },
  'firedancer-vm-sandbox': {
    title: 'Firedancer VM Sandbox Bypass',
    subtitle: 'OOB Region Access + ASLR Leak',
    id: 'OUROBOROS-FD-VM-01',
    severity: 'CRITICAL',
    status: 'PREPARED',
    reality: 'C5-REAL',
    date: 'May 8, 2026',
    platform: 'Immunefi',
    bounty: '$1M Pool',
    summary: 'Two critical sandbox bypass vulnerabilities in fd_vm_private.h. Missing bounds check on region index in FD_VADDR_TO_REGION allows OOB array access, leaking internal vm_t pointers. Integer underflow in fd_vm_find_input_mem_region allows generating host addresses pointing outside the sandbox.',
    evidence: [
      {
        type: 'OOB-Leak',
        label: 'fd_vm_private.h:FD_VADDR_TO_REGION',
        content: `// No check if vaddr >> 28 is within [0, 15]
#define FD_VADDR_TO_REGION(vaddr) ( (vaddr) >> 28 )
// Attacker provides vaddr = 0xFFFFFFFF
// Region index = 15 (valid), but manipulated vaddr can index beyond vm->region[]`
      },
      {
        type: 'Underflow',
        label: 'fd_vm_find_input_mem_region',
        content: `// Underflow when offset < region->start
ulong gap_offset = vaddr - region_end; // Negative result stored in ulong
void * host_addr = (void *)(region->host_base + gap_offset);
// host_addr now points to memory BEFORE the sandbox`
      }
    ],
    merkleRoot: '0x7d1a3f9c6b3a7f2c1b9e4d6a8f5c0b2e',
    tags: ['Sandbox', 'OOB', 'Exploit', 'Firedancer', 'ASLR']
  },
  'exactly-verified-market': {
    title: 'Exactly Protocol Delegate Bypass',
    subtitle: 'VerifiedMarket Firewall Circumvention',
    id: 'OUROBOROS-EXACTLY-01',
    severity: 'CRITICAL',
    status: 'SUBMITTED',
    reality: 'C5-REAL',
    date: 'May 9, 2026',
    platform: 'Immunefi',
    bounty: '$3.3M TVL Risk',
    summary: 'VerifiedAuditor.checkBorrow() only enforces onlyAllowed(borrower). The delegated spender and receiver are never checked, allowing a revoked/non-allowed delegate to continue borrowing and withdrawing via ERC4626 allowance after firewall revocation.',
    evidence: [
      {
        type: 'PoC',
        label: 'test_poc_disallowedDelegateCanBorrow',
        content: `// 1. Grant allowance to Attacker
// 2. Remove Attacker from Firewall
// 3. Attacker calls borrow()
vm.prank(attacker);
auditor.checkBorrow(market, borrower, attacker, amount);
// [PASS] - Logic only checks borrower (owner)`
      }
    ],
    merkleRoot: '0x1b9e4d6a8f5c0b2e7d1a3f9c6b3a7f2c',
    tags: ['DeFi', 'Access Control', 'Optimism', 'Exactly', 'Logic Error']
  },
  'exactly-stale-oracle': {
    title: 'Exactly Stale Oracle L2',
    subtitle: 'Sequencer Uptime + Staleness Neglect',
    id: 'OUROBOROS-EXACTLY-02',
    severity: 'HIGH',
    status: 'PREPARED',
    reality: 'C5-REAL',
    date: 'May 9, 2026',
    platform: 'Immunefi',
    bounty: '$3.3M TVL Risk',
    summary: 'Auditor.sol uses deprecated latestAnswer() without staleness check, round completeness or L2 sequencer uptime validation. IPriceFeed interface structurally prevents staleness check. PriceFeedPool is manipulable via flash loan due to lack of feed health verification.',
    evidence: [
      {
        type: 'Oracle-Failure',
        label: 'Auditor.sol:latestAnswer',
        content: `// Deprecated call lacks timestamp/round check
int256 price = IPriceFeed(feed).latestAnswer();
// If Chainlink nodes stop updating on L2, price is stale
// Attacker exploits price lag during high volatility`
      }
    ],
    merkleRoot: '0x4d6a8f5c0b2e7d1a3f9c6b3a7f2c1b9e',
    tags: ['Oracle', 'Staleness', 'Optimism', 'Exactly', 'Price-Manipulation']
  },
  'bitflow-fee-evasion': {
    title: 'BitFlow DLMM Fee Evasion',
    subtitle: 'Fold-Loop MEV + Integer Truncation',
    id: 'OUROBOROS-BITFLOW-02',
    severity: 'HIGH',
    status: 'SUBMITTED',
    reality: 'C5-REAL',
    date: 'May 10, 2026',
    platform: 'Immunefi',
    bounty: 'Bounty Pool',
    summary: 'High-severity fee bypass in BitFlow DLMM. When token-delta <= 333, (/ (* 333 30) 10000) = 0 due to Clarity integer truncation. Attacker wraps DLMM swap in fold loop, routing 333 micro-tokens per iteration to bypass 100% of fees.',
    evidence: [
      {
        type: 'Clarity-Truncation',
        label: 'dlmm.clar:calc-fee',
        content: `;; FEE_SCALE_BPS = 10000, fee_bps = 30
(define-read-only (get-fee (amount uint))
  (/ (* amount u30) u10000)
)
;; If amount <= 333: (333 * 30) / 10000 = 9990 / 10000 = 0`
      }
    ],
    merkleRoot: '0x6b3a7f2c1b9e4d6a8f5c0b2e7d1a3f9c',
    tags: ['Stacks', 'Clarity', 'MEV', 'Truncation', 'Fee-Evasion']
  },
  'insurace-harvest': {
    title: 'InsurAce Permissionless Harvest',
    subtitle: 'Public Reward Control Exploit',
    id: 'OUROBOROS-INSURACE-01',
    severity: 'HIGH',
    status: 'SUBMITTED',
    reality: 'C5-REAL',
    date: 'May 5, 2026',
    platform: 'Immunefi',
    bounty: '$139K Exposure',
    summary: 'InsurAce RewardController harvest() is public with no msg.sender check. Attacker can front-run legitimate harvests, trigger premature reward distribution, and disrupt user boost windows to manipulate yield distribution.',
    evidence: [
      {
        type: 'Access-Control',
        label: 'RewardController.sol:harvest',
        content: `function harvest(address _vault) public {
    // [!] Missing onlyAllowed or msg.sender check
    _distributeRewards(_vault);
}`
      }
    ],
    merkleRoot: '0x0b2e7d1a3f9c6b3a7f2c1b9e4d6a8f5c',
    tags: ['DeFi', 'Access Control', 'Yield-Manipulation', 'InsurAce']
  }
};

export function initRouter() {
  const handleRoute = () => {
    const path = window.location.pathname;
    const match = path.match(/^\/audit\/([a-z0-9-]+)$/);
    
    if (match) {
      const reportId = match[1];
      if (REPORTS[reportId]) {
        renderReport(REPORTS[reportId]);
      } else {
        render404();
      }
    } else {
      // Show main landing
      document.body.classList.remove('viewing-report');
      const reportOverlay = document.getElementById('report-overlay');
      if (reportOverlay) reportOverlay.classList.remove('active');
    }
  };

  window.addEventListener('popstate', handleRoute);
  
  // Intercept links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.pathname.startsWith('/audit/')) {
      e.preventDefault();
      window.history.pushState(null, '', link.href);
      handleRoute();
    }
  });

  handleRoute();
}

function renderReport(report) {
  let overlay = document.getElementById('report-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'report-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="report-glass-bg"></div>
    <div class="report-container">
      <button class="report-close" id="report-close" aria-label="Close report">&times;</button>
      <header class="report-header">
        <div class="report-nav">
          <a href="/" class="report-back">← Portfolio of Proof</a>
          <span class="report-id">${report.id}</span>
          ${report.reality ? `<span class="report-reality-badge">${report.reality}</span>` : ''}
        </div>
        <div class="report-title-wrap">
          <div class="report-badge-row">
            <div class="report-badge severity-${report.severity.toLowerCase()}">${report.severity}</div>
            <div class="report-status-badge">${report.status}</div>
          </div>
          <h1>${report.title}</h1>
          <p class="report-subtitle">${report.subtitle}</p>
        </div>
        <div class="report-meta-grid">
          <div class="meta-item">
            <span class="meta-label">Date</span>
            <span class="meta-value">${report.date}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Platform</span>
            <span class="meta-value">${report.platform}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Verified Impact</span>
            <span class="meta-value">${report.bounty}</span>
          </div>
        </div>
      </header>

      <section class="report-section">
        <h3 class="section-divider">Forensic Summary</h3>
        <p class="report-summary-text">${report.summary}</p>
      </section>

      <section class="report-section">
        <h3 class="section-divider">Evidence Chain</h3>
        <div class="evidence-grid">
          ${report.evidence.map(ev => `
            <div class="evidence-card">
              <div class="evidence-header">
                <span class="evidence-type">${ev.type}</span>
                <span class="evidence-label">${ev.label}</span>
              </div>
              <div class="evidence-content-wrap">
                <pre class="evidence-content"><code>${escapeHtml(ev.content)}</code></pre>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <section class="report-section report-footer">
        <div class="report-merkle">
          <span class="merkle-label">Merkle Verification Hash (C5-REAL)</span>
          <code class="merkle-value">${report.merkleRoot}</code>
        </div>
        <div class="report-tags">
          ${report.tags.map(tag => `<span class="report-tag">#${tag}</span>`).join('')}
        </div>
      </section>
    </div>
  `;

  document.body.classList.add('viewing-report');
  overlay.classList.add('active');
  window.scrollTo(0, 0);

  const closeReport = (e) => {
    if (e) e.preventDefault();
    window.history.pushState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  overlay.querySelector('.report-back').addEventListener('click', closeReport);
  overlay.querySelector('#report-close').addEventListener('click', closeReport);
  
  // Close on ESC
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeReport();
      window.removeEventListener('keydown', handleEsc);
    }
  };
  window.addEventListener('keydown', handleEsc);
}

function render404() {
  const overlay = document.getElementById('report-overlay');
  if (overlay) {
    overlay.innerHTML = `
      <div class="report-container">
        <h1>404</h1>
        <p>Evidence not found or yet to be crystallized.</p>
        <a href="/" class="report-back">Return to Ledger</a>
      </div>
    `;
    overlay.classList.add('active');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
