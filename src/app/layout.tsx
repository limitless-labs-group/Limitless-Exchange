import { Market } from '@/types'
import axios from 'axios'
import { getFrameMetadata } from 'frog/next'
import { Metadata } from 'next'
import { Providers } from '@/app/providers'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SpeedInsights } from '@vercel/speed-insights/next'

type Props = {
  params: { address: string }
}

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const response = await axios.get<Market>(
//     `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${params.address}`
//   )
//   const frameMetadata = await getFrameMetadata(
//     `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/frames/initial/${params.address}`
//   )
//   console.log(frameMetadata)
//   const market = response.data
//
//   return {
//     title: market?.title,
//     openGraph: {
//       title: market?.title,
//       description: market?.description,
//       // images: [`${market?.ogImageURI}`],
//     },
//     other: frameMetadata,
//   }
// }

const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <html lang='en'>
      <body>
        <Providers>
          {children}
          <SpeedInsights />
          <ReactQueryDevtools initialIsOpen={false} />
        </Providers>
      </body>
    </html>
  )
}

export default Layout
