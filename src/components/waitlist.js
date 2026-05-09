/* ═══════════════════════════════════════════════════════════
   agents.archi — Waitlist Form Component (C5-REAL)
   ═══════════════════════════════════════════════════════════ */

export function initWaitlistForm() {
  const form   = document.getElementById('waitlist-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('waitlist-email');
    const submitBtn  = document.getElementById('waitlist-submit');
    if (!emailInput || !submitBtn) return;

    const value = emailInput.value.trim();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showError(form, 'Enter a valid email address.');
      return;
    }

    clearError(form);
    submitBtn.disabled   = true;
    submitBtn.textContent = 'Registering…';

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      // Success state
      submitBtn.textContent = '✓ You\'re on the list';
      submitBtn.classList.add('btn-success');
      emailInput.value    = '';
      emailInput.disabled = true;
      submitBtn.disabled  = true;

      // Reset after 4s
      setTimeout(() => {
        submitBtn.textContent = 'Get Early Access';
        submitBtn.classList.remove('btn-success');
        emailInput.disabled   = false;
        submitBtn.disabled    = false;
      }, 4000);

    } catch {
      showError(form, 'Could not register. Try borja@moskv.com directly.');
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Get Early Access';
    }
  });
}

function showError(form, msg) {
  let el = form.querySelector('.waitlist-error');
  if (!el) {
    el = document.createElement('p');
    el.className = 'waitlist-error';
    el.style.cssText = 'color:var(--color-error,#ff4d4d);font-size:.8rem;margin:.4rem 0 0;';
    form.appendChild(el);
  }
  el.textContent = msg;
}

function clearError(form) {
  const el = form.querySelector('.waitlist-error');
  if (el) el.textContent = '';
}
