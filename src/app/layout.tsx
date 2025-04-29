import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Metadata } from 'next'
import Script from 'next/script'
import { PropsWithChildren } from 'react'
import { CanonicalLink } from '@/components/common/canonical-link'
import { Providers } from '@/app/providers'
import { ReferralProvider } from '@/providers/Referral'
import { SpindlProvider } from '@/providers/Spindl'
import '../../public/fonts.css'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { r?: string }
}): Promise<Metadata> {
  const referralCode = searchParams?.r || ''

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://limitless.exchange'

  const ogImageUrl = referralCode
    ? `${baseUrl}/api/og?r=${encodeURIComponent(referralCode)}`
    : `${baseUrl}/api/og`

  const title = referralCode ? `Join Limitless with referral: ${referralCode}` : 'Limitless'

  const description = referralCode
    ? `Use this referral link to get started on Limitless Exchange`
    : 'Forecast the future on Limitless, financial prediction market'

  return {
    title,
    description,
    icons: [{ url: '/assets/images/logo.svg' }],
    viewport: {
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Limitless Exchange',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <html lang='en'>
      <head>
        <Script
          id='gtm-script'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-KTR8QTJ7');`,
          }}
        />
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />
        <meta name='apple-mobile-web-app-title' content='Limitless' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='google' content='notranslate' />
        <meta
          name='description'
          content='Forecast the future on Limitless, financial prediction market'
        />
        <CanonicalLink />
      </head>
      <body>
        <noscript>
          <iframe
            src='https://www.googletagmanager.com/ns.html?id=GTM-KTR8QTJ7'
            height='0'
            width='0'
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
          <SpindlProvider />
          <ReferralProvider />
          {/*<ReactQueryDevtools initialIsOpen={false} />*/}
        </Providers>
      </body>
    </html>
  )
}
export default RootLayout
