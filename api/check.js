// /api/check.js — Server-side stream health checker
// Browser CORS issue නෑ — Vercel server එකෙන් check කරනවා

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url param required' });

  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 8000);
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: ctrl.signal,
    });
    const ms = Date.now() - t0;
    const ok = response.ok || response.status === 206 || response.status === 200;
    const status = !ok ? 'dead' : ms > 3000 ? 'slow' : 'live';
    return res.status(200).json({ status, ms, httpStatus: response.status });
  } catch (e) {
    const ms = Date.now() - t0;
    const isTimeout = e.name === 'TimeoutError' || e.name === 'AbortError';
    return res.status(200).json({
      status: 'dead',
      ms,
      reason: isTimeout ? 'timeout' : e.message
    });
  }
}
