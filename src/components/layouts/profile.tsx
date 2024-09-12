import { isMobile } from 'react-device-detect'
import {
  Box,
  HStack,
  Input,
  Image,
  Circle,
  Text,
  InputGroup,
  InputLeftElement,
  Textarea,
  FormControl,
} from '@chakra-ui/react'
import ButtonWithStates from '@/components/common/button-with-states'
import ImageIcon from '@/resources/icons/add-image-icon.svg'
import UserIcon from '@/resources/icons/user-icon.svg'
import EmailIcon from '@/resources/icons/email-icon.svg'
import NotebookIcon from '@/resources/icons/notebook-icon.svg'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Controller, useForm } from 'react-hook-form'
import { useAccount, useEtherspot } from '@/services'
import { yupResolver } from '@hookform/resolvers/yup'
import { ProfileFields, profileValidationSchema } from '@/components'
import { useQueryClient } from '@tanstack/react-query'
import {
  getSigningMessage,
  useCreateProfile,
  useUpdatePfp,
  useUpdateProfile,
} from '@/hooks/profiles'
import { useWeb3Service } from '@/services/Web3Service'
import { useSignMessage } from 'wagmi'
import { ProfileActionType } from '@/types/profiles'
import PenIcon from '@/resources/icons/pen-icon.svg'

export default function Profile() {
  const queryClient = useQueryClient()
  const [pfpFile, setPfpFile] = useState<File | undefined>(undefined)
  const pfpFileRef = useRef<any>()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [hoverImage, setHoverImage] = useState(false)
  const { displayName, displayUsername, bio, account, profileLoading, profileData } = useAccount()
  const { signMessage } = useEtherspot()
  const { signMessageAsync } = useSignMessage()
  const { client } = useWeb3Service()

  const { mutateAsync: updatePfp } = useUpdatePfp()
  const { mutateAsync: updateProfile } = useUpdateProfile()

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFields>({
    defaultValues: {
      displayName: displayName ? displayName : '',
      username: displayUsername ? displayUsername : '',
      bio: bio ? bio : '',
    },
    resolver: yupResolver(profileValidationSchema),
    mode: 'onChange',
  })

  console.log(`isValid ${isValid}`)
  console.log(`isDirty ${isDirty}`)
  console.log(errors)

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
    const { data: updateProfileMessage } = await getSigningMessage(ProfileActionType.UPDATE_PROFILE)
    const signature =
      client === 'eoa'
        ? await signMessageAsync({ message: updateProfileMessage, account })
        : await signMessage(updateProfileMessage)
    if (pfpFile) {
      await updatePfp({
        account,
        client,
        pfpFile,
        signature: signature as string,
        updateProfileMessage,
      })
    }
    await updateProfile({
      ...data,
      bio: data.bio as string,
      account,
      client,
      signature: signature as string,
      updateProfileMessage,
    })
  }

  const showChangeImageIcon = () => {
    if (!isMobile && imagePreview) {
      setHoverImage(true)
    }
    return
  }

  const hideImageIcon = () => {
    if (!isMobile && imagePreview) {
      setHoverImage(false)
    }
    return
  }

  useEffect(() => {
    reset()
  }, [])

  console.log(hoverImage)

  return (
    <Box
      bg='grey.100'
      w={isMobile ? 'full' : '328px'}
      px={isMobile ? '16px' : '8px'}
      pt={isMobile ? 0 : '8px'}
      h='full'
      onClick={(e) => e.stopPropagation()}
      overflow='auto'
    >
      {!isMobile && (
        <HStack w='full' justifyContent='flex-end'>
          <ButtonWithStates
            status='idle'
            variant='contained'
            isDisabled={!isDirty && isValid && !pfpFile}
            type='submit'
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
            // bgImage={bgImage}
            bgSize='cover'
            bgPosition='center'
            bgRepeat='no-repeat'
            cursor='pointer'
            position='relative'
            onMouseEnter={showChangeImageIcon}
            onMouseLeave={hideImageIcon}
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt='Uploaded Image'
                borderRadius='full'
                boxSize='100%'
                objectFit='cover'
                cursor='pointer'
              />
            ) : (
              <ImageIcon width={16} height={16} />
            )}
            {hoverImage && (
              <Box
                bg='transparent.200'
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
      <form onSubmit={handleSubmit(handleUpdateProfile)}>
        <FormControl isInvalid={!!errors.displayName}>
          <Controller
            name='displayName'
            control={control}
            render={({ field }) => {
              return (
                <InputGroup display='block' mt={isMobile ? '16px' : '24px'}>
                  <HStack justifyContent='space-between' mb='4px'>
                    <Text {...paragraphMedium}>Display name</Text>
                  </HStack>
                  <InputLeftElement
                    h='16px'
                    w='unset'
                    top={isMobile ? '32px' : '28px'}
                    left={isMobile ? '12px' : '8px'}
                    color='grey.500'
                  >
                    <UserIcon width={16} height={16} />
                  </InputLeftElement>
                  <Input
                    variant='grey'
                    errorBorderColor='red.500'
                    pl='28px'
                    id='displayName'
                    {...field}
                  />
                </InputGroup>
              )
            }}
          />
          {/*<FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>*/}
        </FormControl>
        <FormControl isInvalid={!!errors.displayName}>
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
                  top={isMobile ? '32px' : '28px'}
                  left={isMobile ? '12px' : '8px'}
                  color='grey.500'
                >
                  <EmailIcon width={16} height={16} />
                </InputLeftElement>
                <Input
                  variant='grey'
                  errorBorderColor='red.500'
                  placeholder='Enter your username'
                  pl='28px'
                  id='username'
                  {...field}
                />
              </InputGroup>
            )}
          />
          {/*<FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>*/}
        </FormControl>
        <Text mt='8px' {...paragraphMedium} color='grey.500'>
          So others can mention you in comments
        </Text>
        <FormControl isInvalid={!!errors.displayName}>
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
                  top={isMobile ? '32px' : '30px'}
                  left={isMobile ? '12px' : '8px'}
                  color='grey.500'
                >
                  <NotebookIcon width={16} height={16} />
                </InputLeftElement>
                <Textarea
                  id='bio'
                  variant='grey'
                  errorBorderColor='red.500'
                  placeholder='Add bio if you want'
                  pl='28px'
                  {...field}
                />
              </InputGroup>
            )}
          />
          {/*<FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>*/}
        </FormControl>
      </form>
    </Box>
  )
}
