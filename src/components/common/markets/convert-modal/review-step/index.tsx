import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { Address, parseUnits } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import { ClobPositionWithTypeAndSelected } from '@/components/common/markets/convert-modal/convert-modal-content'
import { useAccount, useTradingService } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { captionRegular, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

interface ReviewStepProps {
  positions: ClobPositionWithTypeAndSelected[]
  onBack: () => void
  sharesToConvert: string
  checkConvertAllowance: () => Promise<void>
  isApproved: boolean
}

export default function ReviewStep({
  positions,
  onBack,
  sharesToConvert,
  checkConvertAllowance,
  isApproved,
}: ReviewStepProps) {
  const { groupMarket, market } = useTradingService()
  const { approveAllowanceForAll, convertShares } = useWeb3Service()
  const { web3Wallet, web3Client } = useAccount()
  const queryClient = useQueryClient()
  const positionsToConvert = positions.filter((pos) => pos.selected)
  const remainMarkets = groupMarket?.markets?.filter(
    (market) => !positionsToConvert.some((pos) => pos.market.slug === market.slug)
  )

  const convertMutation = useMutation({
    mutationKey: ['convert-shares', groupMarket?.slug],
    mutationFn: async () => {
      const haveOrder = groupMarket?.markets?.every((market) => market.orderInGroup !== undefined)
      if (!haveOrder || !groupMarket?.markets) {
        throw new Error('Market order is not set')
      }
      const indexSet =
        groupMarket.markets
          .sort((a, b) => a.orderInGroup! - b.orderInGroup!)
          .map((market) =>
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

  const approveMutation = useMutation({
    mutationKey: ['approve-convert-shares', groupMarket?.slug, web3Wallet?.account?.address],
    mutationFn: async () =>
      approveAllowanceForAll(
        process.env.NEXT_PUBLIC_CTF_CONTRACT as Address,
        process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address
      ),
  })

  const onResetMutation = async () => {
    await sleep(1)
    await queryClient.refetchQueries({
      queryKey: ['market-shares', market?.slug],
    })
    await queryClient.refetchQueries({
      queryKey: ['positions'],
    })
    convertMutation.reset()
  }

  const onResetApprove = async () => {
    await sleep(1)
    await checkConvertAllowance()
    approveMutation.reset()
  }

  const actionButton = useMemo(() => {
    if (web3Client === 'etherspot') {
      return (
        <ButtonWithStates
          variant='contained'
          status={convertMutation.status}
          onReset={onResetMutation}
          onClick={async () => convertMutation.mutateAsync()}
          minW='72px'
        >
          Convert
        </ButtonWithStates>
      )
    }
    if (!isApproved) {
      return (
        <ButtonWithStates
          variant='contained'
          status={approveMutation.status}
          onReset={onResetApprove}
          onClick={async () => approveMutation.mutateAsync()}
          minW='72px'
        >
          Approve
        </ButtonWithStates>
      )
    }
    return (
      <ButtonWithStates
        variant='contained'
        status={convertMutation.status}
        onReset={onResetMutation}
        onClick={async () => convertMutation.mutateAsync()}
        minW='72px'
      >
        Convert
      </ButtonWithStates>
    )
  }, [approveMutation, convertMutation, isApproved, web3Client])

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
        {actionButton}
      </HStack>
    </Box>
  )
}
