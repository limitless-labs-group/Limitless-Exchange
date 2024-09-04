import { Box, StackItem, VStack } from '@chakra-ui/react'
import { useProfileService } from '@/services'
import {
  ProfileTextareaField,
  ProfileInputField,
  DisplayNameIcon,
  UsernameIcon,
  ProfilePfp,
  BioIcon,
} from '@/components/common/profiles'
import ButtonWithStates from '@/components/common/button-with-states'

export const ProfileContentDesktop = () => {
  const {
    checkUsernameExistsData,
    updateButtonDisabled,
    checkUsernameExists,
    handleUpdateProfile,
    updateButtonLoading,
    profileUpdated,
    setDisplayName,
    setFormDirty,
    profileData,
    setUsername,
    displayName,
    username,
    setBio,
    bio,
  } = useProfileService()

  return (
    <>
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
            <ButtonWithStates
              variant='contained'
              w={'75px'}
              isDisabled={updateButtonDisabled}
              onClick={handleUpdateProfile}
              status={updateButtonLoading ? 'pending' : profileUpdated ? 'success' : 'idle'}
            >
              Update
            </ButtonWithStates>
          </StackItem>

          <StackItem w='full' display='flex' justifyContent='center'>
            <ProfilePfp />
          </StackItem>

          <StackItem w='full'>
            <ProfileInputField
              renderIcon={() => <DisplayNameIcon />}
              label='Display name'
              initialValue={displayName}
              onChange={(v) => {
                setDisplayName(v)
                setFormDirty(true)
              }}
              onBlur={() => {
                if (displayName !== profileData?.displayName) {
                  setFormDirty(true)
                }
              }}
            />
          </StackItem>

          <StackItem w='full'>
            <ProfileInputField
              renderIcon={() => <UsernameIcon />}
              pattern={/^[a-zA-Z0-9_]+$/.source}
              label='Username'
              initialValue={username}
              placeholder='Enter your username'
              hint='So others can mention you in comments'
              onChange={(v) => {
                setUsername(v)
                setFormDirty(true)
              }}
              onBlur={() => {
                if (username !== profileData?.username) {
                  setFormDirty(true)
                  checkUsernameExists()
                }
              }}
              onKeyDown={(e) => {
                const isSpecialCharacter = !/^[a-zA-Z0-9_]+$/.test(e.key)

                if (isSpecialCharacter) e.preventDefault()
                if (e.key === ' ') e.preventDefault()
              }}
              isInvalid={checkUsernameExistsData}
              invalidText='Username already exists'
            />
          </StackItem>

          <StackItem w='full'>
            <ProfileTextareaField
              renderIcon={() => <BioIcon />}
              label='BIO'
              initialValue={bio}
              onChange={(v) => {
                setBio(v ?? '')
                setFormDirty(true)
              }}
              placeholder='Add bio if you want'
              onBlur={() => {
                if (bio !== profileData?.bio) {
                  setFormDirty(true)
                }
              }}
            />
          </StackItem>
        </VStack>
      </Box>
    </>
  )
}
