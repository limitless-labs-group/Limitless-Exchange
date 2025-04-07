import { Box, Button, HStack, useDisclosure } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MergeSharesModal from '@/components/common/modals/merge-shares-modal'
import SplitSharesModal from '@/components/common/modals/split-shares-modal'
import Paper from '@/components/common/paper'
import MergeIcon from '@/resources/icons/merge-icon.svg'
import SplitIcon from '@/resources/icons/split-icon.svg'
import { ClickEvent, useAccount, useAmplitude, useTradingService } from '@/services'

export default function SharesActionsClob() {
  const { isOpen: splitModalOpened, onToggle: onToggleSplitModal } = useDisclosure()
  const { isOpen: mergeModalOpened, onToggle: onToggleMergeModal } = useDisclosure()
  const { account } = useAccount()
  const { trackClicked } = useAmplitude()
  const { market } = useTradingService()
  // const { sharesAvailable } = useClobWidget()

  const handleSplitClicked = () => {
    onToggleSplitModal()
    trackClicked(ClickEvent.SplitContractsModalClicked, {
      marketAddress: market?.slug,
    })
  }

  const handleMergeClicked = () => {
    onToggleMergeModal()
    trackClicked(ClickEvent.MergeContractsModalClicked, {
      marketAddress: market?.slug,
    })
  }

  const splitButton = (
    <Button variant='transparentGreyText' onClick={handleSplitClicked} isDisabled={!account}>
      <SplitIcon />
      Split Contracts
    </Button>
  )

  const mergeButton = (
    <Button
      variant='transparentGreyText'
      onClick={handleMergeClicked}
      // isDisabled={sharesAvailable['yes'] === 0n || sharesAvailable['no'] === 0n || !account}
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
