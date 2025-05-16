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
  FormLabel,
  Divider,
} from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { htmlToText } from 'html-to-text'
import { useAtom } from 'jotai'
import React, { FC, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { default as MultiSelect } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import TimezoneSelect, {
  allTimezones,
  ITimezoneOption,
  useTimezoneSelect,
} from 'react-timezone-select'
import Loader from '@/components/common/loader'
import TextEditor from '@/components/common/text-editor'
import { Toast } from '@/components/common/toast'
import { tokenLimits, selectStyles, defaultFormData } from '@/app/draft/components'
import { FormField } from '@/app/draft/components/form-field'
import { GroupForm } from '@/app/draft/components/group-form'
import { AdjustableNumberInput } from '@/app/draft/components/number-inputs'
import { MarketTypeSelector } from '@/app/draft/components/type-selector'
import {
  dailyToEpochRewards,
  epochToDailyRewards,
  useCreateMarket,
} from '@/app/draft/components/use-create-market'
import {
  defaultGroupMarkets,
  draftMarketTypeAtom,
  formDataAtom,
  groupMarketsAtom,
} from '@/atoms/draft'
import { useToast } from '@/hooks'
import { useCreateMarketModal } from '@/hooks/use-create-market-modal'
import { useLimitlessApi } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { useMarket } from '@/services/MarketsService'
import { headline, paragraphBold, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Token, SelectOption, DraftCreator, DraftMarketType } from '@/types/draft'

export const DraftMarketModal: FC = () => {
  const [formData, setFormData] = useAtom(formDataAtom)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const { supportedTokens } = useLimitlessApi()
  const toast = useToast()
  const queryClient = useQueryClient()
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
  const { id, type, marketType: modalMarketType, close, reset } = useCreateMarketModal()
  const draftMarketId = id && type === 'draft' ? id : null
  const activeMarketId = id && type === 'active' ? String(id) : null

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
        close()
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
        close()
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
        close()
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

  const submit = async () => {
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
    if (draftMarketId) return 'Save editing'
    if (activeMarketId) return 'Update active market'
    return 'Save draft'
  }

  return (
    <Flex justifyContent='center'>
      <VStack w='full' spacing={4}>
        <FormControl>
          <HStack
            w='full'
            maxW='1200px'
            mx='auto'
            gap={10}
            justifyContent='space-between'
            alignItems='stretch'
            minH='800px'
            h='full'
          >
            <VStack w='full' flex='1.2'>
              {!activeMarketId ? (
                <MarketTypeSelector
                  value={modalMarketType ?? 'amm'}
                  onChange={(value) => setMarketType(value as DraftMarketType)}
                />
              ) : null}

              <FormField label='Title'>
                <Textarea
                  resize='none'
                  rows={1}
                  overflow='hidden'
                  height='auto'
                  backgroundColor='transparent'
                  borderColor='grey.200'
                  onInput={resizeTextareaHeight}
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  maxLength={70}
                />
                <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                  <Text {...paragraphRegular}>{formData.title?.length}/70 characters</Text>
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
                    <Text {...paragraphRegular}>
                      {getPlainTextLength(formData.description)}/3000 characters
                    </Text>
                  </FormHelperText>
                </FormField>
              ) : (
                <GroupForm />
              )}
            </VStack>

            <Divider
              orientation='vertical'
              alignSelf='stretch'
              bg='grey.200'
              borderColor='grey.200'
            />

            <VStack w={'full'} flex='0.8' h='full'>
              <Flex alignItems='start' w='full' mb='24px'>
                <Text {...headline}> Attributes</Text>
              </Flex>
              {!activeMarketId ? (
                <HStack w='full' alignItems='center' spacing={4}>
                  <FormLabel mb={0} minW='80px'>
                    <Text>Creator</Text>
                  </FormLabel>
                  <Box flex={1}>
                    <Select
                      value={formData.creatorId}
                      onChange={(e) => handleChange('creatorId', e.target.value)}
                      backgroundColor='transparent'
                      borderColor='grey.200'
                    >
                      {creators?.map((creator: DraftCreator) => (
                        <option key={creator.id} value={creator.id}>
                          {creator?.name ?? ''}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </HStack>
              ) : null}

              {!activeMarketId && isAmm ? (
                <HStack w='full' alignItems='center' spacing={4}>
                  <FormLabel mb={0} minW='80px'>
                    <Text>Token</Text>
                  </FormLabel>
                  <Box flex={1}>
                    <Select
                      value={formData.token.id}
                      onChange={handleTokenSelect}
                      backgroundColor='transparent'
                      borderColor='grey.200'
                    >
                      {supportedTokens?.map((token: Token) => (
                        <option key={token.id} value={token.id} data-name={token.symbol}>
                          {token.symbol}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </HStack>
              ) : null}

              {isClob ? (
                <VStack w='full' alignItems='start' spacing={6}>
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
                      label='Rewards'
                      value={Number(epochToDailyRewards(formData.rewardsEpoch ?? 0))}
                      onChange={(value) => handleChange('rewardsEpoch', dailyToEpochRewards(value))}
                      min={0}
                      max={1000}
                      step={0.1}
                      prefix='US$'
                      // additionalInfo={
                      //   <HStack>
                      //     <Text {...paragraphBold}>Per Epoch:</Text>
                      //     <Text>
                      //       {formData.rewardsEpoch ? Number(formData?.rewardsEpoch).toFixed(5) : ''}
                      //     </Text>
                      //   </HStack>
                      // }
                    />
                  </VStack>
                </VStack>
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

              <HStack w='full' alignItems='center' spacing={4} mt={2}>
                <FormLabel mb={0} minW='80px'>
                  <Text>Categories</Text>
                </FormLabel>
                <Box flex={1}>
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
                        backgroundColor: 'transparent',
                        borderColor: 'var(--chakra-colors-grey-200)',
                      }),
                    }}
                  />
                </Box>
              </HStack>

              <HStack w='full' alignItems='center' spacing={4} mt={2}>
                <FormLabel mb={0} minW='80px'>
                  <Text>Tags</Text>
                </FormLabel>
                <Box flex={1}>
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

              <FormField label='Deadline'>
                <Box position='relative' w='full'>
                  <VStack w='full' spacing={4} alignItems='flex-start'>
                    <HStack w='full' alignItems='center' spacing={4}>
                      <FormLabel mb={0} minW='80px'>
                        <Text>UTC</Text>
                      </FormLabel>
                      <Flex flex={1} h='40px' justifyContent='end'>
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
                          dateFormat='Pp'
                          calendarStartDay={1}
                          popperPlacement='bottom-start'
                          customInput={
                            <Input
                              cursor='pointer'
                              backgroundColor='transparent'
                              color='grey.900'
                              borderColor='grey.200'
                              _hover={{ borderColor: 'grey.300' }}
                              _focus={{ borderColor: 'grey.400' }}
                              padding='8px'
                              borderRadius='md'
                              height='40px'
                            />
                          }
                        />
                      </Flex>
                    </HStack>

                    <HStack w='full' alignItems='center' spacing={4}>
                      <FormLabel mb={0} minW='80px'>
                        <Text>ET</Text>
                      </FormLabel>
                      <Flex flex={1} h='40px' justifyContent='end'>
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
                          dateFormat='Pp'
                          calendarStartDay={1}
                          popperPlacement='bottom-start'
                          customInput={
                            <Input
                              cursor='pointer'
                              backgroundColor='transparent'
                              color='grey.900'
                              borderColor='grey.200'
                              _hover={{ borderColor: 'grey.300' }}
                              _focus={{ borderColor: 'grey.400' }}
                              padding='8px'
                              borderRadius='md'
                              height='40px'
                            />
                          }
                        />
                      </Flex>
                    </HStack>
                  </VStack>

                  <HStack w='full' alignItems='center' spacing={4} mt={4}>
                    <FormLabel mb={0} minW='80px'>
                      <Text>Timezone</Text>
                    </FormLabel>
                    <Flex flex={1} h='40px' justifyContent='end'>
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
                            backgroundColor: 'transparent',
                            borderColor: 'var(--chakra-colors-grey-200)',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            ...selectStyles.singleValue,
                          }),
                          container: (provided) => ({
                            ...provided,
                            height: '40px',
                            width: '100%',
                          }),
                        }}
                      />
                    </Flex>
                  </HStack>
                </Box>

                <HStack w='full' alignItems='center' spacing={4} mt={4}>
                  <FormLabel mb={0} minW='80px'>
                    <Text>Is Bannered</Text>
                  </FormLabel>
                  <Flex flex={1} justifyContent='end'>
                    <HStack gap='8px'>
                      <Box
                        w='16px'
                        h='16px'
                        borderColor='grey.200'
                        border='1px solid'
                        borderRadius='2px'
                        cursor='pointer'
                        bg={formData.isBannered ? 'grey.800' : 'transparent'}
                        onClick={() => {
                          handleChange('isBannered', !formData.isBannered)
                        }}
                      />
                      <Text {...paragraphRegular}>Add market to big banner</Text>
                    </HStack>
                  </Flex>
                </HStack>
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
              </FormField>

              {/* <ButtonGroup spacing='6' mt={5} w='full'> */}
              {/*   {isCreating ? ( */}
              {/*     <Flex width='full' justifyContent='center' alignItems='center'> */}
              {/*       <Spinner /> */}
              {/*     </Flex> */}
              {/*   ) : ( */}
              {/*     <Button */}
              {/*       colorScheme='green' */}
              {/*       w='full' */}
              {/*       height='52px' */}
              {/*       onClick={submit} */}
              {/*       isDisabled={isCreating} */}
              {/*     > */}
              {/*       {getButtonText()} */}
              {/*     </Button> */}
              {/*   )} */}
              {/* </ButtonGroup> */}
            </VStack>
          </HStack>
        </FormControl>
        <Divider />
        <HStack w='full' justifyContent='space-between'>
          <Button height='32px' px='12px' variant='outlined'>
            Review by AI
          </Button>
          <HStack>
            <Button height='32px' px='12px' variant='outlined'>
              Cancel
            </Button>
            {isCreating ? (
              <Flex width='full' justifyContent='center' alignItems='center'>
                <Loader />
              </Flex>
            ) : (
              <Button
                height='32px'
                px='12px'
                variant='contained'
                onClick={submit}
                isDisabled={isCreating}
              >
                {getButtonText()}
              </Button>
            )}
          </HStack>
        </HStack>
      </VStack>
    </Flex>
  )
}
