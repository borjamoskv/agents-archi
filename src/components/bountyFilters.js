/* ══════════════════════════════════════════════════════════
   Bounty Grid Filters — C5-REAL
   ══════════════════════════════════════════════════════════ */

export function initBountyFilters() {
  const filters = document.querySelectorAll('.bounty-filter');
  const cards = document.querySelectorAll('.bounty-card');
  
  if (!filters.length || !cards.length) return;
  
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      
      // Update active state
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter cards
      let delay = 0;
      cards.forEach(card => {
        const severity = card.querySelector('.bounty-severity');
        if (!severity) return;
        
        const severityClass = severity.classList.contains('critical') ? 'critical' 
          : severity.classList.contains('high') ? 'high' 
          : severity.classList.contains('medium') ? 'medium' 
          : 'all';
        
        if (filter === 'all' || severityClass === filter) {
          card.classList.remove('filtered-out');
          // Reset animation classes to re-trigger animation
          card.style.animation = 'none';
          card.offsetHeight; // trigger reflow
          card.style.animation = '';
          card.style.animationDelay = `${delay * 50}ms`;
          delay++;
        } else {
          card.classList.add('filtered-out');
        }
      });
    });
  });
}
