const DEFAULT_TIMEOUT_MS = 120000;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    body: JSON.stringify(body),
  };
}

function resolveTargetUrl(event) {
  const baseUrl = process.env.LM_STUDIO_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error(
      "Missing LM_STUDIO_BASE_URL. Set it in Netlify to your HTTPS tunnel URL, for example https://your-tunnel.trycloudflare.com/v1."
    );
  }

  const rawPath = event.rawUrl ? new URL(event.rawUrl).pathname : event.path;
  const suffix = rawPath
    .replace(/^\/api\/llm/, "")
    .replace(/^\/\.netlify\/functions\/llm/, "");

  return `${baseUrl}${suffix || ""}${event.rawQuery ? `?${event.rawQuery}` : ""}`;
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(204, {});
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const targetUrl = resolveTargetUrl(event);

    const upstream = await fetch(targetUrl, {
      method: event.httpMethod,
      headers: {
        "Content-Type": event.headers["content-type"] || "application/json",
      },
      body: ["GET", "HEAD"].includes(event.httpMethod) ? undefined : event.body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    return {
      statusCode: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: await upstream.text(),
    };
  } catch (error) {
    return json(502, {
      error: "Samuhik Netlify LLM proxy failed",
      detail: error.message,
    });
  }
}
