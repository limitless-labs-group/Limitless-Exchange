import { Box, Button, StackItem, Text, VStack, Circle, Input, Spinner } from '@chakra-ui/react'
import { useProfileService } from '@/services'
import {
  BioIcon,
  CheckIcon,
  DisplayNameIcon,
  EditPenIcon,
  ProfileInputField,
  ProfileTextareaField,
  UsernameIcon,
} from '@/components/common/profiles'

export const ProfileContentDesktop = () => {
  const {
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
            <Circle
              size='75px'
              bg='grey.200'
              bgImage={pfpPreview ? `url(${pfpPreview})` : !!pfpUrl ? `url(${pfpUrl})` : undefined}
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
                <Spinner color='white' size='sm' />
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
    </>
  )
}
