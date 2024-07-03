import { Button, InfoIcon, Input, LogInButton, Tooltip } from '@/components'
import { defaultChain } from '@/constants'
import { useMarketData } from '@/hooks'
import { usePriceOracle } from '@/providers'
import {
  StrategyChangedMetadata,
  ChangeEvent,
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
  HStack,
  Heading,
  Slider as ChakraSlider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  VStack,
  Flex,
  SliderMark,
  Box,
} from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAddress, zeroAddress } from 'viem'
import { Market, MarketTokensIds } from '@/types'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useToken } from '@/hooks/use-token'
import Paper from '@/components/common-new/paper'

interface MarketTradingFormProps {
  market: Market
}

export const MarketTradingForm = ({ market }: MarketTradingFormProps) => {
  /**
   * ACCOUNT STATE
   */
  const address = useWalletAddress()

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
  const { outcomeTokensPercent } = useMarketData({
    marketAddress,
    collateralToken,
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
  const { convertAssetAmountToUsd } = usePriceOracle()
  const amountUsd = useMemo(() => {
    const tokenId = collateralToken?.priceOracleId
    return NumberUtil.formatThousands(
      convertAssetAmountToUsd(tokenId as MarketTokensIds, displayAmount),
      2
    )
  }, [displayAmount, market])

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
  }, [collateralAmount, balance, isZeroBalance, outcomeTokenId])

  useEffect(() => {
    if (market && collateralToken) {
      setToken(collateralToken)
    }
  }, [market, collateralToken])

  console.log(sliderValue)

  return (
    <Paper bg='blue.500' w={'296px'}>
      <HStack
        w={'236px'}
        mx='auto'
        bg='rgba(255, 255, 255, 0.20)'
        borderRadius='2px'
        p='2px'
        mb='24px'
      >
        <Button
          h='unset'
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
          h='unset'
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
      <ChakraSlider
        min={0}
        max={100}
        defaultValue={0}
        onChange={(v) => setSliderValue(v)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        isDisabled={false}
      >
        <SliderMark
          value={0}
          borderRadius='100%'
          display='flex'
          alignItems='center'
          justifyContent='center'
          mt='-1.5'
          w='12px'
          h='12px'
          bg='blue.500'
          zIndex='100'
          onClick={() => setSliderValue(0)}
          sx={{
            pointerEvents: 'auto !important',
          }}
        >
          <Box rounded='full' bg={'white'} w='8px' h='8px' />
        </SliderMark>
        {[20, 40, 60, 80].map((value) => (
          <SliderMark
            value={value}
            borderRadius='100%'
            display='flex'
            alignItems='center'
            justifyContent='center'
            mt='-1.5'
            key={value}
            bg='blue.500'
            w='12px'
            h='12px'
            zIndex='100'
            sx={{
              pointerEvents: 'auto !important',
            }}
            onClick={() => setSliderValue(value)}
          >
            <Box
              rounded='full'
              bg={sliderValue < value ? 'rgba(255, 255, 255, 0.2)' : 'white'}
              w='8px'
              h='8px'
            />
          </SliderMark>
        ))}
        <SliderMark
          value={100}
          borderRadius='100%'
          display='flex'
          alignItems='center'
          justifyContent='center'
          mt='-1.5'
          ml='-2.5'
          w='12px'
          h='12px'
          bg='blue.500'
          zIndex='100'
          sx={{
            pointerEvents: 'auto !important',
          }}
          onClick={() => {
            setSliderValue(100)
          }}
        >
          <Box
            rounded='full'
            bg={sliderValue === 100 ? 'white' : 'rgba(255, 255, 255, 0.2)'}
            w='8px'
            h='8px'
          />
        </SliderMark>
        <SliderTrack bg='rgba(255, 255, 255, 0.20)'>
          <SliderFilledTrack bg='white' />
        </SliderTrack>
      </ChakraSlider>

      <Stack w={'full'} spacing={1} mt='8px'>
        <Text fontSize={'14px'} color='white'>
          {strategy == 'Buy' ? 'You pay' : 'You sell'}
        </Text>
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
              onChange={(e) => handleInputValueChange(e.target.value)}
            />

            <Button
              h={'full'}
              colorScheme={'transparent'}
              border={'1px solid'}
              borderColor={'border'}
              gap={1}
              minW={'110px'}
            >
              <Avatar size={'xs'} src={market?.tokenURI[defaultChain.id]} />
              <Text>{market?.tokenTicker[defaultChain.id]}</Text>
            </Button>
          </HStack>

          <HStack w={'full'} justifyContent={'space-between'} color={'fontLight'} fontSize={'12px'}>
            <Text>~${amountUsd}</Text>
            <Text
              _hover={{ color: 'font' }}
              cursor={'pointer'}
              onClick={() =>
                setCollateralAmount(NumberUtil.toFixed(balance, token?.symbol === 'USDC' ? 1 : 6))
              }
            >
              {`Balance: ${NumberUtil.formatThousands(balance, token?.symbol === 'USDC' ? 1 : 6)}`}{' '}
              {market?.tokenTicker[defaultChain.id]}
            </Text>
          </HStack>
        </Stack>
      </Stack>

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

        {address ? (
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
            <Text textAlign={'right'}>{`${NumberUtil.formatThousands(
              quotes?.outcomeTokenPrice,
              6
            )} ${market?.tokenTicker[defaultChain.id]}`}</Text>
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
                    {`${NumberUtil.formatThousands(quotes?.outcomeTokenAmount, 6)} ${
                      market?.tokenTicker[defaultChain.id]
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
                <Text textAlign={'right'}>
                  {NumberUtil.formatThousands(quotes?.outcomeTokenAmount, 6)}
                </Text>
              </HStack>
            </>
          )}
        </VStack>
      </VStack>
    </Paper>
  )
}
