export function initScrollReveal() {
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

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  document.querySelectorAll('.pillar, .bounty-card, .feed-card').forEach((el, i) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
    el.style.transitionDelay = `${i * 100}ms`;
    observer.observe(el);
  });
}

export function animateCounters() {
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

export function initScoreBars() {
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

export function initLabMetrics() {
  const throughputEl = document.getElementById('lab-throughput');
  const bars = document.querySelectorAll('#lab-chart .bar');
  if (!throughputEl || bars.length === 0) return;

  let jitterInterval = null;
  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
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

        bars.forEach((bar, i) => {
          setTimeout(() => {
            bar.style.height = `${bar.dataset.h}%`;
          }, i * 100);
        });
      }

      if (entry.isIntersecting && !jitterInterval) {
        jitterInterval = setInterval(() => {
          const randomBar = bars[Math.floor(Math.random() * bars.length)];
          const baseH = parseInt(randomBar.dataset.h, 10);
          const jitter = (Math.random() - 0.5) * 15;
          randomBar.style.height = `${Math.max(20, Math.min(100, baseH + jitter))}%`;
        }, 800);
      } else if (!entry.isIntersecting && jitterInterval) {
        clearInterval(jitterInterval);
        jitterInterval = null;
      }
    });
  }, { threshold: 0.2 });

  const labSection = document.getElementById('lab');
  if (labSection) observer.observe(labSection);

  window.addEventListener('pagehide', () => {
    if (jitterInterval) {
      clearInterval(jitterInterval);
      jitterInterval = null;
    }
  });
}

export function initTerminalAnimation() {
  const terminal = document.querySelector('.pillar-terminal');
  if (!terminal) return;

  const lines = terminal.querySelectorAll('.terminal-body .line');
  lines.forEach(line => {
    line.style.animationPlayState = 'paused';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        lines.forEach(line => {
          line.style.animationPlayState = 'running';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(terminal);
}

export function initTypingCursor() {
  const heroSub = document.getElementById('hero-sub');
  if (!heroSub) return;
  
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  heroSub.appendChild(cursor);
  
  setTimeout(() => cursor.remove(), 4000);
}

export function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}
