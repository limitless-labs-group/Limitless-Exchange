import NextLink from 'next/link'
import { PropsWithChildren } from 'react'

interface PositionCardContainerProps {
  marketLink: string
  expired: boolean
}

export default function PositionCardContainer({
  marketLink,
  expired,
  children,
}: PropsWithChildren<PositionCardContainerProps>) {
  return expired ? (
    <>{children}</>
  ) : (
    <NextLink href={`${marketLink}`} style={{ width: '100%' }}>
      {children}
    </NextLink>
  )
}
