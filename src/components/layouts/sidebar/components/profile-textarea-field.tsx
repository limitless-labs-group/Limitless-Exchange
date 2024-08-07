import { Text, Textarea } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export interface IProfileTextareaField {
  renderIcon: () => JSX.Element
  label: string
  initialValue: string
  onChange?: (value: string | undefined) => void
  placeholder?: string
}

export const ProfileTextareaField = ({
  label,
  initialValue,
  onChange,
  placeholder,
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
      <Textarea
        value={_value ?? initialValue}
        onChange={(e) => _setValue(e.target.value)}
        placeholder={placeholder}
        height='56px'
        borderColor='grey.300'
        borderRadius='2px'
        py='4px'
        px='8px'
        _placeholder={{
          color: 'grey.500',
          fontWeight: 500,
          alignItems: 'start',
          textAlign: 'start',
        }}
      />
    </>
  )
}
