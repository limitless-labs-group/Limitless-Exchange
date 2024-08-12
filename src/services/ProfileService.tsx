import {
  useCreateProfile,
  useProfile,
  useUpdatePfp,
  useUpdateProfile,
  useUsernameExists,
} from '@/hooks/profiles'
import { useAccount } from '@/services'
import { useCallback, useEffect, useRef, useState } from 'react'

export const useProfileService = () => {
  const { farcasterInfo, userInfo, account } = useAccount()

  const pfpFileRef = useRef<any>()
  const [pfpFile, setPfpFile] = useState<File | undefined>(undefined)
  const [pfpPreview, setPfpPreview] = useState<string | undefined>(undefined)
  const [pfpUrl, setPfpUrl] = useState<string | undefined>(undefined)
  const [displayName, setDisplayName] = useState(userInfo?.name ?? account ?? '')
  const [username, setUsername] = useState(farcasterInfo?.username ?? account ?? '')
  const [bio, setBio] = useState('')
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

  return {
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
}
