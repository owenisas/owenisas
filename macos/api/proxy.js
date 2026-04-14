export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const targetUrl = decodeURIComponent(url);

    // Validate URL
    const parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid protocol' });
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    const contentType = response.headers.get('content-type') || 'text/html';
    let body = await response.text();

    // Rewrite relative URLs to absolute
    const baseUrl = `${parsed.protocol}//${parsed.host}`;
    body = body
      .replace(/(href|src|action)="\/(?!\/)/g, `$1="${baseUrl}/`)
      .replace(/(href|src|action)='\/(?!\/)/g, `$1='${baseUrl}/`);

    // Remove X-Frame-Options blocking
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    return res.status(200).send(body);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
