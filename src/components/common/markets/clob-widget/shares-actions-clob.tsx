import { Box, Button, HStack, useDisclosure } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
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
  const splitButton = (
    <Button variant='transparentGreyText' onClick={onToggleSplitModal} isDisabled={!account}>
      <SplitIcon />
      Split Contracts
    </Button>
  )

  const mergeButton = (
    <Button
      variant='transparentGreyText'
      onClick={onToggleMergeModal}
      isDisabled={sharesOwned?.[0] === 0n || sharesOwned?.[1] === 0n || !account}
    >
      <MergeIcon />
      Merge Contracts
    </Button>
  )

  return (
    <>
      <Paper w='full' mt='16px'>
        <HStack w='full' gap='24px' justifyContent='center'>
          {isMobile ? (
            <MobileDrawer trigger={splitButton} variant='black'>
              <Box p='16px'>
                <SplitSharesModal isOpen={splitModalOpened} onClose={onToggleSplitModal} />
              </Box>
            </MobileDrawer>
          ) : (
            splitButton
          )}
          {isMobile ? (
            <MobileDrawer trigger={mergeButton} variant='black'>
              <Box p='16px'>
                <MergeSharesModal isOpen={mergeModalOpened} onClose={onToggleMergeModal} />
              </Box>
            </MobileDrawer>
          ) : (
            mergeButton
          )}
        </HStack>
      </Paper>
      {!isMobile && <SplitSharesModal isOpen={splitModalOpened} onClose={onToggleSplitModal} />}
      {!isMobile && <MergeSharesModal isOpen={mergeModalOpened} onClose={onToggleMergeModal} />}
    </>
  )
}
