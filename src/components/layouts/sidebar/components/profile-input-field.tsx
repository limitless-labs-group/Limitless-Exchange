import { ChangeEventHandler } from 'react'
import { Input, Text } from '@chakra-ui/react'

export interface IProfileInputField {
  label: string
  value: string
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined
  hint?: string
  placeholder?: string
}

export const ProfileInputField = ({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: IProfileInputField) => {
  return (
    <>
      <Text fontWeight={500} fontSize='16px'>
        {label}
      </Text>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        height='24px'
        borderColor='grey.300'
        borderRadius='2px'
        padding='4px 8px 4px 8px'
        _placeholder={{ color: 'grey.500', fontWeight: 500 }}
      />
      <Text fontWeight={500} fontSize='16px' color='grey.500'>
        {hint}
      </Text>
    </>
  )
}
