import { Providers } from '@/app/providers';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Metadata } from 'next';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: 'Limitless',
  icons: [{ url: '/assets/images/logo.svg' }],
  viewport: {
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    <html lang='en'>
      <body>
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
          <ReactQueryDevtools initialIsOpen={false} />
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
