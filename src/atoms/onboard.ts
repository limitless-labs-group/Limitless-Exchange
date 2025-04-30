import { atom } from 'jotai'

// export const onboardAtom = atom<{ isOnboardMsgShown: boolean } | {}>({})
export const welcomeModalAtom = atom<boolean>(false)
export const onboardModalAtom = atom<boolean>(false)
