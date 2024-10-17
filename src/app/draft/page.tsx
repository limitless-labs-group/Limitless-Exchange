'use client'

import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  FormControl,
  FormHelperText,
  HStack,
  NumberInput,
  NumberInputField,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spinner,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { MultiValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import TimezoneSelect, {
  allTimezones,
  ITimezoneOption,
  useTimezoneSelect,
} from 'react-timezone-select'
import { Input } from '@/components/common/input'
import { Toast } from '@/components/common/toast'
import {
  defaultFormData,
  defaultTokenSymbol,
  tokenLimits,
  selectStyles,
  OgImageGenerator,
} from '@/app/draft/components'
import { FormField } from './components/form-field'
import { MainLayout } from '@/components'
import { useToast } from '@/hooks'
import { useCategories, useLimitlessApi } from '@/services'
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

  const { data: editMarket } = useQuery({
    queryKey: ['editMarket', marketId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/drafts/${marketId}`
      )
      return response.data
    },
    enabled: !!marketId,
  })

  useEffect(() => {
    if (editMarket) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        title: editMarket.title || prevFormData.title,
        description: editMarket.description || prevFormData.description,
        deadline: editMarket.deadline || prevFormData.deadline,
        token: editMarket.collateralToken
          ? { symbol: editMarket.collateralToken.symbol, id: editMarket.collateralToken.id }
          : prevFormData.token,
        liquidity: editMarket.draftMetadata?.liquidity || prevFormData.liquidity,
        probability: editMarket.draftMetadata?.initialProbability * 100 || prevFormData.probability,
        marketFee: editMarket.draftMetadata?.fee || prevFormData.marketFee,
        tag:
          editMarket.tags.map((tag: Tag) => ({
            id: tag.id,
            value: tag.name,
            label: tag.name,
          })) || prevFormData.tag,
        creatorId: editMarket.creator?.id || prevFormData.creatorId,
        categoryId: editMarket.category?.id || prevFormData.categoryId,
      }))
      generateOgImage()
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
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/creators`)
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

  const prepareData = () => {
    const { title, description, creatorId, ogLogo, tag } = formData
    if (!title || !description || !creatorId || !ogLogo || !tag) {
      showToast('Title, Description, Creator, Market Logo, Og Logo, and Tags are required!')
      return
    }

    const differenceInOffset =
      (parseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone).offset || 1) -
      (parseTimezone(formData.timezone)?.offset || 1)
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
    const data = prepareData()
    setIsCreating(true)
    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/drafts`, data, {
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
    const data = prepareData()
    setIsCreating(true)
    axios
      .put(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/drafts/${marketId}`, data, {
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

  const submit = async () => {
    if (marketId) {
      await updateMarket()
      return
    }
    await draftMarket()
  }

  return (
    <MainLayout>
      <Flex justifyContent={'center'}>
        <VStack w='full' spacing={4}>
          <Text>Create Market</Text>
          <FormControl>
            <HStack
              w='full'
              maxW='1000px'
              gap={10}
              justifyContent='space-between'
              alignItems='flex-start'
            >
              <VStack w={'full'}>
                <FormField label='OG Preview'>
                  <HStack>
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

                <FormField label='Title'>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    maxLength={70}
                    onBlur={() => generateOgImage()}
                  />
                  <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                    {formData.title?.length}/70 characters
                  </FormHelperText>
                </FormField>

                <FormField label='Description'>
                  <Textarea
                    resize='none'
                    rows={7}
                    overflow='hidden'
                    maxLength={1500}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    onBlur={() => generateOgImage()}
                  />
                  <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                    {formData.description?.length}/1500 characters
                  </FormHelperText>
                </FormField>
              </VStack>
              <VStack w={'full'}>
                <FormField label='Token'>
                  <HStack>
                    <Select value={formData.token.id} onChange={handleTokenSelect}>
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
                    <NumberInput maxW='120px' mr='2rem' value={formData.liquidity}>
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
                      <SliderThumb fontSize='sm' boxSize='32px' />
                    </Slider>
                  </HStack>
                </FormField>

                <FormField label='Starting YES Probability'>
                  <HStack>
                    <NumberInput maxW='120px' mr='2rem' value={formData.probability}>
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
                      <SliderThumb fontSize='sm' boxSize='32px' />
                    </Slider>
                  </HStack>
                </FormField>

                <FormField label='Market Fee'>
                  <HStack>
                    <Checkbox
                      isChecked={formData.marketFee === 1}
                      onChange={(e) => handleChange('marketFee', e.target.checked ? 1 : 0)}
                    >
                      1% Fee
                    </Checkbox>
                  </HStack>
                </FormField>

                <FormField label='Creator'>
                  <HStack>
                    <Select
                      value={formData.creatorId}
                      onChange={(e) => handleChange('creatorId', e.target.value)}
                    >
                      {creators?.map((creator: Creator) => (
                        <option key={creator.id} value={creator.id}>
                          {creator.name}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                </FormField>

                <FormField label='Category'>
                  <HStack>
                    <Select
                      value={formData.categoryId}
                      onChange={(e) => handleChange('categoryId', e.target.value)}
                    >
                      {categories?.map((category: Category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                </FormField>

                <FormField label='Tags'>
                  <HStack w={'full'}>
                    <Box width='full'>
                      <CreatableSelect
                        isMulti
                        onCreateOption={handleTagCreation}
                        //@ts-ignore
                        onChange={(option) => handleChange('tag', option)}
                        value={formData.tag}
                        options={tagOptions}
                        styles={{
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isFocused
                              ? 'var(--chakra-colors-blue-50)'
                              : 'var(--chakra-colors-grey-300)',
                            color: state.isFocused
                              ? 'var(--chakra-colors-blue-900)'
                              : 'var(--chakra-colors-grey-900)',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            ...selectStyles.menu,
                          }),
                          control: (provided) => ({
                            ...provided,
                            ...selectStyles.control,
                          }),
                        }}
                      />
                    </Box>
                  </HStack>
                </FormField>

                <FormField label='Deadline'>
                  {/*// Todo move to a separate component?*/}
                  <DatePicker
                    id='input'
                    selected={formData.deadline}
                    onChange={(date) => {
                      if (date) {
                        handleChange('deadline', new Date(date.getTime()))
                      }
                    }}
                    minDate={new Date()}
                    showTimeSelect
                    dateFormat='Pp'
                  />
                  <TimezoneSelect
                    value={formData.timezone}
                    onChange={(timezone: ITimezoneOption) =>
                      handleChange('timezone', timezone.value)
                    }
                    styles={{
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? 'var(--chakra-colors-blue-50)'
                          : 'var(--chakra-colors-grey-300)',
                        color: state.isFocused
                          ? 'var(--chakra-colors-blue-900)'
                          : 'var(--chakra-colors-grey-900)',
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
                    <Button colorScheme='blue' w='full' height='52px' onClick={submit}>
                      {marketId ? 'Save' : 'Draft'}
                    </Button>
                  )}
                </ButtonGroup>
              </VStack>
            </HStack>
          </FormControl>
        </VStack>
      </Flex>
    </MainLayout>
  )
}

export default CreateOwnMarketPage
