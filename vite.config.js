import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All /api/* → Fastify backend (port 3001)
      // The backend handles LLM calls internally via the CORS bridge.
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
