import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";

// Functions that are proxied to local JS handlers during dev.
const PROXIED_FUNCTIONS = ['gemini', 'pos-sync'];

const netlifyFunctionsPlugin = () => {
  return {
    name: 'netlify-functions',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url.split('?')[0];
        const fnName = PROXIED_FUNCTIONS.find(name => url.includes(`/.netlify/functions/${name}`));

        if (fnName) {
          console.log(`[Vite Proxy]: Intercepted ${req.method} ${url}`);
          
          // Handle CORS preflight
          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
            return res.end();
          }

          if (req.method !== 'POST') {
            res.statusCode = 405;
            return res.end(JSON.stringify({ error: 'Method not allowed' }));
          }

          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
            try {
              const baseDir = path.dirname(fileURLToPath(import.meta.url));
              const modPath = path.resolve(baseDir, `./netlify/functions/${fnName}.js`);
              const fileUrl = pathToFileURL(modPath).href + '?t=' + Date.now();
              
              const mod = await import(fileUrl);
              
              if (!mod.handler) {
                console.error('[Vite Proxy]: Export "handler" not found');
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Handler not found' }));
              }

              const response = await mod.handler({ 
                httpMethod: req.method, 
                body,
                headers: req.headers 
              });

              res.statusCode = response.statusCode;
              for (const [key, value] of Object.entries(response.headers || {})) {
                res.setHeader(key, value);
              }
              res.end(response.body);
            } catch (err) {
              console.error('[Vite Proxy ERROR]:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Proxy Error', message: err.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), netlifyFunctionsPlugin()],
  };
});
