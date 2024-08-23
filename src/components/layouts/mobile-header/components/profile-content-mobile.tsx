import { Box, Button, StackItem, Text, VStack } from '@chakra-ui/react'
import { useProfileService } from '@/services'
import {
  ProfileTextareaField,
  ProfileInputField,
  DisplayNameIcon,
  UsernameIcon,
  ProfilePfp,
  CheckIcon,
  BioIcon,
} from '@/components/common/profiles'
import Loader from '@/components/common/loader'

export const ProfileContentMobile = () => {
  const {
    checkUsernameExistsData,
    updateButtonDisabled,
    checkUsernameExists,
    handleUpdateProfile,
    updateButtonLoading,
    profileUpdated,
    setDisplayName,
    setFormDirty,
    setUsername,
    displayName,
    profileData,
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
        <VStack h='full' w='full' px='10px' gap='25px'>
          <StackItem w='full' pt='10px' display='flex' justifyContent='center' alignItems='center'>
            <Box height='4px' width='36px' borderRadius='2px' bg='grey.300' />
          </StackItem>

          <StackItem w='full' pt='10px' display='flex' justifyContent='center'>
            <ProfilePfp />
          </StackItem>

          <StackItem w='full'>
            <ProfileInputField
              renderIcon={() => <DisplayNameIcon />}
              label='Display name'
              initialValue={displayName}
              onChange={(v) => setDisplayName(v)}
              onBlur={() => setFormDirty(true)}
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
              hint='So others can mention you in comments'
              onBlur={() => {
                setFormDirty(true)
                if (username !== profileData?.username) checkUsernameExists()
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
              onChange={(v) => setBio(v ?? '')}
              placeholder='Add bio if you want'
              onBlur={() => setFormDirty(true)}
            />
          </StackItem>

          <StackItem w='full' display='flex' justifyContent='center' alignItems='center'>
            <Button
              onClick={handleUpdateProfile}
              disabled={updateButtonDisabled}
              bg={!updateButtonDisabled ? 'blue.500' : 'grey.300'}
              color={!updateButtonDisabled ? 'white' : 'grey.500'}
              h='32px'
              w='full'
              py='4px'
              px='10px'
              borderRadius='2px'
            >
              {updateButtonLoading ? (
                <Loader />
              ) : profileUpdated ? (
                <CheckIcon height='16px' width='16px' />
              ) : updateButtonDisabled ? (
                <Text fontSize='16px' color={'grey.500'} fontWeight={500}>
                  Update
                </Text>
              ) : (
                <Text fontSize='16px' color={'white'} fontWeight={500}>
                  Update
                </Text>
              )}

              {/* {profileUpdated ? (
                updateButtonDisabled ? (
                  <Text
                    fontSize='16px'
                    color={!updateButtonDisabled ? 'white' : 'grey.500'}
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
                  color={!updateButtonDisabled ? 'white' : 'grey.500'}
                  fontWeight={500}
                >
                  Update
                </Text>
              )} */}
            </Button>
          </StackItem>
        </VStack>
      </Box>
    </>
  )
}
