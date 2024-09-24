'use client'

import { MainLayout } from '@/components'
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
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
import React, { MutableRefObject, useRef, useState } from 'react'
import CreatableSelect from 'react-select/creatable'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks'
import { useCategories, useLimitlessApi } from '@/services'
import { Toast } from '@/components/common/toast'
import { Input } from '@/components/common/input'
import { Category } from '@/types'
import { OgImageGenerator } from '@/app/create/components'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import TimezoneSelect, {
  allTimezones,
  ITimezoneOption,
  useTimezoneSelect,
} from 'react-timezone-select'

interface FormFieldProps {
  label: string
  children: React.ReactNode
}

interface TokenLimit {
  min: number
  max: number
  step: number
}

interface TokenLimits {
  [key: string]: TokenLimit
}

const tokenLimits: TokenLimits = {
  HIGHER: {
    min: 25000,
    max: 390000,
    step: 1000,
  },
  MFER: {
    min: 12500,
    max: 390000,
    step: 1000,
  },
  DEGEN: {
    min: 39000,
    max: 390000,
    step: 1000,
  },
  ONCHAIN: {
    min: 390000,
    max: 3900000,
    step: 10000,
  },
  WETH: {
    min: 0.1,
    max: 5,
    step: 0.1,
  },
  USDC: {
    min: 300,
    max: 30000,
    step: 100,
  },
  VITA: {
    min: 150,
    max: 3000,
    step: 25,
  },
  GHST: {
    min: 150,
    max: 3000,
    step: 10,
  },
  BETS: {
    min: 835000,
    max: 8350000,
    step: 5000,
  },
  cbBTC: {
    min: 0.1,
    max: 5,
    step: 0.01,
  },
}

interface TagOption {
  id: string
  label: string
  value: string
}

interface Creator {
  id: string
  name: string
}

interface Token {
  id: number
  symbol: string
}

const defaultTokenSymbol = 'WETH'
const defaultProbability = 50
const defaultCreatorId = '1'
const defaultCategoryId = '1'

const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
  <Box mt={4}>
    <FormLabel>
      <strong>{label}</strong>
    </FormLabel>
    {children}
  </Box>
)

const CreateOwnMarketPage = () => {
  const { parseTimezone } = useTimezoneSelect({
    labelStyle: 'original',
    timezones: allTimezones,
  })
  const [formData, setFormData] = useState<FormData>(new FormData())

  const [deadline, setDeadline] = useState<Date>(new Date())
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [title, setTitle] = useState<string>('')
  const [token, setToken] = useState<Token>({ symbol: defaultTokenSymbol, id: 1 })
  const [description, setDescription] = useState<string>('')
  const [liquidity, setLiquidity] = useState<number>(tokenLimits[defaultTokenSymbol].min)
  const [probability, setProbability] = useState<number>(defaultProbability)
  const [tag, setTag] = useState<TagOption[]>([])
  const [creatorId, setCreatorId] = useState<string>(defaultCreatorId)
  const [categoryId, setCategoryId] = useState<string>(defaultCategoryId)
  const [marketLogo, setMarketLogo] = useState<File | undefined>()
  const [ogLogo, setOgLogo] = useState<File | undefined>()

  const [isCreating, setIsCreating] = useState<boolean>(false)

  const queryClient = useQueryClient()

  const { supportedTokens } = useLimitlessApi()

  const handleLiquidityChange = (value: number) => setLiquidity(value)

  const handleProbabilityChange = (value: number) => setProbability(value)

  const handleTokenSelect = (option: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTokenId = +option.target.value
    const selectedTokenSymbol =
      option.target.selectedOptions[0].getAttribute('data-name') ?? defaultTokenSymbol
    setToken({ symbol: selectedTokenSymbol, id: selectedTokenId })
    setLiquidity(tokenLimits[selectedTokenSymbol].min)
  }

  const toast = useToast()

  const ogLogoRef: MutableRefObject<any> = useRef()
  const marketLogoRef: MutableRefObject<any> = useRef()

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

  const handleActiveTags = (selectedOptions: TagOption[]) => {
    setTag(selectedOptions)
  }

  const createMarket = async () => {
    if (!title || !description || !creatorId || !marketLogo || !ogLogo || !tag) {
      const id = toast({
        render: () => (
          <Toast
            title={'Title, Description, Creator, Market Logo, Og Logo, Tags are required!'}
            id={id}
          />
        ),
      })
      return
    }

    const differenceInOffset =
      (parseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone).offset || 1) -
      (parseTimezone(timezone)?.offset || 1)

    const zonedTime = new Date(deadline).getTime() + differenceInOffset * 60 * 60 * 1000

    formData?.set('title', title)
    formData?.set('description', description)
    formData?.set('tokenId', token.id.toString())
    formData?.set('liquidity', liquidity.toString())
    formData?.set('initialYesProbability', (probability / 100).toString())
    // @ts-ignore
    formData?.set('deadline', zonedTime)
    formData?.set('creatorId', creatorId)
    formData?.set('categoryId', categoryId)
    formData?.set('imageFile', marketLogo)
    formData?.set('ogFile', ogLogo)
    formData?.set('tagIds', tag.map((tag) => tag.id).join(','))

    const id = toast({
      render: () => (
        <Toast title={'Request for market creation has been registered successfully.'} id={id} />
      ),
    })

    setIsCreating(true)

    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets/admin`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        if (res.status === 201) {
          const newTab = window.open('', '_blank')
          if (newTab) {
            newTab.location.href = res.data.multisigTxLink
          } else {
            // Fallback if the browser blocks the popup
            window.location.href = res.data.multisigTxLink
          }
        }
      })
      .catch((res) => {
        if (res?.response?.status === 413) {
          const id = toast({
            render: () => <Toast title={`Error: Payload Too Large, max 1MB per file`} id={id} />,
          })
        } else {
          const id = toast({
            render: () => <Toast title={`Error: ${res.message}`} id={id} />,
          })
        }
      })
      .finally(() => {
        setIsCreating(false)
      })
  }

  return (
    <MainLayout>
      <Flex justifyContent={'center'}>
        <VStack w='468px' spacing={4}>
          <Text>Create Market</Text>
          <FormControl>
            <FormField label='OG Preview'>
              <HStack>
                <OgImageGenerator
                  title={title}
                  category={
                    categories?.find((category) => category.id === +categoryId)?.name ?? 'Unknown'
                  }
                  onBlobGenerated={(blob) => {
                    console.log('Blob generated', blob)
                    const _ogLogo = new File([blob], 'og.png', {
                      type: blob.type,
                      lastModified: Date.now(),
                    })
                    console.log('Blob transformed to File', _ogLogo)

                    setOgLogo(_ogLogo)
                  }}
                  generateBlob={isGeneratingOgImage}
                />
              </HStack>
            </FormField>

            <FormField label='Title'>
              <Input
                placeholder='Bitcoin ATH in May 2024?'
                onChange={(e) => setTitle(e.target.value)}
                maxLength={70}
                onBlur={() => generateOgImage()}
              />
              <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                {title?.length}/70 characters
              </FormHelperText>
              {/*<FormHelperText*/}
              {/*  h='fit-content'*/}
              {/*  p={4}*/}
              {/*  bg='bgLight'*/}
              {/*  border={`1px solid ${colors.border}`}*/}
              {/*  borderRadius={borderRadius}*/}
              {/*  textAlign='start'*/}
              {/*  color='#747675'*/}
              {/*  display='flex'*/}
              {/*>*/}
              {/*  <Box display='inline-flex' flexShrink={0}>*/}
              {/*    <CgInfo />*/}
              {/*  </Box>*/}
              {/*  */}
              {/*  <Box flex={1} ml={2}>*/}
              {/*    Imagine people only have a second to understand your market. It&apos;s important*/}
              {/*    to create a clear and concise title so that everyone in the community can*/}
              {/*    understand it, or at least become interested.*/}
              {/*  </Box>*/}
              {/*</FormHelperText>*/}
            </FormField>

            <FormField label='Description'>
              <Textarea
                placeholder='Bitcoin is the first decentralized cryptocurrency. Nodes in the peer-to-peer bitcoin network verify transactions through cryptography and record them in a public distributed ledger, called a blockchain, without central oversig.'
                resize='none'
                rows={7}
                overflow='hidden'
                maxLength={1500}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => generateOgImage()}
              />
              <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                {description?.length}/1500 characters
              </FormHelperText>
            </FormField>

            <FormField label='Token'>
              <HStack>
                <Select onChange={handleTokenSelect}>
                  {supportedTokens?.map((token: Token) => (
                    <option key={token.id} value={token.id} data-name={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </Select>
              </HStack>
            </FormField>

            <FormField label={`${token.symbol} Liquidity`}>
              <HStack>
                <NumberInput maxW='120px' mr='2rem' value={liquidity}>
                  <NumberInputField disabled w={'120px'} />
                </NumberInput>
                <Slider
                  flex='1'
                  focusThumbOnChange={false}
                  value={liquidity}
                  onChange={handleLiquidityChange}
                  min={tokenLimits[token.symbol].min}
                  max={tokenLimits[token.symbol].max}
                  step={tokenLimits[token.symbol].step}
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
                <NumberInput maxW='120px' mr='2rem' value={probability}>
                  <NumberInputField disabled w={'120px'} />
                </NumberInput>
                <Slider
                  flex='1'
                  focusThumbOnChange={false}
                  value={probability}
                  onChange={handleProbabilityChange}
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

            <FormField label='Creator'>
              <HStack>
                <Select onChange={(e) => setCreatorId(e?.target?.value)}>
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
                <Select onChange={(e) => setCategoryId(e?.target?.value)}>
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
                    onChange={handleActiveTags}
                    options={tagOptions}
                  />
                </Box>
              </HStack>
            </FormField>

            <FormField label='Deadline'>
              {/*// Todo move to a separate component?*/}
              <DatePicker
                id='input'
                selected={deadline}
                onChange={(date) => {
                  if (date) {
                    setDeadline(new Date(date.getTime()))
                  }
                }}
                minDate={new Date()}
                showTimeSelect
                dateFormat='Pp'
              />
              <TimezoneSelect
                value={timezone}
                onChange={(timezone: ITimezoneOption) => {
                  setTimezone(timezone.value)
                }}
              />
              {/*<SingleDatepicker*/}
              {/*  id='input'*/}
              {/*  triggerVariant='default'*/}
              {/*  propsConfigs={{*/}
              {/*    inputProps: {*/}
              {/*      size: 'md',*/}
              {/*      width: 'full',*/}
              {/*      isReadOnly: true,*/}
              {/*    },*/}
              {/*    triggerBtnProps: {*/}
              {/*      width: '100%',*/}
              {/*      background: 'transparent',*/}
              {/*      border: '1px solid #E2E8F0',*/}
              {/*      color: '#0F172A',*/}
              {/*      justifyContent: 'space-between',*/}
              {/*      rightIcon: (*/}
              {/*        <Image*/}
              {/*          src={'/assets/images/calendar.svg'}*/}
              {/*          h={'24px'}*/}
              {/*          w={'24px'}*/}
              {/*          alt='calendar'*/}
              {/*        />*/}
              {/*      ),*/}
              {/*    },*/}
              {/*    popoverCompProps: {*/}
              {/*      popoverContentProps: {*/}
              {/*        width: '360px',*/}
              {/*      },*/}
              {/*    },*/}
              {/*    dayOfMonthBtnProps: {*/}
              {/*      todayBtnProps: {*/}
              {/*        background: 'teal.200',*/}
              {/*      },*/}
              {/*    },*/}
              {/*  }}*/}
              {/*  name='date-input'*/}
              {/*  date={deadline}*/}
              {/*  usePortal={true}*/}
              {/*  onDateChange={(date) => {*/}
              {/*    console.log(date)*/}
              {/*    setDeadline(new Date(date.getTime() - date.getTimezoneOffset() * 60000)) // fixed the discrepancy between local date and ISO date*/}
              {/*  }}*/}
              {/*  minDate={new Date()}*/}
              {/*/>*/}
            </FormField>

            <FormField label='Picture'>
              <HStack>
                <input
                  type='file'
                  id='marketLogoUpload'
                  name='marketLogoUpload'
                  style={{ display: 'none' }}
                  ref={ogLogoRef}
                  accept={'image/png, image/jpeg'}
                  onChange={(e) => setMarketLogo(e?.target?.files?.[0])}
                />
                <Button colorScheme='gray' onClick={() => ogLogoRef.current.click()}>
                  Choose file
                </Button>
                <Text>{marketLogo?.name ?? 'No file chosen.'}</Text>
              </HStack>
            </FormField>

            <ButtonGroup spacing='6' mt={5}>
              <Button variant='outline' width='222px' disabled>
                Cancel
              </Button>
              {isCreating ? (
                <Box width='222px' display='flex' justifyContent='center' alignItems='center'>
                  <Spinner />
                </Box>
              ) : (
                <Button colorScheme='blue' width='222px' height='52px' onClick={createMarket}>
                  Create
                </Button>
              )}
            </ButtonGroup>
          </FormControl>
        </VStack>
      </Flex>
    </MainLayout>
  )
}

export default CreateOwnMarketPage
