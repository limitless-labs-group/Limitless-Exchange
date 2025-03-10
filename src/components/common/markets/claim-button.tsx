import { ButtonProps, Icon } from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SyntheticEvent } from 'react'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import WinIcon from '@/resources/icons/win-icon.svg'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { NumberUtil } from '@/utils'

export type ClaimButtonProps = ButtonProps & {
  slug?: string
  conditionId: Address
  collateralAddress: Address
  marketAddress: Address
  outcomeIndex: number
  marketType: 'amm' | 'clob'
  amountToClaim: string
  symbol: string
  negRiskRequestId?: string
  amounts?: string[]
}

export default function ClaimButton({
  slug,
  conditionId,
  collateralAddress,
  marketAddress,
  outcomeIndex,
  marketType,
  amountToClaim,
  symbol,
  negRiskRequestId,
  ...props
}: ClaimButtonProps) {
  const { redeemMutation } = useTradingService()
  const { trackClicked } = useAmplitude()
  const queryClient = useQueryClient()
  const { redeemNegRiskMarket } = useWeb3Service()

  const claimSingleMarket = async () =>
    redeemMutation.mutateAsync({
      conditionId,
      collateralAddress,
      marketAddress,
      outcomeIndex,
      type: marketType,
    })

  const claimNegriskMarketMutation = useMutation({
    mutationKey: ['claim-neg-risk', slug],
    mutationFn: async ({ conditionId, amounts }: { conditionId: string; amounts: bigint[] }) =>
      redeemNegRiskMarket(conditionId, amounts),
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: ['positions'],
      })
    },
  })

  const claimNegRiskMarket = async () =>
    claimNegriskMarketMutation.mutateAsync({
      conditionId,
      amounts: [],
    })

  const handleClaim = async () => {
    if (negRiskRequestId) {
      await claimNegRiskMarket()
      return
    }
    await claimSingleMarket()
  }

  return (
    <ButtonWithStates
      {...props}
      status={redeemMutation.status}
      variant='white'
      onClick={async (e: SyntheticEvent) => {
        e.stopPropagation()
        trackClicked(ClickEvent.ClaimRewardOnPortfolioClicked, {
          platform: isMobile ? 'mobile' : 'desktop',
        })
        await handleClaim()
      }}
      minW={isMobile ? 'full' : '162px'}
      onReset={undefined}
    >
      <>
        <Icon as={WinIcon} color={'black'} />
        Claim {`${NumberUtil.formatThousands(amountToClaim, 6)} ${symbol}`}
      </>
    </ButtonWithStates>
  )
}
