/* ═══════════════════════════════════════════════════════════
   agents.archi — Live Threat Feed Component
   ═══════════════════════════════════════════════════════════ */

export async function renderLiveFeed() {
  const grid = document.getElementById('feed-grid');
  if (!grid) return;

  try {
    const response = await fetch('/api/threats.json');
    if (!response.ok) throw new Error('Feed failed');
    const threats = await response.json();

    grid.innerHTML = ''; 

    threats.forEach((t, i) => {
      const card = document.createElement('div');
      card.className = `feed-card feed-${t.severity} reveal`;
      card.id = `feed-${t.id}`;
      card.style.transitionDelay = `${i * 80}ms`;

      // ── Header ──
      const header = document.createElement('div');
      header.className = 'feed-card-header';

      const headerLeft = document.createElement('div');
      headerLeft.className = 'feed-header-left';
      const cve = document.createElement('span');
      cve.className = 'feed-cve';
      cve.textContent = t.cve;
      headerLeft.appendChild(cve);
      if (i === 0) {
        const badge = document.createElement('span');
        badge.className = 'feed-badge-new';
        badge.textContent = 'NEW';
        headerLeft.appendChild(badge);
      }

      const severity = document.createElement('span');
      severity.className = `feed-severity ${t.severity}`;
      severity.textContent = t.severity.toUpperCase();

      header.append(headerLeft, severity);

      // ── Body ──
      const title = document.createElement('h4');
      title.textContent = t.title;
      const desc = document.createElement('p');
      desc.textContent = t.desc;

      // ── Meta ──
      const meta = document.createElement('div');
      meta.className = 'feed-meta';
      const source = document.createElement('span');
      source.className = 'feed-source';
      source.textContent = t.source;
      meta.appendChild(source);
      if (t.cvss) {
        const cvss = document.createElement('span');
        cvss.className = `feed-cvss cvss-${t.severity}`;
        cvss.textContent = t.cvss;
        meta.appendChild(cvss);
      }
      const date = document.createElement('span');
      date.className = 'feed-date';
      date.textContent = t.date;
      meta.appendChild(date);

      card.append(header, title, desc, meta);
      grid.appendChild(card);
    });

    // Re-init reveal observer for new elements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  } catch {
    // Feed unavailable — hardcoded fallbacks rendered by threats.js
  }
}
