import { atom } from 'jotai'
import { PointsActionType } from '@/types'

export const welcomeModalAtom = atom<boolean>(false)
export const onboardModalAtom = atom<boolean>(false)

export interface OnboardingStep {
  id: PointsActionType
  isChecked?: boolean
  title: string
  description?: string
  points?: string
}

const defaultSteps = [
  {
    id: PointsActionType.ENROLL_IN_PROGRAM,
    isChecked: true,
    title: 'Create your account',
  },
  {
    id: PointsActionType.HAS_TRADED,
    isChecked: false,
    title: 'Make your first prediction',
    description: 'Choose a question and assign a probability to one of the outcomes',
  },
  {
    id: PointsActionType.HOLDING_TILL_RESOLVED,
    isChecked: false,
    title: 'Follow through on a forecast',
    description:
      'See how your prediction performed after the outcome is known. Whether you are right or wrong, it still counts!',
  },
]
export const onboardingStepsAtom = atom<OnboardingStep[]>(defaultSteps)
