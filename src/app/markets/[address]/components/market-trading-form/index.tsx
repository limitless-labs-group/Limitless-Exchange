import { Button, Input, Tooltip } from '@/components'
import { defaultChain } from '@/constants'
import {
  StrategyChangedMetadata,
  ChangeEvent,
  useAmplitude,
  useBalanceService,
  useTradingService,
} from '@/services'
import { NumberUtil } from '@/utils'
import {
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  VStack,
  Flex,
} from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAddress, zeroAddress } from 'viem'
import { Market } from '@/types'
import { useToken } from '@/hooks/use-token'
import Paper from '@/components/common-new/paper'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import InfoIcon from '@/resources/icons/tooltip-icon.svg'
import { isMobile } from 'react-device-detect'

interface MarketTradingFormProps {
  market: Market
}

export const MarketTradingForm = ({ market }: MarketTradingFormProps) => {
  /**
   * ANALITYCS
   */
  const { trackChanged, trackClicked } = useAmplitude()

  /**
   * TRADING SERVICE
   */
  const {
    strategy,
    setStrategy,
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

  /**
   * MARKET DATA
   */
  const marketAddress = getAddress(market?.address[defaultChain.id] ?? zeroAddress)
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
        setDisplayAmount(NumberUtil.toFixed(balance, token?.symbol === 'USDC' ? 1 : 6))
        return
      }
      const amountByPercent = (Number(balance) * value) / 100
      setDisplayAmount(NumberUtil.toFixed(amountByPercent, token?.symbol === 'USDC' ? 1 : 6))
    },
    [sliderValue, balance, isZeroBalance]
  )

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
  }, [collateralAmount, balance, isZeroBalance])

  useEffect(() => {
    if (market && collateralToken) {
      setToken(collateralToken)
    }
  }, [market, collateralToken])

  return (
    <Paper bg='blue.500' w={isMobile ? 'full' : '296px'} p={isMobile ? 0 : '8px'}>
      <HStack
        w={'240px'}
        mx='auto'
        bg='rgba(255, 255, 255, 0.20)'
        borderRadius='2px'
        p='2px'
        mb='24px'
      >
        <Button
          h={isMobile ? '28px' : 'unset'}
          flex='1'
          borderRadius='2px'
          bg={strategy === 'Buy' ? 'white' : 'unset'}
          color={strategy === 'Buy' ? 'black' : 'white'}
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
        </Button>
        <Button
          h={isMobile ? '28px' : 'unset'}
          flex='1'
          borderRadius='2px'
          bg={strategy === 'Sell' ? 'white' : 'unset'}
          color={strategy === 'Sell' ? 'black' : 'white'}
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
        </Button>
      </HStack>
      <Flex justifyContent='space-between'>
        <Text color='white' fontWeight={500}>
          Balance
        </Text>
        <Text color='white' fontWeight={500}>
          {NumberUtil.formatThousands(balance, token?.symbol === 'USDC' ? 1 : 6)} {token?.symbol}
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

      <Stack w={'full'} mt='8px'>
        <Text color='white' fontWeight={500}>
          {strategy == 'Buy' ? 'You pay' : 'You sell'}
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
      <VStack mt='24px'>
        <Button
          bg='rgba(255, 255, 255, 0.2)'
          px='12px'
          py='8px'
          w='full'
          h='unset'
          alignItems='flex-start'
          flexDir='column'
          onClick={() => trade(0)}
          borderRadius='2px'
        >
          <HStack gap='8px' color='white'>
            <ThumbsUpIcon width='16px' height='16px' />
            <HStack gap='4px'>
              <Text fontWeight={500}>{market.prices[0]}%</Text>
              <Text fontWeight={500}>Yes</Text>
            </HStack>
          </HStack>
          <VStack ml='24px' mt='8px' w='calc(100% - 24px)'>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text fontWeight={500} color='white'>
                  Avg price
                </Text>
                <Tooltip
                // label={
                //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'
                // }
                >
                  <InfoIcon width='16px' height='16px' />
                </Tooltip>
              </HStack>
              <Text fontWeight={500} color='white'>{`${NumberUtil.formatThousands(
                quotesYes?.outcomeTokenPrice,
                6
              )} ${market?.tokenTicker[defaultChain.id]}`}</Text>
            </HStack>
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
                  Ets. ROI
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
          </VStack>
        </Button>
        <Button
          bg='rgba(255, 255, 255, 0.2)'
          px='12px'
          py='8px'
          w='full'
          h='unset'
          alignItems='flex-start'
          flexDir='column'
          onClick={() => trade(1)}
          borderRadius='2px'
        >
          <HStack gap='8px' color='white'>
            <ThumbsDownIcon width='16px' height='16px' />
            <HStack gap='4px'>
              <Text fontWeight={500}>{market.prices[1]}%</Text>
              <Text fontWeight={500}>No</Text>
            </HStack>
          </HStack>
          <VStack ml='24px' mt='8px' w='calc(100% - 24px)'>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text fontWeight={500} color='white'>
                  Avg price
                </Text>
                <Tooltip
                // label={
                //   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'
                // }
                >
                  <InfoIcon width='16px' height='16px' />
                </Tooltip>
              </HStack>
              <Text fontWeight={500} color='white'>{`${NumberUtil.formatThousands(
                quotesNo?.outcomeTokenPrice,
                6
              )} ${market?.tokenTicker[defaultChain.id]}`}</Text>
            </HStack>
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
                quotesNo?.priceImpact,
                2
              )}%`}</Text>
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text fontWeight={500} color='white'>
                  Ets. ROI
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
                {NumberUtil.toFixed(quotesNo?.roi, 2)}%
              </Text>
            </HStack>
          </VStack>
        </Button>
      </VStack>

      {/*<VStack w={'full'} spacing={5} p={5}>*/}
      {/*  <VStack w={'full'} alignItems={'start'}>*/}
      {/*    <Heading fontSize={'14px'}>Outcome</Heading>*/}
      {/*    <HStack w={'full'}>*/}
      {/*      <Button*/}
      {/*        w={'full'}*/}
      {/*        bg={outcomeTokenId == 0 ? 'green' : 'bgLight'}*/}
      {/*        color={outcomeTokenId == 0 ? 'white' : 'fontLight'}*/}
      {/*        onClick={() => {*/}
      {/*          trackChanged<OutcomeChangedMetadata>(ChangeEvent.OutcomeChanged, {*/}
      {/*            choice: 'Yes',*/}
      {/*            marketAddress,*/}
      {/*          })*/}
      {/*          setOutcomeTokenId(0)*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        {market?.outcomeTokens[0] ?? 'Yes'} {(outcomeTokensPercent?.[0] ?? 50).toFixed(2)}%*/}
      {/*      </Button>*/}
      {/*      <Button*/}
      {/*        w={'full'}*/}
      {/*        bg={outcomeTokenId == 1 ? 'red' : 'bgLight'}*/}
      {/*        color={outcomeTokenId == 1 ? 'white' : 'fontLight'}*/}
      {/*        onClick={() => {*/}
      {/*          trackChanged<OutcomeChangedMetadata>(ChangeEvent.OutcomeChanged, {*/}
      {/*            choice: 'No',*/}
      {/*            marketAddress,*/}
      {/*          })*/}
      {/*          setOutcomeTokenId(1)*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        {market?.outcomeTokens[1] ?? 'No'} {(outcomeTokensPercent?.[1] ?? 50).toFixed(2)}%*/}
      {/*      </Button>*/}
      {/*    </HStack>*/}
      {/*  </VStack>*/}

      {/*  /!*{address ? (*!/*/}
      {/*  /!*  <Button*!/*/}
      {/*  /!*    w={'full'}*!/*/}
      {/*  /!*    colorScheme={'brand'}*!/*/}
      {/*  /!*    isDisabled={status != 'Ready'}*!/*/}
      {/*  /!*    isLoading={status == 'Loading'}*!/*/}
      {/*  /!*    onClick={() => {*!/*/}
      {/*  /!*      trackClicked<TradeClickedMetadata>(ClickEvent.TradeClicked, {*!/*/}
      {/*  /!*        strategy,*!/*/}
      {/*  /!*        marketAddress,*!/*/}
      {/*  /!*      })*!/*/}
      {/*  /!*      trade()*!/*/}
      {/*  /!*    }}*!/*/}
      {/*  /!*  >*!/*/}
      {/*  /!*    {strategy}*!/*/}
      {/*  /!*  </Button>*!/*/}
      {/*  /!*) : (*!/*/}
      {/*  /!*  <LogInButton w={'full'} />*!/*/}
      {/*  /!*)}*!/*/}

      {/*  /!*<VStack w={'full'} spacing={0}>*!/*/}
      {/*  /!*  <HStack w={'full'} justifyContent={'space-between'}>*!/*/}
      {/*  /!*    <Text color={'fontLight'}>Avg price</Text>*!/*/}
      {/*  /!*    <Text textAlign={'right'}>{`${NumberUtil.formatThousands(*!/*/}
      {/*  /!*      quotes?.outcomeTokenPrice,*!/*/}
      {/*  /!*      6*!/*/}
      {/*  /!*    )} ${market?.tokenTicker[defaultChain.id]}`}</Text>*!/*/}
      {/*  /!*  </HStack>*!/*/}
      {/*  /!*  <HStack w={'full'} justifyContent={'space-between'}>*!/*/}
      {/*  /!*    <Text color={'fontLight'}>Price Impact</Text>*!/*/}
      {/*  /!*    <Text textAlign={'right'}>{`${NumberUtil.toFixed(quotes?.priceImpact, 2)}%`}</Text>*!/*/}
      {/*  /!*  </HStack>*!/*/}
      {/*  /!*  {strategy == 'Buy' && (*!/*/}
      {/*  /!*    <>*!/*/}
      {/*  /!*      <HStack w={'full'} justifyContent={'space-between'}>*!/*/}
      {/*  /!*        <Text color={'fontLight'}>Potential return</Text>*!/*/}
      {/*  /!*        <HStack spacing={1}>*!/*/}
      {/*  /!*          <Text color={'green'} fontWeight={'bold'} textAlign={'right'}>*!/*/}
      {/*  /!*            {`${NumberUtil.formatThousands(quotes?.outcomeTokenAmount, 6)} ${*!/*/}
      {/*  /!*              market?.tokenTicker[defaultChain.id]*!/*/}
      {/*  /!*            }`}*!/*/}
      {/*  /!*          </Text>*!/*/}
      {/*  /!*          <Text color={'fontLight'}>{NumberUtil.toFixed(quotes?.roi, 2)}%</Text>*!/*/}
      {/*  /!*        </HStack>*!/*/}
      {/*  /!*      </HStack>*!/*/}
      {/*  /!*      <HStack w={'full'} justifyContent={'space-between'}>*!/*/}
      {/*  /!*        <HStack spacing={1}>*!/*/}
      {/*  /!*          <Text color={'fontLight'}>Contracts</Text>*!/*/}
      {/*  /!*          <Tooltip*!/*/}
      {/*  /!*            label={*!/*/}
      {/*  /!*              'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*!/*/}
      {/*  /!*            }*!/*/}
      {/*  /!*          >*!/*/}
      {/*  /!*            <InfoIcon />*!/*/}
      {/*  /!*          </Tooltip>*!/*/}
      {/*  /!*        </HStack>*!/*/}
      {/*  /!*        <Text textAlign={'right'}>*!/*/}
      {/*  /!*          {NumberUtil.formatThousands(quotes?.outcomeTokenAmount, 6)}*!/*/}
      {/*  /!*        </Text>*!/*/}
      {/*  /!*      </HStack>*!/*/}
      {/*  /!*    </>*!/*/}
      {/*  /!*  )}*!/*/}
      {/*  /!*</VStack>*!/*/}
      {/*</VStack>*/}
    </Paper>
  )
}
