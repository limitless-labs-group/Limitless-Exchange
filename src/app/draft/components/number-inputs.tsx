import { VStack, Flex, Box, NumberInput, NumberInputField } from '@chakra-ui/react'
import { FC } from 'react'
import { FormField } from './form-field'

interface AdjustableNumberInputProps {
  label: string
  value: number | undefined
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  width?: string
  additionalInfo?: React.ReactNode
}

export const AdjustableNumberInput: FC<AdjustableNumberInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  prefix,
  width = '120px',
  additionalInfo,
}) => {
  return (
    <FormField label={label}>
      <VStack alignItems='flex-start'>
        <Flex position='relative' alignItems='center' maxW={width}>
          {prefix && (
            <Box
              position='absolute'
              left='8px'
              zIndex='1'
              pointerEvents='none'
              color='gray.500'
              bg='gray.200'
            >
              {prefix}
            </Box>
          )}
          <NumberInput
            value={value}
            onChange={(value) => onChange(Number(value))}
            min={min}
            max={max}
            step={step}
            w='100%'
          >
            <NumberInputField
              type='number'
              min={min.toString()}
              w={width}
              pl={prefix ? '40px' : undefined}
            />
          </NumberInput>
        </Flex>
        {additionalInfo}
      </VStack>
    </FormField>
  )
}
