import { Box, Link, Text, VStack } from '@chakra-ui/react'
import usePageName from '@/hooks/use-page-name'
import FeedIcon from '@/resources/icons/feed-icon.svg'
import GridIcon from '@/resources/icons/grid-icon.svg'
import NextLink from 'next/link'
import {
  ClickEvent,
  ProfileBurgerMenuClickedMetadata,
  ProfileBurgerMenuClickedOption,
  useAmplitude,
} from '@/services'
import React from 'react'

export default function MobileNavigation() {
  const pageName = usePageName()
  const { trackClicked } = useAmplitude()

  const pagesMenu = [
    {
      title: 'Markets',
      icon: <GridIcon width={16} height={16} />,
      link: '/',
      isActive: pageName === 'Explore Markets',
      amplitudeOption: 'Markets' as ProfileBurgerMenuClickedOption,
    },
    {
      title: 'Feed',
      icon: <FeedIcon width={16} height={16} />,
      link: '/feed',
      isActive: pageName === 'Feed',
      amplitudeOption: 'Feed' as ProfileBurgerMenuClickedOption,
    },
  ]

  return (
    <Box
      w='full'
      position='fixed'
      bottom={0}
      borderTop='1px solid'
      borderColor='grey.200'
      py='8px'
      bg='grey.100'
      display='flex'
    >
      {pagesMenu.map((page) => (
        <NextLink href={page.link} passHref style={{ width: '100%' }} key={page.title}>
          <Link
            onClick={() => {
              trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.ProfileBurgerMenuClicked, {
                option: page.amplitudeOption,
              })
            }}
            variant='transparent'
            w='full'
            color={page.isActive ? 'grey.800' : 'grey.500'}
            h='unset'
            _hover={{
              bg: 'unset',
            }}
          >
            <VStack flex={1} w='full' gap='8px'>
              {page.icon}
              <Text fontWeight={page.isActive ? 500 : 400} fontSize='14px'>
                {page.title}
              </Text>
            </VStack>
          </Link>
        </NextLink>
      ))}
    </Box>
  )
}
