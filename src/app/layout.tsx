import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { Providers } from '@/app/providers'
import '../../public/fonts.css'

export const metadata: Metadata = {
  title: 'Limitless',
  icons: [{ url: '/assets/images/logo.svg' }],
  viewport: {
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <html lang='en'>
      <head>
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />
        <meta name='apple-mobile-web-app-title' content='Limitless' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='google' content='notranslate' />
        <meta name='description' content='Daily prediction markets on Base' />
      </head>
      <body>
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
          {/*<ReactQueryDevtools initialIsOpen={false} />*/}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
