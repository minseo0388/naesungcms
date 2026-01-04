import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Get hostname (e.g. "myblog.localhost:3000" or "demo.platform.com")
    let hostname = req.headers.get("host")!;

    // Development: remove port if present
    // Make sure to replace .localhost for local dev testing
    const searchParams = req.nextUrl.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""
        }`;

    // --- SECURITY: CSRF Protection (Origin Check) ---
    // Only apply to state-changing methods (POST, PUT, DELETE, PATCH)
    // and specifically target /api routes (though middleware matcher filters, extra safety doesn't hurt)
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const origin = req.headers.get('origin')
        const host = req.headers.get('host')

        // If origin is present (browsers send it for CORS/POST), verify it.
        // We allow requests with no origin (e.g. server-to-server or mobile apps if not using browser logic)
        // But for browser-based CSRF, Origin is key.
        if (origin && host) {
            const originHost = origin.replace(/^https?:\/\//, '')
            // Check if origin matches host (Same Origin)
            // Also allow Vercel preview URLs if needed, or configured allowlist
            if (originHost !== host) {
                // Deny Cross-Origin mutations unless explicitly whitelisted (CORS is handled separately)
                // This blocks malicious.com from POSTing to our API via user's browser
                console.warn(`Blocked Cross-Origin Request: ${origin} -> ${host}`)
                return new NextResponse(null, { status: 403, statusText: "Forbidden (CSRF)" })
            }
        }
    }
    // ------------------------------------------------

    // Handle subdomain logic
    // Case 1: Custom domain or Subdomain
    // We need to know the root domain to extract the subdomain.
    // For now, let's assume ROOT_DOMAIN is defined in env (e.g. "platform.com")
    // If undefined, default to "localhost:3000" for dev

    // NOTE: In production, hardcode the root domain or use env
    const rootDomain = "localhost:3000";

    // Check if we are on a custom domain or subdomain
    const isMainDomain = hostname === rootDomain || hostname === "www." + rootDomain;

    // Dynamic CSP Construction
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const isLocal = appUrl.includes("localhost")

    // In LOCAL mode, we relax CSP slightly for convenience (images from any source?)
    // In PROD (S3), we limit to S3 + App Domain.

    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://*.s3.amazonaws.com https://res.cloudinary.com ${isLocal ? "*" : ""};
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()

    const requestHeaders = new Headers(req.headers)
    requestHeaders.set("x-nonce", "nonce-123") // Simplified nonce logic if needed
    requestHeaders.set("Content-Security-Policy", cspHeader)

    // Rewrite logic
    if (isMainDomain) {
        const response = NextResponse.next({
            request: { headers: requestHeaders },
        })
        response.headers.set("Content-Security-Policy", cspHeader)
        return response
    } else {
        let currentHost = hostname.replace(`.${rootDomain}`, "");
        const response = NextResponse.rewrite(
            new URL(`/${currentHost}${path}`, req.url),
            {
                request: { headers: requestHeaders },
            }
        );
        response.headers.set("Content-Security-Policy", cspHeader)
        return response
    }
}
