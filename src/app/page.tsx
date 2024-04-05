'use client'

import { Button, MainLayout, MarketCard } from '@/components'
import { defaultChain, markets } from '@/constants'
import { ClickEvent, CreateMarketClickedMetadata, OpenEvent, useAmplitude } from '@/services'
import { borderRadius, colors } from '@/styles'
import { Box, Grid, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { useEffect } from 'react'

const MainPage = () => {
  const { trackOpened, trackClicked } = useAmplitude()
  useEffect(() => {
    trackOpened(OpenEvent.PageOpened, {
      page: 'Explore Markets',
    })
  }, [])

  return (
    <MainLayout>
      <Stack w={'full'} spacing={5}>
        <HStack spacing={5} fontWeight={'bold'} fontSize={'15px'}>
          <Stack>
            <Text>All</Text>
            <Box w={'full'} h={'3px'} bg={'font'} />
          </Stack>
          <Stack cursor={'not-allowed'}>
            <Text color={'fontLight'}>Crypto</Text>
            <Box w={'full'} h={'3px'} bg={'none'} />
          </Stack>
          {/* <Stack cursor={'not-allowed'}>
            <Text color={'fontLight'}>Esports</Text>
            <Box w={'full'} h={'3px'} bg={'none'} />
          </Stack> */}
        </HStack>

        <Grid templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={6}>
          {/* Create market card. @TODO: incapsulate into dedicated component */}
          <Stack
            w={'full'}
            border={`1px solid ${colors.border}`}
            borderRadius={borderRadius}
            spacing={0}
            cursor={'pointer'}
            onClick={() =>
              window.open(
                'https://limitlesslabs.notion.site/Limitless-Creators-101-fbbde33a51104fcb83c57f6ce9d69d2a?pvs=4',
                '_blank'
              )
            }
          >
            <Image
              src={'/assets/images/create-market.svg'}
              w={{ sm: 'full' }}
              h={{ sm: '200px', md: '150px' }}
              fit={'contain'}
              bg={'bgLight'}
              borderRadius={borderRadius}
              borderEndStartRadius={0}
              borderEndEndRadius={0}
              p={4}
            />

            <Stack
              h={'full'}
              p={3}
              alignItems={'center'}
              textAlign={'center'}
              justifyContent={'space-between'}
            >
              <Stack>
                <Heading fontSize={'18px'} lineHeight={'24px'}>
                  Get started with Limitless
                </Heading>
                <Text color={'fontLight'}>
                  Learn how to create your markets and join the movement. Have skin in your beliefs.
                </Text>
              </Stack>
              <Button
                bg={'brand'}
                color={'white'}
                h={'40px'}
                w={'full'}
                p={1}
                onClick={() => {
                  trackClicked<CreateMarketClickedMetadata>(ClickEvent.CreateMarketClicked, {
                    page: 'Explore Markets',
                  })
                }}
                // onClick={() => router.push(marketURI)}
              >
                Create own market
              </Button>
            </Stack>
          </Stack>

          {markets.map(
            (market) =>
              !market.closed && (
                <MarketCard
                  key={market.address[defaultChain.id]}
                  marketAddress={market.address[defaultChain.id]}
                />
              )
          )}
        </Grid>
      </Stack>
    </MainLayout>
  )
}

export default MainPage
