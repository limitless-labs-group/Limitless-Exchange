import axios from 'axios'
import { getFrameMetadata } from 'frog/next'
import { Metadata } from 'next'
import { Market } from '@/types'

type Props = {
  params: { address: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await axios.get<Market>(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${params.address}`
    )
    const frameMetadata = await getFrameMetadata(
      `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/frames/initial/${params.address}`
    )
    const market = response.data

    return {
      title: market?.proxyTitle ?? market?.title ?? 'Noname market',
      openGraph: {
        title: market?.proxyTitle ?? market?.title ?? 'Noname market',
        description: market?.description,
        images: [`${market?.ogImageURI}`],
      },
      //@ts-ignore
      other: frameMetadata,
    }
  } catch (error) {
    console.error(`Error fetching market`, error)

    return {}
  }
}

const Layout = ({ children }: React.PropsWithChildren) => {
  return <>{children}</>
}

export default Layout
