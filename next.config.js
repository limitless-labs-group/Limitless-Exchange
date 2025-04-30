const {
  generateCSPHeader,
  splitCSPIntoHeaders,
  defaultPolicy,
  limitlessPolicy,
  vercelPolicy,
  spindlPolicy,
  googleTagManagerPolicy,
  privyPolicy,
  intercomPolicy,
} = require('./csp.config')

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
    // Generate the full CSP policy
    const fullCSPPolicy = generateCSPHeader([
      defaultPolicy,
      limitlessPolicy,
      vercelPolicy,
      spindlPolicy,
      googleTagManagerPolicy,
      privyPolicy,
      intercomPolicy,
    ])

    const cspChunks = splitCSPIntoHeaders(fullCSPPolicy)

    const securityHeaders = [
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
        value: '0',
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'off',
      },
      {
        key: 'Origin-Agent-Cluster',
        value: '?1',
      },
    ]

    const cspHeaders = cspChunks.map((chunk) => ({
      key: 'Content-Security-Policy',
      value: chunk,
    }))

    return [
      {
        source: '/:path*',
        headers: [...cspHeaders, ...securityHeaders],
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
