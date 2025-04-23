import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'
import { ReactNode, RefObject } from 'react'
import CloseIcon from '@/resources/icons/close-icon.svg'
import { ChangeEvent, useAmplitude } from '@/services'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string
  before?: ReactNode
  after?: ReactNode
  inputRef?: RefObject<HTMLInputElement>
}

export const SearchInput = ({
  value,
  onChange,
  onKeyDown,
  placeholder = 'Search...',
  before,
  after,
  inputRef,
}: SearchInputProps) => {
  const { trackChanged } = useAmplitude()
  return (
    <InputGroup w='full'>
      {before ? (
        <InputLeftElement h='100%' pointerEvents='none'>
          {before}
        </InputLeftElement>
      ) : null}

      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus
        h='56px'
        alignItems='center'
        bg='grey.100'
        borderRadius='8px'
        borderColor='grey.200'
        _placeholder={{ color: 'grey.500' }}
        _focus={{
          borderColor: 'grey.800',
        }}
      />

      <InputRightElement
        w='auto'
        h='100%'
        pr='16px'
        justifyContent='end'
        display='flex'
        gap='2'
        alignItems='center'
      >
        {after ? after : null}
        {value ? (
          <IconButton
            aria-label='Clear'
            size='xs'
            icon={<CloseIcon width={16} height={16} color='grey.500' />}
            onClick={() => {
              onChange('')
              trackChanged(ChangeEvent.SearchInputCleared)
            }}
            variant='ghost'
          />
        ) : null}
      </InputRightElement>
    </InputGroup>
  )
}
