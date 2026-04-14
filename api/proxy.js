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
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || 'text/html';

    // For non-HTML content, pass through directly
    if (!contentType.includes('text/html')) {
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).send(Buffer.from(buffer));
    }

    let body = await response.text();

    // Rewrite relative URLs to absolute
    const baseUrl = `${parsed.protocol}//${parsed.host}`;

    // Add base tag for relative URL resolution
    const baseTag = `<base href="${baseUrl}/">`;
    body = body.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);

    // Inject script to defeat frame-busting before any other scripts run
    const frameBypassScript = `
      <script>
        // Override frame detection
        try {
          Object.defineProperty(window, 'top', { get: function() { return window; } });
          Object.defineProperty(window, 'parent', { get: function() { return window; } });
          Object.defineProperty(window, 'frameElement', { get: function() { return null; } });
        } catch(e) {}
        // Prevent location redirects
        window.__origLocation = window.location;
      </script>
    `;
    body = body.replace(/<head([^>]*)>/i, `<head$1>${frameBypassScript}`);

    // Remove frame-busting headers and CSP from meta tags
    body = body.replace(/<meta[^>]*http-equiv=["']?content-security-policy["']?[^>]*>/gi, '');
    body = body.replace(/<meta[^>]*http-equiv=["']?x-frame-options["']?[^>]*>/gi, '');

    // Set permissive headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    // Remove CSP by not setting it

    return res.status(200).send(body);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
