import { InputGroup, InputLeftElement, Text, Textarea } from '@chakra-ui/react'
import { FocusEventHandler, useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'

export interface IProfileTextareaField {
  renderIcon: () => JSX.Element
  label: string
  initialValue: string
  onChange?: (value: string | undefined) => void
  onBlur?: FocusEventHandler<HTMLTextAreaElement> | undefined
  placeholder?: string
}

export const ProfileTextareaField = ({
  initialValue,
  placeholder,
  renderIcon,
  onChange,
  onBlur,
  label,
}: IProfileTextareaField) => {
  const [_value, _setValue] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (_value) {
      onChange?.(_value)
    }
  }, [_value])

  return (
    <>
      <Text fontWeight={500} fontSize='16px'>
        {label}
      </Text>
      <InputGroup>
        <InputLeftElement
          // pointerEvents='none'
          height='24px'
          width='36px'
          borderColor='grey.300'
          borderRadius='2px'
          py={isMobile ? '15px' : '4px'}
          pt={isMobile ? '20px' : '10px'}
          // bg='red.100'
          // pr={isMobile ? '8px' : '4px'}
          // pl='8px'
        >
          {renderIcon()}
        </InputLeftElement>
        <Textarea
          value={_value ?? initialValue}
          onChange={(e) => _setValue(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          height='56px'
          borderColor='grey.300'
          borderRadius='2px'
          py={isMobile ? '8px' : '4px'}
          px={isMobile ? '12px' : '8px'}
          _placeholder={{
            color: 'grey.400',
            fontWeight: 500,
            alignItems: 'start',
            textAlign: 'start',
          }}
          pl={'30px'}
          resize='none'
          color='grey.800'
          outline='none'
          _hover={{ borderColor: 'grey.500' }}
          _focus={{ color: 'grey.800', borderColor: 'grey.800', bg: 'grey.100' }}
          _focusVisible={{ color: 'grey.800', borderColor: 'grey.800', bg: 'grey.100' }}
        />
      </InputGroup>
    </>
  )
}
