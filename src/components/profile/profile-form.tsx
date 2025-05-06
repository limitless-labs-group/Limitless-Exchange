import {
  Box,
  Button,
  Circle,
  FormControl,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Controller, useForm } from 'react-hook-form'
import ButtonWithStates from 'src/components/common/buttons/button-with-states'
import Avatar from '@/components/common/avatar'
import { Toast } from '@/components/common/toast'
import { ProfileFields, profileValidationSchema } from '@/components'
import { useToast } from '@/hooks'
import CloseIcon from '@/resources/icons/close-icon.svg'
import EmailIcon from '@/resources/icons/email-icon.svg'
import NotebookIcon from '@/resources/icons/notebook-icon.svg'
import PenIcon from '@/resources/icons/pen-icon.svg'
import UserIcon from '@/resources/icons/user-icon.svg'
import { useAccount } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { APIError } from '@/types'
import { Profile } from '@/types/profiles'
import { DISCORD_LINK } from '@/utils/consts'

export function ProfileForm() {
  const [pfpFile, setPfpFile] = useState<File | undefined>(undefined)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [hoverImage, setHoverImage] = useState(false)
  const {
    displayName,
    displayUsername,
    bio,
    profileData,
    updateProfileMutation,
    account,
    setProfilePageOpened,
  } = useAccount()
  const toast = useToast()

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<ProfileFields>({
    resolver: yupResolver(profileValidationSchema),
    mode: 'onChange',
  })

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setPfpFile(file)
      return
    }
  }

  const handleUpdateProfile = async (data: ProfileFields) => {
    await updateProfileMutation.mutateAsync(
      { ...data, isDirty, pfpFile },
      {
        onSuccess: (data: Profile | undefined) => {
          if (data) {
            setPfpFile(undefined)
            reset({
              displayName: data.displayName,
              username: data.username,
              bio: data.bio,
            })
          }
        },
        onError: (error: APIError) => {
          if (error.response?.data.message === 'Username is already exists.') {
            toast({
              render: () => <Toast title={`Username is already exists.`} id={1} />,
            })
          } else {
            const id = toast({
              render: () => (
                <Toast
                  title={`Failed to update profile.`}
                  text={'Please contact our support.'}
                  link={DISCORD_LINK}
                  linkText='Open Discord'
                  id={id}
                />
              ),
            })
          }
          reset({
            displayName,
            username: displayUsername,
            bio,
          })
        },
      }
    )
  }

  const imageLink = useMemo(() => {
    if (imagePreview) {
      return imagePreview
    }
    if (profileData?.pfpUrl) {
      return profileData.pfpUrl
    }
  }, [profileData, imagePreview])

  const showChangeImageIcon = () => {
    if (!isMobile) {
      setHoverImage(true)
    }
    return
  }

  const hideImageIcon = () => {
    if (!isMobile) {
      setHoverImage(false)
    }
    return
  }

  const isSubmitButtonEnabled = useMemo(() => {
    if (pfpFile) {
      return isValid
    }
    return isValid && isDirty
  }, [isValid, isDirty, pfpFile])

  useEffect(() => {
    reset({
      displayName,
      username: displayUsername,
      bio,
    })
  }, [])

  return (
    <form onSubmit={handleSubmit(handleUpdateProfile)} autoComplete='off'>
      {!isMobile && (
        <HStack w='full' justifyContent='space-between'>
          <Button variant='outlined' onClick={() => setProfilePageOpened(false)}>
            <CloseIcon width={16} height={16} />
            Close
          </Button>
          <ButtonWithStates
            status={updateProfileMutation.status}
            variant='contained'
            isDisabled={!isSubmitButtonEnabled}
            type='submit'
            w='64px'
          >
            Update
          </ButtonWithStates>
        </HStack>
      )}
      <HStack
        w='full'
        justifyContent='center'
        mt={isMobile ? '28px' : '24px'}
        mb={isMobile ? '16px' : '24px'}
      >
        <Input
          type='file'
          accept='image/*'
          onChange={handleImageChange}
          display='none'
          id='image-upload'
          onClick={(e) => e.stopPropagation()} // Prevent click event propagation
        />
        <label htmlFor='image-upload'>
          <Circle
            size='80px'
            bg='grey.300'
            bgSize='cover'
            bgPosition='center'
            bgRepeat='no-repeat'
            cursor='pointer'
            position='relative'
            onMouseEnter={showChangeImageIcon}
            onMouseLeave={hideImageIcon}
          >
            {imageLink ? (
              <Image
                src={imageLink}
                alt='Uploaded Image'
                borderRadius='full'
                boxSize='100%'
                objectFit='cover'
                cursor='pointer'
              />
            ) : (
              <Avatar account={account as string} size='48px' />
            )}
            {hoverImage && (
              <Box
                bg='rgba(0, 0, 0, 0.2)'
                position='absolute'
                p={isMobile ? '8px' : '4px 8px'}
                color='white'
              >
                <PenIcon width={16} height={16} />
              </Box>
            )}
          </Circle>
        </label>
      </HStack>
      <FormControl isInvalid={!!errors.displayName}>
        <Controller
          name='displayName'
          control={control}
          render={({ field }) => {
            return (
              <InputGroup display='block' mt={isMobile ? '16px' : '24px'}>
                <HStack justifyContent='space-between' mb='4px'>
                  <Text {...paragraphMedium}>Display name</Text>
                  {errors.displayName && (
                    <Text {...paragraphMedium} color='red.500'>
                      {errors.displayName.message}
                    </Text>
                  )}
                </HStack>
                <InputLeftElement
                  h='16px'
                  w='unset'
                  top={'28px'}
                  left={isMobile ? '12px' : '8px'}
                  color='grey.500'
                >
                  <UserIcon width={16} height={16} />
                </InputLeftElement>
                <Input
                  {...field}
                  variant='grey'
                  errorBorderColor='red.500'
                  pl={isMobile ? '32px' : '28px'}
                  id='displayName'
                  autoComplete='off'
                />
              </InputGroup>
            )
          }}
        />
      </FormControl>
      <FormControl isInvalid={!!errors.username}>
        <Controller
          name='username'
          control={control}
          render={({ field }) => (
            <InputGroup display='block' mt={'24px'}>
              <HStack justifyContent='space-between' mb='4px'>
                <Text {...paragraphMedium}>Username</Text>
              </HStack>
              <InputLeftElement
                h='16px'
                w='unset'
                top={'28px'}
                left={isMobile ? '12px' : '8px'}
                color='grey.500'
              >
                <EmailIcon width={16} height={16} />
              </InputLeftElement>
              <Input
                {...field}
                variant='grey'
                errorBorderColor='red.500'
                placeholder='Enter your username'
                pl={isMobile ? '32px' : '28px'}
                id='username'
                autoComplete='off'
              />
            </InputGroup>
          )}
        />
      </FormControl>
      <Text mt='8px' {...paragraphMedium} color='grey.500'>
        So others can mention you in comments
      </Text>
      <FormControl isInvalid={!!errors.bio}>
        <Controller
          name='bio'
          control={control}
          render={({ field }) => (
            <InputGroup display='block' mt={'24px'}>
              <HStack justifyContent='space-between' mb='4px'>
                <Text {...paragraphMedium}>BIO</Text>
              </HStack>
              <InputLeftElement
                h='16px'
                w='unset'
                top={isMobile ? '29px' : '24px'}
                left={isMobile ? '12px' : '8px'}
                color='grey.500'
              >
                <NotebookIcon width={16} height={16} />
              </InputLeftElement>
              <Textarea
                {...field}
                id='bio'
                variant='grey'
                errorBorderColor='red.500'
                placeholder='Add bio if you want'
                pl={isMobile ? '32px' : '28px'}
                autoComplete='off'
              />
            </InputGroup>
          )}
        />
        {isMobile && (
          <ButtonWithStates
            status={updateProfileMutation.status}
            variant='contained'
            isDisabled={!isSubmitButtonEnabled}
            type='submit'
            w='full'
            my='24px'
          >
            Update
          </ButtonWithStates>
        )}
      </FormControl>
    </form>
  )
}
