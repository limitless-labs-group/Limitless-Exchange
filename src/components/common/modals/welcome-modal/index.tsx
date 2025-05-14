import {
  Box,
  Button,
  Step,
  StepIndicator,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Text,
  VStack,
} from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import BlueCircleIcon from '@/resources/icons/blue-circle-icon.svg'
import { ClickEvent, useAccount, useAmplitude } from '@/services'
import { captionRegular, h3Bold, paragraphRegular } from '@/styles/fonts/fonts.styles'
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
      title: 'step 1:',
      description: 'find markets matching your expertise.',
    },
    {
      title: 'step 2:',
      description: 'fund your account with USDC on Base',
    },
    {
      title: 'step 3:',
      description: 'buy contracts at price reflecting your confidence',
    },
    {
      title: 'step 4:',
      description: 'profit from correct predictions or price movements',
    },
  ]

  useEffect(() => {
    localStorage.setItem(WELCOME, 'true')
  }, [])

  return (
    <VStack w='full' py='24px' gap='24px' alignItems='flex-start'>
      <Text {...h3Bold} px='24px' fontSize='20px'>
        How it works?
      </Text>
      <Text {...paragraphRegular} px='24px' fontSize='14px'>
        Limitless lets you trade financial predictions where contract prices reflect market
        confidence — 72¢ means a 72% probability.
      </Text>
      <Text {...paragraphRegular} px='24px' fontSize='14px'>
        You earn $1 per contract when correct.
      </Text>
      <Stepper index={steps.length} orientation='vertical' gap='16px' px='24px' variant='blue'>
        {steps.map((step, index) => (
          <Step key={index} alignItems='flex-start'>
            <StepIndicator>
              <StepStatus
                complete={
                  <Box zIndex={10} bg='grey.50'>
                    <BlueCircleIcon />
                  </Box>
                }
              />
            </StepIndicator>

            <VStack w='full' alignItems='flex-start' gap={0}>
              <StepTitle fontSize='14px'>{step.title}</StepTitle>
              <Text {...paragraphRegular} fontSize='14px'>
                {step.description}
              </Text>
            </VStack>
            <StepSeparator />
          </Step>
        ))}
      </Stepper>
      <Box px={isMobile ? '16px' : '24px'}>
        <Button variant='contained' w='full' onClick={onSignUp}>
          I’m ready to turn my knowledge into profit
        </Button>
        <Text
          {...captionRegular}
          mt='16px'
          color='grey.500'
          px={isMobile ? '8px' : 0}
          fontSize='12px'
          textAlign='center'
        >
          By clicking this button you agree to the terms and conditions and certify that you are
          over 18 years old.
        </Text>
      </Box>
    </VStack>
  )
}
