import { Button, VStack } from '@chakra-ui/react'
import React, { PropsWithChildren } from 'react'
import usePageName from '@/hooks/use-page-name'
import { ClickEvent, useAmplitude } from '@/services'

export default function UpgradeWalletContainer({ children }: PropsWithChildren) {
  const { trackClicked } = useAmplitude()
  const pageName = usePageName()

  const handleUpgradeClicked = () => {
    trackClicked(ClickEvent.UpgradeWalletClicked, {
      page: pageName,
    })
    window.open(
      'https://www.notion.so/limitlesslabs/Wallet-Upgrade-16104e33c4b980609633cf09dc032242',
      '_blank',
      'noopener'
    )
  }

  return (
    <VStack
      w='full'
      border='2px solid'
      borderColor='blue.500'
      borderRadius='8px'
      gap='10px'
      pt='4px'
    >
      {children}
      <Button
        variant='contained'
        rounded='0px'
        onClick={handleUpgradeClicked}
        w='full'
        _hover={{ bg: 'blue.500' }}
      >
        Upgrade wallet
      </Button>
    </VStack>
  )
}
