import { conditionalTokensABI } from '@/contracts'
import { Address, getContract } from 'viem'
import { publicClient } from '@/providers'
import { ZeroHash } from '@/constants'
import { useQuery } from '@tanstack/react-query'

export type ConditionalTokensBalanceOfResult = {
  outcomeSlotCount: bigint
  collectionIds: string[]
  positionIds: string[]
  balances: bigint[]
}

export interface IUseConditionalTokensBalanceOf {
  conditionalTokensAddr: Address | undefined
  collateralTokenAddr: Address | undefined
  conditionId: string | undefined
  account: Address | undefined
}

export const useConditionalTokensBalanceOf = ({
  conditionalTokensAddr,
  collateralTokenAddr,
  conditionId,
  account,
}: IUseConditionalTokensBalanceOf) => {
  return useQuery<ConditionalTokensBalanceOfResult | undefined>({
    queryKey: [
      useConditionalTokensBalanceOf.name,
      { conditionalTokensAddr, collateralTokenAddr, conditionId, account },
    ],
    queryFn: async () => {
      if (!conditionalTokensAddr || !collateralTokenAddr || !conditionId || !account) {
        return
      }
      const contract = getContract({
        abi: conditionalTokensABI,
        address: conditionalTokensAddr,
        client: publicClient,
      })

      const outcomeSlotCount = <bigint>await contract.read.getOutcomeSlotCount([conditionId])
      const collectionIds = await Promise.all(
        Array.from({ length: Number(outcomeSlotCount) }).map(
          (_: unknown, outcomeIndex: number) =>
            <Promise<string>>(
              contract.read.getCollectionId([ZeroHash, conditionId, 1 << outcomeIndex])
            )
        )
      )
      const positionIds = await Promise.all(
        collectionIds.map(
          (collectionId) =>
            <Promise<string>>contract.read.getPositionId([collateralTokenAddr, collectionId])
        )
      )
      const balances = await Promise.all(
        positionIds.map(
          (positionId) => <Promise<bigint>>contract.read.balanceOf([account, positionId])
        )
      )

      const result: ConditionalTokensBalanceOfResult = {
        outcomeSlotCount,
        collectionIds,
        positionIds,
        balances,
      }

      return result
    },
    enabled: !!conditionalTokensAddr && !!collateralTokenAddr && !!conditionId && !!account,
  })
}
