'use client'

import { HStack, Text, Box, useRadioGroup, useRadio, UseRadioProps } from '@chakra-ui/react'
import { FC } from 'react'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

interface RadioCardProps extends UseRadioProps {
  children: React.ReactNode
}

const RadioCard: FC<RadioCardProps> = (props) => {
  const { getInputProps, getRadioProps } = useRadio(props)
  const input = getInputProps()
  const checkbox = getRadioProps()

  return (
    <Box as='label'>
      <input {...input} />
      <Box
        {...checkbox}
        cursor='pointer'
        borderRadius='6px'
        px='12px'
        py='2px'
        _checked={{
          bg: 'grey.100',
          color: 'black',
        }}
      >
        {props.children}
      </Box>
    </Box>
  )
}

interface MarketTypeSelectorProps {
  value: string
  onChange: (value: string) => void
  isEdit?: boolean
}

export const options = ['amm', 'clob', 'group'] as const

export const MarketTypeSelector: FC<MarketTypeSelectorProps> = ({ value, onChange, isEdit }) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'marketType',
    defaultValue: value,
    onChange,
  })

  const group = getRootProps()

  return (
    <HStack maxW='1200px' w='full' justifyContent='space-between'>
      <Text {...paragraphMedium} mb={2}>
        Market type
      </Text>
      <HStack {...group} spacing={2} bg='grey.200' w='fit-content' p='2px' borderRadius='8px'>
        {(isEdit ? options.filter((option) => option === value) : options).map((option) => {
          const radio = getRadioProps({ value: option })
          return (
            <RadioCard key={option} {...radio} isDisabled={isEdit}>
              <Text {...paragraphMedium} textTransform='uppercase'>
                {option}
              </Text>
            </RadioCard>
          )
        })}
      </HStack>
    </HStack>
  )
}
