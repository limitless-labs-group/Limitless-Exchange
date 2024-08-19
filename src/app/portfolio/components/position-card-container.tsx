import { PropsWithChildren } from 'react'
import NextLink from 'next/link'

interface PositionCardContainerProps {
  marketLink: string
  expired: boolean
}

export default function PositionCardContainer({
  marketLink,
  expired,
  children,
}: PropsWithChildren<PositionCardContainerProps>) {
  console.log(marketLink)
  return expired ? (
    <>{children}</>
  ) : (
    <NextLink href={`${marketLink}`} style={{ width: '100%' }}>
      {children}
    </NextLink>
  )
}
