import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { CSSProperties, PropsWithChildren } from 'react'
import { useAccount } from '@/services'
import { appendReferralCode } from '@/utils/market'

type LinkProps = PropsWithChildren & Omit<NextLinkProps, 'as'>
type ReferralLinkProps = LinkProps & {
  style?: CSSProperties
}

export const ReferralLink = ({ children, href, style, ...linkProps }: ReferralLinkProps) => {
  const { referralCode } = useAccount()
  const url = referralCode ? appendReferralCode(href.toString(), referralCode) : href
  return (
    <NextLink {...linkProps} href={url} style={style}>
      {children}
    </NextLink>
  )
}
