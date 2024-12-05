'use client'

import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  Heading,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spinner,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toZonedTime } from 'date-fns-tz'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { isMobile } from 'react-device-detect'
import { MultiValue } from 'react-select'
import TimezoneSelect, {
  allTimezones,
  ITimezoneOption,
  useTimezoneSelect,
} from 'react-timezone-select'
import { Toast } from '@/components/common/toast'
import {
  defaultFormData,
  defaultTokenSymbol,
  tokenLimits,
  selectStyles,
  OgImageGenerator,
  defaultProbability,
  defaultMarketFee,
  defaultCreatorId,
  defaultCategoryId,
} from '@/app/draft/components'
import { FormField } from '@/app/draft/components/form-field'
import { MainLayout } from '@/components'
import { useToast } from '@/hooks'
import { useCategories, useLimitlessApi } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { h1Bold } from '@/styles/fonts/fonts.styles'
import { Category } from '@/types'
import { Token, Tag, TagOption, IFormData, Creator } from '@/types/draft'

const CreateOwnMarketPage = () => {
  const { parseTimezone } = useTimezoneSelect({
    labelStyle: 'original',
    timezones: allTimezones,
  })
  const [formData, setFormData] = useState<IFormData>(defaultFormData)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const { supportedTokens } = useLimitlessApi()
  const toast = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const marketId = searchParams.get('market')
  const privateClient = useAxiosPrivateClient()

  const { data: editMarket } = useQuery({
    queryKey: ['editMarket', marketId],
    queryFn: async () => {
      const response = await privateClient.get(`/markets/drafts/${marketId}`)
      return response.data
    },
    enabled: !!marketId,
  })

  useEffect(() => {
    if (editMarket) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        title: editMarket.title || '',
        description: editMarket.description || '',
        deadline: toZonedTime(editMarket.deadline, 'America/New_York'),
        token: editMarket.collateralToken
          ? { symbol: editMarket.collateralToken.symbol, id: editMarket.collateralToken.id }
          : prevFormData.token,
        liquidity:
          editMarket.draftMetadata?.liquidity ||
          tokenLimits[editMarket.collateralToken.symbol]?.min,
        probability: editMarket.draftMetadata?.initialProbability * 100 || defaultProbability,
        marketFee: editMarket.draftMetadata?.fee || defaultMarketFee,
        tag:
          editMarket.tags.map((tag: Tag) => ({
            id: tag.id,
            value: tag.name,
            label: tag.name,
          })) || [],
        creatorId: editMarket.creator?.id || defaultCreatorId,
        categoryId: editMarket.category?.id || defaultCategoryId,
      }))
      generateOgImage().then(() => console.log('Og image generated'))
    }
  }, [editMarket])

  const handleChange = <K extends keyof IFormData>(
    field: string,
    value: IFormData[K] | MultiValue<TagOption>
  ) => {
    if (field === 'tag' && Array.isArray(value)) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [field]: [...value] as TagOption[],
      }))
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [field]: value as IFormData[K],
      }))
    }
  }

  const handleTokenSelect = (option: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTokenId = +option.target.value
    const selectedTokenSymbol =
      option.target.selectedOptions[0].getAttribute('data-name') ?? defaultTokenSymbol

    handleChange('token', { symbol: selectedTokenSymbol, id: selectedTokenId })
    handleChange('liquidity', tokenLimits[selectedTokenSymbol].min)
  }

  const showToast = (message: string) => {
    const id = toast({
      render: () => <Toast title={message} id={id} />,
    })
  }

  const createOption = (id: string, name: string): TagOption => ({
    id,
    label: name,
    value: name,
  })

  const { data: tagOptions } = useQuery({
    queryKey: ['tagOptions'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tags`)

      return response.data.map((tag: { id: string; name: string }) =>
        createOption(tag.id, tag.name)
      ) as TagOption[]
    },
  })

  const { data: creators } = useQuery({
    queryKey: ['creators'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/profiles/creators`
      )
      return response.data as Creator[]
    },
  })

  const { data: categories } = useCategories()
  const { mutateAsync: generateOgImage, isPending: isGeneratingOgImage } = useMutation({
    mutationKey: ['generate-og-image'],
    mutationFn: async () => new Promise((resolve) => setTimeout(resolve, 1_000)),
  })

  const handleTagCreation = async (tagToCreate: string) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tags`, {
      name: tagToCreate,
    })

    queryClient.setQueryData(['tagOptions'], (oldData: TagOption[]) => [
      ...oldData,
      createOption(res.data.id, res.data.name),
    ])
  }

  const prepareData = async () => {
    await generateOgImage()

    const { title, description, creatorId, ogLogo, tag } = formData

    const missingFields: string[] = []
    if (!title) missingFields.push('Title')
    if (!description) missingFields.push('Description')
    if (!creatorId) missingFields.push('Creator')
    if (!ogLogo) missingFields.push('Og Logo')
    if (!tag) missingFields.push('Tag')

    if (missingFields.length > 0) {
      showToast(`${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required!`)
      return
    }

    const differenceInOffset =
      (parseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone).offset ?? 1) -
      (parseTimezone(formData.timezone)?.offset ?? 1)
    const zonedTime = new Date(formData.deadline).getTime() + differenceInOffset * 60 * 60 * 1000

    const marketFormData = new FormData()
    marketFormData?.set('title', formData.title)
    marketFormData?.set('description', formData.description)
    marketFormData?.set('tokenId', formData.token.id.toString())
    marketFormData?.set('liquidity', formData.liquidity.toString())
    marketFormData?.set('initialYesProbability', (formData.probability / 100).toString())
    marketFormData?.set('marketFee', formData.marketFee.toString())
    marketFormData?.set('deadline', zonedTime.toString())

    if (formData.creatorId) {
      marketFormData.set('creatorId', formData.creatorId)
    }

    if (formData.categoryId) {
      marketFormData.set('categoryId', formData.categoryId)
    }

    if (formData.ogLogo) {
      marketFormData.set('ogFile', formData.ogLogo)
    }

    if (formData.tag.length) {
      marketFormData.set('tagIds', formData.tag.map((t) => t.id).join(','))
    }

    showToast('Request for market creation has been registered successfully.')

    return marketFormData
  }

  const draftMarket = async () => {
    const data = await prepareData()
    if (!data) return
    setIsCreating(true)
    privateClient
      .post(`/markets/drafts`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        showToast(`Market is drafted`)
        router.push('/draft/queue')
      })
      .catch((res) => {
        if (res?.response?.status === 413) {
          showToast('Error: Payload Too Large, max 1MB per file')
        } else {
          showToast(`Error: ${res.message}`)
        }
      })
      .finally(() => {
        setIsCreating(false)
      })
  }

  const updateMarket = async () => {
    const data = await prepareData()
    if (!data) return
    setIsCreating(true)
    privateClient
      .put(`/markets/drafts/${marketId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        showToast(`Market ${marketId} is updated`)
        router.push('/draft/queue')
      })
      .catch((res) => {
        if (res?.response?.status === 413) {
          showToast('Error: Payload Too Large, max 1MB per file')
        } else {
          showToast(`Error: ${res.message}`)
        }
      })
      .finally(() => {
        setIsCreating(false)
      })
  }

  const resizeTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.height = 'auto'
    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
  }

  const submit = async () => {
    if (marketId) {
      await updateMarket()
      return
    }
    await draftMarket()
  }

  return (
    <MainLayout>
      <Box w={isMobile ? 'full' : 'calc(100vw - 720px)'}>
        <Divider orientation='horizontal' h='3px' borderColor='grey.800' bg='grey.800' />
        <Heading {...h1Bold} gap={2}>
          Create market
        </Heading>
        <Flex justifyContent={'center'}>
          <VStack w='full' spacing={4}>
            <FormControl>
              <HStack
                w='full'
                maxW='1200px'
                gap={10}
                justifyContent='space-between'
                alignItems='flex-start'
              >
                <VStack w='full' flex='1.2'>
                  <Box position='absolute' opacity={0} pointerEvents='none'>
                    <FormField label='OG Preview is still here, but hidden (required to create an image)'>
                      <HStack position='absolute' zIndex={-1} h='280px' w='600px'>
                        <OgImageGenerator
                          title={formData.title}
                          category={
                            categories?.find((category) => category.id === +formData.categoryId)
                              ?.name ?? 'Unknown'
                          }
                          onBlobGenerated={(blob) => {
                            console.log('Blob generated', blob)
                            const _ogLogo = new File([blob], 'og.png', {
                              type: blob.type,
                              lastModified: Date.now(),
                            })
                            console.log('Blob transformed to File', _ogLogo)

                            handleChange('ogLogo', _ogLogo)
                          }}
                          generateBlob={isGeneratingOgImage}
                        />
                      </HStack>
                    </FormField>
                  </Box>

                  <FormField label='Title'>
                    <Textarea
                      resize='none'
                      rows={1}
                      overflow='hidden'
                      height='auto'
                      variant='grey'
                      onInput={resizeTextareaHeight}
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      maxLength={70}
                      onBlur={() => generateOgImage()}
                    />
                    <FormHelperText
                      textAlign='end'
                      style={{ fontSize: '10px', color: 'spacegray' }}
                    >
                      {formData.title?.length}/70 characters
                    </FormHelperText>
                  </FormField>

                  <FormField label='Description (resolution criteria)'>
                    <Textarea
                      resize='none'
                      rows={7}
                      overflow='hidden'
                      height='auto'
                      variant='grey'
                      onInput={resizeTextareaHeight}
                      maxLength={1500}
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      onBlur={() => generateOgImage()}
                    />
                    <FormHelperText
                      textAlign='end'
                      style={{ fontSize: '10px', color: 'spacegray' }}
                    >
                      {formData.description?.length}/1500 characters
                    </FormHelperText>
                  </FormField>

                  <FormField label='Token'>
                    <HStack>
                      <Select
                        value={formData.token.id}
                        onChange={handleTokenSelect}
                        borderRadius='8px'
                        borderColor='grey.300'
                        h='26px'
                        _focusVisible={{
                          borderColor: 'grey.800',
                        }}
                      >
                        {supportedTokens?.map((token: Token) => (
                          <option key={token.id} value={token.id} data-name={token.symbol}>
                            {token.symbol}
                          </option>
                        ))}
                      </Select>
                    </HStack>
                  </FormField>

                  <FormField label={`${formData.token.symbol} Liquidity`}>
                    <HStack>
                      <NumberInput
                        maxW='120px'
                        mr='2rem'
                        value={formData.liquidity}
                        onChange={(value) => handleChange('liquidity', Number(value))}
                        min={tokenLimits[formData.token.symbol]?.min}
                        max={tokenLimits[formData.token.symbol]?.max}
                        step={tokenLimits[formData.token.symbol]?.step}
                      >
                        <NumberInputField w={'120px'} />
                      </NumberInput>
                      <Slider
                        flex='1'
                        focusThumbOnChange={false}
                        value={formData.liquidity}
                        onChange={(value) => handleChange('liquidity', value)}
                        min={tokenLimits[formData.token.symbol]?.min}
                        max={tokenLimits[formData.token.symbol]?.max}
                        step={tokenLimits[formData.token.symbol]?.step}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb fontSize='sm' />
                      </Slider>
                    </HStack>
                  </FormField>

                  <FormField label='Starting YES Probability'>
                    <HStack>
                      <NumberInput
                        maxW='120px'
                        mr='2rem'
                        value={formData.probability}
                        onChange={(value) => handleChange('probability', Number(value))}
                        min={1}
                        max={99}
                        step={1}
                      >
                        <NumberInputField w={'120px'} />
                      </NumberInput>
                      <Slider
                        flex='1'
                        focusThumbOnChange={false}
                        value={formData.probability}
                        onChange={(value) => handleChange('probability', value)}
                        min={1}
                        max={99}
                        step={1}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb fontSize='sm' />
                      </Slider>
                    </HStack>
                  </FormField>
                </VStack>
              </HStack>
              <FormField label='Deadline'>
                {/*// Todo move to a separate component?*/}
                <DatePicker
                  id='input'
                  selected={formData.deadline || null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      handleChange('deadline', new Date(date.getTime()))
                    }
                  }}
                  minDate={new Date()}
                  showTimeSelect
                  dateFormat='Pp'
                  customInput={<Input variant='grey' mb='5px' />}
                />
                <TimezoneSelect
                  value={formData.timezone}
                  onChange={(timezone: ITimezoneOption) => handleChange('timezone', timezone.value)}
                  styles={{
                    option: (provided) => ({
                      ...provided,
                      cursor: 'pointer',
                      background: 'unset',
                      color: 'var(--chakra-colors-grey-800)',
                      '&:hover': {
                        background: 'var(--chakra-colors-grey-300)',
                      },
                    }),
                    menu: (provided) => ({
                      ...provided,
                      ...selectStyles.menu,
                    }),
                    control: (provided) => ({
                      ...provided,
                      ...selectStyles.control,
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      ...selectStyles.singleValue,
                    }),
                  }}
                />
              </FormField>

              <ButtonGroup spacing='6' mt={5} w='full'>
                {isCreating ? (
                  <Flex width='full' justifyContent='center' alignItems='center'>
                    <Spinner />
                  </Flex>
                ) : (
                  <Button variant='contained' w='full' height='52px' onClick={submit}>
                    Submit For Review
                  </Button>
                )}
              </ButtonGroup>
            </FormControl>
          </VStack>
        </Flex>
      </Box>
    </MainLayout>
  )
}

export default CreateOwnMarketPage
