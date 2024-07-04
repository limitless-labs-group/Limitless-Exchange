import {
  Box,
  Flex,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  VStack,
  Button,
} from '@chakra-ui/react'
import { NumberUtil } from '@/utils'
import { Input, Tooltip } from '@/components'
import { defaultChain } from '@/constants'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import InfoIcon from '@/resources/icons/tooltip-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAmplitude, useBalanceService, useHistory, useTradingService } from '@/services'
import { Market } from '@/types'
import { useToken } from '@/hooks/use-token'

interface BuyFormProps {
  market: Market
  handleInitiateTx: () => void
}

export default function SellForm({ market, handleInitiateTx }: BuyFormProps) {
  const [sliderValue, setSliderValue] = useState(0)
  const [outcomeIndex, setOutcomeIndex] = useState<string | null>(null)

  const { positions: allMarketsPositions } = useHistory()

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) =>
          position.market.id.toLowerCase() === market?.address[defaultChain.id].toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  console.log(positions)

  /**
   * ANALITYCS
   */
  const { trackChanged, trackClicked } = useAmplitude()

  /**
   * TRADING SERVICE
   */
  const {
    strategy,
    collateralAmount,
    setCollateralAmount,
    isExceedsBalance,
    balanceOfCollateralToSell,
    quotesYes,
    quotesNo,
    trade,
    status,
  } = useTradingService()

  /**
   * BALANCE
   */
  const { balanceOfSmartWallet, setToken, token } = useBalanceService()

  const balance = useMemo(() => {
    if (strategy === 'Buy') {
      if (balanceOfSmartWallet) {
        return balanceOfSmartWallet.find(
          (balanceItem) => balanceItem.contractAddress === market?.collateralToken[defaultChain.id]
        )?.formatted
      }
      return ''
    }
    return balanceOfCollateralToSell
  }, [balanceOfSmartWallet, strategy, balanceOfCollateralToSell, market])

  const isZeroBalance = !(Number(balance) > 0)

  const { data: collateralToken } = useToken(market?.collateralToken[defaultChain.id])

  /**
   * Amount to display in UI and reduce queries
   */
  const [displayAmount, setDisplayAmount] = useState('')

  useEffect(() => {
    setDisplayAmount(collateralAmount)
  }, [collateralAmount])

  /**
   * SLIDER
   */

  const [showTooltip, setShowTooltip] = useState(false)

  const handleInputValueChange = (value: string) => {
    if (token?.symbol === 'USDC') {
      const decimals = value.split('.')[1]
      if (decimals && decimals.length > 1) {
        return
      }
      setCollateralAmount(value)
      return
    }
    setCollateralAmount(value)
    return
  }

  const onSlide = useCallback(
    (value: number) => {
      setSliderValue(value)
      if (value == 0 || isZeroBalance) {
        setDisplayAmount('')
        return
      }
      if (value == 100) {
        setDisplayAmount(NumberUtil.toFixed(balance, token?.symbol === 'USDC' ? 1 : 6))
        return
      }
      const amountByPercent = (Number(balance) * value) / 100
      setDisplayAmount(NumberUtil.toFixed(amountByPercent, token?.symbol === 'USDC' ? 1 : 6))
    },
    [sliderValue, balance, isZeroBalance]
  )

  const positionsYes = positions?.find((position) => position.outcomeIndex === 0)
  const positionsNo = positions?.find((position) => position.outcomeIndex === 1)

  const perShareYes = useMemo(() => {
    return quotesYes
      ? `${NumberUtil.formatThousands(quotesYes.outcomeTokenPrice, 6)} ${
          market?.tokenTicker[defaultChain.id]
        }`
      : `${NumberUtil.toFixed((market?.prices[0] || 1) / 100, 3)} ${token?.symbol}`
  }, [quotesYes, market?.tokenTicker, market?.prices, token?.symbol])

  const perShareNo = useMemo(() => {
    return quotesNo
      ? `${NumberUtil.formatThousands(quotesNo.outcomeTokenPrice, 6)} ${
          market?.tokenTicker[defaultChain.id]
        }`
      : `${NumberUtil.toFixed((market?.prices[1] || 1) / 100, 3)} ${token?.symbol}`
  }, [quotesNo, market?.tokenTicker, market?.prices, token?.symbol])

  useEffect(() => {
    if (isZeroBalance) {
      setSliderValue(0)
      return
    }
    const percentByAmount = Number(((Number(collateralAmount) / Number(balance)) * 100).toFixed())
    setSliderValue(percentByAmount)
  }, [collateralAmount, balance, isZeroBalance])

  useEffect(() => {
    if (market && collateralToken) {
      setToken(collateralToken)
    }
  }, [market, collateralToken])

  return (
    <>
      <VStack mt='24px'>
        {positionsYes && (
          <Button
            bg={outcomeIndex === 'yes' ? 'white' : 'rgba(255, 255, 255, 0.2)'}
            px='12px'
            py='8px'
            w='full'
            h='unset'
            alignItems='flex-start'
            flexDir='column'
            onClick={() => setOutcomeIndex('yes')}
            // onClick={() => trade(0)}
            borderRadius='2px'
          >
            <HStack
              color={outcomeIndex === 'yes' ? 'black' : 'white'}
              justifyContent='space-between'
              w='full'
            >
              <HStack gap='8px'>
                <ThumbsUpIcon width='16px' height='16px' />
                <Text fontWeight={500} color={outcomeIndex === 'yes' ? 'black' : 'white'}>
                  Yes
                </Text>
              </HStack>
              <Text>{NumberUtil.toFixed(positionsYes.outcomeTokenAmount, 6)} Contracts</Text>
            </HStack>
            <VStack ml='24px' mt='8px' w='calc(100% - 24px)'>
              <HStack justifyContent='space-between' w='full'>
                <HStack gap='4px'>
                  <Text fontWeight={500} color={outcomeIndex === 'yes' ? 'black' : 'white'}>
                    Per Share
                  </Text>
                  <Tooltip
                  // label={
                  //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'
                  // }
                  >
                    <InfoIcon width='16px' height='16px' />
                  </Tooltip>
                </HStack>
                <Text fontWeight={500} color={outcomeIndex === 'yes' ? 'black' : 'white'}>
                  {perShareYes}
                </Text>
              </HStack>
              {/*<HStack justifyContent='space-between' w='full'>*/}
              {/*  <HStack gap='4px'>*/}
              {/*    <Text fontWeight={500} color={outcomeIndex === 'yes' ? 'black' : 'white'}>*/}
              {/*      Price impact*/}
              {/*    </Text>*/}
              {/*    <Tooltip*/}
              {/*    // label={*/}
              {/*    //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
              {/*    // }*/}
              {/*    >*/}
              {/*      <InfoIcon width='16px' height='16px' />*/}
              {/*    </Tooltip>*/}
              {/*  </HStack>*/}
              {/*  <Text*/}
              {/*    fontWeight={500}*/}
              {/*    color={outcomeIndex === 'yes' ? 'black' : 'white'}*/}
              {/*  >{`${NumberUtil.toFixed(quotesYes?.priceImpact, 2)}%`}</Text>*/}
              {/*</HStack>*/}
              {/*<HStack justifyContent='space-between' w='full'>*/}
              {/*  <HStack gap='4px'>*/}
              {/*    <Text fontWeight={500} color={outcomeIndex === 'yes' ? 'black' : 'white'}>*/}
              {/*      ROI*/}
              {/*    </Text>*/}
              {/*    <Tooltip*/}
              {/*    // label={*/}
              {/*    //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
              {/*    // }*/}
              {/*    >*/}
              {/*      <InfoIcon width='16px' height='16px' />*/}
              {/*    </Tooltip>*/}
              {/*  </HStack>*/}
              {/*  <Text fontWeight={500} color={outcomeIndex === 'yes' ? 'black' : 'white'}>*/}
              {/*    {NumberUtil.toFixed(quotesYes?.roi, 2)}%*/}
              {/*  </Text>*/}
              {/*</HStack>*/}
              <HStack justifyContent='space-between' w='full'>
                <HStack gap='4px'>
                  <Text fontWeight={500} color={outcomeIndex === 'yes' ? 'black' : 'white'}>
                    Total
                  </Text>
                  <Tooltip
                  // label={
                  //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'
                  // }
                  >
                    <InfoIcon width='16px' height='16px' />
                  </Tooltip>
                </HStack>
                <Text
                  fontWeight={500}
                  color={outcomeIndex === 'yes' ? 'black' : 'white'}
                >{`${NumberUtil.toFixed(positionsYes.collateralAmount, 3)} ${
                  positionsYes.market.collateral?.symbol
                }`}</Text>
              </HStack>
            </VStack>
          </Button>
        )}
        {positionsNo && (
          <Button
            bg={outcomeIndex === 'no' ? 'white' : 'rgba(255, 255, 255, 0.2)'}
            px='12px'
            py='8px'
            w='full'
            h='unset'
            alignItems='flex-start'
            flexDir='column'
            onClick={() => setOutcomeIndex('no')}
            // onClick={() => trade(1)}
            borderRadius='2px'
          >
            <HStack
              color={outcomeIndex === 'no' ? 'black' : 'white'}
              justifyContent='space-between'
              w='full'
            >
              <HStack gap='8px'>
                <ThumbsDownIcon width='16px' height='16px' />
                <Text fontWeight={500} color={outcomeIndex === 'no' ? 'black' : 'white'}>
                  No
                </Text>
              </HStack>
              <Text>{NumberUtil.toFixed(positionsNo.outcomeTokenAmount, 6)} Contracts</Text>
            </HStack>
            <VStack ml='24px' mt='8px' w='calc(100% - 24px)'>
              <HStack justifyContent='space-between' w='full'>
                <HStack gap='4px'>
                  <Text fontWeight={500} color={outcomeIndex === 'no' ? 'black' : 'white'}>
                    Per Share
                  </Text>
                  <Tooltip
                  // label={
                  //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'
                  // }
                  >
                    <InfoIcon width='16px' height='16px' />
                  </Tooltip>
                </HStack>
                <Text fontWeight={500} color={outcomeIndex === 'no' ? 'black' : 'white'}>
                  <Text fontWeight={500} color={outcomeIndex === 'no' ? 'black' : 'white'}>
                    {perShareNo}
                  </Text>
                </Text>
              </HStack>
              {/*<HStack justifyContent='space-between' w='full'>*/}
              {/*  <HStack gap='4px'>*/}
              {/*    <Text fontWeight={500} color={outcomeIndex === 'no' ? 'black' : 'white'}>*/}
              {/*      Price impact*/}
              {/*    </Text>*/}
              {/*    <Tooltip*/}
              {/*    // label={*/}
              {/*    //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
              {/*    // }*/}
              {/*    >*/}
              {/*      <InfoIcon width='16px' height='16px' />*/}
              {/*    </Tooltip>*/}
              {/*  </HStack>*/}
              {/*  <Text*/}
              {/*    fontWeight={500}*/}
              {/*    color={outcomeIndex === 'no' ? 'black' : 'white'}*/}
              {/*  >{`${NumberUtil.toFixed(quotesNo?.priceImpact, 2)}%`}</Text>*/}
              {/*</HStack>*/}
              {/*<HStack justifyContent='space-between' w='full'>*/}
              {/*  <HStack gap='4px'>*/}
              {/*    <Text fontWeight={500} color={outcomeIndex === 'no' ? 'black' : 'white'}>*/}
              {/*      ROI*/}
              {/*    </Text>*/}
              {/*    <Tooltip*/}
              {/*    // label={*/}
              {/*    //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
              {/*    // }*/}
              {/*    >*/}
              {/*      <InfoIcon width='16px' height='16px' />*/}
              {/*    </Tooltip>*/}
              {/*  </HStack>*/}
              {/*  <Text fontWeight={500} color={outcomeIndex === 'no' ? 'black' : 'white'}>*/}
              {/*    {NumberUtil.toFixed(quotesNo?.roi, 2)}%*/}
              {/*  </Text>*/}
              {/*</HStack>*/}
              <HStack justifyContent='space-between' w='full'>
                <HStack gap='4px'>
                  <Text fontWeight={500} color={outcomeIndex === 'no' ? 'black' : 'white'}>
                    Total
                  </Text>
                  <Tooltip
                  // label={
                  //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'
                  // }
                  >
                    <InfoIcon width='16px' height='16px' />
                  </Tooltip>
                </HStack>
                <Text
                  fontWeight={500}
                  color={outcomeIndex === 'no' ? 'black' : 'white'}
                >{`${NumberUtil.toFixed(positionsNo.collateralAmount, 3)} ${
                  positionsNo.market.collateral?.symbol
                }`}</Text>
              </HStack>
            </VStack>
          </Button>
        )}
      </VStack>
      {outcomeIndex && (
        <Box mt='24px'>
          <Flex justifyContent='space-between'>
            <Text color='white' fontWeight={500}>
              Balance
            </Text>
            <Text color='white' fontWeight={500}>
              {NumberUtil.formatThousands(balance, token?.symbol === 'USDC' ? 1 : 6)}{' '}
              {token?.symbol}
            </Text>
          </Flex>
          <Slider
            aria-label='slider-ex-6'
            value={sliderValue}
            onChange={(val) => onSlide(val)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onChangeEnd={() => setCollateralAmount(displayAmount)}
            isDisabled={isZeroBalance}
            focusThumbOnChange={false}
          >
            <SliderTrack bg='rgba(255, 255, 255, 0.2)'>
              <SliderFilledTrack bg='white' />
            </SliderTrack>
            <SliderThumb bg='white' />
          </Slider>
          <Stack w={'full'} mt='8px'>
            <Text color='white' fontWeight={500}>
              Enter amount
            </Text>
            <Stack
              w={'full'}
              spacing={1}
              px={2}
              py={1}
              borderRadius='2px'
              border={'1px solid white'}
              borderColor={isExceedsBalance ? 'red' : 'border'}
            >
              <HStack h={'20px'} w='full' spacing={0}>
                <Input
                  type={'number'}
                  fontWeight={'bold'}
                  placeholder={'0'}
                  border={'none'}
                  px={0}
                  h='20px'
                  _focus={{
                    boxShadow: 'none',
                  }}
                  value={displayAmount}
                  color='white'
                  onChange={(e) => handleInputValueChange(e.target.value)}
                />

                <Text color='white' fontWeight={500}>
                  {market?.tokenTicker[defaultChain.id]}
                </Text>
              </HStack>
            </Stack>
          </Stack>
          <Box mt='24px'>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text fontWeight={500} color='white'>
                  Price impact
                </Text>
                <Tooltip
                // label={
                //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'
                // }
                >
                  <InfoIcon width='16px' height='16px' />
                </Tooltip>
              </HStack>
              <Text fontWeight={500} color='white'>{`${NumberUtil.toFixed(
                quotesYes?.priceImpact,
                2
              )}%`}</Text>
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text fontWeight={500} color='white'>
                  ROI
                </Text>
                <Tooltip
                // label={
                //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'
                // }
                >
                  <InfoIcon width='16px' height='16px' />
                </Tooltip>
              </HStack>
              <Text fontWeight={500} color='white'>
                {NumberUtil.toFixed(quotesYes?.roi, 2)}%
              </Text>
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text fontWeight={500} color='white'>
                  Total
                </Text>
                <Tooltip
                // label={
                //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'
                // }
                >
                  <InfoIcon width='16px' height='16px' />
                </Tooltip>
              </HStack>
              <Text fontWeight={500} color='white'>
                {displayAmount} {token?.symbol}
              </Text>
            </HStack>
          </Box>
          {displayAmount && (
            <Button
              variant='contained'
              bg='white'
              color='black'
              w='full'
              mt='24px'
              h='unset'
              py='4px'
              onClick={handleInitiateTx}
            >
              Trade
            </Button>
          )}
        </Box>
      )}
      {/*<ChakraSlider*/}
      {/*  defaultValue={0}*/}
      {/*  onChange={onSlide}*/}
      {/*  onMouseEnter={() => setShowTooltip(true)}*/}
      {/*  onMouseLeave={() => setShowTooltip(false)}*/}
      {/*  isDisabled={false}*/}
      {/*>*/}
      {/*  <SliderMark*/}
      {/*    value={0}*/}
      {/*    borderRadius='100%'*/}
      {/*    display='flex'*/}
      {/*    alignItems='center'*/}
      {/*    justifyContent='center'*/}
      {/*    mt='-1.5'*/}
      {/*    w='12px'*/}
      {/*    h='12px'*/}
      {/*    bg='blue.500'*/}
      {/*    zIndex='100'*/}
      {/*    onClick={() => setSliderValue(0)}*/}
      {/*    sx={{*/}
      {/*      pointerEvents: 'auto !important',*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Box rounded='full' bg={'white'} w='8px' h='8px' />*/}
      {/*  </SliderMark>*/}
      {/*  {[20, 40, 60, 80].map((value) => (*/}
      {/*    <SliderMark*/}
      {/*      value={value}*/}
      {/*      borderRadius='100%'*/}
      {/*      display='flex'*/}
      {/*      alignItems='center'*/}
      {/*      justifyContent='center'*/}
      {/*      mt='-1.5'*/}
      {/*      key={value}*/}
      {/*      bg='blue.500'*/}
      {/*      w='12px'*/}
      {/*      h='12px'*/}
      {/*      zIndex='100'*/}
      {/*      sx={{*/}
      {/*        pointerEvents: 'auto !important',*/}
      {/*      }}*/}
      {/*      onClick={() => setSliderValue(value)}*/}
      {/*    >*/}
      {/*      <Box*/}
      {/*        rounded='full'*/}
      {/*        bg={sliderValue < value ? 'rgba(255, 255, 255, 0.2)' : 'white'}*/}
      {/*        w='8px'*/}
      {/*        h='8px'*/}
      {/*      />*/}
      {/*    </SliderMark>*/}
      {/*  ))}*/}
      {/*  <SliderMark*/}
      {/*    value={100}*/}
      {/*    borderRadius='100%'*/}
      {/*    display='flex'*/}
      {/*    alignItems='center'*/}
      {/*    justifyContent='center'*/}
      {/*    mt='-1.5'*/}
      {/*    ml='-2.5'*/}
      {/*    w='12px'*/}
      {/*    h='12px'*/}
      {/*    bg='blue.500'*/}
      {/*    zIndex='100'*/}
      {/*    sx={{*/}
      {/*      pointerEvents: 'auto !important',*/}
      {/*    }}*/}
      {/*    onClick={() => {*/}
      {/*      setSliderValue(100)*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Box*/}
      {/*      rounded='full'*/}
      {/*      bg={sliderValue === 100 ? 'white' : 'rgba(255, 255, 255, 0.2)'}*/}
      {/*      w='8px'*/}
      {/*      h='8px'*/}
      {/*    />*/}
      {/*  </SliderMark>*/}
      {/*  <SliderTrack bg='rgba(255, 255, 255, 0.20)'>*/}
      {/*    <SliderFilledTrack bg='white' />*/}
      {/*  </SliderTrack>*/}
      {/*</ChakraSlider>*/}
    </>
  )
}
