import { Metadata } from 'next'
import axios from 'axios'
import { Market } from '@/types'
import { getFrameMetadata } from 'frog'

type Props = {
  params: { address: string }
}

// export async function generateMetadata(): Promise<Metadata> {
//   const url = process.env.VERCEL_URL || 'http://localhost:3000'
//   const frameMetadata = await getFrameMetadata(`${url}/markets`)
//   return {
//     other: frameMetadata,
//   }
// }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const response = await axios.get<Market>(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${params.address}`
  )
  const frameMetadata = await getFrameMetadata(
    `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${params.address}`
  )
  console.log(frameMetadata)
  const market = response.data

  return {
    title: market?.title,
    openGraph: {
      title: market?.title,
      description: market?.description,
      images: [`${market?.ogImageURI}`],
    },
    //@ts-ignore
    other: frameMetadata,
  }
}

const Layout = ({ children }: React.PropsWithChildren) => {
  return <>{children}</>
}

export default Layout
