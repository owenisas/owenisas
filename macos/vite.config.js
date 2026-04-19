import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Serve the Vercel `/api/*` handlers during `vite dev` so Safari's proxy works locally.
function vercelApiDev() {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        const url = new URL(req.url, 'http://localhost');
        const route = url.pathname.replace(/^\/api\//, '').replace(/\/$/, '');
        try {
          const mod = await server.ssrLoadModule(`/../api/${route}.js`);
          const handler = mod.default;
          const query = Object.fromEntries(url.searchParams);
          const shim = {
            ...req,
            query,
            headers: req.headers,
          };
          const resShim = Object.assign(res, {
            status(code) { res.statusCode = code; return resShim; },
            json(data) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
              return resShim;
            },
            send(body) {
              if (Buffer.isBuffer(body)) res.end(body);
              else res.end(typeof body === 'string' ? body : JSON.stringify(body));
              return resShim;
            },
            setHeader: res.setHeader.bind(res),
          });
          await handler(shim, resShim);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), vercelApiDev()],
})
