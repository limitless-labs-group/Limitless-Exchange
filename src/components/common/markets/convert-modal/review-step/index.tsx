import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { parseUnits } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import { ClobPositionWithTypeAndSelected } from '@/components/common/markets/convert-modal/convert-modal-content'
import { useTradingService } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { captionRegular, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

interface ReviewStepProps {
  positions: ClobPositionWithTypeAndSelected[]
  onBack: () => void
  sharesToConvert: string
}

export default function ReviewStep({ positions, onBack, sharesToConvert }: ReviewStepProps) {
  const { groupMarket, market } = useTradingService()
  const queryClient = useQueryClient()
  const positionsToConvert = positions.filter((pos) => pos.selected)
  const remainMarkets = groupMarket?.markets?.filter(
    (market) => !positionsToConvert.some((pos) => pos.market.slug === market.slug)
  )

  const { convertShares } = useWeb3Service()

  const convertMutation = useMutation({
    mutationKey: ['convert-shares', groupMarket?.slug],
    mutationFn: async () => {
      const indexSet =
        groupMarket?.markets
          ?.map((market) =>
            positionsToConvert.some((pos) => pos.market.slug === market.slug) ? '1' : '0'
          )
          .reverse()
          .join('') || '000'
      await convertShares(
        groupMarket?.negRiskMarketId as string,
        parseInt(indexSet, 2).toString(),
        parseUnits(sharesToConvert, groupMarket?.collateralToken.decimals || 6)
      )
    },
  })

  const onResetMutation = async () => {
    await sleep(2)
    await queryClient.refetchQueries({
      queryKey: ['market-shares', market?.slug],
    })
    convertMutation.reset()
  }

  const tableHeader = (
    <HStack
      w='full'
      justifyContent='space-between'
      mt='12px'
      borderBottom='2px solid'
      borderColor='grey.200'
    >
      <Text flex={3} {...paragraphRegular} color='grey.500'>
        Outcome
      </Text>
      <Text flex={1} {...paragraphRegular} color='grey.500'>
        Contracts
      </Text>
    </HStack>
  )

  const usdcToReceive = new BigNumber(positionsToConvert.length)
    .minus(1)
    .multipliedBy(sharesToConvert)
    .toString()

  return (
    <Box mt='24px'>
      <Text {...paragraphMedium}>You’re converting</Text>
      {tableHeader}
      <VStack gap={0} w='full'>
        {positionsToConvert.map((position) => (
          <HStack w='full' key={position.market.slug} py='4px'>
            <HStack flex={3} gap='12px'>
              <Text {...paragraphMedium}>{position.market.title}</Text>
              <Box borderRadius='8px' bg='redTransparent.100' px='4px' py='2px' w='30px'>
                <Text {...captionRegular} color='red.500' textAlign='center'>
                  No
                </Text>
              </Box>
            </HStack>
            <Text {...paragraphRegular} flex={1}>
              {sharesToConvert}
            </Text>
          </HStack>
        ))}
      </VStack>
      <Text {...paragraphMedium} mt='24px'>
        Receiving
      </Text>
      {tableHeader}
      <VStack gap={0} w='full'>
        {remainMarkets?.map((position) => (
          <HStack w='full' key={position.slug} py='4px'>
            <HStack flex={3} gap='12px'>
              <Text {...paragraphMedium}>{position.title}</Text>
              <Box borderRadius='8px' bg='greenTransparent.100' px='4px' py='2px' w='30px'>
                <Text {...captionRegular} color='green.500' textAlign='center'>
                  Yes
                </Text>
              </Box>
            </HStack>
            <Text {...paragraphRegular} flex={1}>
              {sharesToConvert}
            </Text>
          </HStack>
        ))}
        <HStack w='full' py='4px'>
          <HStack flex={3} gap='12px'>
            <Text {...paragraphMedium}>{groupMarket?.collateralToken.symbol}</Text>
          </HStack>
          <Text {...paragraphRegular} flex={1}>
            {usdcToReceive} {groupMarket?.collateralToken.symbol}
          </Text>
        </HStack>
      </VStack>
      <HStack mt='32px'>
        <Button variant='outlined' onClick={onBack}>
          Back
        </Button>
        <ButtonWithStates
          variant='contained'
          status={convertMutation.status}
          onReset={onResetMutation}
          onClick={async () => convertMutation.mutateAsync()}
          minW='72px'
        >
          Convert
        </ButtonWithStates>
      </HStack>
    </Box>
  )
}
