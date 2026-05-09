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

    const originalText = submit.textContent;
    submit.textContent = '✓ Registered';
    submit.style.background = '#34D399';
    email.value = '';
    email.disabled = true;
    submit.disabled = true;

    window.location.href = `mailto:borja@moskv.com?subject=${encodeURIComponent('agents.archi Early Access')}&body=${encodeURIComponent('Requesting early access for: ' + value)}`;

    setTimeout(() => {
      submit.textContent = originalText;
      submit.style.background = '';
      email.disabled = false;
      submit.disabled = false;
    }, 3000);
  });
}
