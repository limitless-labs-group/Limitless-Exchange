const {
  generateCSPHeader,
  splitCSPIntoHeaders,
  tiktokPolicy,
  amplitudePolicy,
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
      tiktokPolicy,
      amplitudePolicy,
      googleTagManagerPolicy,
      privyPolicy,
      intercomPolicy,
    ])

    const securityHeaders = [
      {
        key: 'Content-Security-Policy', // to turn off rename to -> Content-Security-Policy-Report-Only
        value: fullCSPPolicy,
      },
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
        value: 'camera=(), microphone=()',
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

    return [
      {
        source: '/:path*',
        headers: [...securityHeaders],
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

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'limitless-0h',
  project: 'ui',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
})
