import {
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  Stack,
  Divider,
  Checkbox,
  Button,
} from '@chakra-ui/react'
import { atom, useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { onboardModalAtom } from '@/atoms/onboard'
import CheckedIcon from '@/resources/icons/checked-icon.svg'
import CopyIcon from '@/resources/icons/copy-icon.svg'
import RoundCheckIcon from '@/resources/icons/round-check-icon.svg'
import { ClickEvent, useAccount, useAmplitude } from '@/services'
import {
  headlineBold,
  paragraphBold,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { CircularProgress } from '../circle-progress'

export const OnboardingModal = () => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(onboardModalAtom)
  const [steps, setSteps] = useAtom(onboardingStepsAtom)
  const [refCopied, setRefCopied] = useState(false)
  const { trackClicked } = useAmplitude()
  const { refLink } = useAccount()
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
    trackClicked(ClickEvent.CopyReferralClicked, {
      // @ts-ignore
      from: 'Onboarding',
    })
    setRefCopied(true)
  }

  const completedSteps = steps.filter((step) => step.isChecked).length
  const progress = Math.round((completedSteps / steps.length) * 100)
  const isFinished = completedSteps === steps.length
  const finish = () => {
    setIsMenuOpen(false)
  }

  return (
    <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
      <MenuButton
        background='transparent'
        _hover={{ background: 'transparent' }}
        onClick={() => setIsMenuOpen(true)}
      >
        {isFinished ? (
          <RoundCheckIcon width='16px' height='16px' />
        ) : (
          <CircularProgress progress={progress} />
        )}
      </MenuButton>
      <MenuList
        maxW='340px'
        w='full'
        gap='12px'
        p='12px'
        display='flex'
        flexDirection='column'
        bg={isFinished ? 'green.500' : 'grey.100'}
      >
        {isFinished ? (
          <Stack gap='16px'>
            <Text {...headlineBold} color='grey.50'>
              {`🎉 You are all set!`}
            </Text>
            <Text {...paragraphRegular} color='grey.50'>
              {`You have completed onboarding and earned +5 points.`}
            </Text>
            <Text {...paragraphRegular} color='grey.50'>
              Keep exploring to sharpen your forecasting skills—and invite others to join too!
            </Text>
            <HStack>
              <Button variant='outlined' size='sm' bg='grey.100' onClick={finish}>
                <Text {...paragraphMedium}>Finish onboarding</Text>
              </Button>

              {/* @ts-ignore */}
              <CopyToClipboard text={refLink} onCopy={onRefLinkCopy}>
                <Button variant='outlined' size='sm' bg='grey.100'>
                  <CopyIcon width='16px' height='16px' cursor='pointer' />
                  {refCopied ? (
                    <Text {...paragraphMedium}>Link copied!</Text>
                  ) : (
                    <Text {...paragraphMedium}> Invite people</Text>
                  )}
                </Button>
              </CopyToClipboard>
            </HStack>
          </Stack>
        ) : (
          <>
            <Stack>
              <HStack alignItems='center'>
                <Stack>
                  <Text {...paragraphBold}>Get started and earn points</Text>
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
                    onToggle={() => {
                      const newSteps = [...steps]
                      newSteps[index] = {
                        ...newSteps[index],
                        isChecked: !newSteps[index].isChecked,
                      }
                      setSteps(newSteps)
                    }}
                  />
                )
              })}
            </Stack>
          </>
        )}
      </MenuList>
    </Menu>
  )
}

export interface OnboardingStep {
  isChecked: boolean
  title: string
  description?: string
  points?: string
}

const defaultSteps = [
  {
    isChecked: true,
    title: 'Create your account',
  },
  {
    isChecked: false,
    title: 'Make your first prediction',
    description: 'Choose a question and assign a probability to one of the outcomes',
  },
  {
    isChecked: false,
    title: 'Follow through on a forecast',
    description:
      'See how your prediction performed after the outcome is known. Whether you are right or wrong, it still counts!',
  },
  {
    isChecked: false,
    title: 'Finish onboarding',
    points: '+5 points',
  },
]
export const onboardingStepsAtom = atom<OnboardingStep[]>(defaultSteps)

export interface OnboardRowProps {
  key: number
  isChecked: boolean
  title: string
  description?: string
  points?: string
  onToggle?: () => void
}
const OnboardRow = ({ key, isChecked, title, description, points, onToggle }: OnboardRowProps) => {
  return (
    <HStack key={key} gap='12px' alignItems='start'>
      <Checkbox
        isChecked={isChecked}
        onChange={onToggle}
        mt='3px'
        icon={<CheckedIcon color='grey.50' width={12} height={12} />}
      ></Checkbox>

      <Stack gap='4px'>
        <HStack>
          <Text
            {...paragraphMedium}
            color={isChecked ? 'grey.500' : undefined}
            textDecoration={isChecked ? 'line-through' : undefined}
          >
            {title}
          </Text>{' '}
          <Stack>
            {points ? (
              <Text
                {...paragraphMedium}
                color={isChecked ? 'grey.500' : undefined}
                textDecoration={isChecked ? 'line-through' : undefined}
              >
                {points}
              </Text>
            ) : null}
          </Stack>
        </HStack>
        {description ? (
          <Text
            {...paragraphRegular}
            color='grey.500'
            textDecoration={isChecked ? 'line-through' : undefined}
          >
            {description}
          </Text>
        ) : null}
      </Stack>
    </HStack>
  )
}
