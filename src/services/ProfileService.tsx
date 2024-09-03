import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { truncateEthAddress } from '@/utils'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useWeb3Service } from '@/services/Web3Service'
import { useDisclosure } from '@chakra-ui/react'
import { cutUsername } from '@/utils/string'
import { useIsMobile } from '@/hooks'
import { Profile } from '@/types/profiles'
import {
  ProfilePictureUploadedChangedMetadata,
  ProfileSettingsChangedMetadata,
  ProfileSettingsOpenedMetadata,
  useAmplitude,
  ChangeEvent,
  useAccount,
  OpenEvent,
} from '@/services'
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
  useMemo,
} from 'react'

export interface IProfileServiceContext {
  profile: Profile | undefined
  setProfile: Dispatch<SetStateAction<Profile | undefined>>
  resetState: () => void
  refetchProfile: (options?: RefetchOptions) => Promise<QueryObserverResult<Profile, Error>>
  resetCreateProfile: () => void
  resetUpdateProfile: () => void
  resetUpdatePfp: () => void
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
  isOpenProfileDrawer: boolean
  onOpenProfileDrawer: () => void
  onCloseProfileDrawer: () => void
  user: {
    displayName: string | undefined
    pfpUrl: string | undefined
  }
  formDirty: boolean
  setFormDirty: Dispatch<SetStateAction<boolean>>
  getProfileDataLoading: boolean
}

const ProfileServiceContext = createContext({} as IProfileServiceContext)

export const ProfileServiceProvider = ({ children }: PropsWithChildren) => {
  const { client } = useWeb3Service()
  const pfpFileRef = useRef<any>()
  const account = useWalletAddress()
  const isMobile = useIsMobile()

  const { trackOpened, trackChanged } = useAmplitude()
  const { farcasterInfo, userInfo } = useAccount()
  const [pfpFile, setPfpFile] = useState<File | undefined>(undefined)
  const [pfpPreview, setPfpPreview] = useState<string | undefined>(undefined)
  const [pfpUrl, setPfpUrl] = useState<string | undefined>(undefined)
  const [profile, setProfile] = useState<Profile | undefined>(undefined)
  const [displayName, setDisplayName] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [profileUpdated, setProfileUpdated] = useState<boolean>(false)
  const [disableUpdateButton, setDisableUpdateButton] = useState<boolean>(false)
  const [formDirty, setFormDirty] = useState<boolean>(false)

  const {
    mutateAsync: createProfileAsync,
    isPending: createProfileLoading,
    reset: resetCreateProfile,
  } = useCreateProfile({
    account,
    client,
  })
  const {
    mutateAsync: updateProfileAsync,
    isPending: updateProfileLoading,
    reset: resetUpdateProfile,
  } = useUpdateProfile({
    account,
    client,
  })
  const {
    mutateAsync: updatePfpAsync,
    isPending: updatePfpLoading,
    reset: resetUpdatePfp,
  } = useUpdatePfp({
    account,
    client,
  })
  const {
    data: profileData,
    isLoading: getProfileDataLoading,
    refetch: refetchProfile,
  } = useProfile()
  const {
    data: checkUsernameExistsData,
    isLoading: checkUsernameExistsLoading,
    refetch: checkUsernameExists,
  } = useUsernameExists({ username })
  const {
    isOpen: isOpenProfileDrawer,
    onOpen: onOpenProfileDrawer,
    onClose: onCloseProfileDrawer,
  } = useDisclosure()
  const user = useMemo(() => {
    if (!profile) {
      return {
        displayName: userInfo?.name ? cutUsername(userInfo.name) : truncateEthAddress(account),
        pfpUrl: userInfo?.profileImage,
      }
    }

    return {
      displayName: profile?.displayName
        ? cutUsername(profile?.displayName, 20)
        : profile?.username
        ? cutUsername(profile?.username, 20)
        : truncateEthAddress(account),
      pfpUrl: profile?.pfpUrl,
    }
  }, [userInfo, profile, getProfileDataLoading, account])

  const profileRegistered = !!profileData
  const updateButtonDisabled =
    !formDirty ||
    // createProfileLoading ||
    // updateProfileLoading ||
    profileUpdated ||
    disableUpdateButton
  const updateButtonLoading = createProfileLoading || updateProfileLoading

  useEffect(() => {
    const _defaultDisplayName = userInfo?.name ?? account ?? ''
    const _defaultUsername = farcasterInfo?.username ?? account ?? ''
    if (!profileData) {
      setDisplayName(_defaultDisplayName)
      setUsername(_defaultUsername)
      refetchProfile()
      return
    } else {
      setProfile(profileData)
      setPfpUrl(profileData?.pfpUrl)
      setDisplayName(profileData?.displayName ?? _defaultDisplayName)
      setUsername(profileData?.username ?? _defaultUsername)
      setBio(profileData.bio ?? '')
    }
  }, [profileData, farcasterInfo, userInfo, account])

  useEffect(() => {
    if (pfpFile) {
      const previewUrl = URL.createObjectURL(pfpFile)
      setPfpPreview(previewUrl)
      updatePfpAsync(pfpFile)
        .then(() =>
          trackChanged<ProfilePictureUploadedChangedMetadata>(
            ChangeEvent.ProfilePictureUploadedChanged,
            {
              platform: isMobile ? 'Mobile' : 'Desktop',
            }
          )
        )
        .finally(() => refetchProfile())

      // Clean up the preview URL when the component unmounts or the file changes
      return () => URL.revokeObjectURL(previewUrl)
    }
  }, [pfpFile])

  useEffect(() => {
    if (isOpenProfileDrawer) {
      trackOpened<ProfileSettingsOpenedMetadata>(OpenEvent.ProfileSettingsOpened, {
        platform: isMobile ? 'Mobile' : 'Desktop',
      })
    } else {
      // resetState()
    }
  }, [isOpenProfileDrawer, isMobile])

  const handleUpdateProfile = useCallback(async () => {
    try {
      profileRegistered
        ? await updateProfileAsync({ displayName, username, bio }).then(() =>
            trackChanged<ProfileSettingsChangedMetadata>(ChangeEvent.ProfileSettingsChanged, {
              platform: isMobile ? 'Mobile' : 'Desktop',
            })
          )
        : await createProfileAsync({ displayName, username, bio }).then(() =>
            trackChanged<ProfileSettingsChangedMetadata>(ChangeEvent.ProfileSettingsChanged, {
              platform: isMobile ? 'Mobile' : 'Desktop',
            })
          )

      setProfileUpdated(true)
      setTimeout(() => {
        setDisableUpdateButton(true)
        setTimeout(() => {
          setProfileUpdated(false)
          setDisableUpdateButton(false)
        }, 1_500)
      }, 3_000)
    } catch (error) {
      console.error(error)
      setProfileUpdated(false)
      setDisableUpdateButton(false)
    } finally {
      refetchProfile()
    }
  }, [profileRegistered, displayName, username, bio])

  const resetState = useCallback(() => {
    setProfile(undefined)
    setDisplayName('')
    setUsername('')
    setBio('')
    setPfpUrl('')
    setPfpPreview('')
    setPfpFile(undefined)
    resetCreateProfile()
    resetUpdateProfile()
    resetUpdatePfp()
    setFormDirty(false)
  }, [])

  const contextProviderValue: IProfileServiceContext = {
    profile,
    setProfile,
    resetState,
    refetchProfile,
    resetCreateProfile,
    resetUpdateProfile,
    resetUpdatePfp,
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
    isOpenProfileDrawer,
    onOpenProfileDrawer,
    onCloseProfileDrawer,
    user,
    formDirty,
    setFormDirty,
    getProfileDataLoading,
  }

  return (
    <ProfileServiceContext.Provider value={contextProviderValue}>
      {children}
    </ProfileServiceContext.Provider>
  )
}

export const useProfileService = () => useContext(ProfileServiceContext)
