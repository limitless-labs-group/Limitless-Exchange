import React from 'react'
import { Text, HStack, Box, VStack, Image, useDisclosure } from '@chakra-ui/react'
import { LuListFilter } from 'react-icons/lu'
import OutsideClickContainer from '@/components/common/OutsideClickContainer'
import { defaultChain, degen, higher, regen, weth } from '@/constants'
import { v4 as uuidv4 } from 'uuid'
import TextButton from '@/components/common/buttons/TextButton'

const tokenFilterOptions = [
  {
    label: higher.symbol,
    icon: higher.imageURI,
    id: higher.address[defaultChain.id],
  },
  {
    label: weth.symbol,
    icon: weth.imageURI,
    id: weth.address[defaultChain.id],
  },
  {
    label: degen.symbol,
    icon: degen.imageURI,
    id: degen.address[defaultChain.id],
  },
  {
    label: regen.symbol,
    icon: regen.imageURI,
    id: regen.address[defaultChain.id],
  },
]

type TokenFilterProps = {
  selectedId: string
  onSelect: (id: string) => void
}

export default function TokenFilter({ selectedId, onSelect }: TokenFilterProps) {
  const {
    isOpen: filterOpened,
    onOpen: handleOpenFilter,
    onClose: handleCloseFilter,
  } = useDisclosure()

  const handleFilterItemClicked = (id: string) => {
    onSelect(id)
    handleCloseFilter()
  }

  return (
    <Box position='relative'>
      <HStack cursor='pointer' w={'fit-content'} onClick={handleOpenFilter}>
        <LuListFilter />
        <Text>Filter by token</Text>
      </HStack>
      {filterOpened && (
        <OutsideClickContainer onClick={handleCloseFilter}>
          <VStack
            border={'1px solid #ddd'}
            position='absolute'
            borderRadius={4}
            w={'fit-content'}
            p={3}
            bg='white'
          >
            <TextButton onClick={() => handleFilterItemClicked('')} label='Clear all' />
            {tokenFilterOptions.map((option) => (
              <TextButton
                key={uuidv4()}
                label={option.label}
                onClick={() => handleFilterItemClicked(option.id)}
                leftIcon={<Image src={option.icon} alt='token' width={'20px'} height={'20px'} />}
                rightIcon={
                  option.id === selectedId ? (
                    <Image
                      src={'/assets/images/tick.svg'}
                      width={'14px'}
                      height={'14px'}
                      alt='tick'
                    />
                  ) : undefined
                }
              />
            ))}
          </VStack>
        </OutsideClickContainer>
      )}
    </Box>
  )
}
