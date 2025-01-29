'use client'

import {
  Box,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  Heading,
  HStack,
  Img,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Spacer,
  Text,
  Textarea,
  useTheme,
  VStack,
} from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { setTimeout } from '@wry/context'
import axios from 'axios'
import { toZonedTime } from 'date-fns-tz'
import html2canvas from 'html2canvas'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { isMobile } from 'react-device-detect'
import { MultiValue } from 'react-select'
import TimezoneSelect, {
  allTimezones,
  ITimezoneOption,
  useTimezoneSelect,
} from 'react-timezone-select'
import ButtonWithStates from '@/components/common/button-with-states'
import Paper from '@/components/common/paper'
import { Toast } from '@/components/common/toast'
import {
  defaultFormData,
  defaultTokenSymbol,
  selectStyles,
  defaultProbability,
  defaultMarketFee,
  defaultCreatorId,
  defaultCategoryId,
  IOgImageGeneratorOptions,
} from '@/app/draft/components'
import { FormField } from '@/app/draft/components/form-field'
import { MainLayout } from '@/components'
import { defaultChain } from '@/constants'
import { draftMarketAddress } from '@/constants/application'
import { useToast } from '@/hooks'
import BaseWhiteIcon from '@/resources/icons/base-icon-white.svg'
import CopyIcon from '@/resources/icons/copy-icon.svg'
import { ClickEvent, useAmplitude, useCategories, useLimitlessApi } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { captionRegular, h1Bold, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Category } from '@/types'
import { Token, Tag, TagOption, IFormData } from '@/types/draft'
import { truncateEthAddress } from '@/utils'

const [backgroundColor] = ['#0000EE']
const exportOptions: IOgImageGeneratorOptions = {
  px: 150,
  p: 10,
  height: `1100px`,
  width: `2110px`,
  fontSize: 113.68,
  borderRadius: 'none',
  divider: {
    borderWidth: '4px',
  },
  logo: {
    width: '847px',
    height: '148px',
  },
}

const CreateOwnMarketPage = () => {
  const { parseTimezone } = useTimezoneSelect({
    labelStyle: 'original',
    timezones: allTimezones,
  })
  const [formData, setFormData] = useState<IFormData>(defaultFormData)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [copied, setCopied] = useState(false)

  const { supportedTokens } = useLimitlessApi()
  const toast = useToast()
  const theme = useTheme()
  const canvasRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const marketId = searchParams.get('market')
  const privateClient = useAxiosPrivateClient()
  const queryClient = useQueryClient()
  const { data: categories } = useCategories()
  const { trackClicked } = useAmplitude()

  const { data: editMarket } = useQuery({
    queryKey: ['editMarket', marketId],
    queryFn: async () => {
      const response = await privateClient.get(`/markets/drafts/${marketId}`)
      return response.data
    },
    enabled: !!marketId,
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
  }

  const showToast = (message: string) => {
    const id = toast({
      render: () => <Toast title={message} id={id} />,
    })
  }

  const { firstWord, secondWord, words } = useMemo(() => {
    const [firstWord, secondWord, ...words] = formData.title.split(' ')
    return {
      firstWord,
      secondWord,
      words,
    }
  }, [formData.title])

  const generateOgImage = async () => {
    if (!canvasRef.current) return
    const componentWidth = canvasRef.current.offsetWidth
    const componentHeight = canvasRef.current.offsetHeight
    const scale = 2110 / componentWidth // calculate the scale factor
    const canvas = await html2canvas(canvasRef.current, {
      useCORS: true,
      logging: true,
      scale,
      width: componentWidth * scale,
      height: componentHeight * scale,
      backgroundColor: backgroundColor,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
    })

    let ogLogo

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const _ogLogo = new File([blob], 'og.png', {
            type: blob.type,
            lastModified: Date.now(),
          })
          console.log('Blob transformed to File', _ogLogo)

          ogLogo = _ogLogo
        } else {
          console.error('Blob generation failed')
        }
      },
      'image/png',
      1.0
    )
    while (!ogLogo) {
      await sleep(1)
    }
    return ogLogo
  }

  const prepareData = async () => {
    const ogLogo = await generateOgImage()

    const { title, description, creatorId, tag, txHash, token, probability } = formData

    const missingFields: string[] = []
    if (!title) missingFields.push('Title')
    if (!description) missingFields.push('Description')
    if (!creatorId) missingFields.push('Creator')
    if (!ogLogo) missingFields.push('Og Logo')
    // if (!tag) missingFields.push('Tag')
    if (!txHash) missingFields.push('Tx Hash')
    if (!txHash.startsWith('0x')) {
      showToast('Transaction hash should start with 0x')
      setIsCreating(false)
      return
    }

    if (missingFields.length > 0) {
      showToast(`${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required!`)
      setIsCreating(false)
      return
    }

    const differenceInOffset =
      (parseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone).offset ?? 1) -
      (parseTimezone(formData.timezone)?.offset ?? 1)
    const zonedTime = new Date(formData.deadline).getTime() + differenceInOffset * 60 * 60 * 1000

    const marketFormData = new FormData()
    marketFormData?.set('title', title)
    marketFormData?.set('description', description)
    marketFormData?.set('tokenId', token.id.toString())
    marketFormData?.set('deadline', zonedTime.toString())
    if (formData.tag.length) {
      marketFormData.set('tagIds', formData.tag.map((t) => t.id).join(','))
    }
    if (formData.categoryId) {
      marketFormData.set('categoryId', formData.categoryId)
    }
    marketFormData?.set('initialYesProbability', (probability / 100).toString())
    marketFormData.set('txHash', txHash)

    if (ogLogo) {
      marketFormData.set('ogFile', ogLogo)
    }

    return marketFormData
  }

  const createOption = (id: string, name: string): TagOption => ({
    id,
    label: name,
    value: name,
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

  const draftMarket = async () => {
    setIsCreating(true)
    const data = await prepareData()
    if (!data) return
    try {
      await privateClient.post(`/markets/user-drafts`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      showToast('Request for market creation has been registered successfully.')
      await queryClient.resetQueries({
        queryKey: ['my-markets'],
      })
    } catch (e) {
      const error = e as Error
      showToast(`Error: ${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  const onClickCopy = () => {
    trackClicked(ClickEvent.CopyAddressClicked, {
      page: 'Create Market',
      address: '0x',
    })
    setCopied(true)
  }

  useEffect(() => {
    const hideCopiedMessage = setTimeout(() => {
      setCopied(false)
    }, 2000)

    return () => clearTimeout(hideCopiedMessage)
  }, [copied])

  const submit = async () => {
    await draftMarket()
  }

  return (
    <MainLayout>
      <Box w={isMobile ? 'full' : '40%'}>
        <Divider orientation='horizontal' h='3px' borderColor='grey.800' bg='grey.800' />
        <Heading {...h1Bold} gap={2}>
          Create market
        </Heading>
        <Flex justifyContent={'center'}>
          <VStack w='full' spacing={4}>
            <FormControl>
              <HStack w='full' gap={10} justifyContent='space-between' alignItems='flex-start'>
                <VStack w='full' flex='1.2'>
                  <Box position='absolute' opacity={0} pointerEvents='none'>
                    <FormField label='OG Preview is still here, but hidden (required to create an image)'>
                      <HStack position='absolute' h='280px' w='600px'>
                        <Box display='inline-block' w='full' position='absolute' top='-9999px'>
                          <Box
                            ref={canvasRef}
                            bg={backgroundColor}
                            width={exportOptions.width}
                            height={exportOptions.height}
                            p={exportOptions.p}
                            pt={35}
                            pb={112}
                            px={exportOptions.px}
                            borderRadius={exportOptions.borderRadius}
                            style={{
                              lineHeight: '0.5 !important',
                            }}
                          >
                            <Divider
                              color='white'
                              borderWidth={exportOptions.divider.borderWidth}
                              pos='absolute'
                              top='75px'
                              // p={0} m={0}
                            />

                            <VStack w='full' h='full' display='flex' gap={0}>
                              <Text
                                // bg='red'
                                fontWeight={400}
                                height='146px'
                                fontSize={exportOptions.fontSize}
                                color='white'
                                w='full'
                                pb={50}
                                style={{
                                  lineHeight: '0.5 !important',
                                }}
                              >
                                <span style={{ fontFamily: theme.fonts.body }}>{firstWord}</span>{' '}
                                <span style={{ fontFamily: theme.fonts.heading }}>
                                  {' '}
                                  {secondWord}{' '}
                                </span>
                                <span style={{ fontFamily: theme.fonts.body }}>
                                  {words.join(' ')}
                                </span>
                              </Text>

                              <Spacer />

                              <Box
                                display='flex'
                                justifyContent='start'
                                alignItems='center'
                                w='full'
                              >
                                <Img
                                  src='/logo-og-markets.png'
                                  // src='/logo-og.png' // use this for dynamic category
                                  alt='Limitless Logo'
                                  width={exportOptions.logo.width}
                                  height={exportOptions.logo.height}
                                />
                              </Box>
                            </VStack>
                          </Box>
                        </Box>
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
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      maxLength={70}
                      id='title'
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
                      maxLength={1500}
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      id='description'
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
                        {...paragraphMedium}
                        disabled={true}
                      >
                        {supportedTokens?.map((token: Token) => (
                          <option key={token.id} value={token.id} data-name={token.symbol}>
                            {token.symbol}
                          </option>
                        ))}
                      </Select>
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
                        <NumberInputField w={'120px'} id='probability' />
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
                  customInput={<Input variant='grey' mb='5px' id='deadline' h='26px' />}
                />
                <TimezoneSelect
                  value={formData.timezone}
                  onChange={(timezone: ITimezoneOption) => handleChange('timezone', timezone.value)}
                  id='timezone'
                  styles={{
                    option: (provided) => ({
                      ...provided,
                      cursor: 'pointer',
                      background: 'unset',
                      ...paragraphMedium,
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
                    indicatorSeparator: (provided) => ({
                      ...provided,
                      display: 'none',
                    }),
                  }}
                />
              </FormField>

              <FormField label='Category'>
                <HStack>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) => {
                      handleChange('categoryId', e.target.value)
                    }}
                    borderRadius='8px'
                    borderColor='grey.300'
                    h='26px'
                    _focusVisible={{
                      borderColor: 'grey.800',
                    }}
                    {...paragraphMedium}
                  >
                    {categories?.map((category: Category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </HStack>
              </FormField>

              {/*<FormField label='Tags'>*/}
              {/*  <HStack w={'full'}>*/}
              {/*    <Box width='full'>*/}
              {/*      <CreatableSelect*/}
              {/*        isMulti*/}
              {/*        onCreateOption={handleTagCreation}*/}
              {/*        //@ts-ignore*/}
              {/*        onChange={(option) => handleChange('tag', option)}*/}
              {/*        value={formData.tag}*/}
              {/*        options={tagOptions}*/}
              {/*        styles={{*/}
              {/*          option: (provided) => ({*/}
              {/*            ...provided,*/}
              {/*            cursor: 'pointer',*/}
              {/*            background: 'unset',*/}
              {/*            ...paragraphMedium,*/}
              {/*            '&:hover': {*/}
              {/*              background: 'var(--chakra-colors-grey-300)',*/}
              {/*            },*/}
              {/*          }),*/}
              {/*          multiValue: (provided) => ({*/}
              {/*            ...provided,*/}
              {/*            backgroundColor: 'var(--chakra-colors-grey-300)',*/}
              {/*            borderRadius: '8px',*/}
              {/*          }),*/}
              {/*          multiValueLabel: (provided) => ({*/}
              {/*            ...provided,*/}
              {/*            color: 'var(--chakra-colors-grey-800)',*/}
              {/*          }),*/}
              {/*          menu: (provided) => ({*/}
              {/*            ...provided,*/}
              {/*            ...selectStyles.menu,*/}
              {/*          }),*/}
              {/*          control: (provided) => ({*/}
              {/*            ...provided,*/}
              {/*            ...selectStyles.control,*/}
              {/*          }),*/}
              {/*        }}*/}
              {/*      />*/}
              {/*    </Box>*/}
              {/*  </HStack>*/}
              {/*</FormField>*/}

              <Paper
                my='24px'
                bg='radial-gradient(120.21% 216.83% at 0% 50%, #5F1BEC 0%, #FF3756 47.2%, #FFCB00 100%)'
                w='full'
                p='8px'
              >
                <Text {...paragraphMedium} color='white'>
                  Send min. 250 USDC to submit market
                </Text>
                <HStack w='full' justifyContent='space-between' alignItems='flex-end'>
                  <Box mt='16px'>
                    <Text {...paragraphMedium} color='white'>
                      Address
                    </Text>
                    <HStack gap='4px'>
                      <CopyToClipboard
                        text={draftMarketAddress[defaultChain.id]}
                        onCopy={onClickCopy}
                      >
                        <HStack gap='4px' color='white' cursor='pointer'>
                          <Text {...paragraphMedium} color='white'>
                            {isMobile
                              ? truncateEthAddress(draftMarketAddress[defaultChain.id])
                              : draftMarketAddress[defaultChain.id]}
                          </Text>
                          <CopyIcon width='16px' height='16px' />
                          {copied && (
                            <Text {...paragraphMedium} color='white' ml='4px'>
                              Copied!
                            </Text>
                          )}
                        </HStack>
                      </CopyToClipboard>
                    </HStack>
                  </Box>
                  <HStack gap='4px' color='white'>
                    <BaseWhiteIcon />
                    <Text {...captionRegular} color='white'>
                      BASE NETWORK
                    </Text>
                  </HStack>
                </HStack>
              </Paper>

              <FormField label='Tx Hash'>
                <Input
                  variant='grey'
                  value={formData.txHash}
                  onChange={(e) => handleChange('txHash', e.target.value)}
                  id='txHash'
                />
                <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                  Market liquidity deposit tx hash
                </FormHelperText>
              </FormField>

              <ButtonWithStates
                status={isCreating ? 'pending' : 'idle'}
                variant='contained'
                onClick={submit}
                w='full'
                h='52px'
                mt='16px'
                mb={isMobile ? '40px' : 0}
              >
                Submit For Review
              </ButtonWithStates>
            </FormControl>
          </VStack>
        </Flex>
      </Box>
    </MainLayout>
  )
}

export default CreateOwnMarketPage
