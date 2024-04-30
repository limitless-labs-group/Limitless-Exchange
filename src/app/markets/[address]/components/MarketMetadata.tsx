import { Button } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { useIsMobile, useMarketData } from '@/hooks'
import {
  ClickEvent,
  ShareClickedMetadata,
  createMarketShareUrls,
  useAmplitude,
  useTradingService,
} from '@/services'
import { borderRadius, colors } from '@/styles'
import { NumberUtil } from '@/utils'

import {
  Avatar,
  Divider,
  Flex,
  HStack,
  Heading,
  Image,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  StackProps,
  Text,
  VStack,
  useClipboard,
} from '@chakra-ui/react'
import { FaShareSquare } from 'react-icons/fa'
import { FaCircle, FaLink, FaXTwitter } from 'react-icons/fa6'

export const MarketMetadata = ({ ...props }: StackProps) => {
  const { market } = useTradingService()
  const { trackClicked } = useAmplitude()
  const { liquidity, holdersCount, outcomeTokensPercent } = useMarketData({
    marketAddress: market?.address[defaultChain.id],
  })
  const { onCopy, hasCopied } = useClipboard(window.location.href)

  const { tweetURI, castURI } = createMarketShareUrls(market, outcomeTokensPercent)

  const isMobile = useIsMobile()

  return (
    <Stack w={'full'} alignItems={'start'} spacing={4} {...props}>
      <Stack
        flexDir={{ sm: 'column', md: 'row' }}
        alignItems={{ sm: 'center', md: 'start' }}
        spacing={4}
        w={'full'}
      >
        <Image
          src={market?.imageURI}
          minW={{ sm: 'full', md: '35%' }}
          // minH={{ sm: '200px', md: '30%' }}
          // aspectRatio={'4/3'}
          fit={'contain'}
          bg={'brand'}
          borderRadius={borderRadius}
        />

        <VStack alignItems={'start'} spacing={4} w={'full'}>
          {isMobile ? (
            <HStack
              w={'full'}
              fontSize={'12px'}
              color={'fontLight'}
              justifyContent={'space-between'}
              divider={<FaCircle size={'3px'} />}
              gap={2}
              fontWeight={'medium'}
            >
              <Text>{market?.expirationData}</Text>
              <Text>{`${NumberUtil.toFixed(liquidity, 4)} ${collateralToken.symbol}`}</Text>
              <Text>{holdersCount ?? 0} investors</Text>
            </HStack>
          ) : (
            <HStack w={'full'} spacing={4} justifyContent={'space-between'}>
              <Stack spacing={0}>
                <Text color={'fontLight'}>Pool</Text>
                <Text fontWeight={'bold'}>{`${NumberUtil.toFixed(liquidity, 4)} ${
                  collateralToken.symbol
                }`}</Text>
              </Stack>

              <Stack spacing={0}>
                <Text color={'fontLight'}>Investors</Text>
                <Text fontWeight={'bold'}>{holdersCount ?? 0}</Text>
              </Stack>

              <Stack spacing={0}>
                <Text color={'fontLight'}>Deadline</Text>
                <Text noOfLines={1} fontWeight={'bold'}>
                  {market?.expirationData}
                </Text>
              </Stack>
            </HStack>
          )}

          <Heading fontSize={'28px'}>{market?.title}</Heading>

          <Text>{market?.description}</Text>

          <Popover placement={'bottom-end'} trigger={'click'} isLazy>
            <PopoverTrigger>
              <Flex h={'full'} w={'full'}>
                <Button
                  w={'full'}
                  h={'40px'}
                  gap={2}
                  fontWeight={'normal'}
                  colorScheme={'transparent'}
                  border={`1px solid ${colors.border}`}
                >
                  <FaShareSquare />
                  <Text>Share</Text>
                </Button>
              </Flex>
            </PopoverTrigger>
            <Portal>
              <PopoverContent bg={'bg'} border={`1px solid ${colors.border}`} w={'200px'}>
                <Button
                  w={'full'}
                  h={'40px'}
                  gap={2}
                  fontWeight={'normal'}
                  colorScheme={'transparent'}
                  justifyContent={'start'}
                  onClick={() => {
                    trackClicked<ShareClickedMetadata>(ClickEvent.ShareClicked, {
                      type: 'Copy Link',
                      page: 'Market Page',
                    })
                    onCopy()
                  }}
                >
                  <FaLink />
                  {hasCopied ? 'Copied' : 'Copy link'}
                </Button>
                <Divider />
                <Button
                  w={'full'}
                  h={'40px'}
                  gap={2}
                  fontWeight={'normal'}
                  colorScheme={'transparent'}
                  justifyContent={'start'}
                  onClick={() => {
                    trackClicked<ShareClickedMetadata>(ClickEvent.ShareClicked, {
                      type: 'X/Twitter',
                      page: 'Market Page',
                    })
                    window.open(tweetURI, '_blank', 'noopener')
                  }}
                >
                  <FaXTwitter />
                  <Text>Share on X</Text>
                </Button>
                <Divider />
                <Button
                  w={'full'}
                  h={'40px'}
                  gap={2}
                  fontWeight={'normal'}
                  colorScheme={'transparent'}
                  justifyContent={'start'}
                  onClick={() => window.open(castURI, '_blank', 'noopener')}
                >
                  <Image src='/assets/images/farcaster.png' blockSize={'15px'} />
                  <Text>Share on Farcaster</Text>
                </Button>
              </PopoverContent>
            </Portal>
          </Popover>

          <HStack>
            <Link href={market?.creator.link} isExternal>
              <Image
                w={'44px'}
                h={'44px'}
                src={market?.creator.imageURI ?? '/assets/images/logo.svg'}
                borderRadius={'full'}
                border={'1px solid'}
                borderColor={'border'}
                bg={'brand'}
                p={0}
                cursor={'pointer'}
                fit={'cover'}
              />
            </Link>
            <VStack spacing={1} alignItems={'start'}>
              <Link href={market?.creator.link} isExternal>
                <Text fontWeight={'bold'} cursor={'pointer'} _hover={{ textDecor: 'underline' }}>
                  {market?.creator.name}
                </Text>
              </Link>
              <HStack spacing={1} fontSize={'12px'}>
                {market?.tags?.map((tag, i) => (
                  <Text key={i} p={'2px 6px'} bg={'bgLight'} borderRadius={'full'}>
                    {tag}
                  </Text>
                ))}
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      </Stack>
    </Stack>
  )
}
