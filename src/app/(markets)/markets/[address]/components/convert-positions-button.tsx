import { Box, Button } from '@chakra-ui/react'
import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import ConvertModalContent from '@/components/common/markets/convert-modal/convert-modal-content'
import { useTradingService } from '@/services'

export default function ConvertPositionsButton() {
  const { setConvertModalOpened } = useTradingService()
  const [step, setStep] = useState(1)

  const handleClick = () => {
    if (!isMobile) {
      setConvertModalOpened(true)
    }
  }

  const button = (
    <Button variant='white' onClick={handleClick}>
      Convert
    </Button>
  )
  return isMobile ? (
    <MobileDrawer trigger={button} variant='common' onClose={() => setStep(1)}>
      <Box p='16px'>
        <ConvertModalContent step={step} setStep={setStep} />
      </Box>
    </MobileDrawer>
  ) : (
    button
  )
}
