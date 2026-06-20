// ═══════════════════════════════════════════════════════════
//  agents.archi — Stripe Checkout Session (C5-REAL)
//  Vercel Serverless Function · Node.js Runtime
//  POST /api/create-checkout-session
//  Body: { priceId: string, email: string }
//  Returns: { url: string }  →  Stripe hosted checkout URL
// ═══════════════════════════════════════════════════════════

import Stripe from 'stripe';


export default async function handler(req, res) {
  // ── Method guard ──────────────────────────────────────────
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Env guard ─────────────────────────────────────────────
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('[stripe] STRIPE_SECRET_KEY not set');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  const priceIdSprint = process.env.PRICE_ID_SPRINT;
  const priceIdCouncil = process.env.PRICE_ID_COUNCIL;
  const priceIdCert = process.env.PRICE_ID_CERT;
  if (!priceIdSprint || !priceIdCouncil || !priceIdCert) {
    console.error('[stripe] PRICE_ID_SPRINT / COUNCIL / CERT not set');
    return res.status(500).json({ error: 'Product catalog not configured' });
  }

  // ── Body parsing ──────────────────────────────────────────
  const { plan, email } = req.body || {};

  // ── Input validation ──────────────────────────────────────
  const validPlans = {
    sprint: priceIdSprint,
    council: priceIdCouncil,
    cert: priceIdCert
  };

  if (!plan || !validPlans[plan]) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  const priceId = validPlans[plan];

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // ── Create Checkout Session ───────────────────────────────
  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2024-06-20' });

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://agents.archi';
    
    const mode = priceId === priceIdCouncil ? 'subscription' : 'payment';

    const session = await stripe.checkout.sessions.create({
      mode: mode,
      customer_email: email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/#pricing`,
      metadata: {
        source: 'agents.archi',
        cortex_taint: `taint:checkout:${Date.now()}`,
      },
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('[stripe] Checkout session error:', err.message);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
