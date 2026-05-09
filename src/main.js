/* ═══════════════════════════════════════════════════════════
   agents.archi — Main Application Logic
   ═══════════════════════════════════════════════════════════ */

import './style.css';

// ── Threat Vector Data ──
const THREAT_VECTORS = [
  {
    icon: '🎯',
    title: 'Prompt Injection',
    desc: 'Agent executes attacker-controlled instructions embedded in user input, tool output, or retrieved context.',
    status: 'partial',
    statusText: 'Partial Coverage',
    accent: '#FF8C42',
  },
  {
    icon: '🔧',
    title: 'Tool Misuse',
    desc: 'Agent invokes tools in unintended ways — deleting files, transferring funds, or calling APIs beyond scope.',
    status: 'unsolved',
    statusText: 'No Solution',
    accent: '#FF3B5C',
  },
  {
    icon: '🧠',
    title: 'Memory Poisoning',
    desc: 'Long-term memory corrupted to alter future decisions. False memories injected across conversation boundaries.',
    status: 'unsolved',
    statusText: 'No Solution',
    accent: '#FF3B5C',
  },
  {
    icon: '🔓',
    title: 'Privilege Escalation',
    desc: 'Agent gains access to tools, data, or capabilities beyond its authorized scope through indirect manipulation.',
    status: 'unsolved',
    statusText: 'No Solution',
    accent: '#FF3B5C',
  },
  {
    icon: '💰',
    title: 'Economic Exploits',
    desc: 'Financial decisions manipulated through adversarial market conditions, oracle attacks, or engineered edge cases.',
    status: 'unsolved',
    statusText: 'No Solution',
    accent: '#FF3B5C',
  },
  {
    icon: '🔗',
    title: 'MCP Supply Chain',
    desc: 'Compromised MCP servers inject malicious tool definitions, exfiltrate data, or hijack agent execution flow.',
    status: 'unsolved',
    statusText: 'No Solution',
    accent: '#FF3B5C',
  },
  {
    icon: '🤝',
    title: 'Multi-Agent Collusion',
    desc: 'In swarm architectures, agents cooperate against the principal\'s interests through emergent or designed coordination.',
    status: 'unsolved',
    statusText: 'No Solution',
    accent: '#FF3B5C',
  },
  {
    icon: '♾️',
    title: 'Infinite Loop DoS',
    desc: 'Agent trapped in recursive execution, burning tokens and compute. No circuit breaker, no kill switch.',
    status: 'partial',
    statusText: 'Partial Coverage',
    accent: '#FF8C42',
  },
];

// ── Render Threat Grid ──
function renderThreatGrid() {
  const grid = document.getElementById('threat-grid');
  if (!grid) return;

  grid.innerHTML = THREAT_VECTORS.map((v, i) => `
    <div class="threat-card reveal" style="--card-accent: ${v.accent}; transition-delay: ${i * 60}ms">
      <div class="threat-card-header">
        <span class="threat-icon">${v.icon}</span>
        <span class="threat-status ${v.status}">${v.statusText}</span>
      </div>
      <h4>${v.title}</h4>
      <p>${v.desc}</p>
    </div>
  `).join('');
}

// ── Scroll Reveal Observer ──
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  // Observe all reveal elements
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Also observe major sections for staggered reveals
  document.querySelectorAll('.pillar, .bounty-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 100}ms`;
    observer.observe(el);
  });
}

// ── Counter Animation ──
function animateCounters() {
  const counters = document.querySelectorAll('.stat-value[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;

        let current = 0;
        const duration = 1500;
        const step = Math.ceil(target / (duration / 16));

        const tick = () => {
          current = Math.min(current + step, target);
          el.textContent = current;
          if (current < target) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ── Nav Scroll Effect ──
function initNavScroll() {
  const nav = document.getElementById('nav-main');
  if (!nav) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ── Smooth scroll for anchor links ──
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ── Score bar animation ──
function initScoreBars() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.score-fill').forEach(fill => {
          fill.style.width = `${fill.dataset.fill}%`;
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.scorecard-preview').forEach(el => observer.observe(el));
}

// ── Lab Metrics Logic ──
function initLabMetrics() {
  const throughputEl = document.getElementById('lab-throughput');
  const bars = document.querySelectorAll('#lab-chart .bar');
  if (!throughputEl || bars.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate throughput
        let val = 0;
        const target = 1242;
        const tick = () => {
          val += Math.floor(Math.random() * 50) + 20;
          if (val >= target) {
            throughputEl.innerHTML = `1.2k <small>inv/sec</small>`;
          } else {
            throughputEl.innerHTML = `${(val / 1000).toFixed(1)}k <small>inv/sec</small>`;
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);

        // Animate bars
        bars.forEach((bar, i) => {
          setTimeout(() => {
            bar.style.height = `${bar.dataset.h}%`;
          }, i * 100);
        });

        // Start random jitter
        setInterval(() => {
          const randomBar = bars[Math.floor(Math.random() * bars.length)];
          const baseH = parseInt(randomBar.dataset.h, 10);
          const jitter = (Math.random() - 0.5) * 15;
          randomBar.style.height = `${Math.max(20, Math.min(100, baseH + jitter))}%`;
        }, 800);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(document.getElementById('lab'));
}

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
  renderThreatGrid();
  initScrollReveal();
  animateCounters();
  initNavScroll();
  initSmoothScroll();
  initScoreBars();
  initLabMetrics();
});
