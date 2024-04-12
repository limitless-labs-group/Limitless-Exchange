import { Button, Input, LogInButton } from '@/components'
import { collateralToken, defaultChain } from '@/constants'
import { useMarketData } from '@/hooks'
import {
  StrategyChangedMetadata,
  ChangeEvent,
  useAccount,
  useAmplitude,
  useBalanceService,
  useTradingService,
  OutcomeChangedMetadata,
  ClickEvent,
  PricePresetClickedMetadata,
} from '@/services'
import { borderRadius, colors } from '@/styles'
import { NumberUtil } from '@/utils'
import {
  Avatar,
  Box,
  Divider,
  Flex,
  HStack,
  Heading,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  StackProps,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { useState } from 'react'
import { FaInfoCircle } from 'react-icons/fa'
import { getAddress, zeroAddress } from 'viem'

export const TradeForm = ({ ...props }: StackProps) => {
  /**
   * ACCOUNT STATE
   */
  const { isLoggedIn } = useAccount()

  /**
   * ANALITYCS
   */
  const { trackChanged, trackClicked } = useAmplitude()

  /**
   * BALANCE
   */
  const { balanceOfSmartWallet } = useBalanceService()

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
    balanceShares,
    netCost,
    shareCost,
    roi,
    trade,
    status,
  } = useTradingService()

  /**
   * MARKET DATA
   */
  const marketAddress = getAddress(market?.address[defaultChain.id] ?? zeroAddress)
  const { sharesPercent } = useMarketData({
    marketAddress,
  })

  /**
   * SLIDER
   */
  const [sliderValue, setSliderValue] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)

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
            {/* {strategy == 'Buy' ? (
              <Button
                h={'24px'}
                px={2}
                py={1}
                fontSize={'13px'}
                colorScheme={'transparent'}
                gap={1}
              >
                {`Balance: ${NumberUtil.toFixed(balanceOfSmartWallet?.formatted, 1)}`}{' '}
                {collateralToken.symbol}
              </Button>
            ) : (
              <Button
                h={'24px'}
                px={2}
                py={1}
                fontSize={'13px'}
                onClick={() => setAmount(NumberUtil.toFixed(balanceShares, 0))}
              >
                Max {NumberUtil.toFixed(balanceShares, 0)} shares
              </Button>
            )} */}
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
                value={amount}
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
              <Text>$3,512,2</Text> {/* // TODO: replace with USD calc  */}
              <Text
                _hover={{ color: 'font' }}
                cursor={'pointer'}
                onClick={() => setAmount(balanceOfSmartWallet?.formatted ?? '')}
              >
                {`Balance: ${NumberUtil.toFixed(balanceOfSmartWallet?.formatted, 3)}`}{' '}
                {collateralToken.symbol}
              </Text>
            </HStack>
          </Stack>
        </Stack>

        <Slider
          w={'95%'}
          aria-label='slider-ex-6'
          value={sliderValue}
          onChange={(val) => setSliderValue(val)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
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
          {strategy == 'Buy' ? (
            <>
              <HStack w={'full'} justifyContent={'space-between'}>
                <Text color={'fontLight'}>Potential return</Text>
                <HStack spacing={1}>
                  <Text color={'green'} fontWeight={'bold'} textAlign={'right'}>
                    {`${Number(amount ?? 0)} ${collateralToken.symbol}`}
                  </Text>
                  <Text color={'fontLight'}>{Number(roi ?? 0)}%</Text>
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
                    <Flex>
                      <FaInfoCircle fill={colors.fontLight} />
                    </Flex>
                  </Tooltip>
                </HStack>
                <Text textAlign={'right'}>0</Text>
              </HStack>
            </>
          ) : (
            <>
              <HStack w={'full'} justifyContent={'space-between'}>
                <Text color={'fontLight'}>Avg price</Text>
                <Text textAlign={'right'}>{`${Number(shareCost ?? 0)} ${
                  collateralToken.symbol
                }`}</Text>
              </HStack>
            </>
          )}
        </VStack>
      </VStack>
    </Stack>
  )
}
