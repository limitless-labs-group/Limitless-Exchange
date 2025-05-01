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
  useClipboard,
  ChakraProps,
} from '@chakra-ui/react'
import { atom, useAtom } from 'jotai'
import { useEffect, useState } from 'react'
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

  const completedSteps = steps.filter((step) => step.isChecked).length
  const progress = Math.round((completedSteps / steps.length) * 100)
  const isFinished = completedSteps === steps.length
  const finish = async () => {
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
        <OnboardingList isFinished={isFinished} onFinish={finish} />
      </MenuList>
    </Menu>
  )
}

export interface OnboardingStep {
  isChecked?: boolean
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
]
export const onboardingStepsAtom = atom<OnboardingStep[]>(defaultSteps)

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
        {`🎉 You are all set!`}
      </Text>
      <Text {...paragraphRegular} color='white'>
        {`You have completed onboarding and earned +5 points.`}
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
    <Stack p={mobile ? '8px 12px' : '0px'}>
      <Stack>
        <HStack alignItems='start'>
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
            />
          )
        })}
        <OnboardRow title='Finish onboarding and get +5 points' />
      </Stack>
    </Stack>
  )
}

export interface OnboardRowProps {
  key?: number
  isChecked?: boolean
  title: string
  description?: string
  points?: string
  onToggle?: () => void
}
const OnboardRow = ({ key, isChecked, title, description, points, onToggle }: OnboardRowProps) => {
  const withCheckbox = typeof isChecked === 'boolean'
  return (
    <>
      {!withCheckbox ? <Divider borderColor='grey.200' /> : null}
      <HStack key={key} gap='12px' alignItems='start'>
        {withCheckbox ? (
          <Checkbox
            isChecked={!!isChecked}
            onChange={onToggle}
            mt='3px'
            icon={<CheckedIcon color='grey.50' width={12} height={12} />}
            variant='green'
          />
        ) : null}

        <Stack gap='4px'>
          <HStack justifyContent='space-between'>
            <Text
              {...paragraphMedium}
              color={!!isChecked ? 'grey.500' : undefined}
              textDecoration={!!isChecked ? 'line-through' : undefined}
              pl={!withCheckbox ? '23px' : 0}
            >
              {title}
            </Text>
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
    </>
  )
}
