let stripe;
let currentPlanId;

export async function loadStripeConfig() {
  try {
    let response = await fetch('/v1/stripe/config').catch(() => null);
    
    if (!response || !response.ok) {
      console.log('⬡ Redirecting to local config substrate...');
      response = await fetch('/api/stripe-config.json');
    }

    const config = await response.json();
    
    if (config.publicKey && typeof Stripe !== 'undefined') {
      stripe = Stripe(config.publicKey);
      console.log('⬡ Stripe initialized via secure config');
    }

    if (config.plans) {
      if (config.plans.pro) {
        const proEl = document.getElementById('price-pro');
        if (proEl) proEl.innerHTML = `$${config.plans.pro.amount}<small>/month</small>`;
        const proBtn = document.querySelector('[data-plan="pro"]');
        if (proBtn) proBtn.dataset.priceId = config.plans.pro.id;
      }
      if (config.plans.team) {
        const teamEl = document.getElementById('price-team');
        if (teamEl) teamEl.innerHTML = `$${config.plans.team.amount}<small>/month</small>`;
        const teamBtn = document.querySelector('[data-plan="team"]');
        if (teamBtn) teamBtn.dataset.priceId = config.plans.team.id;
      }
    }
  } catch (err) {
    console.error('⬡ Stripe Config Error:', err);
  }
}

export function initStripeCheckout() {
  const modal = document.getElementById('checkout-modal');
  const closeBtn = document.getElementById('modal-close');
  const planBtns = document.querySelectorAll('.plan-btn[data-plan]');
  const submitBtn = document.getElementById('checkout-submit-btn');

  if (!modal || !closeBtn) return;

  // ── Inline error display (replaces bare alert) ────────────
  let errorEl = document.getElementById('checkout-error');
  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl.id = 'checkout-error';
    errorEl.style.cssText = 'color:var(--color-error,#ff4d4d);font-size:.85rem;margin:.5rem 0 0;display:none;';
    submitBtn?.parentNode?.insertBefore(errorEl, submitBtn);
  }

  function showCheckoutError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  function clearCheckoutError() {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }

  planBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      const priceId = btn.dataset.priceId;
      const priceText = btn.closest('.plan-card').querySelector('.plan-price').textContent;
      
      currentPlanId = priceId;
      
      document.getElementById('summary-plan-name').textContent = plan === 'pro' ? 'Pro Agent' : 'Swarm Elite';
      document.getElementById('summary-plan-price').textContent = priceText.split('/')[0];

      // Reset modal to clean state
      clearCheckoutError();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pay Securely';
      const emailInput = document.getElementById('checkout-email');
      if (emailInput) emailInput.value = '';
      
      modal.classList.add('active');
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    clearCheckoutError();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      clearCheckoutError();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
      clearCheckoutError();
    }
  });

  submitBtn.addEventListener('click', async () => {
    const email = document.getElementById('checkout-email').value;
    if (!email) {
      showCheckoutError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showCheckoutError('Please enter a valid email address.');
      return;
    }

    clearCheckoutError();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Redirecting to Secure Checkout…';

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: currentPlanId, email }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || `Server error ${response.status}`);
      }

      // C5-REAL: redirect to Stripe hosted checkout
      window.location.href = data.url;

    } catch (err) {
      console.error('⬡ Checkout Error:', err);
      showCheckoutError('Could not start checkout. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pay Securely';
    }
  });
}
