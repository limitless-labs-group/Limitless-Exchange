'use client'

import { HStack, Text, Box, useRadioGroup, useRadio, UseRadioProps } from '@chakra-ui/react'
import { FC } from 'react'

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
        borderWidth='1px'
        borderRadius='md'
        boxShadow='md'
        _checked={{
          bg: 'blue.400',
          color: 'white',
          borderColor: 'blue.400',
        }}
        px='6px'
        py='4px'
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
    <Box maxW='1200px' w='full' justifySelf='center'>
      <Text mb={2}>Market type</Text>
      <HStack {...group} spacing={2}>
        {(isEdit ? options.filter((option) => option === value) : options).map((option) => {
          const radio = getRadioProps({ value: option })
          return (
            <RadioCard key={option} {...radio} isDisabled={isEdit}>
              <Text fontSize='10px'>{option}</Text>
            </RadioCard>
          )
        })}
      </HStack>
    </Box>
  )
}
