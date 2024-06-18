import { Metadata } from 'next'
import axios from 'axios'
import { Market } from '@/types'

type Props = {
  params: { address: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const response = await axios.get<Market>(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${params.address}`
  )
  const market = response.data

  return {
    title: market?.title,
    openGraph: {
      title: market?.title,
      description: market?.description,
      images: [`${market?.ogImageURI}`],
    },
  }
}

const Layout = ({ children }: React.PropsWithChildren) => {
  return <>{children}</>
}

export default Layout
