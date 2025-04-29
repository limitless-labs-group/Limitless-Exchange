const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
module.exports = withBundleAnalyzer({
  images: {
    disableStaticImages: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/lumy',
        destination: '/',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/ingest/:path*',
        destination: 'https://spindl.link/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // { TODO: needs polish
          //   key: 'Content-Security-Policy',
          //   value: "default-src 'self' https://*.limitless.exchange; script-src 'self' https://*.limitless.exchange https://challenges.cloudflare.com; style-src 'self' https://*.limitless.exchange 'unsafe-inline'; img-src 'self' https://*.limitless.exchange data: blob:; font-src 'self' https://*.limitless.exchange; object-src 'none'; base-uri 'self'; form-action 'self' https://*.limitless.exchange; frame-ancestors 'none'; child-src https://*.limitless.exchange https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org; frame-src https://*.limitless.exchange https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com; connect-src 'self' https://*.limitless.exchange https://auth.privy.io wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems https://explorer-api.walletconnect.com; worker-src 'self' https://*.limitless.exchange; manifest-src 'self' https://*.limitless.exchange"
          // },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Powered-By',
            value: 'false',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), interest-cohort=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '0', //# it's intentionally turned off filtering, due to potenial issues - https://github.com/helmetjs/helmet/issues/230
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          {
            key: 'Origin-Agent-Cluster',
            value: '?1',
          },
        ],
      },
    ]
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
})
