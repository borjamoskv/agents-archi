// Vercel Serverless — /api/audit-request
// Accepts forensic audit requests without coupling the intake flow to Stripe.

import crypto from 'node:crypto';

const ALLOWED_DEPTHS = new Set(['surface', 'deep', 'adversarial']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const body = parseBody(req.body);
    const target = cleanText(body.target, 280);
    const email = cleanText(body.email, 120).toLowerCase();
    const depth = cleanText(body.depth, 32);
    const parameters = cleanText(body.parameters, 2000);

    if (target.length < 4) {
      return res.status(400).json({ error: 'Target is required' });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!ALLOWED_DEPTHS.has(depth)) {
      return res.status(400).json({ error: 'Invalid verification depth' });
    }

    const ts = new Date().toISOString();
    const requestId = createRequestId({ target, email, depth, parameters, ts });

    console.log(JSON.stringify({
      event: 'forensic_audit_request',
      requestId,
      target,
      email,
      depth,
      parametersHash: hash(parameters),
      parametersBytes: Buffer.byteLength(parameters),
      ts,
      source: req.headers.referer || 'direct',
    }));

    return res.status(200).json({ success: true, requestId });
  } catch (err) {
    console.error('audit request error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    return JSON.parse(body);
  }
  return body;
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function createRequestId(payload) {
  const digest = hash(JSON.stringify(payload)).slice(0, 12).toUpperCase();
  const day = new Date(payload.ts).toISOString().slice(0, 10).replaceAll('-', '');
  return `ARCHI-${day}-${digest}`;
}

function hash(value) {
  return crypto.createHash('sha256').update(value || '').digest('hex');
}
