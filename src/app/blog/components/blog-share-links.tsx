import { HStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import React from 'react'
import { isMobile } from 'react-device-detect'
import CopyButton from '@/components/common/buttons/copy-button'
import WarpcastIcon from '@/resources/icons/Farcaster.svg'
import TwitterIcon from '@/resources/icons/X.svg'
import { ClickEvent, createPostShareUrls, useAmplitude } from '@/services'

interface BlogShareLinksProps {
  slug: string
}

export default function BlogShareLinks({ slug }: BlogShareLinksProps) {
  const postLink = `${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`

  const { trackClicked } = useAmplitude()

  const { tweetURI, castURI } = createPostShareUrls(slug)

  const onCopyClicked = () => {
    trackClicked(ClickEvent.PostLinkCopyClicked, {
      platform: isMobile ? 'mobile' : 'desktop',
      value: postLink,
    })
  }

  const shareButtons = [
    {
      icon: <TwitterIcon width={16} height={16} />,
      link: tweetURI,
      type: 'X/Twitter',
    },
    {
      icon: <WarpcastIcon width={16} height={16} />,
      link: castURI,
      type: 'Farcaster',
    },
  ]

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
      {shareButtons.map((button) => (
        <NextLink href={button.link} target='_blank' rel='noopener' passHref key={button.type}>
          <HStack
            p='8px'
            border='1px solid'
            borderColor='grey.200'
            rounded='8px'
            _hover={{ bg: 'grey.100' }}
          >
            {button.icon}
          </HStack>
        </NextLink>
      ))}
    </HStack>
  )
}
