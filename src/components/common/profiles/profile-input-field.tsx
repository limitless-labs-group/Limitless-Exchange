import { Input, InputGroup, InputLeftAddon, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'

export interface IProfileInputField {
  renderIcon: () => JSX.Element
  label: string
  initialValue: string
  onChange?: (value: string) => void
  hint?: string
  placeholder?: string
}

export const ProfileInputField = ({
  renderIcon,
  label,
  initialValue,
  onChange,
  hint,
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
        <InputLeftAddon
          height='24px'
          borderColor='grey.300'
          borderRadius='2px'
          borderRight='none'
          py={isMobile ? '15px' : '4px'}
          pr={isMobile ? '8px' : '4px'}
          // py='4px'
          // pr='4px'
          pl='8px'
        >
          {renderIcon()}
        </InputLeftAddon>
        <Input
          value={_value ?? initialValue}
          onChange={(e) => _setValue(e.target.value)}
          placeholder={placeholder}
          height='24px'
          borderColor='grey.300'
          borderRadius='2px'
          borderLeft='none'
          py={isMobile ? '15px' : '4px'}
          pr={isMobile ? '12px' : '8px'}
          pl='0px'
          _placeholder={{ color: 'grey.500', fontWeight: 500 }}
        />
      </InputGroup>

      <Text fontWeight={500} fontSize='16px' color='grey.500'>
        {hint}
      </Text>
    </>
  )
}
