// Vercel Serverless — /api/waitlist.js
// Collects waitlist emails and logs them in Vercel's platform logs.
// Upgrade path: swap appendEmail() for Resend/KV when available.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://agents.archi');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // C5-REAL: log entry visible in Vercel Dashboard → Logs
    console.log(JSON.stringify({
      event: 'waitlist_signup',
      email: trimmed,
      ts: new Date().toISOString(),
      source: req.headers['referer'] || 'direct',
    }));

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('waitlist error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
