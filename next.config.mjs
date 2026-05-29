/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // fal.ai CDN (generated images)
      { protocol: 'https', hostname: 'fal.media' },
      { protocol: 'https', hostname: '*.fal.media' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      // Cloudflare R2 public bucket
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.cloudflarestorage.com' },
      // Supabase avatars
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Exclude heavy server SDKs from webpack bundling — loaded at runtime via Node require()
  // This prevents build-time crashes when env vars are missing.
  serverExternalPackages: [
    'stripe',
    '@anthropic-ai/sdk',
    '@fal-ai/serverless-client',
    '@aws-sdk/client-s3',
    'resend',
  ],
}

export default nextConfig
