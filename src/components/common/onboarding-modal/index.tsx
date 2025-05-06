import { Menu, MenuButton, MenuList } from '@chakra-ui/react'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { OnboardingList } from './onboarding-list'
import { onboardingStepsAtom, onboardModalAtom } from '@/atoms/onboard'
import { usePointsActions } from '@/hooks/use-onboarding-points'
import RoundCheckIcon from '@/resources/icons/round-check-icon.svg'
import { ChangeEvent, useAccount, useAmplitude } from '@/services'
import { CircularProgress } from '../circle-progress'

export const OnboardingModal = () => {
  const [isMenuOpen, setIsMenuOpen] = useAtom(onboardModalAtom)
  const [steps, setSteps] = useAtom(onboardingStepsAtom)
  const { data: points } = usePointsActions()
  const { updateOnboardingStatus } = useAccount()
  const { trackChanged } = useAmplitude()

  useEffect(() => {
    if (points) {
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          isChecked: points[step.id] ?? false,
        }))
      )
    }
  }, [points, setSteps])

  const completedSteps = steps.filter((step) => step.isChecked).length
  const progress = Math.round((completedSteps / steps.length) * 100)
  const isFinished = completedSteps === steps.length

  const finish = async () => {
    await updateOnboardingStatus.mutateAsync(true)
    setIsMenuOpen(false)
    trackChanged(ChangeEvent.FinishedOnboarding)
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
        border='1px solid'
        borderRadius='8px'
        borderColor={isFinished ? 'green.500' : 'grey.100'}
        bg={isFinished ? 'green.500' : 'grey.50'}
      >
        <OnboardingList isFinished={isFinished} onFinish={finish} />
      </MenuList>
    </Menu>
  )
}
