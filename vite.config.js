import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { handler as geminiHandler } from "./netlify/functions/gemini.js";

const netlifyFunctionsPlugin = () => {
  return {
    name: 'netlify-functions',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/.netlify/functions/gemini' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            const event = {
              httpMethod: req.method,
              body: body,
            };
            try {
              const response = await geminiHandler(event);
              res.statusCode = response.statusCode;
              for (const [key, value] of Object.entries(response.headers || {})) {
                res.setHeader(key, value);
              }
              res.end(response.body);
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
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
