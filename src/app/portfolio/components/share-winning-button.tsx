import { Button, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Modal } from '@/components/common/modals/modal'
import { ShareWin } from './share-win'
import ShareIcon from '@/resources/icons/share-icon.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export interface ShareWinningButtonProps {
  slug: string
  width?: string
}
export const ShareWinningButton = ({ slug, width = 'fit-content' }: ShareWinningButtonProps) => {
  const [isShareOpen, setIsShareOpen] = useState(false)
  return (
    <>
      <Modal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        maxW='780px'
        minH={{ base: '500px', md: '700px' }}
      >
        <ShareWin marketSlug={slug} />
      </Modal>
      <Button
        w={width}
        variant='white'
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsShareOpen(true)
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
