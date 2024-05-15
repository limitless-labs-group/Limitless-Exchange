import React, { useEffect, useState } from 'react'
import {
  Text,
  HStack,
  Image,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  useDisclosure,
} from '@chakra-ui/react'
import { LuListFilter } from 'react-icons/lu'
import { collateralTokensArray } from '@/constants'
import { v4 as uuidv4 } from 'uuid'
import TextButton from '@/components/common/buttons/TextButton'
import { colors } from '@/styles'
import { Token } from '@/types'
import { Button } from '@/components/common/buttons/Button'
import { FaXmark } from 'react-icons/fa6'

type TokenFilterProps = {
  onChange: (tokens: Token[]) => void
}

export default function TokenFilter({ onChange }: TokenFilterProps) {
  const { onOpen, onClose, isOpen } = useDisclosure()

  const [selectedFilterTokens, setSelectedFilterTokens] = useState<Token[]>([])

  const handleFilterItemClicked = (token: Token) => {
    if (selectedFilterTokens.find((_token) => _token.symbol == token.symbol)) {
      setSelectedFilterTokens(
        selectedFilterTokens.filter((_token) => _token.symbol != token.symbol)
      )
    } else {
      setSelectedFilterTokens([...selectedFilterTokens, token])
    }
    onClose()
  }

  useEffect(() => {
    onChange(selectedFilterTokens)
  }, [selectedFilterTokens])

  return (
    <HStack minH={'33px'} spacing={2} wrap={'wrap'}>
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement={'bottom-start'}>
        <PopoverTrigger>
          <HStack cursor='pointer'>
            <LuListFilter />
            <Text>Filter by token</Text>
          </HStack>
        </PopoverTrigger>
        <Portal>
          <PopoverContent bg={'bg'} border={`1px solid ${colors.border}`} w={'fit-content'} p={3}>
            <TextButton onClick={() => setSelectedFilterTokens([])} label='Clear all' py={2} />
            {collateralTokensArray.map(
              (token) =>
                !selectedFilterTokens.includes(token) && (
                  <TextButton
                    key={uuidv4()}
                    label={token.symbol}
                    onClick={() => handleFilterItemClicked(token)}
                    py={2}
                    leftIcon={
                      <Image
                        src={token.imageURI}
                        alt='token'
                        width={'20px'}
                        height={'20px'}
                        borderRadius={'full'}
                      />
                    }
                  />
                )
            )}
          </PopoverContent>
        </Portal>
      </Popover>

      {selectedFilterTokens.map((filterToken) => (
        <HStack key={uuidv4()}>
          <Button
            key={uuidv4()}
            h={'33px'}
            px={2}
            fontWeight={'normal'}
            onClick={() => handleFilterItemClicked(filterToken)}
            leftIcon={
              <Image
                src={filterToken.imageURI}
                alt='token'
                width={'20px'}
                height={'20px'}
                borderRadius={'full'}
              />
            }
            rightIcon={<FaXmark fill={colors.fontLight} />}
          >
            {filterToken.symbol}
          </Button>
        </HStack>
      ))}
    </HStack>
  )
}
