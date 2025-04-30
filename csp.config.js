/**
 * @typedef {Object} SecurityPolicyEntry
 * @property {string[]} [base-uri] - Restricts URLs that can be used as the document base URI
 * @property {string[]} [child-src] - Restricts valid sources for web workers and nested browsing contexts
 * @property {string[]} [connect-src] - Restricts URLs for fetch, XHR, WebSocket and EventSource connections
 * @property {string[]} [default-src] - Default fallback for fetch directives when specific directives are not defined
 * @property {string[]} [font-src] - Specifies valid sources for font loading (woff, ttf, etc.)
 * @property {string[]} [form-action] - Controls valid endpoints for form submissions
 * @property {string[]} [frame-ancestors] - Controls which domains can embed your site in frames/iframes
 * @property {string[]} [frame-src] - Controls valid sources for frames and iframes
 * @property {string[]} [img-src] - Defines valid sources for images and favicons
 * @property {string[]} [manifest-src] - Controls valid sources for web app manifests
 * @property {string[]} [media-src] - Restricts valid sources for <audio> and <video> elements
 * @property {string[]} [object-src] - Controls valid sources for plugins like <object>, <embed> and <applet>
 * @property {string[]} [report-to] - Specifies reporting group for sending violation reports via the Reporting API
 * @property {string[]} [report-uri] - Defines endpoint for CSP violation reports (deprecated)
 * @property {string[]} [script-src] - Controls valid sources for JavaScript, preventing XSS attacks
 * @property {string[]} [style-src] - Controls valid sources for stylesheets to prevent CSS injection attacks
 * @property {string[]} [worker-src] - Defines valid sources for Worker, SharedWorker and ServiceWorker scripts
 */

const RPCs = [
  'https://base.drpc.org',
  'https://base.llamarpc.com',
  'https://base-pokt.nodies.app',
  'https://base.meowrpc.com',
  'https://base-rpc.publicnode.com',
]

/**
 * Merges multiple security policies into a single policy string.
 * @param {SecurityPolicyEntry[]} policies - Array of security policies
 * @returns {string} - Combined security policy string
 */
const defaultConfig = {
  'default-src': ["'self'", 'https://limitless.exchange'],
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'frame-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': true,
}

const limitlessPolicy = {
  'script-src': ['https://limitless.exchange', 'https://*.limitless.exchange'],
  'connect-src': [
    'https://api.limitless.exchange',
    'https://*.api.limitless.exchange',
    'wss://hermes.pyth.network',
    'https://mainnet.base.org',
    ...RPCs,
  ],
  'img-src': [
    'https://storage.googleapis.com/limitless-exchange-prod-424014',
    'https://pbs.twimg.com',
    'https://limitless.exchange',
  ],
}

const vercelPolicy = {
  'connect-src': ['https://vercel.live', 'https://*.pusher.com', 'wss://*.pusher.com'],
  'img-src': ['https://vercel.com'],
  'script-src': ['https://vercel.live'],
  'style-src': ['https://vercel.live'],
  'font-src': ['https://vercel.live'],
  'frame-src': ['https://vercel.live'],
}

const privyPolicy = {
  'script-src': ['https://challenges.cloudflare.com'],
  'style-src': ["'unsafe-inline'"],
  'img-src': ['blob:'],
  'child-src': [
    'https://auth.privy.io',
    'https://verify.walletconnect.com',
    'https://verify.walletconnect.org',
  ],
  'frame-src': [
    'https://auth.privy.io',
    'https://verify.walletconnect.com',
    'https://verify.walletconnect.org',
    'https://challenges.cloudflare.com',
  ],
  'connect-src': [
    "'self'",
    'https://auth.privy.io',
    'wss://relay.walletconnect.com',
    'wss://relay.walletconnect.org',
    'wss://www.walletlink.org',
    'https://*.rpc.privy.systems',
    'https://explorer-api.walletconnect.com',
  ],
  'worker-src': ["'self'"],
  'manifest-src': ["'self'"],
}

const intercomPolicy = {
  'script-src': [
    'https://app.intercom.io',
    'https://widget.intercom.io',
    'https://js.intercomcdn.com',
  ],
  'connect-src': [
    'https://via.intercom.io',
    'https://api.intercom.io',
    'https://api.au.intercom.io',
    'https://api.eu.intercom.io',
    'https://api-iam.intercom.io',
    'https://api-iam.eu.intercom.io',
    'https://api-iam.au.intercom.io',
    'https://api-ping.intercom.io',
    'https://nexus-websocket-a.intercom.io',
    'wss://nexus-websocket-a.intercom.io',
    'https://nexus-websocket-b.intercom.io',
    'wss://nexus-websocket-b.intercom.io',
    'https://nexus-europe-websocket.intercom.io',
    'wss://nexus-europe-websocket.intercom.io',
    'https://nexus-australia-websocket.intercom.io',
    'wss://nexus-australia-websocket.intercom.io',
    'https://uploads.intercomcdn.com',
    'https://uploads.intercomcdn.eu',
    'https://uploads.au.intercomcdn.com',
    'https://uploads.eu.intercomcdn.com',
    'https://uploads.intercomusercontent.com',
  ],
  'child-src': [
    'https://intercom-sheets.com',
    'https://www.intercom-reporting.com',
    'https://www.youtube.com',
    'https://player.vimeo.com',
    'https://fast.wistia.net',
  ],
  'font-src': ['https://js.intercomcdn.com', 'https://fonts.intercomcdn.com'],
  'form-action': [
    'https://intercom.help',
    'https://api-iam.intercom.io',
    'https://api-iam.eu.intercom.io',
    'https://api-iam.au.intercom.io',
  ],
  'media-src': [
    'https://js.intercomcdn.com',
    'https://downloads.intercomcdn.com',
    'https://downloads.intercomcdn.eu',
    'https://downloads.au.intercomcdn.com',
  ],
  'img-src': [
    'blob:',
    'data:',
    'https://js.intercomcdn.com',
    'https://static.intercomassets.com',
    'https://downloads.intercomcdn.com',
    'https://downloads.intercomcdn.eu',
    'https://downloads.au.intercomcdn.com',
    'https://uploads.intercomusercontent.com',
    'https://gifs.intercomcdn.com',
    'https://video-messages.intercomcdn.com',
    'https://messenger-apps.intercom.io',
    'https://messenger-apps.eu.intercom.io',
    'https://messenger-apps.au.intercom.io',
    'https://*.intercom-attachments-1.com',
    'https://*.intercom-attachments.eu',
    'https://*.au.intercom-attachments.com',
    'https://*.intercom-attachments-2.com',
    'https://*.intercom-attachments-3.com',
    'https://*.intercom-attachments-4.com',
    'https://*.intercom-attachments-5.com',
    'https://*.intercom-attachments-6.com',
    'https://*.intercom-attachments-7.com',
    'https://*.intercom-attachments-8.com',
    'https://*.intercom-attachments-9.com',
    'https://static.intercomassets.eu',
    'https://static.au.intercomassets.com',
  ],
  'style-src': ["'unsafe-inline'"],
  'frame-src': [
    'https://intercom-sheets.com',
    'https://www.intercom-reporting.com',
    'https://www.youtube.com',
    'https://player.vimeo.com',
    'https://fast.wistia.net',
  ],
}

function generateCSPHeader(policies) {
  const combined = policies.reduce((combined, policy) => {
    Object.keys(policy).forEach((directive) => {
      const sources = Array.from(new Set([...(combined[directive] ?? []), ...policy[directive]]))
      combined[directive] = sources
    })

    return combined
  }, {})

  const baseDirectives = Object.entries(combined).map(
    ([directive, sources]) => `${directive} ${sources.sort().join(' ')}`
  )

  return [...baseDirectives, 'upgrade-insecure-requests'].join('; ')
}

module.exports = {
  RPCs,
  defaultConfig,
  limitlessPolicy,
  vercelPolicy,
  privyPolicy,
  intercomPolicy,
  generateCSPHeader,
}
