import { Button } from '@/components'
import { defaultChain } from '@/constants'
import { useIsMobile, useMarketData } from '@/hooks'
import { useToken } from '@/hooks/use-token'
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
import { FaLink, FaXTwitter } from 'react-icons/fa6'
import { formatUnits } from 'viem'

export const MarketMetadata = ({ ...props }: StackProps) => {
  /**
   * MARKET DATA
   */
  const { market } = useTradingService()

  // const { data: collateralToken } = useToken(market?.collateralToken[defaultChain.id])
  //
  // const { liquidity, volume, outcomeTokensPercent } = useMarketData({
  //   marketAddress: market?.address[defaultChain.id],
  //   collateralToken,
  // })

  const liquidity = formatUnits(BigInt(market?.liquidity || '0'), 6)
  const volume = formatUnits(BigInt(market?.volume || '0'), 6)

  /**
   * ANALYTICS
   */
  const { trackClicked } = useAmplitude()

  const { onCopy, hasCopied } = useClipboard(window.location.href)

  const { tweetURI, castURI } = createMarketShareUrls(
    market,
    market?.outcomeTokensPercent || [50, 50]
  )

  const isMobile = useIsMobile()

  return (
    <Stack
      flexDir={{ sm: 'column', md: 'row' }}
      alignItems={{ sm: 'center', md: 'start' }}
      spacing={4}
      w={'full'}
      {...props}
    >
      <Image
        src={market?.imageURI}
        objectFit='cover'
        maxW={'140px'}
        maxH={'140px'}
        bg={'brand'}
        borderRadius={borderRadius}
        alt='market'
      />

      <Flex alignItems={'start'} gap={4} w={'full'} flexDirection={'column'}>
        <Heading fontSize={'28px'} w={'full'}>
          {market?.title}
        </Heading>
        {isMobile ? (
          <Stack w={'full'}>
            <HStack w={'full'} justifyContent={'space-between'}>
              <Text color={'fontLight'}>Deadline</Text>
              <Text fontWeight={'bold'}>{market?.expirationDate}</Text>
            </HStack>
            <HStack w={'full'} justifyContent={'space-between'}>
              <Text color={'fontLight'}>Liquidity</Text>
              <Text fontWeight={'bold'}>{`${NumberUtil.formatThousands(liquidity, 2)} ${
                market?.tokenTicker[defaultChain.id]
              }`}</Text>
            </HStack>
            <HStack w={'full'} justifyContent={'space-between'}>
              <Text color={'fontLight'}>Volume</Text>
              <Text fontWeight={'bold'}>{`${NumberUtil.formatThousands(volume, 4)} ${
                market?.tokenTicker[defaultChain.id]
              }`}</Text>
            </HStack>
          </Stack>
        ) : (
          <HStack w={'full'} spacing={4} justifyContent={'space-between'}>
            <Stack spacing={0}>
              <Text color={'fontLight'}>Liquidity</Text>
              <Text fontWeight={'bold'}>{`${NumberUtil.formatThousands(liquidity, 4)} ${
                market?.tokenTicker[defaultChain.id]
              }`}</Text>
            </Stack>

            <Stack spacing={0}>
              <Text color={'fontLight'}>Volume</Text>
              <Text fontWeight={'bold'}>{`${NumberUtil.formatThousands(volume, 4)} ${
                market?.tokenTicker[defaultChain.id]
              }`}</Text>
            </Stack>

            <Stack spacing={0}>
              <Text color={'fontLight'}>Deadline</Text>
              <Text noOfLines={1} fontWeight={'bold'}>
                {market?.expirationDate}
              </Text>
            </Stack>
          </HStack>
        )}

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
                <Image src='/assets/images/farcaster.png' blockSize={'15px'} alt='warpcast' />
                <Text>Share on Farcaster</Text>
              </Button>
            </PopoverContent>
          </Portal>
        </Popover>
        <VStack gap={'4px'} alignItems={'flex-start'} w={'full'}>
          <Text fontWeight={'semibold'} color={'fontLight'}>
            Created by
          </Text>
          <Divider />
        </VStack>
        <HStack>
          <Link href={market?.creator.link} isExternal>
            <Image
              minW={'44px'}
              minH={'44px'}
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
              alt='creator'
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
      </Flex>
    </Stack>
  )
}
