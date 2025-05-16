import { Flex, Box, NumberInput, NumberInputField, HStack, FormLabel, Text } from '@chakra-ui/react'
import { FC } from 'react'
import { paragraphBold, paragraphRegular } from '@/styles/fonts/fonts.styles'

interface AdjustableNumberInputProps {
  label?: string
  value: number | undefined
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  width?: string
  additionalInfo?: React.ReactNode
  hideLabel?: boolean
  compact?: boolean
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
  hideLabel = false,
  compact = false,
}) => {
  if (compact) {
    return (
      <HStack alignItems='center' spacing={1} w='auto'>
        {label && (
          <FormLabel mb={0} w='auto' mr='2px' whiteSpace='nowrap'>
            <Text {...paragraphRegular}>{label}:</Text>
          </FormLabel>
        )}
        <Flex position='relative' alignItems='center' w='auto'>
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
            w='auto'
          >
            <NumberInputField
              type='number'
              w={width}
              min={min.toString()}
              p='5px'
              pl={prefix ? '40px' : undefined}
            />
          </NumberInput>
        </Flex>
        {additionalInfo}
      </HStack>
    )
  }
  if (hideLabel) {
    return (
      <HStack alignItems='flex-start'>
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
      </HStack>
    )
  }

  return (
    <HStack w='full' alignItems='center' spacing={4} mt={2}>
      <FormLabel mb={0} minW='80px'>
        <Text {...paragraphBold}>{label}</Text>
      </FormLabel>
      <Box flex={1}>
        <HStack alignItems='flex-start'>
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
        </HStack>
      </Box>
    </HStack>
  )
}
