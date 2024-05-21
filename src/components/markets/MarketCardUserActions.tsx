import { ShareURI } from '@/services'
import { colors } from '@/styles'
import { Button, HStack, Image, StackProps, useClipboard } from '@chakra-ui/react'
import { FaLink, FaXTwitter } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

interface IMarketCardUserActions extends StackProps {
  marketURI: string
  shareLinks: ShareURI
  mainActionButton?: ReactElement
}

export const MarketCardUserActions = ({
  marketURI,
  shareLinks,
  mainActionButton,
  ...props
}: IMarketCardUserActions) => {
  /**
   * NAVIGATION
   */
  const router = useRouter()

  const { onCopy, hasCopied } = useClipboard(marketURI)

  return (
    <HStack h={'33px'} {...props}>
      {mainActionButton ?? (
        <Button variant='black' h={'full'} w={'full'} p={1} onClick={() => router.push(marketURI)}>
          Trade
        </Button>
      )}
      <Button onClick={onCopy} variant='icon'>
        <FaLink size={'16px'} fill={hasCopied ? colors.brand : colors.font} />
      </Button>
      <Button variant='icon' onClick={() => window.open(shareLinks.tweetURI, '_blank', 'noopener')}>
        <FaXTwitter size={'16px'} />
      </Button>
      <Button onClick={() => window.open(shareLinks.castURI, '_blank', 'noopener')} variant='icon'>
        <Image src={'/assets/images/warpcast.svg'} h={'16px'} w={'16px'} alt={'warpcast'} />
      </Button>
    </HStack>
  )
}
