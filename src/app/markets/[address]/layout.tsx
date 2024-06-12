import { Metadata } from 'next'
import { useMarket } from '@/services/MarketsService'
import axios from 'axios'
import { Market } from '@/types'

type Props = {
  params: { address: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let market: Market | null = null

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/${params.address}`
    )
    market = response.data
  } catch (error) {
    console.error('Failed to fetch market data:', error)
    return {}
  }

  return {
    title: market?.title ?? 'Limitless',
    openGraph: {
      title: market?.title ?? 'Limitless',
      description: market?.description ?? 'Limitless',
      images: [market?.ogImageURI ?? ''],
    },
  }
}

const Layout = ({ children }: React.PropsWithChildren) => {
  return <>{children}</>
}

export default Layout
