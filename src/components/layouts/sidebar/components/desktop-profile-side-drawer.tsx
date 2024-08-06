import { Avatar, Box, Button, Slide, StackItem, Text, VStack } from '@chakra-ui/react'
import { useCreateProfile, useUpdateProfile, useProfile } from '@/hooks/profiles'
import { ProfileInputField, ProfileTextareaField } from '@/components/layouts/sidebar/components'
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
        borderRight: '1px solid',
        borderColor: '#E7E7E7', // theme.colors['grey.200'],
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
              <Avatar
                // my='20px'
                h='64px'
                w='64px'
                bg='red'
              />
            </StackItem>

            <StackItem w='full'>
              <ProfileInputField
                label='Display name'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </StackItem>

            <StackItem w='full'>
              <ProfileInputField
                label='Username'
                value={username}
                placeholder='Enter your username'
                onChange={(e) => setUsername(e.target.value)}
                hint='So others can mention you in comments'
              />
            </StackItem>

            <StackItem w='full'>
              <ProfileTextareaField
                label='BIO'
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder='Add bio if you want'
              />
            </StackItem>
          </VStack>
        </Box>
      )}
    </Slide>
  )
}
