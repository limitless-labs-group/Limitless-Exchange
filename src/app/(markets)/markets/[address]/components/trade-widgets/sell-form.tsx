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
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import InfoIcon from '@/resources/icons/tooltip-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ClickEvent,
  TradeClickedMetadata,
  TradeQuotes,
  useAmplitude,
  useBalanceService,
  useHistory,
  useTradingService,
} from '@/services'
import { Market, MarketGroup, MarketStatus } from '@/types'
import { useToken } from '@/hooks/use-token'
import BigNumber from 'bignumber.js'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { css } from '@emotion/react'
import { isMobile } from 'react-device-detect'
import BlockIcon from '@/resources/icons/block.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import { useWeb3Service } from '@/services/Web3Service'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import PredictionsIcon from '@/resources/icons/predictions-icon.svg'
import { Address, parseUnits } from 'viem'

const _transformSellValue = (value: string) => {
  const [wholeNumber, fractionalNumber] = value.split('.')

  // const fractionalNumberLength = fractionalNumber?.length || 0
  // const percentage = fractionalNumberLength <= 6 ? 0.99 : fractionalNumberLength === 0 ? 1 : 0.91
  const percentage = 1

  let zeroWholeFraction: string = ['0', fractionalNumber].join('.')
  zeroWholeFraction = String(+zeroWholeFraction * percentage)
  zeroWholeFraction = Number(zeroWholeFraction).toFixed(6)
  const [, _fractionalNumber] = zeroWholeFraction.split('.')
  return [wholeNumber, _fractionalNumber].join('.')
}

interface SellFormProps {
  market: Market
  setOutcomeIndex: Dispatch<SetStateAction<number>>
  marketGroup?: MarketGroup
  setSelectedMarket?: (market: Market) => void
}

export function SellForm({
  market,
  setOutcomeIndex,
  marketGroup,
  setSelectedMarket,
}: SellFormProps) {
  const [sliderValue, setSliderValue] = useState(0)
  const [outcomeChoice, setOutcomeChoice] = useState<string | null>(null)
  const [quoteYes, setQuoteYes] = useState<TradeQuotes | undefined | null>()
  const [quoteNo, setQuoteNo] = useState<TradeQuotes | undefined | null>()

  const { client } = useWeb3Service()
  const { isOpen: isOpenSelectMarketMenu, onToggle: onToggleSelectMarketMenu } = useDisclosure()
  const { positions: allMarketsPositions } = useHistory()
  const INFO_MSG = 'Market is locked. Trading stopped. Please await for final resolution.'

  const positions = useMemo(
    () =>
      allMarketsPositions?.filter(
        (position) => position.market.id.toLowerCase() === market?.address.toLowerCase()
      ),
    [allMarketsPositions, market]
  )

  const positionsGroup = useMemo(() => {
    if (marketGroup) {
      return allMarketsPositions?.filter((position) =>
        marketGroup.markets.some((market) => market.address === position.market.id)
      )
    }
  }, [marketGroup, allMarketsPositions])

  const getTotalContractsAmount = (address: Address) => {
    const positionsForMarket = positionsGroup?.filter(
      (position) => position.market.id.toLowerCase() === address.toLowerCase()
    )
    if (!positionsForMarket) {
      return '0'
    }
    return positionsForMarket.reduce((a, b) => {
      return new BigNumber(a).plus(new BigNumber(b.outcomeTokenAmount || '0')).toString()
    }, '0')
  }

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
    sell,
  } = useTradingService()

  useEffect(() => {
    if (!outcomeChoice) {
      setQuoteYes(quotesYes)
      setQuoteNo(quotesNo)
      return
    }
    if (outcomeChoice === 'yes') {
      setQuoteYes(quotesYes)
      return
    }
    if (outcomeChoice === 'no') {
      setQuoteNo(quotesNo)
      return
    }
  }, [outcomeChoice, quotesYes, quotesNo])

  /**
   * BALANCE
   */
  const { setToken, token } = useBalanceService()

  const balance = useMemo(() => {
    if (outcomeChoice) {
      let _balance =
        outcomeChoice === 'yes' ? balanceOfCollateralToSellYes : balanceOfCollateralToSellNo
      _balance = _transformSellValue(_balance)
      return _balance
    }
  }, [outcomeChoice, balanceOfCollateralToSellYes, balanceOfCollateralToSellNo])

  const isZeroBalance = !(Number(balance) > 0)

  const { isOpen: isYesOpen, onOpen: onYesOpen, onClose: onYesClose } = useDisclosure()
  const { isOpen: isNoOpen, onOpen: onNoOpen, onClose: onNoClose } = useDisclosure()

  const { data: collateralToken } = useToken(market?.collateralToken.address)

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
    const _collateralAmount = _transformSellValue(value)
    setCollateralAmount(_collateralAmount)
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
        // _displayAmount = NumberUtil.toFixed(balance, 6)
        // _displayAmount = _transformCollateralAmount(balance ?? '0')
        // console.log('onSlide _displayAmount', _displayAmount)
        setDisplayAmount(balance ?? '0')
        return
      }
      const amountByPercent = (Number(balance) * value) / 100

      // _displayAmount = amountByPercent.toString()
      // _displayAmount = _transformCollateralAmount(_displayAmount)
      // console.log('onSlide amountByPercent _displayAmount', _displayAmount)
      const _collateralAmount = _transformSellValue(amountByPercent.toString())
      setDisplayAmount(_collateralAmount)
    },
    [balance, isZeroBalance]
  )

  const positionsYes = positions?.find((position) => position.outcomeIndex === 0)
  const positionsNo = positions?.find((position) => position.outcomeIndex === 1)

  const perShareYes = useMemo(() => {
    return quoteYes
      ? `${NumberUtil.formatThousands(quoteYes.outcomeTokenPrice, 6)} ${
          market?.collateralToken.symbol
        }`
      : `${NumberUtil.toFixed((market?.prices[0] || 1) / 100, 3)} ${token?.symbol}`
  }, [quoteYes, market?.collateralToken.symbol, market?.prices, token?.symbol])

  const perShareNo = useMemo(() => {
    return quoteNo
      ? `${NumberUtil.formatThousands(quoteNo.outcomeTokenPrice, 6)} ${
          market?.collateralToken.symbol
        }`
      : `${NumberUtil.toFixed((market?.prices[1] || 1) / 100, 3)} ${token?.symbol}`
  }, [quoteNo, market?.collateralToken.symbol, market?.prices, token?.symbol])

  const handleTradeClicked = async () => {
    trackClicked(ClickEvent.SellTradeClicked, {
      address: market.address,
    })
    const index = outcomeChoice === 'yes' ? 0 : 1
    const balanceToSell = index
      ? BigInt(
          NumberUtil.toFixed(
            parseUnits(balanceOfCollateralToSellNo, market.collateralToken.decimals).toString(),
            6
          )
        )
      : parseUnits(balanceOfCollateralToSellYes, market.collateralToken.decimals)
    setOutcomeIndex(index)
    // await trade(index)
    await sell({
      outcomeTokenId: index,
      amount:
        sliderValue === 100
          ? balanceToSell
          : parseUnits(collateralAmount, market.collateralToken.decimals),
    })
  }

  const isExceedsBalance = useMemo(() => {
    if (outcomeChoice) {
      return new BigNumber(collateralAmount).isGreaterThan(
        new BigNumber(
          outcomeChoice === 'yes'
            ? (+balanceOfCollateralToSellYes).toFixed(6)
            : (+balanceOfCollateralToSellNo).toFixed(6)
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
      {marketGroup && (
        <>
          <Button
            variant='transparentLight'
            w='full'
            justifyContent='space-between'
            mb={isOpenSelectMarketMenu ? '8px' : isMobile ? '32px' : '8px'}
            onClick={onToggleSelectMarketMenu}
            rightIcon={
              <Box
                transform={`rotate(${isOpenSelectMarketMenu ? '180deg' : 0})`}
                transition='0.5s'
                color='white'
              >
                <ChevronDownIcon width='16px' height='16px' />
              </Box>
            }
          >
            <HStack gap='8px'>
              <PredictionsIcon />
              <Text {...paragraphMedium}>{market.title}</Text>
            </HStack>
          </Button>
          {isOpenSelectMarketMenu && (
            <VStack gap={isMobile ? '16px' : '8px'} mb={isMobile ? '16px' : '8px'}>
              {marketGroup?.markets.map((market) => (
                <Button
                  key={market.address}
                  onClick={() => {
                    setSelectedMarket && setSelectedMarket(market)
                    onToggleSelectMarketMenu()
                    setOutcomeChoice(null)
                  }}
                  flexDirection='column'
                  variant='transparentLight'
                  w='full'
                >
                  <HStack mb='8px' w='full'>
                    <HStack justifyContent='space-between' w='full' alignItems='flex-start'>
                      <Text {...paragraphMedium} color='white'>
                        {market.title}
                      </Text>
                      <Text {...paragraphMedium} color='white'>
                        {NumberUtil.formatThousands(getTotalContractsAmount(market.address), 6)}{' '}
                        Contracts
                      </Text>
                    </HStack>
                  </HStack>
                </Button>
              ))}
            </VStack>
          )}
        </>
      )}
      {!isOpenSelectMarketMenu && (
        <>
          <VStack mt={marketGroup ? 0 : '24px'}>
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
                  trackClicked<TradeClickedMetadata>(ClickEvent.SellClicked, {
                    outcome: 'Yes',
                    marketAddress: market.address,
                    walletType: client,
                  })
                  setOutcomeChoice('yes')
                  setCollateralAmount('')
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
                      <Text
                        {...paragraphMedium}
                        color='whtie'
                        textAlign={'left'}
                        whiteSpace='normal'
                      >
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
                        <Text
                          {...paragraphMedium}
                          color={outcomeChoice === 'yes' ? 'black' : 'white'}
                        >
                          Yes
                        </Text>
                      </HStack>
                      <Text
                        {...paragraphMedium}
                        color={outcomeChoice === 'yes' ? 'black' : 'white'}
                      >
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
                        <Text
                          {...paragraphRegular}
                          color={outcomeChoice === 'yes' ? 'black' : 'white'}
                        >
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
                  trackClicked<TradeClickedMetadata>(ClickEvent.SellClicked, {
                    outcome: 'No',
                    marketAddress: market.address,
                    walletType: client,
                  })
                  setOutcomeChoice('no')
                  setCollateralAmount('')
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
                      <Text
                        {...paragraphMedium}
                        color='white'
                        textAlign={'left'}
                        whiteSpace='normal'
                      >
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
                        <Text
                          {...paragraphMedium}
                          color={outcomeChoice === 'no' ? 'black' : 'white'}
                        >
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
                        </HStack>
                        <Text
                          {...paragraphRegular}
                          color={outcomeChoice === 'no' ? 'black' : 'white'}
                        >
                          {perShareNo}
                        </Text>
                      </HStack>
                      <HStack justifyContent='space-between' w='full'>
                        <HStack gap='4px'>
                          <Text
                            {...paragraphRegular}
                            color={outcomeChoice === 'no' ? 'black' : 'white'}
                          >
                            Total
                          </Text>
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
                  {NumberUtil.formatThousands(balance, 6)} {token?.symbol}
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
                      {market?.collateralToken.symbol}
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
                  </HStack>
                  <Text {...paragraphRegular} color='white'>{`${NumberUtil.toFixed(
                    outcomeChoice == 'yes' ? quoteYes?.priceImpact : quoteNo?.priceImpact,
                    2
                  )}%`}</Text>
                </HStack>
                <HStack justifyContent='space-between' w='full'>
                  <HStack gap='4px'>
                    <Text {...paragraphRegular} color='white'>
                      ROI
                    </Text>
                  </HStack>
                  <Text {...paragraphRegular} color='white'>
                    {NumberUtil.toFixed(outcomeChoice == 'yes' ? quoteYes?.roi : quoteNo?.roi, 2)}%
                  </Text>
                </HStack>
                <HStack justifyContent='space-between' w='full'>
                  <HStack gap='4px'>
                    <Text {...paragraphRegular} color='white'>
                      Total
                    </Text>
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
        </>
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
