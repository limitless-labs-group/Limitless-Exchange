import { Box, Button, Text, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import Logo from '@/resources/icons/logo-in-box.svg'
import { ClickEvent, useAccount, useAmplitude } from '@/services'
import { h3Bold, paragraphBold, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { WELCOME } from '@/utils/consts'

interface WelcomeModalProps {
  onClose: () => void
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const { loginToPlatform } = useAccount()
  const { trackClicked } = useAmplitude()

  const onSignUp = () => {
    trackClicked(ClickEvent.WelcomeModalSignUpButtonClicked)
    onClose()
    loginToPlatform()
  }

  const steps = [
    {
      title: 'Step 1:',
      description: 'Sign up for a free account',
    },
    {
      title: 'Step 2:',
      description: 'Explore live market data',
    },
    {
      title: 'Step 3:',
      description: 'Start trading',
    },
  ]

  useEffect(() => {
    localStorage.setItem(WELCOME, 'true')
  }, [])

  return (
    <VStack gap={0} w='full'>
      <Logo />
      <VStack w='full' gap='16px' mt='16px'>
        <Text {...h3Bold} textAlign='center'>
          Welcome to Limitless
        </Text>
        <Text {...paragraphRegular} textAlign='center'>
          Sign up to start trading and forecast the future. It&#39;s free and easy. <br /> Join now
          to access real-time markets and advanced tools!
        </Text>
        <Box>
          {steps.map((step, index) => (
            <Box key={index} textAlign='center'>
              <Text as='span' {...paragraphBold}>
                {step.title}
              </Text>{' '}
              <Text as='span' {...paragraphRegular}>
                {step.description}
              </Text>
            </Box>
          ))}
        </Box>
        <Button onClick={onSignUp} w='175px' h='32px' variant='contained' mt='8px'>
          Sign Up
        </Button>
      </VStack>
    </VStack>
  )
}
