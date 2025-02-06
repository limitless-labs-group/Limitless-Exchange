import { ButtonProps, Icon } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SyntheticEvent } from 'react'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import ButtonWithStates from '@/components/common/button-with-states'
import WinIcon from '@/resources/icons/win-icon.svg'
import { ClickEvent, useAmplitude, useTradingService } from '@/services'
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
  ...props
}: ClaimButtonProps) {
  const { redeem } = useTradingService()
  const { trackClicked } = useAmplitude()
  const queryClient = useQueryClient()

  const redeemMutation = useMutation({
    mutationKey: ['redeemPosition', slug || marketAddress],
    mutationFn: async () => {
      await redeem({
        conditionId,
        collateralAddress,
        marketAddress,
        outcomeIndex,
        type: marketType,
      })
    },
  })

  const onResetClaimMutation = async () => {
    await sleep(1)
    await queryClient.refetchQueries({
      queryKey: ['positions'],
    })
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
        await redeemMutation.mutateAsync()
      }}
      minW={isMobile ? 'full' : '162px'}
      onReset={onResetClaimMutation}
    >
      <>
        <Icon as={WinIcon} color={'black'} />
        Claim {`${NumberUtil.formatThousands(amountToClaim, 6)} ${symbol}`}
      </>
    </ButtonWithStates>
  )
}
