'use client'

import { Input, MainLayout } from '@/components'
import {
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Textarea,
  FormControl,
  FormHelperText,
  FormLabel,
  Box,
  Button,
  ButtonGroup,
  Image,
  Select,
  NumberInput,
  NumberInputField,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react'
import { borderRadius, colors } from '@/styles'
import { CgInfo } from 'react-icons/cg'
import { SingleDatepicker } from 'chakra-dayzed-datepicker'
import React, { MutableRefObject, useRef, useState } from 'react'
import CreatableSelect from 'react-select/creatable'

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
  onchain: {
    min: 390000,
    max: 3900000,
    step: 10000,
  },
  WETH: {
    min: 0.1,
    max: 3,
    step: 0.1,
  },
}

const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
  <Box mt={4}>
    <FormLabel>
      <strong>{label}</strong>
    </FormLabel>
    {children}
  </Box>
)

const CreateOwnMarketPage = () => {
  const [date, setDate] = useState(new Date())
  const [title, setTitle] = useState('')
  const [token, setToken] = useState('WETH')
  const [description, setDescription] = useState('')
  const [liquidity, setLiquidity] = React.useState(tokenLimits['WETH'].min)
  const [probability, setProbability] = React.useState(50)
  const handleLiquidityChange = (value: number) => setLiquidity(value)
  const handleProbabilityChange = (value: number) => setProbability(value)
  const handleTokenSelect = (option: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedToken = option.target.value
    setToken(selectedToken)
    setLiquidity(tokenLimits[selectedToken].min)
  }

  // Todo temp implementation before logic is adjusted
  const inputRef: MutableRefObject<any> = useRef()
  const handleFileUploaded = () => {
    inputRef.current.click()
  }

  return (
    <MainLayout>
      <Flex justifyContent={'center'}>
        <VStack w='468px' spacing={4}>
          <Heading>Create Market</Heading>
          <FormControl>
            <FormField label='Title'>
              <Input
                placeholder='Bitcoin ATH in May 2024?'
                onChange={(e) => setTitle(e.target.value)}
                maxLength={70}
              />
              <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                {title?.length}/70 characters
              </FormHelperText>
              <FormHelperText
                h='fit-content'
                p={4}
                bg='bgLight'
                border={`1px solid ${colors.border}`}
                borderRadius={borderRadius}
                textAlign='start'
                color='#747675'
                display='flex'
              >
                <Box display='inline-flex' flexShrink={0}>
                  <CgInfo />
                </Box>
                <Box flex={1} ml={2}>
                  Imagine people only have a second to understand your market. It&apos;s important
                  to create a clear and concise title so that everyone in the community can
                  understand it, or at least become interested.
                </Box>
              </FormHelperText>
            </FormField>

            <FormField label='Description'>
              <Textarea
                placeholder='Bitcoin is the first decentralized cryptocurrency. Nodes in the peer-to-peer bitcoin network verify transactions through cryptography and record them in a public distributed ledger, called a blockchain, without central oversig.'
                resize='none'
                rows={5}
                overflow='hidden'
                maxLength={320}
                onChange={(e) => setDescription(e.target.value)}
              />
              <FormHelperText textAlign='end' style={{ fontSize: '10px', color: 'spacegray' }}>
                {description?.length}/320 characters
              </FormHelperText>
            </FormField>

            <FormField label='Token'>
              <HStack>
                <Select onChange={handleTokenSelect}>
                  <option value='onchain'>onchain</option>
                  <option value='WETH' selected={true}>
                    WETH
                  </option>
                </Select>
              </HStack>
            </FormField>

            <FormField label={`${token} Liquidity`}>
              <HStack>
                <NumberInput maxW='120px' mr='2rem' value={liquidity}>
                  <NumberInputField disabled w={'120px'} />
                </NumberInput>
                <Slider
                  flex='1'
                  focusThumbOnChange={false}
                  value={liquidity}
                  onChange={handleLiquidityChange}
                  min={tokenLimits[token].min}
                  max={tokenLimits[token].max}
                  step={tokenLimits[token].step}
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
                <Select placeholder='Select creator'>
                  <option value='@rev'>@rev</option>
                  <option value='Dima Horshkov'>Dima Horshkov</option>
                  <option value='CJ'>CJ</option>
                </Select>
              </HStack>
            </FormField>

            <FormField label='Tags'>
              <HStack w={'full'}>
                <Box width='full'>
                  <CreatableSelect isMulti />
                </Box>
              </HStack>
            </FormField>

            <FormField label='Deadline'>
              {/*// Todo move to a separate component?*/}
              <SingleDatepicker
                id='input'
                triggerVariant='default'
                propsConfigs={{
                  inputProps: {
                    size: 'md',
                    width: 'full',
                    isReadOnly: true,
                  },
                  triggerBtnProps: {
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid #E2E8F0',
                    color: '#0F172A',
                    justifyContent: 'space-between',
                    rightIcon: (
                      <Image
                        src={'/assets/images/calendar.svg'}
                        h={'24px'}
                        w={'24px'}
                        alt='calendar'
                      />
                    ),
                  },
                  popoverCompProps: {
                    popoverContentProps: {
                      width: '360px',
                    },
                  },
                  dayOfMonthBtnProps: {
                    todayBtnProps: {
                      background: 'teal.200',
                    },
                  },
                }}
                name='date-input'
                date={date}
                usePortal={true}
                onDateChange={setDate}
                minDate={new Date()}
              />
            </FormField>

            <FormField label='Picture'>
              <HStack>
                <input
                  type='file'
                  id='fileUpload'
                  name='fileUpload'
                  style={{ display: 'none' }}
                  ref={inputRef}
                  accept={'image/png, image/jpeg'}
                />
                <Button colorScheme='gray' onClick={handleFileUploaded}>
                  Choose file
                </Button>
                <Text>No file chosen.</Text>
              </HStack>
            </FormField>

            <FormField label='OG'>
              <HStack>
                <input
                  type='file'
                  id='fileUpload'
                  name='fileUpload'
                  style={{ display: 'none' }}
                  ref={inputRef}
                  accept={'image/png, image/jpeg'}
                />
                <Button colorScheme='gray' onClick={handleFileUploaded}>
                  Choose file
                </Button>
                <Text>No file chosen.</Text>
              </HStack>
            </FormField>

            <ButtonGroup spacing='6' mt={5}>
              <Button variant='outline' width='222px' disabled>
                Cancel
              </Button>
              <Button colorScheme='blue' width='222px' height='52px'>
                Create
              </Button>
            </ButtonGroup>
          </FormControl>
        </VStack>
      </Flex>
    </MainLayout>
  )
}

export default CreateOwnMarketPage
