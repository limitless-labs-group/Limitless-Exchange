import { defaultChain, markets } from '@/constants'
import { Metadata } from 'next'

type Props = {
  params: { address: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const market = markets.find(
    (market) => market.address[defaultChain.id]?.toLowerCase() === params.address.toLowerCase()
  )

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
