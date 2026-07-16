import { clientEnv } from "@repo/config/env/client";

const POSTHOG_ASSET_ORIGIN = "https://us-assets.i.posthog.com";
const POSTHOG_INGEST_ORIGIN = "https://us.i.posthog.com";
const LUDIC_FONT_ORIGIN = "https://font.ldcr.us";
const TURNSTILE_ORIGIN = "https://challenges.cloudflare.com";
const CARTO_ORIGIN = "https://basemaps.cartocdn.com";
const CARTO_TILE_ORIGIN = "https://*.basemaps.cartocdn.com";

export function applySecurityHeaders(
  response: Response,
  request: Request
): Response {
  const securedResponse = new Response(response.body, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });

  securedResponse.headers.set(
    "Permissions-Policy",
    "camera=(), geolocation=(), microphone=()"
  );
  securedResponse.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );
  securedResponse.headers.set("X-Content-Type-Options", "nosniff");
  securedResponse.headers.set("X-DNS-Prefetch-Control", "off");
  securedResponse.headers.set("X-Frame-Options", "DENY");
  securedResponse.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  securedResponse.headers.set("X-XSS-Protection", "0");
  securedResponse.headers.set("Origin-Agent-Cluster", "?1");

  if (new URL(request.url).protocol === "https:") {
    securedResponse.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  if (process.env.NODE_ENV === "production") {
    securedResponse.headers.set(
      "Content-Security-Policy",
      contentSecurityPolicy()
    );
  }

  return securedResponse;
}

function contentSecurityPolicy(): string {
  const convexUrl = new URL(clientEnv.VITE_CONVEX_URL);
  const convexWebSocketUrl = new URL(convexUrl);
  convexWebSocketUrl.protocol =
    convexUrl.protocol === "https:" ? "wss:" : "ws:";

  const connectSources = [
    "'self'",
    convexUrl.origin,
    convexWebSocketUrl.origin,
    CARTO_ORIGIN,
    CARTO_TILE_ORIGIN,
    TURNSTILE_ORIGIN,
  ];
  const imageSources = [
    "'self'",
    "data:",
    "blob:",
    // Blog Markdown and admin-managed company logos intentionally support
    // arbitrary public HTTPS image origins.
    "https:",
    "https://workoscdn.com",
    "https://*.convex.cloud",
    "https://abs.twimg.com",
    "https://pbs.twimg.com",
    "https://video.twimg.com",
    CARTO_ORIGIN,
    CARTO_TILE_ORIGIN,
    convexUrl.origin,
  ];
  const scriptSources = ["'self'", "'unsafe-inline'", TURNSTILE_ORIGIN];

  if (clientEnv.VITE_POSTHOG_KEY) {
    connectSources.push(POSTHOG_INGEST_ORIGIN, POSTHOG_ASSET_ORIGIN);
    imageSources.push(POSTHOG_ASSET_ORIGIN);
    scriptSources.push(POSTHOG_ASSET_ORIGIN);
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    `connect-src ${connectSources.join(" ")}`,
    `font-src 'self' data: ${LUDIC_FONT_ORIGIN}`,
    "form-action 'self'",
    `frame-src 'self' ${TURNSTILE_ORIGIN}`,
    "frame-ancestors 'none'",
    `img-src ${imageSources.join(" ")}`,
    "object-src 'none'",
    `script-src ${scriptSources.join(" ")}`,
    `style-src 'self' 'unsafe-inline' ${LUDIC_FONT_ORIGIN}`,
    "worker-src 'self' blob:",
  ].join("; ");
}
