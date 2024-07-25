import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  useDisclosure,
  VStack,
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
  useHistory,
  useTradingService,
} from '@/services'
import { Market, MarketStatus } from '@/types'
import { useToken } from '@/hooks/use-token'
import BigNumber from 'bignumber.js'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { css } from '@emotion/react'
import { isMobile } from 'react-device-detect'
import BlockIcon from '@/resources/icons/block.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'

interface BuyFormProps {
  market: Market
  setOutcomeIndex: Dispatch<SetStateAction<number>>
}

export function SellForm({ market, setOutcomeIndex }: BuyFormProps) {
  const [sliderValue, setSliderValue] = useState(0)
  const [outcomeChoice, setOutcomeChoice] = useState<string | null>(null)

  const { positions: allMarketsPositions } = useHistory()
  const INFO_MSG = 'Market is locked. Trading stopped. Please await for final resolution.'

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) =>
          position.market.id.toLowerCase() === market?.address[defaultChain.id].toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  /**
   * ANALITYCS
   */
  const { trackClicked } = useAmplitude()

  /**
   * TRADING SERVICE
   */
  const {
    collateralAmount,
    setCollateralAmount,
    balanceOfCollateralToSellYes,
    balanceOfCollateralToSellNo,
    quotesYes,
    quotesNo,
    trade,
  } = useTradingService()

  /**
   * BALANCE
   */
  const { setToken, token } = useBalanceService()

  const balance = useMemo(() => {
    if (outcomeChoice) {
      return outcomeChoice === 'yes' ? balanceOfCollateralToSellYes : balanceOfCollateralToSellNo
    }
  }, [outcomeChoice, balanceOfCollateralToSellYes, balanceOfCollateralToSellNo])

  const isZeroBalance = !(Number(balance) > 0)

  const { isOpen: isYesOpen, onOpen: onYesOpen, onClose: onYesClose } = useDisclosure()
  const { isOpen: isNoOpen, onOpen: onNoOpen, onClose: onNoClose } = useDisclosure()

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

  const handleTradeClicked = async () => {
    trackClicked<TradeClickedMetadata>(ClickEvent.TradeClicked, {
      strategy: 'Sell',
      marketAddress: market.address[defaultChain.id],
    })
    const index = outcomeChoice === 'yes' ? 0 : 1
    setOutcomeIndex(index)
    await trade(index)
  }

  const isExceedsBalance = useMemo(() => {
    if (outcomeChoice) {
      return new BigNumber(collateralAmount).isGreaterThan(
        new BigNumber(
          outcomeChoice === 'yes' ? balanceOfCollateralToSellYes : balanceOfCollateralToSellNo
        )
      )
    }
    return false
  }, [collateralAmount, outcomeChoice, balanceOfCollateralToSellYes, balanceOfCollateralToSellNo])

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
            bg={outcomeChoice === 'yes' ? 'white' : 'rgba(255, 255, 255, 0.2)'}
            px='12px'
            py='8px'
            w='full'
            h='unset'
            alignItems='flex-start'
            flexDir='column'
            onClick={() => {
              if (market?.status === MarketStatus.LOCKED) {
                onYesOpen()
                return
              }
              setOutcomeChoice('yes')
            }}
            borderRadius='2px'
            _hover={{
              backgroundColor: outcomeChoice === 'yes' ? 'white' : 'transparent.300',
            }}
            gap={isMobile ? '16px' : '8px'}
          >
            {isYesOpen ? (
              <VStack w={'full'} h={'72px'}>
                <HStack w={'full'} justifyContent={'space-between'}>
                  <Icon as={BlockIcon} width={'16px'} height={'16px'} color={'white'} />
                  <Icon
                    as={CloseIcon}
                    width={'16px'}
                    height={'16px'}
                    color={'white'}
                    onClick={(event) => {
                      event.stopPropagation()
                      onYesClose()
                    }}
                  />
                </HStack>
                <HStack w={'full'}>
                  <Text {...paragraphMedium} color='whtie' textAlign={'left'} whiteSpace='normal'>
                    {INFO_MSG}
                  </Text>
                  <Box w={'45px'}></Box>
                </HStack>
              </VStack>
            ) : (
              <>
                <HStack
                  color={outcomeChoice === 'yes' ? 'black' : 'white'}
                  justifyContent='space-between'
                  w='full'
                >
                  <HStack gap='8px'>
                    <ThumbsUpIcon width='16px' height='16px' />
                    <Text {...paragraphMedium} color={outcomeChoice === 'yes' ? 'black' : 'white'}>
                      Yes
                    </Text>
                  </HStack>
                  <Text {...paragraphMedium} color={outcomeChoice === 'yes' ? 'black' : 'white'}>
                    {NumberUtil.toFixed(positionsYes.outcomeTokenAmount, 6)} Contracts
                  </Text>
                </HStack>
                <VStack ml='24px' w='calc(100% - 24px)' gap={isMobile ? '8px' : '4px'}>
                  <HStack justifyContent='space-between' w='full'>
                    <HStack gap='4px'>
                      <Text
                        {...paragraphRegular}
                        color={outcomeChoice === 'yes' ? 'black' : 'white'}
                      >
                        Per Share
                      </Text>
                    </HStack>
                    <Text {...paragraphRegular} color={outcomeChoice === 'yes' ? 'black' : 'white'}>
                      {perShareYes}
                    </Text>
                  </HStack>
                  <HStack justifyContent='space-between' w='full'>
                    <HStack gap='4px'>
                      <Text
                        {...paragraphRegular}
                        color={outcomeChoice === 'yes' ? 'black' : 'white'}
                      >
                        Total
                      </Text>
                    </HStack>
                    <Text
                      {...paragraphRegular}
                      color={outcomeChoice === 'yes' ? 'black' : 'white'}
                    >{`${NumberUtil.toFixed(positionsYes.collateralAmount, 3)} ${
                      positionsYes.market.collateral?.symbol
                    }`}</Text>
                  </HStack>
                </VStack>
              </>
            )}
          </Button>
        )}
        {positionsNo && (
          <Button
            bg={outcomeChoice === 'no' ? 'white' : 'rgba(255, 255, 255, 0.2)'}
            px='12px'
            py='8px'
            w='full'
            h='unset'
            alignItems='flex-start'
            flexDir='column'
            onClick={() => {
              if (market?.status === MarketStatus.LOCKED) {
                onNoOpen()
                return
              }
              setOutcomeChoice('no')
            }}
            borderRadius='2px'
            _hover={{
              backgroundColor: outcomeChoice === 'no' ? 'white' : 'transparent.300',
            }}
            gap={isMobile ? '16px' : '8px'}
          >
            {isNoOpen ? (
              <VStack w={'full'} h={'72px'}>
                <HStack w={'full'} justifyContent={'space-between'}>
                  <Icon as={BlockIcon} width={'16px'} height={'16px'} color={'white'} />
                  <Icon
                    as={CloseIcon}
                    width={'16px'}
                    height={'16px'}
                    color={'white'}
                    onClick={(event) => {
                      event.stopPropagation()
                      onNoClose()
                    }}
                  />
                </HStack>
                <HStack w={'full'}>
                  <Text {...paragraphMedium} color='white' textAlign={'left'} whiteSpace='normal'>
                    {INFO_MSG}
                  </Text>
                  <Box w={'45px'}></Box>
                </HStack>
              </VStack>
            ) : (
              <>
                <HStack
                  color={outcomeChoice === 'no' ? 'black' : 'white'}
                  justifyContent='space-between'
                  w='full'
                >
                  <HStack gap='8px'>
                    <ThumbsDownIcon width='16px' height='16px' />
                    <Text {...paragraphMedium} color={outcomeChoice === 'no' ? 'black' : 'white'}>
                      No
                    </Text>
                  </HStack>
                  <Text {...paragraphMedium} color={outcomeChoice === 'no' ? 'black' : 'white'}>
                    {NumberUtil.toFixed(positionsNo.outcomeTokenAmount, 6)} Contracts
                  </Text>
                </HStack>
                <VStack ml='24px' w='calc(100% - 24px)' gap={isMobile ? '8px' : '4px'}>
                  <HStack justifyContent='space-between' w='full'>
                    <HStack gap='4px'>
                      <Text
                        {...paragraphRegular}
                        color={outcomeChoice === 'no' ? 'black' : 'white'}
                      >
                        Per Share
                      </Text>
                      {/*<Tooltip*/}
                      {/*// label={*/}
                      {/*//   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
                      {/*// }*/}
                      {/*>*/}
                      {/*  <InfoIcon width='16px' height='16px' />*/}
                      {/*</Tooltip>*/}
                    </HStack>
                    <Text {...paragraphRegular} color={outcomeChoice === 'no' ? 'black' : 'white'}>
                      {perShareNo}
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
                      <Text
                        {...paragraphRegular}
                        color={outcomeChoice === 'no' ? 'black' : 'white'}
                      >
                        Total
                      </Text>
                      {/*<Tooltip*/}
                      {/*// label={*/}
                      {/*//   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
                      {/*// }*/}
                      {/*>*/}
                      {/*  <InfoIcon width='16px' height='16px' />*/}
                      {/*</Tooltip>*/}
                    </HStack>
                    <Text
                      {...paragraphRegular}
                      color={outcomeChoice === 'no' ? 'black' : 'white'}
                    >{`${NumberUtil.toFixed(positionsNo.collateralAmount, 3)} ${
                      positionsNo.market.collateral?.symbol
                    }`}</Text>
                  </HStack>
                </VStack>
              </>
            )}
          </Button>
        )}
      </VStack>
      {outcomeChoice && (
        <Box mt='24px'>
          <Flex justifyContent='space-between'>
            <Text {...paragraphMedium} color='white'>
              Balance
            </Text>
            <Text {...paragraphMedium} color='white'>
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
            h={isMobile ? '40px' : '8px'}
            py={isMobile ? '0px !important' : '4px'}
          >
            <SliderTrack bg='rgba(255, 255, 255, 0.2)'>
              <SliderFilledTrack bg='white' />
            </SliderTrack>
            <SliderThumb bg='white' />
          </Slider>
          <Stack w={'full'} mt={isMobile ? 0 : '8px'} gap='4px'>
            <HStack justifyContent='space-between'>
              <Text {...paragraphMedium} color='white'>
                Enter amount
              </Text>
              {isExceedsBalance && (
                <HStack color='white' gap='4px'>
                  <InfoIcon width='16px' height='16px' />
                  <Text {...paragraphMedium} color='white'>
                    Not enough funds
                  </Text>
                </HStack>
              )}
            </HStack>
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
                <Text {...paragraphMedium} color='white'>
                  {market?.tokenTicker[defaultChain.id]}
                </Text>
              </InputRightElement>
            </InputGroup>
          </Stack>
          <VStack my='24px' gap={isMobile ? '8px' : '4px'} w='full'>
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
              <Text {...paragraphRegular} color='white'>{`${NumberUtil.toFixed(
                quotesYes?.priceImpact,
                2
              )}%`}</Text>
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='white'>
                  ROI
                </Text>
                {/*<Tooltip*/}
                {/*// label={*/}
                {/*//   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
                {/*// }*/}
                {/*>*/}
                {/*  <InfoIcon width='16px' height='16px' />*/}
                {/*</Tooltip>*/}
              </HStack>
              <Text {...paragraphRegular} color='white'>
                {NumberUtil.toFixed(quotesYes?.roi, 2)}%
              </Text>
            </HStack>
            <HStack justifyContent='space-between' w='full'>
              <HStack gap='4px'>
                <Text {...paragraphRegular} color='white'>
                  Total
                </Text>
                {/*<Tooltip*/}
                {/*// label={*/}
                {/*//   'Each contract will expire at 0 or 1 WETH, depending on the outcome reported. You may trade partial contracts, ie 0.1'*/}
                {/*// }*/}
                {/*>*/}
                {/*  <InfoIcon width='16px' height='16px' />*/}
                {/*</Tooltip>*/}
              </HStack>
              <Text {...paragraphRegular} color='white'>
                {displayAmount} {token?.symbol}
              </Text>
            </HStack>
          </VStack>
          {displayAmount && (
            <Button
              variant='white'
              w='full'
              onClick={handleTradeClicked}
              isDisabled={isExceedsBalance}
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
