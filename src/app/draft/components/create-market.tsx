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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
  Switch,
  FormLabel,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toZonedTime } from 'date-fns-tz'
import { htmlToText } from 'html-to-text'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { FC, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { MultiValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import TimezoneSelect, {
  allTimezones,
  ITimezoneOption,
  useTimezoneSelect,
} from 'react-timezone-select'
import TextEditor from '@/components/common/text-editor'
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
import { MarketTypeSelector } from './type-selector'
import { useToast } from '@/hooks'
import CloseIcon from '@/resources/icons/close-icon.svg'
import { useCategories, useLimitlessApi } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { Category } from '@/types'
import {
  Token,
  Tag,
  TagOption,
  IFormData,
  Creator,
  MarketInput,
  DraftMarketType,
} from '@/types/draft'
import { FormField } from '../components/form-field'

export const CreateMarket: FC = () => {
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
  const type = searchParams.get('marketType')
  const privateClient = useAxiosPrivateClient()

  const [marketType, setMarketType] = useState<DraftMarketType>((type as DraftMarketType) ?? 'amm')
  const isClob = marketType === 'clob'
  const isAmm = marketType === 'amm'
  const isGroup = marketType === 'group'

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
      setAutoGenerateOg(true)
      setMarketType(editMarket.type)
      setFormData((prevFormData) => ({
        ...prevFormData,
        title: editMarket.title || '',
        ...(editMarket.type !== 'group' ? { description: editMarket.description || '' } : {}),
        deadline: toZonedTime(editMarket.deadline, 'America/New_York'),
        token: editMarket.collateralToken
          ? { symbol: editMarket.collateralToken.symbol, id: editMarket.collateralToken.id }
          : prevFormData.token,
        liquidity:
          editMarket.draftMetadata?.liquidity ||
          tokenLimits[editMarket.collateralToken.symbol]?.min,
        probability: editMarket.draftMetadata?.initialProbability * 100 || defaultProbability,
        marketFee: editMarket.draftMetadata?.fee || defaultMarketFee,
        isBannered: editMarket.metadata?.isBannered || false,
        tag:
          editMarket.tags.map((tag: Tag) => ({
            id: tag.id,
            value: tag.name,
            label: tag.name,
          })) || [],
        creatorId: editMarket.creator?.id || defaultCreatorId,
        categoryId: editMarket.category?.id || defaultCategoryId,
        type: editMarket.type,
      }))
      if (editMarket.type === 'group' && editMarket.markets?.length > 0) {
        setMarketType('group')
        setMarkets(
          editMarket.markets.map((market: MarketInput) => ({
            title: market.title ?? '',
            description: market.description ?? '',
            id: market.id ?? '',
          }))
        )
      }
      generateOgImage().then(() => console.log('Og image generated'))
    }
  }, [editMarket])

  const handleChange = <K extends keyof IFormData>(
    field: string,
    value: IFormData[K] | MultiValue<TagOption> | MarketInput[]
  ) => {
    if (Array.isArray(value)) {
      if (field === 'tag') {
        setFormData((prevFormData) => ({
          ...prevFormData,
          //@ts-ignore
          [field]: [...value] as TagOption[],
        }))
      }
      if (field === 'markets') {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [field]: [...value] as MarketInput[],
        }))
      }
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
  const [ogImageError, setOgImageError] = useState<string | null>(null)
  const [autoGenerateOg, setAutoGenerateOg] = useState<boolean>(true)
  const [isReady, setIsReady] = useState<boolean>(false)

  useEffect(() => {
    setIsReady(true)
    if (autoGenerateOg && formData.title) {
      const timer = setTimeout(() => {
        generateOgImage()
          .then(() => console.log('Initial OG image generated successfully'))
          .catch(() => {
            setOgImageError('Failed to generate initial OG image. Please try regenerating.')
          })
      }, 500) // Add a small delay to ensure form data is stable

      return () => clearTimeout(timer)
    }
  }, [formData.title, autoGenerateOg])

  const { mutateAsync: generateOgImage, isPending: isGeneratingOgImage } = useMutation({
    mutationKey: ['generate-og-image'],
    mutationFn: async () => {
      setOgImageError(null)
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(console.log('OG image generation timed out'))
        }, 5000)

        const checkReady = setInterval(() => {
          if (isReady) {
            clearInterval(checkReady)
            clearTimeout(timeout)
            resolve(true)
          }
        }, 50)
      })
    },
    onError: (error) => {
      console.error('OG image generation error:', error)
      setOgImageError('Failed to generate OG image. Please try again.')
    },
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

  const prepareMarketData = (formData: FormData) => {
    const tokenId = Number(formData.get('tokenId'))
    const marketFee = Number(formData.get('marketFee'))
    const deadline = Number(formData.get('deadline'))

    if (isNaN(tokenId) || isNaN(marketFee) || isNaN(deadline)) {
      throw new Error('Invalid numeric values in form data')
    }

    const title = formData.get('title')
    const description = formData.get('description')
    if (!title) {
      throw new Error('Missing required fields')
    }

    return {
      title: title.toString(),
      ...(!isGroup ? { description: description?.toString() ?? '' } : {}),
      tokenId,
      ...(isAmm ? { liquidity: Number(formData.get('liquidity')) } : {}),
      ...(isAmm ? { initialYesProbability: Number(formData.get('initialYesProbability')) } : {}),
      marketFee,
      deadline,
      isBannered: formData.get('isBannered') === 'true',
      creatorId: formData.get('creatorId')?.toString() ?? '',
      categoryId: formData.get('categoryId')?.toString() ?? '',
      ogFile: formData.get('ogFile') as File | null,
      tagIds: formData.get('tagIds')?.toString() ?? '',
      ...(isGroup
        ? { marketsInput: JSON.parse(formData.get('marketsInput')?.toString() ?? '[]') }
        : {}),
    }
  }

  const prepareData = async () => {
    await generateOgImage()

    try {
      const { title, description, creatorId, ogLogo, tag, marketInput } = formData

      const missingFields: string[] = []

      if (!title) missingFields.push('Title')
      if (!description && !isGroup) missingFields.push('Description')
      if (!creatorId) missingFields.push('Creator')
      if (tag.length === 0) missingFields.push('Tag')
      if (marketInput && marketInput.length < 2) missingFields.push('Market inputs')

      if (!ogLogo) {
        if (ogImageError) {
          showToast(`OG Image generation failed: ${ogImageError}`)
          return
        }
        missingFields.push('Og Logo')
      }

      if (ogLogo && !ogLogo.size) {
        showToast('OG Logo file is empty or corrupted. Please try regenerating.')
        return
      }

      if (missingFields.length > 0) {
        showToast(
          `${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required!`
        )
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
      if (isAmm) {
        marketFormData?.set('liquidity', formData.liquidity?.toString() || '')
        marketFormData?.set('initialYesProbability', (formData.probability / 100).toString())
      }
      marketFormData?.set('marketFee', formData.marketFee.toString())
      marketFormData?.set('deadline', zonedTime.toString())
      marketFormData?.set('isBannered', formData.isBannered.toString())

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

      if (isGroup && markets.length > 0) {
        marketFormData.set('marketsInput', JSON.stringify(markets))
      }

      return marketFormData
    } catch (e) {}
  }

  const draftMarket = async () => {
    const data = await prepareData()
    if (!data) return
    setIsCreating(true)
    const marketData = prepareMarketData(data)
    //todo: refactor after clob endpoint will be unified
    const url = () => {
      if (isClob) return '/markets/clob/drafts'
      if (isGroup) return '/markets/drafts/group'
      return '/markets/drafts'
    }
    privateClient
      .post(url(), marketData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        showToast(`Market is drafted`)
        router.push(`/draft?tab=${marketType}`)
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
    const marketData = prepareMarketData(data)
    const url = isGroup ? `/markets/drafts/group/${marketId}` : `/markets/drafts/${marketId}`
    privateClient
      .put(url, marketData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        showToast(`Market ${marketId} is updated`)
        router.push(`/draft?tab=queue-${marketType}`)
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

  const getPlainTextLength = (html: string | undefined): number => {
    if (!html) return 0
    return htmlToText(html, {
      wordwrap: false,
      preserveNewlines: true,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' },
      ],
    }).length
  }

  const handleBlobGenerated = (blob: Blob | null) => {
    try {
      if (!blob) {
        const errorMessage = 'Failed to generate OG image: No blob received'
        showToast(errorMessage)
        setOgImageError(errorMessage)
        return
      }
      if (!blob.type.startsWith('image/')) {
        const errorMessage = 'Failed to generate OG image: Invalid image type'
        showToast(errorMessage)
        setOgImageError(errorMessage)
        return
      }

      const _ogLogo = new File([blob], 'og.png', {
        type: blob.type,
        lastModified: Date.now(),
      })

      if (!_ogLogo.size) {
        const errorMessage = 'Failed to generate OG image: Empty file'
        showToast(errorMessage)
        setOgImageError(errorMessage)
        return
      }

      if (_ogLogo.size > 1024 * 1024) {
        const errorMessage = 'Failed to generate OG image: File too large'
        showToast('Failed to generate OG image: File too large')
        setOgImageError(errorMessage)
        return
      }

      setOgImageError(null)
      handleChange('ogLogo', _ogLogo)
    } catch (error) {
      const errorMessage = 'Failed to generate OG image: ' + (error as Error).message
      showToast(errorMessage)
      setOgImageError(errorMessage)
    }
  }

  const submit = async () => {
    if (marketId) {
      await updateMarket()
      return
    }
    await draftMarket()
  }

  const getButtonText = () => {
    if (!isReady && !editMarket) return 'OG is not ready..'
    if (marketId) return 'Save'
    return 'Draft'
  }

  const [markets, setMarkets] = useState<MarketInput[]>([{ title: '', description: '' }])

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedMarkets = [...markets]
    //@ts-ignore
    updatedMarkets[index][field] = value
    setMarkets(updatedMarkets)
  }

  const addMarket = () => {
    setMarkets([...markets, { title: '', description: '' }])
  }

  return (
    <Flex justifyContent='center'>
      <VStack w='full' spacing={4}>
        <FormControl>
          <MarketTypeSelector
            value={marketType ?? 'amm'}
            onChange={(value) => setMarketType(value as DraftMarketType)}
          />
          <HStack
            w='full'
            maxW='1200px'
            mx='auto'
            gap={10}
            justifyContent='space-between'
            alignItems='flex-start'
          >
            <VStack w='full' flex='1.2'>
              <FormField label='Title'>
                <Textarea
                  resize='none'
                  rows={1}
                  overflow='hidden'
                  height='auto'
                  onInput={resizeTextareaHeight}
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  maxLength={70}
                  onBlur={() => autoGenerateOg && generateOgImage()}
                />
                <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                  {formData.title?.length}/70 characters
                </FormHelperText>
              </FormField>
              {!isGroup ? (
                <FormField label='Description'>
                  <TextEditor
                    value={formData.description}
                    readOnly={false}
                    onChange={(e) => {
                      if (getPlainTextLength(e) <= 1500) {
                        handleChange('description', e)
                      }
                    }}
                  />
                  <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                    {getPlainTextLength(formData.description)}/1500 characters
                  </FormHelperText>
                </FormField>
              ) : (
                <>
                  {markets.map((market, index) => (
                    <Box key={market.id} borderWidth={1} p={4} borderRadius='md' width='100%'>
                      <Flex justify='space-between' align='center' mb={2}>
                        <Text fontWeight='bold'>
                          Market #{index + 1} {market.id ? `- id: ${market.id}` : ''}
                        </Text>
                        <Box
                          cursor='pointer'
                          onClick={() => {
                            const updatedMarkets = [...markets]
                            updatedMarkets.splice(index, 1)
                            setMarkets(updatedMarkets)
                          }}
                        >
                          <CloseIcon color='red' height={24} width={24} />
                        </Box>
                      </Flex>
                      <FormControl>
                        <FormLabel htmlFor={`market${index}_title`}>Title</FormLabel>
                        <Input
                          type='text'
                          id={`market${index}_title`}
                          name={`marketsInput[${index}][title]`}
                          value={market.title}
                          onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                          placeholder={`Enter market ${index + 1} title`}
                          required
                        />
                      </FormControl>
                      <FormControl mt={4}>
                        <FormLabel htmlFor={`market${index}_description`}>Description</FormLabel>
                        <TextEditor
                          value={market.description}
                          readOnly={false}
                          onChange={(value) => {
                            if (getPlainTextLength(value) <= 1500) {
                              handleInputChange(index, 'description', value)
                            }
                          }}
                        />
                        <FormHelperText
                          textAlign='end'
                          style={{ fontSize: '10px', color: 'spacegray' }}
                        >
                          {getPlainTextLength(market.description)}/1500 characters
                        </FormHelperText>
                      </FormControl>
                    </Box>
                  ))}
                </>
              )}

              {isGroup && (
                <Button onClick={addMarket} colorScheme='blue'>
                  Add Another Market
                </Button>
              )}

              <FormField label='Token'>
                <HStack>
                  <Select value={formData.token.id} onChange={handleTokenSelect} disabled={isClob}>
                    {supportedTokens?.map((token: Token) => (
                      <option key={token.id} value={token.id} data-name={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </FormField>
              {isAmm && (
                <>
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
                        <SliderTrack bg='var(--chakra-colors-greyTransparent-600)'>
                          <SliderFilledTrack bg='var(--chakra-colors-text-100)' />
                        </SliderTrack>
                        <SliderThumb
                          bg='var(--chakra-colors-text-100)'
                          fontSize='sm'
                          boxSize='24px'
                        />
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
                        <SliderTrack bg='var(--chakra-colors-greyTransparent-600)'>
                          <SliderFilledTrack bg='var(--chakra-colors-text-100)' />
                        </SliderTrack>
                        <SliderThumb
                          bg='var(--chakra-colors-text-100)'
                          fontSize='sm'
                          boxSize='24px'
                        />
                      </Slider>
                    </HStack>
                  </FormField>
                </>
              )}
              <Accordion mt='20px' allowToggle defaultIndex={[0]}>
                <AccordionItem>
                  <>
                    <AccordionButton>
                      <Box flex='1' textAlign='left'>
                        OG Preview (Click to Expand/Collapse)
                        {!formData.ogLogo && ogImageError && (
                          <Box as='span' color='red.500' ml={2} fontSize='sm'>
                            (Generation failed)
                          </Box>
                        )}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} position='relative'>
                      <Box>
                        <HStack mb={4} width='full' justifyContent='space-between'>
                          <Button
                            size='sm'
                            colorScheme='blue'
                            onClick={async () => {
                              setOgImageError(null)
                              await generateOgImage()
                            }}
                            isLoading={!isReady}
                          >
                            Regenerate OG Image
                          </Button>
                          <Checkbox
                            isChecked={autoGenerateOg}
                            onChange={(e) => setAutoGenerateOg(e.target.checked)}
                          >
                            Auto-generate
                          </Checkbox>
                        </HStack>
                        <Box pointerEvents='none'>
                          <HStack h='280px' w='600px'>
                            <OgImageGenerator
                              title={formData.title}
                              setReady={(isReady) => {
                                setIsReady(isReady)
                              }}
                              category={
                                categories?.find((category) => category.id === +formData.categoryId)
                                  ?.name ?? 'Unknown'
                              }
                              onBlobGenerated={(blob) => handleBlobGenerated(blob)}
                              generateBlob={isGeneratingOgImage}
                            />
                          </HStack>
                        </Box>
                      </Box>
                    </AccordionPanel>
                  </>
                </AccordionItem>
              </Accordion>
            </VStack>

            <VStack w={'full'} flex='0.8' h='full'>
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
              <FormField label='Is Bannered'>
                <HStack>
                  <Checkbox
                    isChecked={formData.isBannered}
                    onChange={(e) => handleChange('isBannered', e.target.checked)}
                  >
                    Add market to big banner
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
                    onChange={async (e) => {
                      handleChange('categoryId', e.target.value)
                      if (autoGenerateOg) {
                        await generateOgImage()
                      }
                    }}
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
                      closeMenuOnSelect={false}
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
                  selected={formData.deadline || null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      handleChange('deadline', new Date(date.getTime()))
                    }
                  }}
                  minDate={new Date()}
                  showTimeSelect
                  timeIntervals={60}
                  dateFormat='Pp'
                  calendarStartDay={1}
                  customInput={
                    <Input
                      cursor='pointer'
                      backgroundColor='grey.100'
                      color='grey.900'
                      _hover={{ backgroundColor: 'grey.200' }}
                      _focus={{ backgroundColor: 'gray.300', borderColor: 'gray.500' }}
                      padding='8px'
                      mb='5px'
                      borderRadius='md'
                    />
                  }
                />
                <TimezoneSelect
                  value={formData.timezone}
                  onChange={(timezone: ITimezoneOption) => handleChange('timezone', timezone.value)}
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
                  <Button
                    colorScheme='green'
                    w='full'
                    height='52px'
                    onClick={submit}
                    isDisabled={!isReady && !editMarket}
                  >
                    {getButtonText()}
                  </Button>
                )}
              </ButtonGroup>
            </VStack>
          </HStack>
        </FormControl>
      </VStack>
    </Flex>
  )
}
