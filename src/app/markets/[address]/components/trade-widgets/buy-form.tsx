import {
  Button,
  Flex,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  VStack,
  Input,
  InputRightElement,
  InputGroup,
} from '@chakra-ui/react'
import { NumberUtil } from '@/utils'
import { defaultChain } from '@/constants'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import InfoIcon from '@/resources/icons/tooltip-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ClickEvent,
  TradeClickedMetadata,
  useAmplitude,
  useBalanceService,
  useTradingService,
} from '@/services'
import { Market } from '@/types'
import { useToken } from '@/hooks/use-token'
import BigNumber from 'bignumber.js'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { css } from '@emotion/react'
import { isMobile } from 'react-device-detect'

interface BuyFormProps {
  market: Market
  setOutcomeIndex: Dispatch<SetStateAction<number>>
}

export function BuyForm({ market, setOutcomeIndex }: BuyFormProps) {
  const [sliderValue, setSliderValue] = useState(0)

  /**
   * ANALITYCS
   */
  const { trackChanged, trackClicked } = useAmplitude()

  /**
   * TRADING SERVICE
   */
  const { strategy, collateralAmount, setCollateralAmount, quotesYes, quotesNo, trade } =
    useTradingService()

  /**
   * BALANCE
   */
  const { balanceOfSmartWallet, setToken, token } = useBalanceService()

  const balance = useMemo(() => {
    if (strategy === 'Buy') {
      if (balanceOfSmartWallet) {
        return (
          balanceOfSmartWallet.find(
            (balanceItem) =>
              balanceItem.contractAddress === market?.collateralToken[defaultChain.id]
          )?.formatted || ''
        )
      }
      return ''
    }
    return ''
  }, [balanceOfSmartWallet, strategy, market])

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

  const isExceedsBalance = useMemo(() => {
    return new BigNumber(collateralAmount).isGreaterThan(balance)
  }, [collateralAmount, balance])

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
      <Flex justifyContent='space-between'>
        <Text {...paragraphMedium} color='grey.50'>
          Balance
        </Text>
        <Text {...paragraphMedium} color='grey.50'>
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
          <SliderFilledTrack bg='grey.50' />
        </SliderTrack>
        <SliderThumb bg='grey.50' w='8px' h='8px' />
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

      <Stack w={'full'} mt='8px' gap='4px'>
        <HStack justifyContent='space-between'>
          <Text {...paragraphMedium} color='grey.50'>
            Enter amount
          </Text>
          {isExceedsBalance && (
            <HStack color='grey.50' gap='4px'>
              <InfoIcon width='16px' height='16px' />
              <Text {...paragraphMedium} color='grey.50'>
                Not enough funds
              </Text>
            </HStack>
          )}
        </HStack>
        <Stack
          w={'full'}
          borderRadius='2px'
          border={'1px solid grey.50'}
          borderColor={isExceedsBalance ? 'red' : 'border'}
        >
          <InputGroup>
            <Input
              variant='outlined'
              value={displayAmount}
              onChange={(e) => handleInputValueChange(e.target.value)}
              placeholder='0'
              css={css`
                caret-color: white;
              `}
              type='number'
            />
            <InputRightElement
              h='16px'
              top={isMobile ? '8px' : '4px'}
              right={isMobile ? '8px' : '4px'}
            >
              <Text {...paragraphMedium} color='grey.50'>
                {market?.tokenTicker[defaultChain.id]}
              </Text>
            </InputRightElement>
          </InputGroup>
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
          _hover={{
            backgroundColor: 'transparent.300',
          }}
          isDisabled={isExceedsBalance || !collateralAmount}
          onClick={async () => {
            trackClicked<TradeClickedMetadata>(ClickEvent.TradeClicked, {
              strategy: 'Buy',
              marketAddress: market.address[defaultChain.id],
            })
            setOutcomeIndex(0)
            await trade(0)
          }}
          borderRadius='2px'
        >
          <HStack gap='8px' color='grey.50'>
            <ThumbsUpIcon width='16px' height='16px' />
            <HStack gap='4px'>
              <Text {...paragraphMedium} color='grey.50'>
                {market.prices[0]}%
              </Text>
              <Text {...paragraphMedium} color='grey.50'>
                Yes
              </Text>
            </HStack>
          </HStack>
          <VStack ml='24px' mt='4px' w='calc(100% - 24px)'>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='grey.50'>
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
              <Text {...paragraphRegular} color='grey.50'>{`${NumberUtil.formatThousands(
                quotesYes?.outcomeTokenPrice,
                6
              )} ${market?.tokenTicker[defaultChain.id]}`}</Text>
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='grey.50'>
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
              <Text {...paragraphRegular} color='grey.50'>{`${NumberUtil.toFixed(
                quotesYes?.priceImpact,
                2
              )}%`}</Text>
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='grey.50'>
                  Est. ROI
                </Text>
                {/*<Tooltip*/}
                {/*// label={*/}
                {/*//   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
                {/*// }*/}
                {/*>*/}
                {/*  <InfoIcon width='16px' height='16px' />*/}
                {/*</Tooltip>*/}
              </HStack>
              <Text {...paragraphRegular} color='grey.50'>
                {NumberUtil.toFixed(quotesYes?.roi, 2)}%
              </Text>
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='grey.50'>
                  Return
                </Text>
                {/*<Tooltip*/}
                {/*// label={*/}
                {/*//   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
                {/*// }*/}
                {/*>*/}
                {/*  <InfoIcon width='16px' height='16px' />*/}
                {/*</Tooltip>*/}
              </HStack>
              <Text {...paragraphRegular} color='grey.50'>
                {NumberUtil.formatThousands(quotesYes?.outcomeTokenAmount, 6)}{' '}
                {market.tokenTicker[defaultChain.id]}
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
          isDisabled={isExceedsBalance || !collateralAmount}
          _hover={{
            backgroundColor: 'transparent.300',
          }}
          onClick={async () => {
            trackClicked<TradeClickedMetadata>(ClickEvent.TradeClicked, {
              strategy: 'Buy',
              marketAddress: market.address[defaultChain.id],
            })
            setOutcomeIndex(1)
            await trade(1)
          }}
          borderRadius='2px'
        >
          <HStack gap='8px' color='grey.50'>
            <ThumbsDownIcon width='16px' height='16px' />
            <HStack gap='4px'>
              <Text {...paragraphMedium} color='grey.50'>
                {market.prices[1]}%
              </Text>
              <Text {...paragraphMedium} color='grey.50'>
                No
              </Text>
            </HStack>
          </HStack>
          <VStack ml='24px' mt='4px' w='calc(100% - 24px)'>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='grey.50'>
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
              <Text {...paragraphRegular} color='grey.50'>{`${NumberUtil.formatThousands(
                quotesNo?.outcomeTokenPrice,
                6
              )} ${market?.tokenTicker[defaultChain.id]}`}</Text>
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='grey.50'>
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
              <Text {...paragraphRegular} color='grey.50'>{`${NumberUtil.toFixed(
                quotesNo?.priceImpact,
                2
              )}%`}</Text>
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='grey.50'>
                  Est. ROI
                </Text>
                {/*<Tooltip*/}
                {/*// label={*/}
                {/*//   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
                {/*// }*/}
                {/*>*/}
                {/*  <InfoIcon width='16px' height='16px' />*/}
                {/*</Tooltip>*/}
              </HStack>
              <Text {...paragraphRegular} color='grey.50'>
                {NumberUtil.toFixed(quotesNo?.roi, 2)}%
              </Text>
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='grey.50'>
                  Return
                </Text>
                {/*<Tooltip*/}
                {/*// label={*/}
                {/*//   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
                {/*// }*/}
                {/*>*/}
                {/*  <InfoIcon width='16px' height='16px' />*/}
                {/*</Tooltip>*/}
              </HStack>
              <Text {...paragraphRegular} color='grey.50'>
                {NumberUtil.formatThousands(quotesNo?.outcomeTokenAmount, 6)}{' '}
                {market.tokenTicker[defaultChain.id]}
              </Text>
            </HStack>
          </VStack>
        </Button>
      </VStack>
    </>
  )
}
