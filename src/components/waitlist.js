/* ═══════════════════════════════════════════════════════════
   agents.archi — Waitlist Form Component
   ═══════════════════════════════════════════════════════════ */

export function initWaitlistForm() {
  const form = document.getElementById('waitlist-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('waitlist-email');
    const submit = document.getElementById('waitlist-submit');
    if (!email || !submit) return;

    const value = email.value.trim();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return;

    // Visual feedback
    const originalText = submit.textContent;
    submit.textContent = '✓ Registered';
    submit.classList.add('btn-success');
    email.value = '';
    email.disabled = true;
    submit.disabled = true;

    // Open mailto as fallback
    window.location.href = `mailto:borja@moskv.com?subject=${encodeURIComponent('agents.archi Early Access')}&body=${encodeURIComponent('Requesting early access for: ' + value)}`;

    setTimeout(() => {
      submit.textContent = originalText;
      submit.classList.remove('btn-success');
      email.disabled = false;
      submit.disabled = false;
    }, 3000);
  });
}
