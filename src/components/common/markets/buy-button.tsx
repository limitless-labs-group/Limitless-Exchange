import { Box, Button, HStack, Text, Tooltip, useOutsideClick, VStack } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import BigNumber from 'bignumber.js'
import { AnimatePresence, motion } from 'framer-motion'
import Cookies from 'js-cookie'
import { usePathname } from 'next/navigation'
import React, {
  Dispatch,
  LegacyRef,
  MutableRefObject,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { isMobile } from 'react-device-detect'
import { Address, parseUnits } from 'viem'
import Loader from '@/components/common/loader'
import TradeWidgetSkeleton, {
  SkeletonType,
} from '@/components/common/skeleton/trade-widget-skeleton'
import BlockedTradeTemplate from '@/app/(markets)/markets/[address]/components/trade-widgets/blocked-trade-template'
import ConfirmButton from '@/app/(markets)/markets/[address]/components/trade-widgets/confirm-button'
import CheckedIcon from '@/resources/icons/checked-icon.svg'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import { ClickEvent, TradeQuotes, useAccount, useAmplitude, useTradingService } from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'
import { useWeb3Service } from '@/services/Web3Service'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market, MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'
import { BLOCKED_REGION } from '@/utils/consts'

interface ActionButtonProps {
  onClick: () => Promise<void>
  market: Market
  amount: string
  option: 'Yes' | 'No'
  price?: number
  quote?: TradeQuotes | null
  decimals?: number
  marketType: 'group' | 'single'
  showReturnPercent: boolean
  setShowReturnPercent: Dispatch<SetStateAction<boolean>>
  showFeeInValue: boolean
  setShowFeeInValue: Dispatch<SetStateAction<boolean>>
  isExceedsBalance: boolean
  resetForm: () => void
  quotesLoading: boolean
}

// @ts-ignore
const MotionBox = motion(Box)

export type ButtonStatus =
  | 'initial'
  | 'confirm'
  | 'transaction-broadcasted'
  | 'success'
  | 'error'
  | 'unlock'
  | 'unlocking'

export default function BuyButton({
  onClick,
  quote,
  market,
  price,
  option,
  amount,
  decimals,
  marketType,
  showFeeInValue,
  setShowReturnPercent,
  setShowFeeInValue,
  showReturnPercent,
  isExceedsBalance,
  resetForm,
  quotesLoading,
}: ActionButtonProps) {
  const [marketLocked, setMarketLocked] = useState(false)
  const [tradingBlocked, setTradingBlocked] = useState(false)
  const [showFullInfo, setShowFullInfo] = useState(false)
  const pathname = usePathname()
  /**
   * ANALITYCS
   */
  const { trackClicked } = useAmplitude()
  const { pushGA4Event } = useGoogleAnalytics()
  const country = Cookies.get('limitless_geo')

  const ref = useRef<HTMLElement>()
  const { client, checkAllowance, approveContract } = useWeb3Service()
  const { marketFee, collateralAmount } = useTradingService()
  const { account: walletAddress, loginToPlatform } = useAccount()

  const [status, setStatus] = useState<ButtonStatus>('initial')
  const INFO_MSG = 'Market is locked. Trading stopped. Please await for final resolution.'
  const TRADING_BLOCKED_MSG =
    'Trading is unavailable to individuals or companies based in the U.S. or restricted territories.'

  useOutsideClick({
    ref: ref as MutableRefObject<HTMLElement>,
    handler: () => {
      if (!['transaction-broadcasted', 'success'].includes(status)) {
        setStatus('initial')
      }
    },
  })

  const analyticsSource = useMemo(() => {
    if (pathname === '/') {
      return 'Home'
    }
    if (pathname === '/portfolio') {
      return 'Portfolio'
    }
    return 'Feed'
  }, [pathname])

  const handleFeeToggleClicked = (e: SyntheticEvent) => {
    trackClicked(ClickEvent.FeeTradingDetailsClicked, {
      from: showFeeInValue ? 'numbers' : 'percentage',
      to: showFeeInValue ? 'percentage' : 'numbers',
      platform: isMobile ? 'mobile' : 'desktop',
      marketAddress: market.address,
    })
    e.stopPropagation()
    setShowFeeInValue(!showFeeInValue)
  }

  const headerStatus = useMemo(() => {
    let content
    switch (status) {
      case 'transaction-broadcasted':
        content = (
          <>
            <Loader />
            <Text {...paragraphMedium} color='white'>
              Buying...
            </Text>
          </>
        )
        break
      case 'success':
        content = (
          <>
            <AnimatePresence>
              <MotionBox
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                position='absolute'
                width='100%'
                display='flex'
                alignItems='center'
                gap='8px'
              >
                <CheckedIcon width={16} height={16} />
                <Text {...paragraphMedium} color='white'>
                  Bought
                </Text>
              </MotionBox>
            </AnimatePresence>
          </>
        )
        break
      default:
        content = (
          <HStack w='full' justifyContent='space-between'>
            <HStack gap='8px'>
              <HStack gap='4px'>
                <Text {...paragraphMedium} color='white'>
                  {option === 'Yes' ? 'YES' : 'NO'} {`${price}%`}
                </Text>
              </HStack>
            </HStack>
            <Tooltip
              variant='black'
              label={`Fee: (${marketFee * 100}%) ${NumberUtil.convertWithDenomination(
                new BigNumber(amount).multipliedBy(marketFee).toNumber(),
                6
              )} ${market?.collateralToken.symbol}`}
              placement='top-end'
            >
              <Text
                {...paragraphRegular}
                color='white'
                borderBottom={quote?.outcomeTokenAmount ? '1px dashed' : 'unset'}
                borderColor={'whiteAlpha.20'}
                _hover={{
                  borderColor: 'var(--chakra-colors-transparent-600)',
                }}
                onClick={handleFeeToggleClicked}
              >
                {showFeeInValue
                  ? `${NumberUtil.convertWithDenomination(
                      new BigNumber(amount).multipliedBy(marketFee).toNumber(),
                      6
                    )} ${market?.collateralToken.symbol}`
                  : `${marketFee * 100}%`}
              </Text>
            </Tooltip>
          </HStack>
        )
        break
    }
    return (
      <HStack gap='8px' color='white' minH='20px' w='full'>
        {content}
      </HStack>
    )
  }, [
    amount,
    market?.collateralToken.symbol,
    marketFee,
    option,
    price,
    quote?.outcomeTokenAmount,
    showFeeInValue,
    status,
  ])

  const transformValue = isMobile ? -304 : -264

  const buttonsTransform = isMobile ? 16 : 0

  const handleShowFullInfoArrowClicked = (e: SyntheticEvent) => {
    trackClicked(ClickEvent.TradingWidgetReturnDecomposition, {
      mode: showFullInfo ? 'opened' : 'closed',
      marketCategory: market?.categories,
      marketAddress: market?.address,
      marketType: market.marketType,
      marketTags: market?.tags,
    })
    e.stopPropagation()
    setShowFullInfo(!showFullInfo)
  }

  const handleActionIntention = async () => {
    if (!walletAddress) {
      await loginToPlatform()
      return
    }
    if (isExceedsBalance) {
      return
    }
    if (market?.status === MarketStatus.LOCKED) {
      setMarketLocked(true)
      return
    }
    if (country === BLOCKED_REGION) {
      setTradingBlocked(true)
      return
    }
    if (status !== 'initial') {
      setStatus('initial')
      return
    }
    trackClicked(ClickEvent.BuyClicked, {
      outcome: option,
      marketAddress: market.slug,
      walletType: client,
      source: analyticsSource,
    })
    if (client === 'eoa') {
      const allowance = await checkAllowance(
        market.address as Address,
        market.collateralToken.address
      )
      const amountBI = parseUnits(amount, decimals || 18)
      if (amountBI > allowance) {
        setStatus('unlock')
        return
      }
      setStatus('confirm')
      return
    }
    setStatus('confirm')
    return
  }

  const handleApprove = async () => {
    try {
      setStatus('unlocking')
      const amountBI = parseUnits(amount, decimals || 18)
      await approveContract(market.address as Address, market.collateralToken.address, amountBI)
      trackClicked(ClickEvent.ConfirmCapClicked, {
        address: market?.slug,
        strategy: 'Buy',
        outcome: option,
        walletType: 'eoa',
        source: analyticsSource,
      })
      await sleep(2)
      setStatus('confirm')
      return
    } catch (e) {
      setStatus('initial')
      return
    }
  }

  const handleConfirmClicked = async () => {
    try {
      setStatus('transaction-broadcasted')
      await onClick()
      setStatus('success')
      return
    } catch (e) {
      setStatus('initial')
      return
    }
  }

  const handleReturnToggleClicked = (e: SyntheticEvent) => {
    trackClicked(ClickEvent.ReturnTradingDetailsClicked, {
      from: showReturnPercent ? 'numbers' : 'percentage',
      to: showReturnPercent ? 'percentage' : 'numbers',
      platform: isMobile ? 'mobile' : 'desktop',
      marketAddress: market.address,
    })
    e.stopPropagation()
    setShowReturnPercent(!showReturnPercent)
  }

  const blockedMessage = useMemo(() => {
    if (tradingBlocked) {
      return (
        <BlockedTradeTemplate
          onClose={() => setTradingBlocked(false)}
          message={TRADING_BLOCKED_MSG}
        />
      )
    }
    if (marketLocked) {
      return <BlockedTradeTemplate onClose={() => setMarketLocked(false)} message={INFO_MSG} />
    }
  }, [marketLocked, tradingBlocked])

  useEffect(() => {
    const returnToInitial = async () => {
      await sleep(2)
      setStatus('initial')
      resetForm()
    }
    if (status === 'success') {
      returnToInitial()
    }
  }, [status])

  const colors = {
    Yes: {
      main: 'green.500',
      hover: 'green.300',
    },
    No: {
      main: 'red.500',
      hover: 'red.300',
    },
  }

  return (
    <HStack w='full' gap={'8px'} ref={ref as LegacyRef<HTMLDivElement>}>
      <MotionBox
        animate={{ x: ['unlock', 'unlocking', 'confirm'].includes(status) ? transformValue : 0 }}
        transition={{ duration: 0.5 }}
        w='full'
        display='flex'
        // ref={isMobile ? (ref as MutableRefObject<HTMLElement>) : undefined}
      >
        <Button
          bg='rgba(255, 255, 255, 0.2)'
          px='12px'
          py='8px'
          w={isMobile ? 'calc(100vw - 40px)' : '472px'}
          h='unset'
          alignItems='flex-start'
          flexDir='column'
          gap={'8px'}
          backgroundColor={colors[option].main}
          _hover={{
            backgroundColor: colors[option].hover,
          }}
          isDisabled={!collateralAmount || ['transaction-broadcasted', 'success'].includes(status)}
          onClick={() => {
            return handleActionIntention()
          }}
          borderRadius='8px'
          sx={{
            WebkitTapHighlightColor: 'transparent !important',
          }}
        >
          {blockedMessage ? (
            blockedMessage
          ) : (
            <>
              {headerStatus}
              <HStack w='full' justifyContent='space-between'>
                <HStack justifyContent='space-between' w='full'>
                  <HStack gap='4px'>
                    <Text {...paragraphRegular} color='white'>
                      Return
                    </Text>
                    {quotesLoading ? (
                      <Box w='120px'>
                        <TradeWidgetSkeleton
                          height={20}
                          type={option === 'Yes' ? SkeletonType.WIDGET_YES : SkeletonType.WIDGET_NO}
                        />
                      </Box>
                    ) : (
                      <Text
                        {...paragraphRegular}
                        color='white'
                        borderBottom={quote?.outcomeTokenAmount ? '1px dashed' : 'unset'}
                        borderColor={'whiteAlpha.20'}
                        _hover={{
                          borderColor: 'var(--chakra-colors-transparent-600)',
                        }}
                        cursor={quote?.outcomeTokenAmount ? 'pointer' : 'default'}
                        onClick={handleReturnToggleClicked}
                      >
                        {showReturnPercent
                          ? `${NumberUtil.toFixed(quote?.roi, 2)}%`
                          : `${NumberUtil.formatThousands(
                              quote?.outcomeTokenAmount,
                              market.collateralToken.symbol === 'USDC' ? 2 : 6
                            )} ${market.collateralToken.symbol}`}
                      </Text>
                    )}
                    {/*<Tooltip*/}
                    {/*// label={*/}
                    {/*//   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
                    {/*// }*/}
                    {/*>*/}
                    {/*  <InfoIcon width='16px' height='16px' />*/}
                    {/*</Tooltip>*/}
                  </HStack>
                </HStack>
                <Box
                  transform={`rotate(${showFullInfo ? '180deg' : 0})`}
                  transition='0.5s'
                  onClick={handleShowFullInfoArrowClicked}
                  color='white'
                >
                  <ChevronDownIcon width='16px' height='16px' />
                </Box>
              </HStack>
              {showFullInfo && (
                <VStack w='full' gap={isMobile ? '8px' : '4px'}>
                  <HStack justifyContent='space-between' w='full'>
                    <HStack gap='4px'>
                      <Text {...paragraphRegular} color='white'>
                        Avg price
                      </Text>
                      {/*<Tooltip*/}
                      {/*// label={*/}
                      {/*//   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
                      {/*// }*/}
                      {/*>*/}
                      {/*  <InfoIcon width='16px' height='16px' />*/}
                      {/*</Tooltip>*/}
                    </HStack>
                    {quotesLoading ? (
                      <Box w='120px'>
                        <TradeWidgetSkeleton
                          height={20}
                          type={option === 'Yes' ? SkeletonType.WIDGET_YES : SkeletonType.WIDGET_NO}
                        />
                      </Box>
                    ) : (
                      <Text {...paragraphRegular} color='white'>{`${NumberUtil.formatThousands(
                        quote?.outcomeTokenPrice,
                        6
                      )} ${market?.collateralToken.symbol}`}</Text>
                    )}
                  </HStack>
                  <HStack justifyContent='space-between' w='full'>
                    <HStack gap='4px'>
                      <Text {...paragraphRegular} color='white'>
                        Price impact
                      </Text>
                      {/*<Tooltip*/}
                      {/*// label={*/}
                      {/*//   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
                      {/*// }*/}
                      {/*>*/}
                      {/*  <InfoIcon width='16px' height='16px' />*/}
                      {/*</Tooltip>*/}
                    </HStack>
                    {quotesLoading ? (
                      <Box w='60px'>
                        <TradeWidgetSkeleton
                          height={20}
                          type={option === 'Yes' ? SkeletonType.WIDGET_YES : SkeletonType.WIDGET_NO}
                        />
                      </Box>
                    ) : (
                      <Text {...paragraphRegular} color='white'>{`${NumberUtil.toFixed(
                        quote?.priceImpact,
                        2
                      )}%`}</Text>
                    )}
                  </HStack>
                </VStack>
              )}
            </>
          )}
        </Button>
      </MotionBox>
      <MotionBox
        animate={{
          x: ['unlock', 'unlocking', 'confirm'].includes(status)
            ? transformValue
            : buttonsTransform,
        }}
        transition={{ duration: 0.5 }}
      >
        <ConfirmButton
          tokenTicker={market.collateralToken.symbol}
          status={status}
          showFullInfo={showFullInfo}
          handleConfirmClicked={() => {
            pushGA4Event(GAEvents.ClickBuy)
            trackClicked(ClickEvent.ConfirmTransactionClicked, {
              address: market.address,
              outcome: option,
              strategy: 'Buy',
              walletType: client,
              marketType,
              source: analyticsSource,
              marketMakerType: 'AMM',
            })

            return handleConfirmClicked()
          }}
          onApprove={handleApprove}
          setStatus={setStatus}
          analyticParams={{ source: analyticsSource }}
          outcome={option}
          marketAddress={market.address as Address}
        />
      </MotionBox>
    </HStack>
  )
}
