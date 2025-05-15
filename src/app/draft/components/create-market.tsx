'use client'

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormHelperText,
  HStack,
  Input,
  Select,
  Spinner,
  Textarea,
  VStack,
  Text,
} from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { htmlToText } from 'html-to-text'
import { useAtom } from 'jotai'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { FC, useCallback, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { default as MultiSelect } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import TimezoneSelect, {
  allTimezones,
  ITimezoneOption,
  useTimezoneSelect,
} from 'react-timezone-select'
import TextEditor from '@/components/common/text-editor'
import { Toast } from '@/components/common/toast'
import { tokenLimits, selectStyles, defaultFormData } from '@/app/draft/components'
import { GroupForm } from './group-form'
import { AdjustableNumberInput } from './number-inputs'
import { MarketTypeSelector } from './type-selector'
import { dailyToEpochRewards, epochToDailyRewards, useCreateMarket } from './use-create-market'
import {
  defaultGroupMarkets,
  draftMarketTypeAtom,
  formDataAtom,
  groupMarketsAtom,
} from '@/atoms/draft'
import { useToast } from '@/hooks'
import { useUrlParams } from '@/hooks/use-url-param'
import { useLimitlessApi } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { useMarket } from '@/services/MarketsService'
import { paragraphBold, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Token, SelectOption, DraftCreator, DraftMarketType } from '@/types/draft'
import { FormField } from '../components/form-field'

export const CreateMarket: FC = () => {
  const [formData, setFormData] = useAtom(formDataAtom)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const { supportedTokens } = useLimitlessApi()
  const toast = useToast()
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftMarketId = searchParams.get('draft-market')
  const activeMarketId = searchParams.get('active-market')
  const type = searchParams.get('marketType')
  const privateClient = useAxiosPrivateClient()
  const {
    handleChange,
    populateDraftMarketData,
    populateActiveMarketData,
    createOption,
    handleTokenSelect,
    prepareMarketData,
  } = useCreateMarket()

  const [marketType, setMarketType] = useAtom(draftMarketTypeAtom)
  const [, setGroupMarkets] = useAtom(groupMarketsAtom)

  const isClob = marketType === 'clob'
  const isAmm = marketType === 'amm'
  const isGroup = marketType === 'group'

  const calculateZonedTime = (deadline: Date, timezone: string): number => {
    const currentTimezoneOffset =
      parseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone).offset ?? 1
    const formTimezoneOffset = parseTimezone(timezone)?.offset ?? 1
    const differenceInOffset = currentTimezoneOffset - formTimezoneOffset
    return new Date(deadline).getTime() + differenceInOffset * 60 * 60 * 1000
  }

  const { data: editDraftMarket } = useQuery({
    queryKey: ['editMarket', draftMarketId],
    queryFn: async () => {
      const response = await privateClient.get(`/markets/drafts/${draftMarketId}`)
      return response.data
    },
    enabled: !!draftMarketId,
  })

  const { data: editActiveMarket } = useMarket(activeMarketId)

  useEffect(() => {
    if (type) {
      setMarketType(type as DraftMarketType)
    }
  }, [type])

  useEffect(() => {
    if (editDraftMarket) {
      setMarketType(editDraftMarket.type)
      populateDraftMarketData(editDraftMarket)
      return
    }
    if (editActiveMarket) {
      setMarketType(type as DraftMarketType)
      populateActiveMarketData(editActiveMarket)
      return
    }
    setFormData(defaultFormData)
    setGroupMarkets(defaultGroupMarkets)
  }, [editDraftMarket, editActiveMarket])

  const showToast = (message: string) => {
    const id = toast({
      render: () => <Toast title={message} id={id} />,
    })
  }

  const { parseTimezone } = useTimezoneSelect({
    labelStyle: 'original',
    timezones: allTimezones,
  })

  const { data: tagOptions } = useQuery({
    queryKey: ['tagOptions'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tags`)

      return response.data.map((tag: { id: string; name: string }) =>
        createOption(tag.id, tag.name)
      ) as SelectOption[]
    },
  })
  const { data: categoriesOptions } = useQuery({
    queryKey: ['catOptions'],
    queryFn: async () => {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/categories`)

      return response.data.map((tag: { id: string; name: string }) =>
        createOption(tag.id, tag.name)
      ) as SelectOption[]
    },
  })

  const { data: creators } = useQuery({
    queryKey: ['creators'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/profiles/creators`
      )
      return response.data as DraftCreator[]
    },
  })

  const handleTagCreation = async (tagToCreate: string) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tags`, {
      name: tagToCreate,
    })

    queryClient.setQueryData(['tagOptions'], (oldData: SelectOption[]) => [
      ...oldData,
      createOption(res.data.id, res.data.name),
    ])
  }

  const draftMarket = async () => {
    const marketData = prepareMarketData()
    if (!marketData) return

    setIsCreating(true)
    const url = () => {
      if (isClob) return '/markets/clob/drafts'
      if (isGroup) return '/markets/drafts/group'
      return '/markets/drafts'
    }
    privateClient
      .post(url(), marketData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['allDraftMarkets'] })
        showToast(`Market is drafted`)
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

  const updateMarket = async () => {
    const marketData = prepareMarketData()
    if (!marketData) return

    setIsCreating(true)
    const url = isGroup
      ? `/markets/drafts/group/${draftMarketId}`
      : `/markets/drafts/${draftMarketId}`
    privateClient
      .put(url, marketData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['allDraftMarkets'] })
        showToast(`Market ${draftMarketId} is updated`)
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

  const updateActiveMarket = async () => {
    const marketData = prepareMarketData(true)
    if (!marketData) return
    const { id, ...rest } = marketData
    setIsCreating(true)
    const url = isGroup ? `/markets/group/${id}` : `/markets/${activeMarketId}`
    privateClient
      .put(url, rest, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['markets'] })
        showToast(`Market is updated`)
        router.push(`/draft?tab=active`)
      })
      .catch((res) => {
        showToast(`Error: ${res.message}`)
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

  const playSound = useCallback(() => {
    const audio = new Audio('/audio.mp3')
    audio.play()
  }, [])

  const submit = async () => {
    // playSound()
    if (draftMarketId) {
      await updateMarket()
      return
    }
    if (activeMarketId) {
      await updateActiveMarket()
      return
    }
    await draftMarket()
  }

  const getButtonText = () => {
    if (draftMarketId) return 'Save'
    if (activeMarketId) return 'Update active market'
    return 'Draft'
  }

  return (
    <Flex justifyContent='center'>
      <VStack w='full' spacing={4}>
        <FormControl>
          {!activeMarketId ? (
            <MarketTypeSelector
              value={marketType ?? 'amm'}
              onChange={(value) => setMarketType(value as DraftMarketType)}
            />
          ) : null}
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
                      if (getPlainTextLength(e) <= 3000) {
                        handleChange('description', e)
                      }
                    }}
                    style={{ wordBreak: 'break-word' }}
                  />
                  <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                    {getPlainTextLength(formData.description)}/3000 characters
                  </FormHelperText>
                </FormField>
              ) : (
                <GroupForm />
              )}

              {!activeMarketId && isAmm ? (
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
              ) : null}

              {isClob ? (
                <HStack w='full' alignItems='start' spacing={6}>
                  <VStack w='full'>
                    <AdjustableNumberInput
                      label='Min size'
                      value={formData.minSize}
                      onChange={(value) => handleChange('minSize', value)}
                      min={0}
                      max={1000}
                      step={1}
                    />

                    <AdjustableNumberInput
                      label='Max spread'
                      value={formData.maxSpread}
                      onChange={(value) => handleChange('maxSpread', value)}
                      min={0}
                      max={99}
                      step={0.1}
                    />
                  </VStack>
                  <VStack w='full'>
                    <AdjustableNumberInput
                      label='C'
                      value={formData.c}
                      onChange={(value) => handleChange('c', value)}
                      min={0}
                      max={1000}
                      step={1}
                    />

                    <AdjustableNumberInput
                      label='Rewards per day'
                      value={Number(epochToDailyRewards(formData.rewardsEpoch ?? 0))}
                      onChange={(value) => handleChange('rewardsEpoch', dailyToEpochRewards(value))}
                      min={0}
                      max={1000}
                      step={0.1}
                      prefix='US$'
                      additionalInfo={
                        <HStack>
                          <Text {...paragraphBold}>Per Epoch:</Text>
                          <Text>
                            {formData.rewardsEpoch ? Number(formData?.rewardsEpoch).toFixed(5) : ''}
                          </Text>
                        </HStack>
                      }
                    />
                  </VStack>
                </HStack>
              ) : null}

              {isAmm && !activeMarketId ? (
                <>
                  <AdjustableNumberInput
                    label={`${formData.token.symbol} Liquidity`}
                    value={formData.liquidity}
                    onChange={(value) => handleChange('liquidity', value)}
                    min={tokenLimits[formData.token.symbol]?.min}
                    max={tokenLimits[formData.token.symbol]?.max}
                    step={tokenLimits[formData.token.symbol]?.step}
                  />

                  <AdjustableNumberInput
                    label='Starting YES Probability'
                    value={formData.probability}
                    onChange={(value) => handleChange('probability', value)}
                    min={1}
                    max={99}
                    step={1}
                  />
                </>
              ) : null}
            </VStack>

            <VStack w={'full'} flex='0.8' h='full'>
              {!isAmm && (
                <HStack w='full' spacing='6' alignItems='start' justifyContent='start'>
                  <VStack>
                    <FormField label='Fee'>
                      <HStack gap='8px'>
                        <Box
                          w='16px'
                          h='16px'
                          borderColor='grey.500'
                          border='1px solid'
                          borderRadius='2px'
                          cursor='pointer'
                          bg={formData.marketFee ? 'grey.800' : 'unset'}
                          onClick={() => {
                            handleChange('marketFee', !formData.marketFee)
                          }}
                        />
                        <Text {...paragraphRegular}>Market takes fees</Text>
                      </HStack>
                    </FormField>
                  </VStack>
                </HStack>
              )}
              <HStack w='full' spacing='6' alignItems='start' justifyContent='start'>
                <VStack>
                  <FormField label='Is Bannered'>
                    <HStack gap='8px'>
                      <Box
                        w='16px'
                        h='16px'
                        borderColor='grey.500'
                        border='1px solid'
                        borderRadius='2px'
                        cursor='pointer'
                        bg={formData.isBannered ? 'grey.800' : 'unset'}
                        onClick={() => {
                          handleChange('isBannered', !formData.isBannered)
                        }}
                      />
                      <Text {...paragraphRegular}>Add market to big banner</Text>
                    </HStack>
                  </FormField>
                </VStack>
                <VStack>
                  <AdjustableNumberInput
                    label='Priority index'
                    value={formData.priorityIndex}
                    onChange={(value) => handleChange('priorityIndex', value)}
                    min={1}
                    max={1000}
                    step={1}
                  />
                </VStack>
              </HStack>
              {!activeMarketId ? (
                <FormField label='Creator'>
                  <HStack>
                    <Select
                      value={formData.creatorId}
                      onChange={(e) => handleChange('creatorId', e.target.value)}
                    >
                      {creators?.map((creator: DraftCreator) => (
                        <option key={creator.id} value={creator.id}>
                          {creator?.name ?? ''}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                </FormField>
              ) : null}

              <FormField label='Categories'>
                <HStack w={'full'}>
                  <Box width='full'>
                    <MultiSelect
                      isMulti
                      closeMenuOnSelect={false}
                      onChange={(option) => handleChange('categories', option)}
                      value={formData.categories}
                      options={categoriesOptions}
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
                <Box position='relative' w='full'>
                  <HStack w='full' spacing={4} alignItems='flex-start'>
                    <VStack w='full' alignItems='flex-start'>
                      <Text fontSize='sm' fontWeight='medium'>
                        UTC (24h format)
                      </Text>
                      <Box w='full' h='40px'>
                        <DatePicker
                          id='utc-input'
                          selected={formData.deadline ? new Date(formData.deadline) : null}
                          onChange={(date: Date | null) => {
                            if (date) {
                              handleChange('deadline', date)
                            }
                          }}
                          minDate={new Date()}
                          showTimeSelect
                          timeIntervals={60}
                          dateFormat='dd/MM/yyyy HH:mm'
                          timeFormat='HH:mm'
                          calendarStartDay={1}
                          popperPlacement='bottom-start'
                          customInput={
                            <Input
                              cursor='pointer'
                              backgroundColor='grey.100'
                              color='grey.900'
                              _hover={{ backgroundColor: 'grey.200' }}
                              _focus={{ backgroundColor: 'gray.300', borderColor: 'gray.500' }}
                              padding='8px'
                              borderRadius='md'
                              height='40px'
                            />
                          }
                        />
                      </Box>
                    </VStack>

                    <VStack w='full' alignItems='flex-start'>
                      <Text fontSize='sm' fontWeight='medium'>
                        ET (Eastern Time)
                      </Text>
                      <Box w='full' h='40px'>
                        <DatePicker
                          id='et-input'
                          selected={toZonedTime(
                            calculateZonedTime(formData.deadline, 'Gtm/utc'),
                            'America/New_York'
                          )}
                          onChange={(date: Date | null) => {
                            if (date) {
                              const utcDate = fromZonedTime(
                                calculateZonedTime(date, 'Europe/Belgrade'),
                                'America/New_York'
                              )
                              handleChange('deadline', utcDate)
                            }
                          }}
                          minDate={new Date()}
                          showTimeSelect
                          timeIntervals={60}
                          dateFormat='dd/MM/yyyy h:mm aa'
                          calendarStartDay={1}
                          popperPlacement='bottom-start'
                          customInput={
                            <Input
                              cursor='pointer'
                              backgroundColor='grey.100'
                              color='grey.900'
                              _hover={{ backgroundColor: 'grey.200' }}
                              _focus={{ backgroundColor: 'gray.300', borderColor: 'gray.500' }}
                              padding='8px'
                              borderRadius='md'
                              height='40px'
                            />
                          }
                        />
                      </Box>
                    </VStack>
                  </HStack>

                  <Box mt={4} h='40px'>
                    <TimezoneSelect
                      value={formData.timezone}
                      onChange={(timezone: ITimezoneOption) => {
                        handleChange('timezone', timezone.value)
                      }}
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
                          minHeight: '40px',
                          height: '40px',
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          ...selectStyles.singleValue,
                        }),
                        container: (provided) => ({
                          ...provided,
                          height: '40px',
                        }),
                      }}
                    />
                  </Box>
                </Box>
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
                    isDisabled={isCreating}
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
