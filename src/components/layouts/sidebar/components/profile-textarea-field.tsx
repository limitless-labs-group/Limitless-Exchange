import { ChangeEventHandler } from 'react'
import { Text, Textarea } from '@chakra-ui/react'

export interface IProfileTextareaField {
  label: string
  value: string
  onChange?: ChangeEventHandler<HTMLTextAreaElement> | undefined
  placeholder?: string
}

export const ProfileTextareaField = ({
  label,
  value,
  onChange,
  placeholder,
}: IProfileTextareaField) => {
  return (
    <>
      <Text fontWeight={500} fontSize='16px'>
        {label}
      </Text>
      <Textarea
        value={value}
        onChange={onChange}
        height='56px'
        borderColor='grey.300'
        borderRadius='2px'
        padding='4px 8px 4px 8px'
        placeholder={placeholder}
        _placeholder={{ color: 'grey.500', fontWeight: 500 }}
      />
    </>
  )
}
