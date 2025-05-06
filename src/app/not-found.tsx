'use client'

import { Text, Flex, VStack, HStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { isMobile } from 'react-device-detect'
import { MainLayout } from '@/components'
import NotFoundImage from '@/resources/icons/404.svg'
import { captionMedium, h1Bold } from '@/styles/fonts/fonts.styles'

export default function NotFound() {
  return (
    <MainLayout>
      <Flex
        width='full'
        justifyContent='center'
        alignItems='center'
        mt={isMobile ? '70px' : '150px'}
      >
        <VStack alignItems='center' justifyContent='center'>
          <NotFoundImage
            height={isMobile ? '356' : '528px'}
            width={isMobile ? '356' : '528px'}
            color='grey.900'
          />
          <HStack>
            <VStack flex='0.5'></VStack>
            <VStack flex='0.5' alignItems='start'>
              <Text {...h1Bold}>404</Text>
              <Text {...captionMedium}>page not found</Text>
              <Text {...captionMedium}>
                {`whoops — that's the limit but limitless means there's always more`}
              </Text>
              <Text {...captionMedium}>
                check out{' '}
                <NextLink href='/' style={{ textDecoration: 'underline' }}>
                  our markets
                </NextLink>
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Flex>
    </MainLayout>
  )
}
