import { Button, Input, LogInButton } from '@/components'
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
} from '@/services'
import { borderRadius, colors } from '@/styles'
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
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaInfo } from 'react-icons/fa'
import { getAddress, zeroAddress } from 'viem'

export const TradeForm = ({ ...props }: StackProps) => {
  /**
   * ACCOUNT STATE
   */
  const { isLoggedIn } = useAccount()

  /**
   * ANALITYCS
   */
  const { trackChanged } = useAmplitude()

  /**
   * TRADING SERVICE
   */
  const {
    market,
    strategy,
    setStrategy,
    outcomeTokenSelected,
    setOutcomeTokenSelected,
    amount,
    setAmount,
    isExceedsBalance,
    balanceOfInvest,
    sharesAmount,
    shareCost,
    roi,
    trade,
    status,
  } = useTradingService()

  /**
   * BALANCE
   */
  const { balanceOfSmartWallet } = useBalanceService()

  const balanceFormatted = useMemo(() => {
    return NumberUtil.toFixed(
      strategy == 'Buy' ? balanceOfSmartWallet?.formatted : balanceOfInvest,
      4
    )
  }, [balanceOfSmartWallet, strategy, balanceOfInvest])

  /**
   * MARKET DATA
   */
  const marketAddress = getAddress(market?.address[defaultChain.id] ?? zeroAddress)
  const { sharesPercent } = useMarketData({
    marketAddress,
  })

  /**
   * PRICE ORACLE
   */
  const { convertEthToUsd } = usePriceOracle()
  const amountUsd = useMemo(() => {
    return NumberUtil.formatThousands(convertEthToUsd(amount), 2)
  }, [amount])

  /**
   * Amount to display in UI and reduce queries
   */
  const [displayAmount, setDisplayAmount] = useState('')

  useEffect(() => {
    setDisplayAmount(amount)
  }, [amount])

  /**
   * SLIDER
   */
  const [sliderValue, setSliderValue] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)

  const isZeroBalance = useMemo(() => {
    return (
      (strategy == 'Buy' && !(Number(balanceOfSmartWallet?.formatted) > 0)) ||
      (strategy == 'Sell' && !(Number(balanceOfInvest) > 0))
    )
  }, [strategy, balanceOfSmartWallet, balanceOfInvest])

  const onSlide = useCallback(
    (value: number) => {
      setSliderValue(value)
      if (value == 0 || isZeroBalance) {
        setDisplayAmount('')
        return
      }
      let amountByPercent = 0
      if (strategy == 'Buy') {
        amountByPercent = (Number(balanceOfSmartWallet?.formatted) * value) / 100
      } else if (strategy == 'Sell') {
        amountByPercent = (Number(balanceOfInvest) * value) / 100
      }
      setDisplayAmount(NumberUtil.toFixed(amountByPercent, 4))
    },
    [sliderValue, balanceOfSmartWallet, isZeroBalance]
  )

  /**
   * Effect to automatically set a proper slider value based on the tokens amount
   */
  useEffect(() => {
    if (isZeroBalance) {
      setSliderValue(0)
      return
    }
    let percentByAmount = 0
    if (strategy == 'Buy') {
      percentByAmount = (Number(amount) / Number(balanceOfSmartWallet?.formatted)) * 100
    } else if (strategy == 'Sell') {
      percentByAmount = (Number(amount) / Number(balanceOfInvest)) * 100
    }
    percentByAmount = Number(percentByAmount.toFixed())
    setSliderValue(percentByAmount)
  }, [amount, isZeroBalance, strategy, outcomeTokenSelected])

  return (
    <Stack
      h={'fit-content'}
      w={'full'}
      minW={'330px'}
      maxW={'400px'}
      // border={`1px solid ${colors.border}`}
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
              market: marketAddress,
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
              market: marketAddress,
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
              bg={outcomeTokenSelected == 0 ? 'green' : 'bgLight'}
              color={outcomeTokenSelected == 0 ? 'white' : 'fontLight'}
              onClick={() => {
                trackChanged<OutcomeChangedMetadata>(ChangeEvent.OutcomeChanged, {
                  choice: 'Yes',
                  market: marketAddress,
                })
                setOutcomeTokenSelected(0)
              }}
            >
              {market?.outcomeTokens[0] ?? 'Yes'} {(sharesPercent?.[0] ?? 50).toFixed(1)}%
            </Button>
            <Button
              w={'full'}
              bg={outcomeTokenSelected == 1 ? 'red' : 'bgLight'}
              color={outcomeTokenSelected == 1 ? 'white' : 'fontLight'}
              onClick={() => {
                trackChanged<OutcomeChangedMetadata>(ChangeEvent.OutcomeChanged, {
                  choice: 'No',
                  market: marketAddress,
                })
                setOutcomeTokenSelected(1)
              }}
            >
              {market?.outcomeTokens[1] ?? 'No'} {(sharesPercent?.[1] ?? 50).toFixed(1)}%
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
            <HStack h={'34px'} w='full'>
              <Input
                type={'number'}
                h={'full'}
                fontWeight={'bold'}
                placeholder={'0'}
                border={'none'}
                pl={0}
                _focus={{
                  boxShadow: 'none',
                }}
                value={displayAmount}
                onChange={(e) => setAmount(e.target.value)}
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
                onClick={() => setAmount(balanceFormatted)}
              >
                {`Balance: ${balanceFormatted}`} {collateralToken.symbol}
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
          onChangeEnd={() => setAmount(displayAmount)}
          isDisabled={isZeroBalance}
          focusThumbOnChange={false}
        >
          <SliderTrack>
            <SliderFilledTrack bg={outcomeTokenSelected == 0 ? 'green' : 'red'} />
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
              bg={outcomeTokenSelected == 0 ? 'green' : 'red'}
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
            onClick={trade}
          >
            {strategy}
          </Button>
        ) : (
          <LogInButton w={'full'} />
        )}

        <VStack w={'full'} spacing={0}>
          <HStack w={'full'} justifyContent={'space-between'}>
            <Text color={'fontLight'}>Avg price</Text>
            <Text textAlign={'right'}>{`${NumberUtil.toFixed(shareCost, 4)} ${
              collateralToken.symbol
            }`}</Text>
          </HStack>
          {strategy == 'Buy' && (
            <>
              <HStack w={'full'} justifyContent={'space-between'}>
                <Text color={'fontLight'}>Potential return</Text>
                <HStack spacing={1}>
                  <Text color={'green'} fontWeight={'bold'} textAlign={'right'}>
                    {`${NumberUtil.toFixed(sharesAmount, 4)} ${collateralToken.symbol}`}
                  </Text>
                  <Text color={'fontLight'}>{NumberUtil.toFixed(roi, 2)}%</Text>
                </HStack>
              </HStack>
              <HStack w={'full'} justifyContent={'space-between'}>
                <HStack spacing={1}>
                  <Text color={'fontLight'}>Contracts</Text>
                  <Tooltip
                    label={
                      'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'
                    }
                    bg={'bg'}
                    color={'font'}
                    fontWeight={'normal'}
                    border={'1px solid'}
                    borderColor={'border'}
                    borderRadius={borderRadius}
                    px={3}
                    py={2}
                  >
                    <Box
                      p={'2px'}
                      borderRadius={'full'}
                      border={'1px solid'}
                      borderColor={'fontLight'}
                    >
                      <FaInfo fontSize={'8px'} fill={colors.fontLight} />
                    </Box>
                  </Tooltip>
                </HStack>
                <Text textAlign={'right'}>{NumberUtil.toFixed(sharesAmount, 4)}</Text>
              </HStack>
            </>
          )}
        </VStack>
      </VStack>
    </Stack>
  )
}
