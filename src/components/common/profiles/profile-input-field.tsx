import { Input, InputGroup, InputLeftElement, Text } from '@chakra-ui/react'
import { KeyboardEventHandler, useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'

export interface IProfileInputField {
  pattern?: string | undefined
  renderIcon: () => JSX.Element
  label: string
  initialValue: string
  isInvalid?: boolean
  onChange?: (value: string) => void
  onBlur?: () => void
  onKeyDown?: KeyboardEventHandler<HTMLInputElement> | undefined
  hint?: string
  invalidText?: string
  placeholder?: string
}

export const ProfileInputField = ({
  pattern,
  renderIcon,
  label,
  initialValue,
  isInvalid,
  onChange,
  onBlur,
  onKeyDown,
  hint,
  invalidText,
  placeholder,
}: IProfileInputField) => {
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
          // bg='red.100'
          // pr={isMobile ? '8px' : '4px'}
          // pl='8px'
        >
          {renderIcon()}
        </InputLeftElement>
        <Input
          pattern={pattern}
          value={_value ?? initialValue}
          onChange={(e) => _setValue(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          isInvalid={isInvalid}
          placeholder={placeholder}
          height='24px'
          borderColor='grey.300'
          borderRadius='2px'
          py={isMobile ? '15px' : '4px'}
          pr={isMobile ? '12px' : '8px'}
          pl={'28px'}
          color='grey.800'
          outline='none'
          _placeholder={{ color: 'grey.400', fontWeight: 500 }}
          _hover={{ color: 'grey.500', borderColor: 'grey.500' }}
          _focus={{ color: 'grey.800', borderColor: 'grey.800', bg: 'grey.100' }}
          _focusVisible={{ color: 'grey.800', borderColor: 'grey.800', bg: 'grey.100' }}
        />
      </InputGroup>

      {!isInvalid ? (
        <Text fontWeight={500} fontSize='16px' color='grey.500'>
          {hint}
        </Text>
      ) : (
        <Text fontWeight={500} fontSize='16px' color='red'>
          {invalidText}
        </Text>
      )}
    </>
  )
}
