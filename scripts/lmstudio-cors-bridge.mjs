import http from "node:http";

const BRIDGE_PORT = Number(process.env.LM_STUDIO_BRIDGE_PORT || 8787);
const LM_STUDIO_ORIGIN = process.env.LM_STUDIO_ORIGIN || "http://127.0.0.1:1234";

const server = http.createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const target = new URL(request.url, LM_STUDIO_ORIGIN);
    const upstream = await fetch(target, {
      method: request.method,
      headers: {
        "Content-Type": request.headers["content-type"] || "application/json",
      },
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request,
      duplex: "half",
    });

    response.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    response.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    response.writeHead(502, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    response.end(JSON.stringify({ error: `LM Studio bridge failed: ${error.message}` }));
  }
});

server.listen(BRIDGE_PORT, "127.0.0.1", () => {
  console.log(`Samuhik LM Studio bridge: http://127.0.0.1:${BRIDGE_PORT}/v1 -> ${LM_STUDIO_ORIGIN}/v1`);
});
