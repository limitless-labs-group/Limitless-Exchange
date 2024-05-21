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
  Button,
} from '@chakra-ui/react'
import { LuListFilter } from 'react-icons/lu'
import { collateralTokensArray, defaultChain } from '@/constants'
import { v4 as uuidv4 } from 'uuid'
import { colors } from '@/styles'
import { Token } from '@/types'
import { FaXmark } from 'react-icons/fa6'

type TokenFilterProps = {
  onChange: (tokens: Token[]) => void
}

export default function TokenFilter({ onChange }: TokenFilterProps) {
  const { onOpen, onClose, isOpen } = useDisclosure()

  const [selectedFilterTokens, setSelectedFilterTokens] = useState<Token[]>([])

  const handleFilterItemClicked = (token: Token) => {
    if (
      selectedFilterTokens.find(
        (_token) => _token.address[defaultChain.id] == token.address[defaultChain.id]
      )
    ) {
      setSelectedFilterTokens(
        selectedFilterTokens.filter(
          (_token) => _token.address[defaultChain.id] != token.address[defaultChain.id]
        )
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
          <PopoverContent bg={'bg'} border={`1px solid ${colors.border}`} w={'160px'} p={3}>
            <Button variant='text' py={2} onClick={() => setSelectedFilterTokens([])} w='full'>
              Clear all
            </Button>
            {collateralTokensArray.map(
              (token) =>
                !selectedFilterTokens.includes(token) && (
                  <Button
                    key={uuidv4()}
                    variant='text'
                    onClick={() => handleFilterItemClicked(token)}
                    py={2}
                    w='full'
                    leftIcon={
                      <Image
                        src={token.imageURI}
                        alt='token'
                        width={'20px'}
                        height={'20px'}
                        borderRadius={'full'}
                      />
                    }
                  >
                    {token.symbol}
                  </Button>
                )
            )}
          </PopoverContent>
        </Portal>
      </Popover>

      {selectedFilterTokens.map((filterToken) => (
        <Button
          key={uuidv4()}
          variant='text'
          px={2}
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
      ))}
    </HStack>
  )
}
