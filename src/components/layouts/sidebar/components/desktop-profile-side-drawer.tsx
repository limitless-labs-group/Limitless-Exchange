import { useCreateProfile, useUpdateProfile, useProfile, useUpdatePfp } from '@/hooks/profiles'
import {
  Box,
  Button,
  StackItem,
  Text,
  VStack,
  Slide,
  Circle,
  Input,
  Spinner,
} from '@chakra-ui/react'
import { ProfileInputField, ProfileTextareaField } from '@/components/layouts/sidebar/components'
import { useEffect, useRef, useState } from 'react'
import { useAccount } from '@/services'
import EditPenIcon from 'public/edit-pen-icon.svg'
import DisplayNameIcon from 'public/display-name-icon.svg'
import UsernameIcon from 'public/username-icon.svg'
import BioIcon from 'public/bio-icon.svg'

export interface IProfileSideDrawer {
  isOpen: boolean
  onClose: () => void
}

export const DesktopProfileSideDrawer = ({ isOpen, onClose }: IProfileSideDrawer) => {
  const { farcasterInfo, userInfo } = useAccount()

  const pfpFileRef = useRef<any>()
  const [pfpFile, setPfpFile] = useState<File | undefined>(undefined)
  const [pfpPreview, setPfpPreview] = useState<string | undefined>(undefined)
  const [pfpUrl, setPfpUrl] = useState<string | undefined>(undefined)
  const [displayName, setDisplayName] = useState(userInfo?.name ?? '')
  const [username, setUsername] = useState(farcasterInfo?.username ?? '')
  const [bio, setBio] = useState('')

  const { mutateAsync: createProfileAsync, isPending: createProfileLoading } = useCreateProfile()
  const { mutateAsync: updateProfileAsync, isPending: updateProfileLoading } = useUpdateProfile()
  const { mutateAsync: updatePfpAsync, isPending: updatePfpLoading } = useUpdatePfp()
  const { data: profileData, isPending: getProfileDataLoading } = useProfile()

  const profileRegistered = !!profileData
  const updateButtonDisabled = getProfileDataLoading || createProfileLoading || updateProfileLoading
  const updateButtonLoading = createProfileLoading || updateProfileLoading

  useEffect(() => {
    if (!profileData) return
    setPfpUrl(profileData.pfpUrl)
    setDisplayName(profileData.displayName)
    setUsername(profileData.username)
    setBio(profileData.bio ?? '')
  }, [profileData])

  useEffect(() => {
    if (pfpFile) {
      const previewUrl = URL.createObjectURL(pfpFile)
      setPfpPreview(previewUrl)

      if (profileData) {
        updatePfpAsync(pfpFile)
      }

      // Clean up the preview URL when the component unmounts or the file changes
      return () => URL.revokeObjectURL(previewUrl)
    }
  }, [pfpFile, profileData])

  return (
    <>
      <Slide
        direction='left'
        in={isOpen}
        style={{
          borderRight: '1px solid',
          borderColor: '#E7E7E7', // theme.colors['grey.200'],
          zIndex: 100,
          left: '188px',
          width: '328px',
          height: '100%',
          transition: '0.1s',
          animation: 'fadeIn 0.5s',
        }}
      >
        {isOpen && (
          <Box
            style={{
              zIndex: -1,
              transition: '0.1s',
              animation: 'fadeIn 0.5s',
            }}
            h='full'
            w='full'
            bg='grey.100'
          >
            <VStack h='full' w='full' pt='30px' px='10px' gap='25px'>
              <StackItem w='full' display='flex' justifyContent='right'>
                <Button
                  onClick={() =>
                    profileRegistered
                      ? updateProfileAsync({ displayName, username, bio })
                      : createProfileAsync({ displayName, username, bio })
                  }
                  isLoading={updateButtonLoading}
                  disabled={updateButtonDisabled}
                  bg='blue.500'
                  h='24px'
                  w='75px'
                  py='4px'
                  px='10px'
                  borderRadius='2px'
                  color='white'
                >
                  <Text fontSize='16px' color='white' fontWeight={500}>
                    Update
                  </Text>
                </Button>
              </StackItem>

              <StackItem w='full' display='flex' justifyContent='center'>
                <Circle
                  size='75px'
                  bg='grey.200'
                  bgImage={
                    pfpPreview ? `url(${pfpPreview})` : !!pfpUrl ? `url(${pfpUrl})` : undefined
                  }
                  bgSize='cover'
                  bgPosition='center'
                  bgRepeat='no-repeat'
                >
                  <Box
                    pos='absolute'
                    bg='grey.500'
                    w='32px'
                    h='24px'
                    borderRadius='2px'
                    opacity={0.7}
                    onClick={() => pfpFileRef.current.click()}
                    cursor='pointer'
                  />
                  {updatePfpLoading ? (
                    <Spinner />
                  ) : (
                    <EditPenIcon
                      onClick={() => pfpFileRef.current.click()}
                      cursor='pointer'
                      style={{ position: 'absolute', height: '16px', width: '16px' }}
                    />
                  )}
                </Circle>

                <Input
                  display='hidden'
                  type='file'
                  id='marketLogoUpload'
                  name='marketLogoUpload'
                  style={{ display: 'none' }}
                  ref={pfpFileRef}
                  accept={'image/png, image/jpeg'}
                  onChange={(e) => setPfpFile(e?.target?.files?.[0])}
                />
              </StackItem>

              <StackItem w='full'>
                <ProfileInputField
                  renderIcon={() => <DisplayNameIcon />}
                  label='Display name'
                  initialValue={displayName}
                  onChange={(v) => setDisplayName(v)}
                />
              </StackItem>

              <StackItem w='full'>
                <ProfileInputField
                  renderIcon={() => <UsernameIcon />}
                  label='Username'
                  initialValue={username}
                  placeholder='Enter your username'
                  onChange={(v) => setUsername(v)}
                  hint='So others can mention you in comments'
                />
              </StackItem>

              <StackItem w='full'>
                <ProfileTextareaField
                  renderIcon={() => <BioIcon />}
                  label='BIO'
                  initialValue={bio}
                  onChange={(v) => setBio(v ?? '')}
                  placeholder='Add bio if you want'
                />
              </StackItem>
            </VStack>
          </Box>
        )}
      </Slide>

      {isOpen && (
        <Box
          top='0px'
          pos='absolute'
          h='100vh'
          w='full'
          bg='black'
          opacity={0.5}
          onClick={onClose}
        />
      )}
    </>
  )
}
