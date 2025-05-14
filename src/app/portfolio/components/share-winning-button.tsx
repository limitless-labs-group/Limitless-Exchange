import { Button, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Modal } from '@/components/common/modals/modal'
import { ShareWin } from './share-win'
import usePageName from '@/hooks/use-page-name'
import ShareIcon from '@/resources/icons/share-icon.svg'
import { ClickEvent, useAmplitude } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export interface ShareWinningButtonProps {
  slug: string
  width?: string
  amountToClaim?: string
  symbol?: string
}
export const ShareWinningButton = ({
  slug,
  width = 'fit-content',
  amountToClaim,
  symbol,
}: ShareWinningButtonProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false)
  const { trackClicked } = useAmplitude()
  const pageName = usePageName()
  return (
    <>
      <Modal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        maxW='780px'
        minH={{ base: '500px', md: '700px' }}
      >
        <ShareWin marketSlug={slug} amountToClaim={amountToClaim} symbol={symbol} />
      </Modal>
      <Button
        w={width}
        variant='white'
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsShareOpen(true)
          trackClicked(ClickEvent.ShareWinChartButtonClicked, {
            page: pageName,
            market: slug,
          })
        }}
      >
        <HStack gap='4px'>
          <ShareIcon width={16} height={16} color='black' />
          <Text {...paragraphMedium} color='black'>
            Share
          </Text>
        </HStack>
      </Button>
    </>
  )
}
