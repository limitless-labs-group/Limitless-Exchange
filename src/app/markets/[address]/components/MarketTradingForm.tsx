import { Button, InfoIcon, Input, LogInButton, Tooltip } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { useMarketData } from '@/hooks'
import { usePriceOracle } from '@/providers'
import {
  StrategyChangedMetadata,
  ChangeEvent,
  useAccount,
  useAmplitude,
  useBalanceService,
  useTradingService,
  OutcomeChangedMetadata,
  ClickEvent,
  TradeClickedMetadata,
} from '@/services'
import { borderRadius } from '@/styles'
import { NumberUtil } from '@/utils'
import {
  Avatar,
  Box,
  Divider,
  HStack,
  Heading,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  StackProps,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAddress, zeroAddress } from 'viem'

export const MarketTradingForm = ({ ...props }: StackProps) => {
  /**
   * ACCOUNT STATE
   */
  const { isLoggedIn } = useAccount()

  /**
   * ANALITYCS
   */
  const { trackChanged, trackClicked } = useAmplitude()

  /**
   * TRADING SERVICE
   */
  const {
    market,
    strategy,
    setStrategy,
    outcomeTokenId,
    setOutcomeTokenId,
    collateralAmount,
    setCollateralAmount,
    isExceedsBalance,
    balanceOfCollateralToSell,
    quotes,
    trade,
    status,
  } = useTradingService()

  /**
   * BALANCE
   */
  const { balanceOfSmartWallet } = useBalanceService()

  const balance = useMemo(
    () => (strategy == 'Buy' ? balanceOfSmartWallet?.formatted ?? '' : balanceOfCollateralToSell),
    [balanceOfSmartWallet, strategy, balanceOfCollateralToSell]
  )

  const isZeroBalance = !(Number(balance) > 0)

  /**
   * MARKET DATA
   */
  const marketAddress = getAddress(market?.address[defaultChain.id] ?? zeroAddress)
  const { outcomeTokensPercent } = useMarketData({
    marketAddress,
  })

  /**
   * Amount to display in UI and reduce queries
   */
  const [displayAmount, setDisplayAmount] = useState('')

  useEffect(() => {
    setDisplayAmount(collateralAmount)
  }, [collateralAmount])

  /**
   * PRICE ORACLE
   */
  const { convertEthToUsd } = usePriceOracle()
  const amountUsd = useMemo(() => {
    return NumberUtil.formatThousands(convertEthToUsd(displayAmount), 2)
  }, [displayAmount])

  /**
   * SLIDER
   */
  const [sliderValue, setSliderValue] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)

  const onSlide = useCallback(
    (value: number) => {
      setSliderValue(value)
      if (value == 0 || isZeroBalance) {
        setDisplayAmount('')
        return
      }
      if (value == 100) {
        setDisplayAmount(NumberUtil.toFixed(balance, 6))
        return
      }
      const amountByPercent = (Number(balance) * value) / 100
      setDisplayAmount(NumberUtil.toFixed(amountByPercent, 6))
    },
    [sliderValue, balance, isZeroBalance]
  )

  /**
   * Effect to automatically set a proper slider value based on the tokens amount
   */
  useEffect(() => {
    if (isZeroBalance) {
      setSliderValue(0)
      return
    }
    const percentByAmount = Number(((Number(collateralAmount) / Number(balance)) * 100).toFixed())
    setSliderValue(percentByAmount)
  }, [collateralAmount, balance, isZeroBalance, outcomeTokenId])

  return (
    <Stack
      h={'fit-content'}
      w={'full'}
      maxW={'400px'}
      boxShadow={'0 0 12px #ddd'}
      borderRadius={borderRadius}
      spacing={0}
      {...props}
    >
      <HStack px={5} pt={2} spacing={4}>
        <Button
          pos={'relative'}
          bg={'none'}
          variant={'unstyled'}
          borderRadius={0}
          minW={'unset'}
          onClick={() => {
            trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
              type: 'Buy selected',
              marketAddress,
            })
            setStrategy('Buy')
          }}
        >
          <Text fontWeight={'bold'} color={strategy == 'Buy' ? 'font' : 'fontLight'}>
            Buy
          </Text>
          <Box
            pos={'absolute'}
            w={'full'}
            h={'3px'}
            bg={'black'}
            bottom={0}
            visibility={strategy == 'Buy' ? 'visible' : 'hidden'}
          />
        </Button>
        <Button
          pos={'relative'}
          bg={'none'}
          variant={'unstyled'}
          borderRadius={0}
          minW={'unset'}
          onClick={() => {
            trackChanged<StrategyChangedMetadata>(ChangeEvent.StrategyChanged, {
              type: 'Sell selected',
              marketAddress,
            })
            setStrategy('Sell')
          }}
        >
          <Text fontWeight={'bold'} color={strategy == 'Sell' ? 'font' : 'fontLight'}>
            Sell
          </Text>
          <Box
            pos={'absolute'}
            w={'full'}
            h={'3px'}
            bg={'black'}
            bottom={0}
            visibility={strategy == 'Sell' ? 'visible' : 'hidden'}
          />
        </Button>
      </HStack>

      <Divider />

      <VStack w={'full'} spacing={5} p={5}>
        <VStack w={'full'} alignItems={'start'}>
          <Heading fontSize={'14px'}>Outcome</Heading>
          <HStack w={'full'}>
            <Button
              w={'full'}
              bg={outcomeTokenId == 0 ? 'green' : 'bgLight'}
              color={outcomeTokenId == 0 ? 'white' : 'fontLight'}
              onClick={() => {
                trackChanged<OutcomeChangedMetadata>(ChangeEvent.OutcomeChanged, {
                  choice: 'Yes',
                  marketAddress,
                })
                setOutcomeTokenId(0)
              }}
            >
              {market?.outcomeTokens[0] ?? 'Yes'} {(outcomeTokensPercent?.[0] ?? 50).toFixed(2)}%
            </Button>
            <Button
              w={'full'}
              bg={outcomeTokenId == 1 ? 'red' : 'bgLight'}
              color={outcomeTokenId == 1 ? 'white' : 'fontLight'}
              onClick={() => {
                trackChanged<OutcomeChangedMetadata>(ChangeEvent.OutcomeChanged, {
                  choice: 'No',
                  marketAddress,
                })
                setOutcomeTokenId(1)
              }}
            >
              {market?.outcomeTokens[1] ?? 'No'} {(outcomeTokensPercent?.[1] ?? 50).toFixed(2)}%
            </Button>
          </HStack>
        </VStack>

        <Stack w={'full'} spacing={1}>
          <HStack w={'full'} justifyContent={'space-between'} alignItems={'center'}>
            <Heading fontSize={'14px'}>{strategy == 'Buy' ? 'You pay' : 'You sell'}</Heading>
          </HStack>
          <Stack
            w={'full'}
            spacing={1}
            px={3}
            py={2}
            borderRadius={borderRadius}
            border={'1px solid'}
            borderColor={isExceedsBalance ? 'red' : 'border'}
          >
            <HStack h={'34px'} w='full' spacing={0}>
              <Input
                type={'number'}
                h={'full'}
                fontWeight={'bold'}
                placeholder={'0'}
                border={'none'}
                px={0}
                _focus={{
                  boxShadow: 'none',
                }}
                value={displayAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
              />

              <Button
                h={'full'}
                colorScheme={'transparent'}
                border={'1px solid'}
                borderColor={'border'}
                gap={1}
              >
                <Avatar size={'xs'} src={collateralToken.imageURI} />
                <Text>{collateralToken.symbol}</Text>
              </Button>
            </HStack>

            <HStack
              w={'full'}
              justifyContent={'space-between'}
              color={'fontLight'}
              fontSize={'12px'}
            >
              <Text>~${amountUsd}</Text>
              <Text
                _hover={{ color: 'font' }}
                cursor={'pointer'}
                onClick={() => setCollateralAmount(NumberUtil.toFixed(balance, 6))}
              >
                {`Balance: ${NumberUtil.toFixed(balance, 6)}`} {collateralToken.symbol}
              </Text>
            </HStack>
          </Stack>
        </Stack>

        <Slider
          w={'95%'}
          aria-label='slider-ex-6'
          value={sliderValue}
          onChange={(val) => onSlide(val)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onChangeEnd={() => setCollateralAmount(displayAmount)}
          isDisabled={isZeroBalance}
          focusThumbOnChange={false}
        >
          <SliderTrack>
            <SliderFilledTrack bg={outcomeTokenId == 0 ? 'green' : 'red'} />
          </SliderTrack>
          <Tooltip
            hasArrow
            bg='bgLight'
            color='fontLight'
            fontSize={'12px'}
            placement='top'
            isOpen={showTooltip}
            label={`${sliderValue}%`}
          >
            <SliderThumb
              bg={outcomeTokenId == 0 ? 'green' : 'red'}
              border={'1px solid'}
              borderColor={'border'}
            />
          </Tooltip>
        </Slider>

        {isLoggedIn ? (
          <Button
            w={'full'}
            colorScheme={'brand'}
            isDisabled={status != 'Ready'}
            isLoading={status == 'Loading'}
            onClick={() => {
              trackClicked<TradeClickedMetadata>(ClickEvent.TradeClicked, {
                strategy,
                marketAddress,
              })
              trade()
            }}
          >
            {strategy}
          </Button>
        ) : (
          <LogInButton w={'full'} />
        )}

        <VStack w={'full'} spacing={0}>
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Avg price</Text>
            <Text textAlign={'right'}>{`${NumberUtil.toFixed(quotes?.outcomeTokenPrice, 6)} ${
              collateralToken.symbol
            }`}</Text>
          </HStack>
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Price Impact</Text>
            <Text textAlign={'right'}>{`${NumberUtil.toFixed(quotes?.priceImpact, 2)}%`}</Text>
          </HStack>
          {strategy == 'Buy' && (
            <>
              <HStack w={'full'} justifyContent={'space-between'}>
                <Text color={'fontLight'}>Potential return</Text>
                <HStack spacing={1}>
                  <Text color={'green'} fontWeight={'bold'} textAlign={'right'}>
                    {`${NumberUtil.toFixed(quotes?.outcomeTokenAmount, 6)} ${
                      collateralToken.symbol
                    }`}
                  </Text>
                  <Text color={'fontLight'}>{NumberUtil.toFixed(quotes?.roi, 2)}%</Text>
                </HStack>
              </HStack>
              <HStack w={'full'} justifyContent={'space-between'}>
                <HStack spacing={1}>
                  <Text color={'fontLight'}>Contracts</Text>
                  <Tooltip
                    label={
                      'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'
                    }
                  >
                    <InfoIcon />
                  </Tooltip>
                </HStack>
                <Text textAlign={'right'}>{NumberUtil.toFixed(quotes?.outcomeTokenAmount, 6)}</Text>
              </HStack>
            </>
          )}
        </VStack>
      </VStack>
    </Stack>
  )
}
