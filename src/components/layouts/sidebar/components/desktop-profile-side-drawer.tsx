import { useCreateProfile, useProfile } from '@/hooks/profiles'
import { useUpdateProfile } from '@/hooks/profiles/use-update-profile'
import {
  Avatar,
  Box,
  Button,
  Input,
  Slide,
  Spinner,
  StackItem,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export interface IProfileSideDrawer {
  opened?: boolean
}

export const DesktopProfileSideDrawer = ({ opened }: IProfileSideDrawer) => {
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')

  const { mutateAsync: createProfileAsync, isPending: createProfileLoading } = useCreateProfile()
  const { mutateAsync: updateProfileAsync, isPending: updateProfileLoading } = useUpdateProfile()
  const { data: profileData, isPending: getProfileDataLoading } = useProfile()

  const profileRegistered = !!profileData
  const updateButtonDisabled = getProfileDataLoading || createProfileLoading || updateProfileLoading
  const updateButtonLoading = createProfileLoading || updateProfileLoading

  useEffect(() => {
    console.log('profileData', profileData)
    if (!profileData) return
    setDisplayName(profileData.displayName)
    setUsername(profileData.username)
    setBio(profileData.bio ?? '')
  }, [profileData])

  return (
    <Slide
      direction='left'
      in={opened}
      style={{
        zIndex: -1,
        left: '188px',
        width: '328px',
        height: '100%',
        transition: '0.1s',
        animation: 'fadeIn 0.5s',
      }}
    >
      {opened && (
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
          <VStack h='full' w='full' pt='30px' px='10px'>
            <StackItem w='full' display='flex' justifyContent='right'>
              <Button
                variant='grey'
                onClick={() =>
                  profileRegistered
                    ? updateProfileAsync({ displayName, username, bio })
                    : createProfileAsync({ displayName, username, bio })
                }
                isLoading={updateButtonLoading}
                disabled={updateButtonDisabled}
              >
                {updateButtonLoading ? <Spinner /> : 'Update'}
              </Button>
            </StackItem>

            <StackItem w='full' display='flex' justifyContent='center'>
              <Avatar my='20px' h='64px' w='64px' bg='red' />
            </StackItem>

            <StackItem w='full'>
              <Text>Display Name</Text>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </StackItem>

            <StackItem w='full'>
              <Text>Username</Text>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </StackItem>

            <StackItem w='full'>
              <Text>Bio</Text>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </StackItem>
          </VStack>
        </Box>
      )}
    </Slide>
  )
}
