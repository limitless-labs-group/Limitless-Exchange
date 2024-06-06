import { defaultChain } from '@/constants'
import { Metadata } from 'next'
import { useMarkets } from '@/services/MarketsService'

type Props = {
  params: { address: string }
}

const Layout = ({ children }: React.PropsWithChildren) => {
  return <>{children}</>
}

export default Layout
