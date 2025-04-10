import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react'
import { ReactNode, RefObject } from 'react'
import CloseIcon from '@/resources/icons/close-icon.svg'

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
  return (
    <InputGroup w='716px' h='56px'>
      {before ? <InputLeftElement pointerEvents='none'>{before}</InputLeftElement> : null}

      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus
      />

      <InputRightElement display='flex' gap='2' alignItems='center'>
        {after ? after : null}
        {value ? (
          <IconButton
            aria-label='Clear'
            size='xs'
            icon={<CloseIcon width={16} height={16} />}
            onClick={() => onChange('')}
            variant='ghost'
          />
        ) : null}
      </InputRightElement>
    </InputGroup>
  )
}
