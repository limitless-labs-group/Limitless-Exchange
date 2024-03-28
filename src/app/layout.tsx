import { Providers } from '@/app/providers'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata = {
  title: 'Limitless',
  icons: [{ url: '/assets/images/logo.svg' }],
}

const RootLayout = ({ children }: React.PropsWithChildren) => {
  return (
    <html lang='en'>
      <body>
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
