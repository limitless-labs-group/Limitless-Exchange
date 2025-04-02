import { Link } from '@chakra-ui/react'
import { FC, ReactNode, useMemo } from 'react'

interface MarketCardLinkProps {
  children: ReactNode
  marketAddress: string
}
export const MarketCardLink: FC<MarketCardLinkProps> = ({ children, marketAddress }) => {
  const href = useMemo(() => {
    return `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${marketAddress}`
  }, [marketAddress])

  return (
    <Link w='full' href={href} _hover={{ textDecoration: 'none' }}>
      {children}
    </Link>
  )
}
