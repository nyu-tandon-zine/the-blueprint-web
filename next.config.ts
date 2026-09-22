import type { NextConfig } from "next";

// ----------------------------------------------------------------
// Content-Security-Policy for custom work pages.
//
// Custom pages under /public/custom/** are contributor-authored and run in
// a sandboxed iframe (see CustomFrame.tsx). This CSP is the second layer of
// defence: it limits what those pages can load and, crucially, blocks them
// from sending data anywhere (`connect-src 'none'`).
//
// Rules for contributors (also in docs/custom-pages.md):
//   • Inline all your CSS and JavaScript in index.html.
//   • Load extra libraries ONLY from the approved CDNs below.
//   • Images/audio: a file in your folder, a data: URI, or a Supabase URL.
//
// To approve another library CDN, add its host to script-src / style-src.
// ----------------------------------------------------------------
const CUSTOM_PAGE_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
  "style-src 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
  "img-src 'self' data: https:",
  "media-src 'self' data: https:",
  "font-src data: https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
  "connect-src 'none'",
  "frame-ancestors 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

const nextConfig: NextConfig = {
  // Lets a phone on the same Wi-Fi load the dev server via its LAN address
  // (the "Network:" URL `next dev` prints) instead of `localhost`. Without
  // this, Next 16 silently blocks cross-origin dev requests — the page's
  // static HTML still loads, but React never hydrates, so every button,
  // dropdown, and toggle on the site is inert. Dev-only; has no effect on
  // production builds. Update/extend this if your LAN IP changes.
  allowedDevOrigins: ['10.20.91.244'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/custom/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: CUSTOM_PAGE_CSP },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
  },
};

export default nextConfig;
