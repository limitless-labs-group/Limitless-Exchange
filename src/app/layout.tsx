import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Metadata } from 'next'
import Script from 'next/script'
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
        <Script
          id='intercom'
          dangerouslySetInnerHTML={{
            __html: `(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/' + 'pvixpx0m';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`,
          }}
        />
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
