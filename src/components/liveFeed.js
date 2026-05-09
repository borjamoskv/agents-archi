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

      card.innerHTML = `
        <div class="feed-card-header">
          <div class="feed-header-left">
            <span class="feed-cve">${t.cve}</span>
            ${i === 0 ? '<span class="feed-badge-new">NEW</span>' : ''}
          </div>
          <span class="feed-severity ${t.severity}">${t.severity.toUpperCase()}</span>
        </div>
        <h4>${t.title}</h4>
        <p>${t.desc}</p>
        <div class="feed-meta">
          <span class="feed-source">${t.source}</span>
          ${t.cvss ? `<span class="feed-cvss cvss-${t.severity}">${t.cvss}</span>` : ''}
          <span class="feed-date">${t.date}</span>
        </div>
      `;

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

  } catch (err) {
    console.warn('⬡ Using hardcoded threat fallbacks:', err);
  }
}
