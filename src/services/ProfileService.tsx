import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { useAccount } from '@/services'
import { Profile } from '@/types/profiles'
import {
  useUsernameExists,
  useUpdateProfile,
  useCreateProfile,
  useUpdatePfp,
  useProfile,
} from '@/hooks/profiles'
import {
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  Dispatch,
  useState,
  useRef,
} from 'react'

export interface IProfileServiceContext {
  profileData: Profile | undefined
  handleUpdateProfile: () => Promise<void>
  updateButtonLoading: boolean
  updateButtonDisabled: boolean
  disableUpdateButton: boolean
  pfpPreview: string | undefined
  profileUpdated: boolean
  pfpUrl: string | undefined
  pfpFileRef: any
  updatePfpLoading: boolean
  setPfpFile: Dispatch<SetStateAction<File | undefined>>
  displayName: string
  setDisplayName: Dispatch<SetStateAction<string>>
  username: string
  setUsername: Dispatch<SetStateAction<string>>
  bio: string
  setBio: Dispatch<SetStateAction<string>>
  checkUsernameExistsData: boolean | undefined
  checkUsernameExistsLoading: boolean
  checkUsernameExists: (options?: RefetchOptions) => Promise<QueryObserverResult<boolean, Error>>
}

const ProfileServiceContext = createContext({} as IProfileServiceContext)

export const ProfileServiceProvider = ({ children }: PropsWithChildren) => {
  const { farcasterInfo, userInfo, account } = useAccount()

  const pfpFileRef = useRef<any>()
  const [pfpFile, setPfpFile] = useState<File | undefined>(undefined)
  const [pfpPreview, setPfpPreview] = useState<string | undefined>(undefined)
  const [pfpUrl, setPfpUrl] = useState<string | undefined>(undefined)
  const [displayName, setDisplayName] = useState<string>(userInfo?.name ?? account ?? '')
  const [username, setUsername] = useState<string>(farcasterInfo?.username ?? account ?? '')
  const [bio, setBio] = useState<string>('')
  const [profileUpdated, setProfileUpdated] = useState<boolean>(false)
  const [disableUpdateButton, setDisableUpdateButton] = useState<boolean>(false)

  const { mutateAsync: createProfileAsync, isPending: createProfileLoading } = useCreateProfile()
  const { mutateAsync: updateProfileAsync, isPending: updateProfileLoading } = useUpdateProfile()
  const { mutateAsync: updatePfpAsync, isPending: updatePfpLoading } = useUpdatePfp()
  const { data: profileData, isLoading: getProfileDataLoading } = useProfile()
  const {
    data: checkUsernameExistsData,
    isLoading: checkUsernameExistsLoading,
    refetch: checkUsernameExists,
  } = useUsernameExists({ username })

  const profileRegistered = !!profileData
  const updateButtonDisabled =
    getProfileDataLoading ||
    createProfileLoading ||
    updateProfileLoading ||
    profileUpdated ||
    disableUpdateButton
  const updateButtonLoading = createProfileLoading || updateProfileLoading

  useEffect(() => {
    if (!profileData) return
    setPfpUrl(profileData.pfpUrl)
    setDisplayName(profileData.displayName)
    setUsername(profileData.username)
    setBio(profileData.bio ?? '')
  }, [profileData])

  useEffect(() => {
    setDisplayName(userInfo?.name ?? account ?? '')
    setUsername(farcasterInfo?.username ?? account ?? '')
  }, [farcasterInfo, userInfo, account])

  useEffect(() => {
    if (pfpFile) {
      const previewUrl = URL.createObjectURL(pfpFile)
      setPfpPreview(previewUrl)
      updatePfpAsync(pfpFile)

      // Clean up the preview URL when the component unmounts or the file changes
      return () => URL.revokeObjectURL(previewUrl)
    }
  }, [pfpFile])

  const handleUpdateProfile = useCallback(async () => {
    try {
      profileRegistered
        ? await updateProfileAsync({ displayName, username, bio })
        : await createProfileAsync({ displayName, username, bio })
      setProfileUpdated(true)
      setTimeout(() => {
        setDisableUpdateButton(true)
      }, 3_000)
    } catch (error) {
      console.error(error)
      setProfileUpdated(false)
      setDisableUpdateButton(false)
    }
  }, [profileRegistered, displayName, username, bio])

  const contextProviderValue: IProfileServiceContext = {
    profileData,
    handleUpdateProfile,
    updateButtonLoading,
    updateButtonDisabled,
    disableUpdateButton,
    pfpPreview,
    profileUpdated,
    pfpUrl,
    pfpFileRef,
    updatePfpLoading,
    setPfpFile,
    displayName,
    setDisplayName,
    username,
    setUsername,
    bio,
    setBio,
    checkUsernameExistsData,
    checkUsernameExistsLoading,
    checkUsernameExists,
  }

  return (
    <ProfileServiceContext.Provider value={contextProviderValue}>
      {children}
    </ProfileServiceContext.Provider>
  )
}

export const useProfileService = () => useContext(ProfileServiceContext)
