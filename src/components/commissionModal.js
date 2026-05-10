/* ═══════════════════════════════════════════════════════════
   agents.archi — Commission Request Component
   Interactive Forensic Target Submission
   ═══════════════════════════════════════════════════════════ */

export function initCommissionModal() {
  const btn = document.getElementById('btn-commission');
  if (!btn) return;

  btn.addEventListener('click', () => {
    openCommissionModal();
  });
}

function openCommissionModal() {
  const overlay = document.createElement('div');
  overlay.className = 'commission-overlay';
  overlay.innerHTML = `
    <div class="commission-container reveal">
      <button class="commission-close">&times;</button>
      <div class="commission-header">
        <div class="reality-badge">C5-TARGET</div>
        <h2>Forensic Commission</h2>
        <p>Submit agentic infrastructure for formal verification or adversarial audit.</p>
      </div>

      <form id="commission-form" class="commission-form">
        <div class="form-group">
          <label>Target Identifier (Domain/Repo/Contract)</label>
          <input type="text" name="target" placeholder="e.g. 0x... or github.com/org/repo" required>
        </div>
        
        <div class="form-group">
          <label>Verification Depth</label>
          <select name="depth">
            <option value="surface">Surface Audit (C4-Verification)</option>
            <option value="deep">Deep Formal Verification (ASL-Verified)</option>
            <option value="adversarial">Adversarial Stress Test (LEGIØN-1 Strike)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Mission Parameters / Critical Invariants</label>
          <textarea name="parameters" placeholder="Define the 'never' and 'always' properties for this agent..."></textarea>
        </div>

        <div class="form-footer">
          <div class="submission-meta">
            <span class="meta-label">Estimated Exergy:</span>
            <span class="meta-value" id="exergy-calc">Waiting for input...</span>
          </div>
          <button type="submit" class="btn btn-primary">Initialize Strike Pipeline</button>
        </div>
      </form>

      <div id="submission-result" class="submission-result" style="display: none;">
        <div class="result-icon">⬡</div>
        <h3>Target Registered</h3>
        <p>Your request has been crystallized into the target ledger. An Architect will review the exergy requirements and contact you via the encrypted channel provided.</p>
        <div class="result-hash" id="target-hash"></div>
        <button class="btn btn-outline close-result">Close Terminal</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('active'), 10);

  const form = overlay.querySelector('#commission-form');
  const closeBtn = overlay.querySelector('.commission-close');
  const exergyCalc = overlay.querySelector('#exergy-calc');

  closeBtn.addEventListener('click', () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 400);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeBtn.click();
  });

  // Dynamic exergy calculation
  form.addEventListener('input', () => {
    const depth = form.depth.value;
    const target = form.target.value;
    if (!target) {
      exergyCalc.textContent = 'Waiting for target...';
      return;
    }
    const base = depth === 'adversarial' ? 500 : (depth === 'deep' ? 200 : 50);
    const rand = Math.floor(Math.random() * 20);
    exergyCalc.textContent = `${base + rand}W (Estimated)`;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'CRYSTALLIZING...';

    setTimeout(() => {
      form.style.display = 'none';
      const result = overlay.querySelector('#submission-result');
      result.style.display = 'flex';
      overlay.querySelector('#target-hash').textContent = 'target_id: 0x' + Array.from({length: 40}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
      
      overlay.querySelector('.close-result').addEventListener('click', () => closeBtn.click());
    }, 1500);
  });
}
