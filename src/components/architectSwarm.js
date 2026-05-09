/* ═══════════════════════════════════════════════════════════
   agents.archi — Architect's Swarm Component
   Antigravity's full helper roster with domain filtering
   ═══════════════════════════════════════════════════════════ */

import {
  ARCHITECT_HELPERS,
  DOMAINS,
  getDomainStats,
  getHelpersByDomain,
  getHelperCount,
  getActiveHelpers,
} from '../data/architectTemplate.js';

let activeFilter = 'all';

export function initArchitectSwarm() {
  const container = document.getElementById('swarm-grid');
  const filterBar = document.getElementById('swarm-filters');
  const countEl = document.getElementById('swarm-count');
  if (!container) return;

  renderFilters(filterBar);
  renderSwarm(container, ARCHITECT_HELPERS);
  updateCount(countEl);
}

/* ── Filters ── */
function renderFilters(bar) {
  if (!bar) return;
  bar.innerHTML = '';

  // "All" filter
  const allBtn = createFilterBtn('all', `All (${getHelperCount()})`, '⬡');
  allBtn.classList.add('filter-active');
  bar.appendChild(allBtn);

  // Domain filters
  const stats = getDomainStats();
  Object.values(stats).forEach(domain => {
    if (domain.total === 0) return;
    const btn = createFilterBtn(domain.id, `${domain.label} (${domain.total})`, domain.icon);
    bar.appendChild(btn);
  });
}

function createFilterBtn(filterId, label, icon) {
  const btn = document.createElement('button');
  btn.className = 'swarm-filter-btn';
  btn.dataset.filter = filterId;
  btn.innerHTML = `<span class="filter-icon">${icon}</span><span class="filter-label">${label}</span>`;

  btn.addEventListener('click', () => {
    activeFilter = filterId;
    document.querySelectorAll('.swarm-filter-btn').forEach(b => b.classList.remove('filter-active'));
    btn.classList.add('filter-active');

    const container = document.getElementById('swarm-grid');
    const helpers = filterId === 'all' ? ARCHITECT_HELPERS : getHelpersByDomain(filterId);
    renderSwarm(container, helpers);
  });

  return btn;
}

/* ── Swarm Grid ── */
function renderSwarm(container, helpers) {
  container.innerHTML = '';

  helpers.forEach((helper, i) => {
    const card = document.createElement('div');
    card.className = `swarm-card swarm-tier-${helper.tier} reveal`;
    card.style.transitionDelay = `${i * 50}ms`;
    card.dataset.status = helper.status;

    // Domain accent stripe
    const stripe = document.createElement('div');
    stripe.className = 'swarm-card-stripe';
    stripe.style.background = helper.domain.color;
    card.appendChild(stripe);

    // Header
    const header = document.createElement('div');
    header.className = 'swarm-card-header';

    const nameRow = document.createElement('div');
    nameRow.className = 'swarm-name-row';

    const icon = document.createElement('span');
    icon.className = 'swarm-icon';
    icon.textContent = helper.domain.icon;

    const name = document.createElement('span');
    name.className = 'swarm-name';
    name.textContent = helper.name;

    const tierBadge = document.createElement('span');
    tierBadge.className = `swarm-tier-badge tier-${helper.tier}`;
    tierBadge.textContent = helper.tier.toUpperCase();

    nameRow.append(icon, name, tierBadge);

    const roleEl = document.createElement('div');
    roleEl.className = 'swarm-role';
    roleEl.textContent = helper.role;

    header.append(nameRow, roleEl);
    card.appendChild(header);

    // Description
    const desc = document.createElement('p');
    desc.className = 'swarm-desc';
    desc.textContent = helper.description;
    card.appendChild(desc);

    // Capabilities
    const caps = document.createElement('div');
    caps.className = 'swarm-caps';
    helper.capabilities.forEach(cap => {
      const tag = document.createElement('span');
      tag.className = 'swarm-cap-tag';
      tag.textContent = cap;
      caps.appendChild(tag);
    });
    card.appendChild(caps);

    // Status footer
    const footer = document.createElement('div');
    footer.className = 'swarm-card-footer';

    const statusDot = document.createElement('span');
    statusDot.className = `swarm-status-dot status-${helper.status}`;

    const statusText = document.createElement('span');
    statusText.className = 'swarm-status-text';
    statusText.textContent = helper.status.toUpperCase();

    const pulseLabel = document.createElement('span');
    pulseLabel.className = 'swarm-pulse';
    pulseLabel.textContent = `λ ${helper.pulse.toFixed(1)}s`;

    footer.append(statusDot, statusText, pulseLabel);
    card.appendChild(footer);

    // Reveal animation on scroll
    setTimeout(() => {
      card.classList.add('revealed');
    }, 100 + i * 50);

    container.appendChild(card);
  });
}

/* ── Count ── */
function updateCount(el) {
  if (!el) return;
  const active = getActiveHelpers().length;
  const total = getHelperCount();
  el.textContent = `${active}/${total} ACTIVE`;
}
