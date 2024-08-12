import { Box, Button, StackItem, Text, VStack } from '@chakra-ui/react'
import { useProfileService } from '@/services'
import {
  BioIcon,
  CheckIcon,
  DisplayNameIcon,
  ProfileInputField,
  ProfilePfp,
  ProfileTextareaField,
  UsernameIcon,
} from '@/components/common/profiles'

export const ProfileContentDesktop = () => {
  const {
    handleUpdateProfile,
    updateButtonLoading,
    updateButtonDisabled,
    disableUpdateButton,
    profileUpdated,
    displayName,
    setDisplayName,
    username,
    setUsername,
    bio,
    setBio,
    checkUsernameExists,
    checkUsernameExistsData,
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
            <Button
              onClick={handleUpdateProfile}
              isLoading={updateButtonLoading}
              disabled={updateButtonDisabled}
              bg={!disableUpdateButton ? 'blue.500' : 'grey.300'}
              color={!disableUpdateButton ? 'white' : 'grey.500'}
              h='24px'
              w='75px'
              py='4px'
              px='10px'
              borderRadius='2px'
            >
              {profileUpdated ? (
                disableUpdateButton ? (
                  <Text
                    fontSize='16px'
                    color={!disableUpdateButton ? 'white' : 'grey.500'}
                    fontWeight={500}
                  >
                    Update
                  </Text>
                ) : (
                  <CheckIcon height='16px' width='16px' />
                )
              ) : (
                <Text
                  fontSize='16px'
                  color={!disableUpdateButton ? 'white' : 'grey.500'}
                  fontWeight={500}
                >
                  Update
                </Text>
              )}
            </Button>
          </StackItem>

          <StackItem w='full' display='flex' justifyContent='center'>
            <ProfilePfp />
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
              pattern={/^[a-zA-Z0-9_]+$/.source}
              label='Username'
              initialValue={username}
              placeholder='Enter your username'
              onChange={(v) => setUsername(v)}
              onBlur={() => {
                if (username) checkUsernameExists()
              }}
              onKeyDown={(e) => {
                const isSpecialCharacter = !/^[a-zA-Z0-9_]+$/.test(e.key)

                if (isSpecialCharacter) e.preventDefault()
                if (e.key === ' ') e.preventDefault()
              }}
              isInvalid={checkUsernameExistsData}
              invalidText='Username already exists'
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
    </>
  )
}
