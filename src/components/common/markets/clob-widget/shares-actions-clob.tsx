import { Button, HStack, useDisclosure } from '@chakra-ui/react'
import MergeSharesModal from '@/components/common/modals/merge-shares-modal'
import SplitSharesModal from '@/components/common/modals/split-shares-modal'
import Paper from '@/components/common/paper'
import useClobMarketShares from '@/hooks/use-clob-market-shares'
import MergeIcon from '@/resources/icons/merge-icon.svg'
import SplitIcon from '@/resources/icons/split-icon.svg'
import { useAccount, useTradingService } from '@/services'

export default function SharesActionsClob() {
  const { isOpen: splitModalOpened, onToggle: onToggleSplitModal } = useDisclosure()
  const { isOpen: mergeModalOpened, onToggle: onToggleMergeModal } = useDisclosure()
  const { market } = useTradingService()
  const { data: sharesOwned } = useClobMarketShares(market?.slug, market?.tokens)
  const { account } = useAccount()

  return (
    <>
      <Paper w='full' mt='16px'>
        <HStack w='full' gap='24px' justifyContent='center'>
          <Button variant='transparentGreyText' onClick={onToggleSplitModal} isDisabled={!account}>
            <SplitIcon />
            Split Contracts
          </Button>
          <Button
            variant='transparentGreyText'
            onClick={onToggleMergeModal}
            isDisabled={sharesOwned?.[0] === 0n || sharesOwned?.[1] === 0n || !account}
          >
            <MergeIcon />
            Merge Contracts
          </Button>
        </HStack>
      </Paper>
      <SplitSharesModal isOpen={splitModalOpened} onClose={onToggleSplitModal} />
      <MergeSharesModal isOpen={mergeModalOpened} onClose={onToggleMergeModal} />
    </>
  )
}
