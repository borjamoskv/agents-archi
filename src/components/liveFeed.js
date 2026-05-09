export async function renderLiveFeed() {
  const grid = document.getElementById('feed-grid');
  if (!grid) return;

  const observeCards = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.feed-card').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 80}ms`;
      observer.observe(el);
    });
  };

  try {
    const response = await fetch('/api/threats.json');
    if (!response.ok) throw new Error('Feed failed');
    const threats = await response.json();

    grid.innerHTML = '';

    threats.forEach((t, i) => {
      const card = document.createElement('div');
      card.className = `feed-card feed-${sanitize(t.severity)} reveal`;
      card.id = `feed-${sanitize(t.id)}`;
      card.style.transitionDelay = `${i * 80}ms`;

      const header = document.createElement('div');
      header.className = 'feed-card-header';

      const headerLeft = document.createElement('div');
      headerLeft.className = 'feed-header-left';

      const cveSpan = document.createElement('span');
      cveSpan.className = 'feed-cve';
      cveSpan.textContent = t.cve;
      headerLeft.appendChild(cveSpan);

      if (i === 0) {
        const newBadge = document.createElement('span');
        newBadge.className = 'feed-badge-new';
        newBadge.textContent = 'NEW';
        headerLeft.appendChild(newBadge);
      }

      const sevSpan = document.createElement('span');
      sevSpan.className = `feed-severity ${sanitize(t.severity)}`;
      sevSpan.textContent = (t.severity || '').toUpperCase();

      header.appendChild(headerLeft);
      header.appendChild(sevSpan);

      const title = document.createElement('h4');
      title.textContent = t.title;

      const desc = document.createElement('p');
      desc.textContent = t.desc;

      const meta = document.createElement('div');
      meta.className = 'feed-meta';

      const source = document.createElement('span');
      source.className = 'feed-source';
      source.textContent = t.source;

      const date = document.createElement('span');
      date.className = 'feed-date';
      date.textContent = t.date;

      meta.appendChild(source);
      meta.appendChild(date);

      card.appendChild(header);
      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(meta);
      grid.appendChild(card);
    });

    observeCards();

  } catch {
    // API unavailable — keep hardcoded HTML from index.html intact
    observeCards();
  }
}

/** Strip non-alphanumeric chars to prevent class/id injection */
function sanitize(str) {
  return String(str || '').replace(/[^a-zA-Z0-9_-]/g, '');
}
