import { Box, Text, Stack, Button } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { welcomeModalAtom } from '@/atoms/onboard'
import Ticket from '@/resources/onboarding/ticket.svg'
import { SignInEvent, useAccount, useAmplitude } from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'
import { h3Bold, paragraphBold, paragraphRegular } from '@/styles/fonts/fonts.styles'

export interface OnboardModalProps {
  onClose: () => void
  referralCode: string
}

export const WelcomeModal = ({ onClose, referralCode }: OnboardModalProps) => {
  const { loginToPlatform } = useAccount()
  const [, setOnboarding] = useAtom(welcomeModalAtom)

  const { pushGA4Event } = useGoogleAnalytics()
  const { trackSignIn } = useAmplitude()
  const signUp = () => {
    loginToPlatform()
    trackSignIn(SignInEvent.SignUp, {
      signedIn: true,
      fromReferral: true,
    })
    pushGA4Event(GAEvents.ClickLogin)
    onClose()
    setOnboarding(false)
  }

  return (
    <Stack w='full' p='20px' alignItems='center'>
      <Box position='relative'>
        <Ticket />
        <Box position='absolute' top='14px' left='14px'>
          <Text {...paragraphRegular}>Code:</Text>
          <Text {...paragraphBold}>{referralCode}</Text>
        </Box>
      </Box>
      <Text {...h3Bold} mt='24px'>
        Welcome to Limitless
      </Text>
      <Text {...paragraphRegular} mt='8px' maxW='285px' textAlign='center'>
        You have been invited to forecast the future with us.
      </Text>
      <Button
        onClick={signUp}
        variant='contained'
        w='fit-content'
        minW='200px'
        minH='32px'
        py='8px'
        mt='24px'
      >
        Sign Up
      </Button>
    </Stack>
  )
}
