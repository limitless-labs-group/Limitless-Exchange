import { Text, HStack, Stack, Divider, Button, useClipboard } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { OnboardRow } from './onboarding-row'
import { onboardingStepsAtom } from '@/atoms/onboard'
import CopyIcon from '@/resources/icons/copy-icon.svg'
import RoundCheckIcon from '@/resources/icons/round-check-icon.svg'
import { ClickEvent, useAccount, useAmplitude } from '@/services'
import {
  headlineBold,
  paragraphBold,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'

export interface OnboardingListProps {
  isFinished: boolean
  onFinish: () => Promise<void>
  mobile?: boolean
}

export const OnboardingList = ({ isFinished, onFinish, mobile }: OnboardingListProps) => {
  const [steps] = useAtom(onboardingStepsAtom)
  const [refCopied, setRefCopied] = useState(false)
  const { trackClicked } = useAmplitude()
  const { refLink } = useAccount()
  const { hasCopied, onCopy } = useClipboard(refLink)

  useEffect(() => {
    let hideRefCopiedMessage: NodeJS.Timeout | undefined
    if (refCopied) {
      hideRefCopiedMessage = setTimeout(() => {
        setRefCopied(false)
      }, 2000)
    }

    return () => {
      if (hideRefCopiedMessage) {
        clearTimeout(hideRefCopiedMessage)
      }
    }
  }, [refCopied])

  const onRefLinkCopy = () => {
    onCopy()
    trackClicked(ClickEvent.CopyReferralClicked, {
      //@ts-ignore
      from: 'Onboarding',
    })
    setRefCopied(true)
  }

  return isFinished ? (
    <Stack
      gap='16px'
      p={mobile ? '8px 12px' : '0px'}
      bg='green.500'
      borderRadius={mobile ? '8px' : 'unset'}
    >
      <Text {...headlineBold} color='white'>
        {` 🎉 You're all set!`}
      </Text>
      <Text {...paragraphRegular} color='white'>
        {`You've completed onboarding and earned +10 points.`}
      </Text>
      <Text {...paragraphRegular} color='white'>
        Keep exploring to sharpen your forecasting skills—and invite others to join too!
      </Text>
      <HStack justifyContent={mobile ? 'space-between' : 'unset'}>
        <Button
          variant='outlined'
          size='sm'
          bg='white'
          borderColor='white'
          color='black'
          onClick={onFinish}
          _hover={{
            bg: '#E5E7EB',
            borderColor: '#E5E7EB',
          }}
        >
          <Text {...paragraphMedium} color='black'>
            Finish onboarding
          </Text>
        </Button>

        <Button
          variant='outlined'
          size='sm'
          bg='white'
          borderColor='white'
          color='black'
          onClick={onRefLinkCopy}
          _hover={{
            bg: '#E5E7EB',
            borderColor: '#E5E7EB',
          }}
        >
          <CopyIcon width='16px' height='16px' cursor='pointer' />
          {hasCopied ? (
            <Text {...paragraphMedium} color='black'>
              Link copied!
            </Text>
          ) : (
            <Text {...paragraphMedium} color='black'>
              Invite people
            </Text>
          )}
        </Button>
      </HStack>
    </Stack>
  ) : (
    <Stack p={mobile ? '8px 12px' : '0px'} borderColor='grey.100'>
      <Stack>
        <HStack alignItems='start'>
          <Stack>
            <Text {...headlineBold}>Get started and earn points</Text>
            <Text {...paragraphRegular}>
              Complete these simple steps to unlock rewards for you and your inviter
            </Text>
          </Stack>
          <Stack>
            <RoundCheckIcon width='24px' height='24px' />
          </Stack>
        </HStack>
      </Stack>
      <Divider borderColor='grey.200' />
      <Stack gap='12px'>
        {steps.map((item, index) => {
          return (
            <OnboardRow
              key={index}
              isChecked={item.isChecked}
              title={item.title}
              description={item.description}
              points={item.points}
            />
          )
        })}
        <OnboardRow title='Finish onboarding and get +10 points' />
      </Stack>
    </Stack>
  )
}
