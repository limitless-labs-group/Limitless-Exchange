import { Button, Input, LogInButton } from '@/components'
import { defaultChain } from '@/constants'
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
import { borderRadius } from '@/styles'
import { NumberUtil } from '@/utils'
import { Box, Divider, HStack, Heading, Stack, StackProps, Text, VStack } from '@chakra-ui/react'
import { getAddress, zeroAddress } from 'viem'

export const TradeForm = ({ ...props }: StackProps) => {
  const { isLoggedIn } = useAccount()
  const { trackChanged, trackClicked } = useAmplitude()
  const { balanceOfSmartWallet } = useBalanceService()
  const {
    market,
    strategy,
    setStrategy,
    outcomeTokenSelected,
    setOutcomeTokenSelected,
    amount,
    setAmount,
    decreaseAmount,
    increaseAmount,
    isExceedsBalance,
    balanceShares,
    netCost,
    shareCost,
    roi,
    trade,
    status,
  } = useTradingService()

  const marketAddress = getAddress(market?.address[defaultChain.id] ?? zeroAddress)
  const { sharesCost } = useMarketData({
    marketAddress,
  })

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
          <Text fontWeight={strategy == 'Buy' ? 'bold' : 'nornal'}>Buy</Text>
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
          <Text fontWeight={strategy == 'Sell' ? 'bold' : 'nornal'}>Sell</Text>
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
              {market?.outcomeTokens[0] ?? 'Yes'} {sharesCost?.[0]?.toFixed(1) ?? '50.0'}¢
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
              {market?.outcomeTokens[1] ?? 'No'} {sharesCost?.[1]?.toFixed(1) ?? '50.0'}¢
            </Button>
          </HStack>
        </VStack>

        <Stack w={'full'} spacing={1}>
          <HStack w={'full'} justifyContent={'space-between'} alignItems={'center'}>
            <Heading fontSize={'14px'}>Shares</Heading>
            {strategy == 'Buy' ? (
              <Button h={'24px'} px={2} py={1} fontSize={'13px'} colorScheme={'transparent'}>
                Balance: ${NumberUtil.toFixed(balanceOfSmartWallet?.formatted, 1)}
              </Button>
            ) : (
              <Button
                h={'24px'}
                px={2}
                py={1}
                fontSize={'13px'}
                onClick={() => setAmount(NumberUtil.toIntString(balanceShares))}
              >
                Max {NumberUtil.toIntString(balanceShares)} shares
              </Button>
            )}
          </HStack>
          <HStack w={'full'} spacing={1}>
            <HStack pos={'relative'}>
              <Button
                pos={'absolute'}
                h={'40px'}
                left={'8px'}
                top={`${(60 - 40) / 2}px`}
                zIndex={2}
                fontSize={'26px'}
                fontWeight={'normal'}
                p={2}
                onClick={() => {
                  trackClicked<PricePresetClickedMetadata>(ClickEvent.PricePresetClicked, {
                    type: '-10 clicked',
                  })
                  decreaseAmount(10)
                }}
              >
                -
              </Button>
              <Input
                type={'number'}
                fontWeight={'bold'}
                fontSize={'18px'}
                textAlign={'center'}
                placeholder={'0'}
                // zIndex={-1}
                borderColor={isExceedsBalance && strategy == 'Sell' ? 'red' : 'bgLight'}
                _hover={{
                  borderColor: isExceedsBalance && strategy == 'Sell' ? 'red' : 'bgLight',
                }}
                _focus={{
                  boxShadow: 'none',
                  borderColor: isExceedsBalance && strategy == 'Sell' ? 'red' : 'bgLight',
                }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <Button
                pos={'absolute'}
                h={'40px'}
                right={'8px'}
                top={`${(60 - 40) / 2}px`}
                zIndex={2}
                fontSize={'22px'}
                fontWeight={'normal'}
                p={2}
                onClick={() => {
                  trackClicked<PricePresetClickedMetadata>(ClickEvent.PricePresetClicked, {
                    type: '+10 clicked',
                  })
                  increaseAmount(10)
                }}
              >
                +
              </Button>

              {/* <VStack spacing={1}>
              <HStack spacing={1}>
                <Button
                  fontSize={'12px'}
                  p={1}
                  h={'fit-content'}
                  color={'green'}
                  bg={'none'}
                  onClick={() => increaseAmount(1)}
                >
                  +$1
                </Button>
                <Button
                  fontSize={'12px'}
                  p={1}
                  h={'fit-content'}
                  color={'green'}
                  bg={'none'}
                  onClick={() => increaseAmount(5)}
                >
                  +$5
                </Button>
              </HStack>
              <HStack spacing={1}>
                <Button
                  fontSize={'12px'}
                  p={1}
                  h={'fit-content'}
                  color={'red'}
                  bg={'none'}
                  onClick={() => decreaseAmount(1)}
                >
                  -$1
                </Button>
                <Button
                  fontSize={'12px'}
                  p={1}
                  h={'fit-content'}
                  color={'red'}
                  bg={'none'}
                  onClick={() => decreaseAmount(5)}
                >
                  -$5
                </Button>
              </HStack>
            </VStack> */}
            </HStack>

            <Text color={'fontLight'}>≈</Text>

            {/* <Input
              // fontWeight={'bold'}
              fontSize={'16px'}
              textAlign={'center'}
              borderColor={isExceedsBalance && strategy == 'Buy' ? 'red' : 'bgLight'}
              value={`$${NumberUtil.toFixed(netCost, 2)}`}
              placeholder={'$0'}
              bg={'none'}
              pointerEvents={'none'}
              width={'fit-content%'}
              px={0}
            /> */}
            <Text
              color={isExceedsBalance && strategy == 'Buy' ? 'red' : 'font'}
            >{`$${NumberUtil.toFixed(netCost, 2)}`}</Text>
          </HStack>
        </Stack>

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
            <Text textAlign={'right'}>{Number(shareCost ?? 0)}¢</Text>
          </HStack>
          {strategy == 'Buy' && (
            <HStack w={'full'} justifyContent={'space-between'}>
              <Text color={'fontLight'}>Potential return</Text>
              <Text color={'green'} fontWeight={'bold'} textAlign={'right'}>
                ${Number(amount ?? 0)} ({Number(roi ?? 0)}%)
              </Text>
            </HStack>
          )}
        </VStack>
      </VStack>
    </Stack>
  )
}
