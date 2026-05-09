/* ═══════════════════════════════════════════════════════════
   agents.archi — Certification Portal Component
   Merkle Tree Canvas + SAGA Pipeline Animation
   ═══════════════════════════════════════════════════════════ */

// ── Merkle Tree Canvas ──
function drawMerkleTree(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let w, h, nodes, frame;
  const accentRGB = [43, 59, 229];
  const greenRGB = [52, 211, 153];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildTree();
  }

  function buildTree() {
    nodes = [];
    const levels = 5;
    const padding = 40;
    const levelH = (h - padding * 2) / (levels - 1);

    for (let level = 0; level < levels; level++) {
      const count = Math.pow(2, level);
      const y = padding + level * levelH;
      const availW = w - padding * 2;
      for (let i = 0; i < count; i++) {
        const x = padding + (availW / (count + 1)) * (i + 1);
        const hash = genHash(8);
        const parentIdx = level > 0 ? Math.floor(nodes.length - count - Math.floor(i / 2) + (count / 2) - 1) : -1;
        nodes.push({ x, y, level, hash, parentIdx, glow: 0, verified: false });
      }
    }
  }

  function genHash(len) {
    const chars = '0123456789abcdef';
    let s = '';
    for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  function animate() {
    frame = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    for (const node of nodes) {
      if (node.parentIdx < 0) continue;
      const parent = nodes[node.parentIdx];
      if (!parent) continue;
      const alpha = node.verified ? 0.4 : 0.1;
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(parent.x, parent.y);
      const grad = ctx.createLinearGradient(node.x, node.y, parent.x, parent.y);
      if (node.verified) {
        grad.addColorStop(0, `rgba(${greenRGB},${alpha})`);
        grad.addColorStop(1, `rgba(${greenRGB},${alpha * 0.5})`);
      } else {
        grad.addColorStop(0, `rgba(${accentRGB},${alpha})`);
        grad.addColorStop(1, `rgba(${accentRGB},${alpha * 0.5})`);
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw nodes
    const t = Date.now() / 1000;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const radius = n.level === 0 ? 14 : n.level < 3 ? 10 : 7;

      // Glow decay
      n.glow = Math.max(0, n.glow - 0.02);

      // Node circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      if (n.verified) {
        ctx.fillStyle = `rgba(${greenRGB}, 0.15)`;
        ctx.strokeStyle = `rgba(${greenRGB}, ${0.5 + n.glow * 0.5})`;
      } else {
        ctx.fillStyle = `rgba(${accentRGB}, 0.08)`;
        ctx.strokeStyle = `rgba(${accentRGB}, ${0.3 + n.glow * 0.7})`;
      }
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      // Glow ring
      if (n.glow > 0) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 8 * n.glow, 0, Math.PI * 2);
        const rgb = n.verified ? greenRGB : accentRGB;
        ctx.strokeStyle = `rgba(${rgb}, ${n.glow * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Hash text on larger nodes
      if (n.level < 3 && radius > 8) {
        ctx.fillStyle = n.verified ? `rgba(${greenRGB}, 0.7)` : `rgba(240,240,245, 0.4)`;
        ctx.font = `${Math.max(7, radius - 3)}px JetBrains Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.hash.slice(0, 4), n.x, n.y);
      }
    }

    // Periodic verification wave (bottom-up)
    if (Math.floor(t * 0.5) !== Math.floor((t - 0.016) * 0.5)) {
      const idx = Math.floor(Math.random() * nodes.length);
      propagateVerify(idx);
    }
  }

  function propagateVerify(idx) {
    if (idx < 0 || idx >= nodes.length) return;
    const node = nodes[idx];
    node.verified = true;
    node.glow = 1;
    node.hash = genHash(8);
    if (node.parentIdx >= 0) {
      setTimeout(() => propagateVerify(node.parentIdx), 300);
    }
    // Update root hash display
    if (node.level === 0) {
      const el = document.getElementById('merkle-root-hash');
      if (el) el.textContent = 'root: 0x' + genHash(32);
    }
  }

  window.addEventListener('resize', resize);
  resize();
  animate();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
  };
}

// ── SAGA Pipeline Animation ──
function initSagaPipeline() {
  const steps = document.querySelectorAll('.saga-step');
  if (!steps.length) return;

  let current = 0;

  function cycleStep() {
    steps.forEach((s, i) => {
      s.classList.remove('step-active', 'step-passed');
      if (i < current) s.classList.add('step-passed');
      if (i === current) s.classList.add('step-active');
    });
    current = (current + 1) % (steps.length + 1);
    if (current === steps.length) {
      // All passed — hold briefly, then reset
      steps.forEach(s => s.classList.add('step-passed'));
      setTimeout(() => {
        current = 0;
        steps.forEach(s => s.classList.remove('step-active', 'step-passed'));
        setTimeout(cycleStep, 800);
      }, 2000);
      return;
    }
    setTimeout(cycleStep, 1200);
  }

  // Start when visible
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      cycleStep();
    }
  }, { threshold: 0.3 });
  observer.observe(steps[0].closest('.saga-pipeline'));
}

// ── Trust Metrics Counter ──
function animateTrustMetrics() {
  const metrics = document.querySelectorAll('.trust-metric-value[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = el.dataset.count;
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const isFloat = target.includes('.');
      const end = parseFloat(target);
      const duration = 2000;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = eased * end;
        el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  metrics.forEach(m => observer.observe(m));
}

// ── Seal pulse effect ──
function initSealPulse() {
  const core = document.querySelector('.cert-seal-core');
  if (!core) return;
  setInterval(() => {
    core.style.boxShadow = '0 0 40px rgba(43,59,229,0.5)';
    setTimeout(() => {
      core.style.boxShadow = '0 0 30px rgba(43,59,229,0.25)';
    }, 400);
  }, 3000);
}

// ── Export ──
export function initCertificationPortal() {
  const canvas = document.getElementById('merkle-canvas');
  if (canvas) drawMerkleTree(canvas);
  initSagaPipeline();
  animateTrustMetrics();
  initSealPulse();
}
