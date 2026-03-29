// Vercel Serverless Function — /api/playlist.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const M3U_URL = 'https://iptv-org.github.io/iptv/index.m3u';

  try {
    const response = await fetch(M3U_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
      },
    });

    if (!response.ok) {
      // Still return valid M3U so #EXTM3U check passes, client shows error gracefully
      return res.status(200).send(`#EXTM3U\n# Upstream error: ${response.status}`);
    }

    const text = await response.text();

    if (!text || !text.includes('#EXTM3U')) {
      return res.status(200).send(`#EXTM3U\n# Invalid upstream response`);
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(text);

  } catch (err) {
    console.error('Playlist fetch error:', err.message);
    // Return valid M3U header so client knows API is reachable
    res.status(200).send(`#EXTM3U\n# Fetch error: ${err.message}`);
  }
}
