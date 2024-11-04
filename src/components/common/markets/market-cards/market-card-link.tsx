import { Link } from '@chakra-ui/react'
import { FC, ReactNode, useMemo } from 'react'

interface MarketCardLinkProps {
  children: ReactNode
  marketAddress: string
  group?: boolean
}
export const MarketCardLink: FC<MarketCardLinkProps> = ({ children, marketAddress, group }) => {
  const href = useMemo(() => {
    const query = group ? 'market-group' : 'markets'
    return `${process.env.NEXT_PUBLIC_FRAME_URL}/${query}/${marketAddress}`
  }, [marketAddress, group])

  return (
    <Link w='full' href={href}>
      {children}
    </Link>
  )
}
