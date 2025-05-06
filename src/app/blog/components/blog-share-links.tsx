import { HStack } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import CopyButton from '@/components/common/buttons/copy-button'
import { ClickEvent, useAmplitude } from '@/services'

interface BlogShareLinksProps {
  slug: string
}

export default function BlogShareLinks({ slug }: BlogShareLinksProps) {
  const postLink = `${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`

  const { trackClicked } = useAmplitude()

  const onCopyClicked = () => {
    trackClicked(ClickEvent.PostLinkCopyClicked, {
      platform: isMobile ? 'mobile' : 'desktop',
      value: postLink,
    })
  }

  return (
    <HStack gap='8px'>
      <CopyButton
        link={postLink}
        onCopyClicked={onCopyClicked}
        startIcon
        variant='outlined'
        h='unset'
        w={isMobile ? '126px' : '114px'}
        p='7px 12px'
      />
    </HStack>
  )
}
