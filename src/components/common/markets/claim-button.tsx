import { Box, ButtonProps, Icon } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SyntheticEvent } from 'react'
import { isMobile } from 'react-device-detect'
import ButtonWithStates from 'src/components/common/buttons/button-with-states'
import { Address, getAddress, zeroHash } from 'viem'
import Skeleton from '@/components/common/skeleton'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import { getConditionalTokenAddress } from '@/hooks/use-conditional-tokens-addr'
import WinIcon from '@/resources/icons/win-icon.svg'
import { ClickEvent, useAccount, useAmplitude, useTradingService } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { NumberUtil } from '@/utils'
import { DISCORD_LINK } from '@/utils/consts'

export type ClaimButtonProps = ButtonProps & {
  slug?: string
  conditionId: Address
  collateralAddress: Address
  marketAddress: Address
  marketType: 'amm' | 'clob'
  amountToClaim?: string
  symbol: string
  negRiskRequestId?: string
  amounts?: bigint[]
}

export default function ClaimButton({
  slug,
  conditionId,
  collateralAddress,
  marketAddress,
  marketType,
  amountToClaim,
  symbol,
  negRiskRequestId,
  amounts,
  ...props
}: ClaimButtonProps) {
  const toast = useToast()
  const { redeemPositions, approveAllowanceForAll } = useWeb3Service()
  const { trackClicked } = useAmplitude()
  const queryClient = useQueryClient()
  const { redeemNegRiskMarket } = useWeb3Service()
  const { negriskApproved, setNegRiskApproved, negriskApproveStatusLoading } = useTradingService()

  const { web3Client } = useAccount()

  const redeemMutation = useMutation({
    mutationKey: ['redeemPosition', slug],
    mutationFn: async () => {
      const conditionalTokenAddress =
        marketType === 'amm'
          ? await getConditionalTokenAddress(getAddress(marketAddress))
          : marketAddress

      const receipt = await redeemPositions(
        conditionalTokenAddress,
        collateralAddress,
        zeroHash,
        conditionId
      )

      if (!receipt) {
        const id = toast({
          render: () => (
            <Toast
              title={`Unsuccessful transaction`}
              text={'Please contact our support.'}
              link={DISCORD_LINK}
              linkText='Open Discord'
              id={id}
            />
          ),
        })
        return
      }
      return receipt
    },
  })

  const claimNegriskMarketMutation = useMutation({
    mutationKey: ['claim-neg-risk', slug],
    mutationFn: async () => redeemNegRiskMarket(conditionId, amounts as bigint[]),
  })

  const claimMutation = negRiskRequestId ? claimNegriskMarketMutation : redeemMutation

  const onResetMutation = async () => {
    await sleep(1)
    await queryClient.refetchQueries({
      queryKey: ['positions'],
    })
    await queryClient.invalidateQueries({
      queryKey: ['history'],
    })
    claimMutation.reset()
  }

  const onResetApproveMutation = async () => {
    await sleep(1)
    setNegRiskApproved(true)
    approveClaimNegriskMutation.reset()
  }

  const approveClaimNegriskMutation = useMutation({
    mutationKey: ['approve-neg-risk-claim', slug],
    mutationFn: async () =>
      approveAllowanceForAll(
        process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address,
        process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
      ),
  })

  if (negriskApproveStatusLoading) {
    return (
      <Box w='162px'>
        <Skeleton height={24} />
      </Box>
    )
  }

  return !!negRiskRequestId && !negriskApproved && web3Client !== 'etherspot' ? (
    <ButtonWithStates
      {...props}
      status={approveClaimNegriskMutation.status}
      variant='white'
      onClick={async (e: SyntheticEvent) => {
        e.stopPropagation()
        trackClicked(ClickEvent.ApproveClaimRewardForNegRiskMarketClicked, {
          platform: isMobile ? 'mobile' : 'desktop',
        })
        await approveClaimNegriskMutation.mutateAsync()
      }}
      minW={isMobile ? 'full' : '162px'}
      onReset={onResetApproveMutation}
    >
      Approve Claim
    </ButtonWithStates>
  ) : (
    <ButtonWithStates
      {...props}
      status={claimMutation.status}
      variant='white'
      onClick={async (e: SyntheticEvent) => {
        e.stopPropagation()
        trackClicked(ClickEvent.ClaimRewardOnPortfolioClicked, {
          platform: isMobile ? 'mobile' : 'desktop',
        })
        await claimMutation.mutateAsync()
      }}
      minW={isMobile ? 'full' : '162px'}
      onReset={onResetMutation}
    >
      <>
        <Icon as={WinIcon} color={'black'} />
        Claim {`${NumberUtil.formatThousands(amountToClaim, 2)} ${symbol}`}
      </>
    </ButtonWithStates>
  )
}
