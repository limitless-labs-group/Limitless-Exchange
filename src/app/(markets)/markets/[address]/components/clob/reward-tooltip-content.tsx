import {
  Text,
  Box,
  HStack,
  Link,
  Portal,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import NextLink from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { formatUnits, maxUint256 } from 'viem'
import useMarketRewardsIncentive from '@/hooks/use-market-rewards'
import { useOrderBook } from '@/hooks/use-order-book'
import GemIcon from '@/resources/icons/gem-icon.svg'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { useMarketRewards } from '@/services/MarketsService'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'
import { calculateDisplayRange } from '@/utils/market'

interface RewardTooltipContentProps {
  contentHoverCallback: (arg: boolean) => void
  linkHoverCallback: (arg: boolean) => void
}

export const RewardTooltipContent = ({
  linkHoverCallback,
  contentHoverCallback,
}: RewardTooltipContentProps) => {
  const { market, clobOutcome } = useTradingService()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { data: orderbook } = useOrderBook(market?.slug)
  const { data: marketRewardsTotal } = useMarketRewardsIncentive(market?.slug, market?.tradeType)
  const minRewardsSize = orderbook?.minSize ? orderbook.minSize : maxUint256.toString()
  const range = calculateDisplayRange(
    clobOutcome,
    orderbook?.adjustedMidpoint,
    orderbook?.maxSpread
  )
  const { data: marketRewards } = useMarketRewards(market?.slug, market?.isRewardable)
  const { trackClicked } = useAmplitude()

  const initialFocusRef = useRef(null)
  const popoverContentRef = useRef(null)
  const [isClickOpen, setIsClickOpen] = useState(false)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleClickOutside = () => {
    if (isClickOpen) {
      setIsClickOpen(false)
      onClose()
    }
  }
  useOutsideClick({
    ref: popoverContentRef,
    handler: handleClickOutside,
  })

  useEffect(() => {
    contentHoverCallback(isOpen || isClickOpen)
  }, [isOpen, isClickOpen, contentHoverCallback])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const url =
    'https://limitlesslabs.notion.site/Limitless-Docs-0e59399dd44b492f8d494050969a1567#19304e33c4b9808498d9ea69e68a0cb4'

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    if (!isClickOpen) {
      onOpen()
    }
  }

  const handleMouseLeave = () => {
    if (!isClickOpen) {
      closeTimeoutRef.current = setTimeout(() => {
        onClose()
      }, 100)
    }
  }

  const handleClick = () => {
    trackClicked(ClickEvent.RewardsButtonClicked, {
      visible: isClickOpen ? 'off' : 'on',
    })
    setIsClickOpen(!isClickOpen)
    if (!isClickOpen) {
      onOpen()
    }
  }

  return (
    <Popover
      isOpen={isOpen || isClickOpen}
      onOpen={onOpen}
      onClose={() => {
        if (!isClickOpen) {
          onClose()
        }
      }}
      placement='top'
      closeOnBlur={false}
      closeOnEsc={false}
      initialFocusRef={initialFocusRef}
      gutter={4}
      modifiers={[
        { name: 'preventOverflow', options: { boundary: 'window' } },
        { name: 'flip', options: { fallbackPlacements: [] } },
        { name: 'offset', options: { offset: [0, 4] } },
      ]}
    >
      <PopoverTrigger>
        <HStack
          gap='4px'
          borderRadius='8px'
          py='4px'
          px='8px'
          bg={isOpen ? 'blue.500' : 'blueTransparent.100'}
          cursor='pointer'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <GemIcon />
          <Text {...paragraphMedium} color={isOpen ? 'white' : 'blue.500'}>
            {marketRewards && Boolean(marketRewards?.length)
              ? `Earnings ${NumberUtil.toFixed(marketRewards[0].totalUnpaidReward, 6)} ${
                  market?.collateralToken.symbol
                }`
              : 'Earn Rewards'}
          </Text>
        </HStack>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          w='auto'
          minW='260px'
          border='none'
          boxShadow='none'
          bg='transparent'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={popoverContentRef}
          mt='-4px'
        >
          <Box
            position='absolute'
            bottom='-4px'
            left='0'
            right='0'
            height='8px'
            bg='transparent'
            onMouseEnter={handleMouseEnter}
          />
          <PopoverBody p='0'>
            <Box
              bg='grey.50'
              border='1px solid'
              borderColor='grey.200'
              boxShadow='0px 1px 4px 0px rgba(2, 6, 23, 0.05)'
              w='260px'
              p='8px'
              rounded='8px'
              minH='128px'
            >
              <Text {...paragraphMedium} as='span'>
                Place limit order near the midpoint to get rewarded.
              </Text>
              <NextLink href={url} target='_blank' rel='noopener' passHref>
                <Link
                  variant='textLinkSecondary'
                  {...paragraphRegular}
                  isExternal
                  color='grey.500'
                  onMouseEnter={() => linkHoverCallback(true)}
                  onMouseLeave={() => linkHoverCallback(false)}
                >
                  {' '}
                  Learn more
                </Link>
              </NextLink>
              <HStack w='full' mt='12px' justifyContent='space-between'>
                <Text {...paragraphMedium}>Daily reward:</Text>
                <Text {...paragraphMedium}>
                  {marketRewardsTotal?.totalRewards
                    ? marketRewardsTotal.totalRewards.toFixed(0)
                    : '0'}{' '}
                  {market?.collateralToken.symbol}
                </Text>
              </HStack>
              <HStack w='full' mt='4px' justifyContent='space-between'>
                <Text {...paragraphMedium}>Max spread:</Text>
                <Text {...paragraphMedium}>
                  &#177;
                  {new BigNumber(orderbook?.maxSpread ? orderbook.maxSpread : '0')
                    .multipliedBy(100)
                    .toString()}
                  ¢
                </Text>
              </HStack>
              <HStack w='full' mt='4px' justifyContent='space-between'>
                <Text {...paragraphMedium}>Min contracts:</Text>
                <Text {...paragraphMedium}>
                  {formatUnits(BigInt(minRewardsSize), market?.collateralToken.decimals || 6)}
                </Text>
              </HStack>
              <HStack w='full' mt='4px' justifyContent='space-between'>
                <Text {...paragraphMedium}>Current range:</Text>
                <Text {...paragraphMedium}>
                  {range.lower}¢ - {range.upper}¢
                </Text>
              </HStack>
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
