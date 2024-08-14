import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query'
import { truncateEthAddress } from '@/utils'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useWeb3Service } from '@/services/Web3Service'
import { useDisclosure } from '@chakra-ui/react'
import { cutUsername } from '@/utils/string'
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
  useMemo,
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
  isOpenProfileDrawer: boolean
  onOpenProfileDrawer: () => void
  onCloseProfileDrawer: () => void
  user: {
    displayName: string | undefined
    pfpUrl: string | undefined
  }
}

const ProfileServiceContext = createContext({} as IProfileServiceContext)

export const ProfileServiceProvider = ({ children }: PropsWithChildren) => {
  const { client } = useWeb3Service()
  const pfpFileRef = useRef<any>()
  const account = useWalletAddress()

  const { farcasterInfo, userInfo } = useAccount()
  const [pfpFile, setPfpFile] = useState<File | undefined>(undefined)
  const [pfpPreview, setPfpPreview] = useState<string | undefined>(undefined)
  const [pfpUrl, setPfpUrl] = useState<string | undefined>(undefined)
  const [displayName, setDisplayName] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [profileUpdated, setProfileUpdated] = useState<boolean>(false)
  const [disableUpdateButton, setDisableUpdateButton] = useState<boolean>(false)

  const { mutateAsync: createProfileAsync, isPending: createProfileLoading } = useCreateProfile({
    account,
    client,
  })
  const { mutateAsync: updateProfileAsync, isPending: updateProfileLoading } = useUpdateProfile({
    account,
    client,
  })
  const { mutateAsync: updatePfpAsync, isPending: updatePfpLoading } = useUpdatePfp({
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
    if (!profileData) {
      return {
        displayName: userInfo?.name ? cutUsername(userInfo.name) : truncateEthAddress(account),
        pfpUrl: userInfo?.profileImage,
      }
    }

    return {
      displayName: profileData?.displayName
        ? cutUsername(profileData?.displayName)
        : profileData?.username
        ? cutUsername(profileData?.username)
        : truncateEthAddress(account),
      pfpUrl: profileData?.pfpUrl,
    }
  }, [userInfo, profileData, getProfileDataLoading, account])

  const profileRegistered = !!profileData
  const updateButtonDisabled =
    getProfileDataLoading ||
    createProfileLoading ||
    updateProfileLoading ||
    profileUpdated ||
    disableUpdateButton
  const updateButtonLoading = createProfileLoading || updateProfileLoading

  useEffect(() => {
    if (!profileData) {
      setDisplayName(userInfo?.name ?? account ?? '')
      setUsername(farcasterInfo?.username ?? account ?? '')
      refetchProfile()
      return
    } else {
      setPfpUrl(profileData.pfpUrl)
      setDisplayName(profileData.displayName)
      setUsername(profileData.username)
      setBio(profileData.bio ?? '')
    }
  }, [profileData, farcasterInfo, userInfo, account])

  useEffect(() => {
    if (pfpFile) {
      const previewUrl = URL.createObjectURL(pfpFile)
      setPfpPreview(previewUrl)
      updatePfpAsync(pfpFile).finally(() => refetchProfile())

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
    isOpenProfileDrawer,
    onOpenProfileDrawer,
    onCloseProfileDrawer,
    user,
  }

  return (
    <ProfileServiceContext.Provider value={contextProviderValue}>
      {children}
    </ProfileServiceContext.Provider>
  )
}

export const useProfileService = () => useContext(ProfileServiceContext)
