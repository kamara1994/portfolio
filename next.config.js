/** @type {import('next').NextConfig} */

// Security headers applied to every route. Note: microphone is allowed for the
// PWEZA voice chat; camera and browser geolocation are disabled (visitor geo is
// resolved server-side from the request IP, never from the browser).
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Permissions-Policy', value: 'microphone=(self), camera=(), geolocation=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  {
    // Everything the site loads is first-party (fonts, images, audio are self-hosted);
    // outbound calls (LLMs, TTS, geo, Telegram) happen server-side only.
    // 'unsafe-inline' on scripts is required by Next.js inline bootstrap without nonces.
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "media-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' mailto:",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
]

const nextConfig = {
  // msedge-tts and its ws stack must stay external — webpack-bundling ws
  // breaks its frame masking on Vercel ("t.mask is not a function").
  experimental: {
    serverComponentsExternalPackages: ['msedge-tts', 'ws', 'isomorphic-ws'],
  },
  poweredByHeader: false,
  images: {
    domains: [],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

module.exports = nextConfig
