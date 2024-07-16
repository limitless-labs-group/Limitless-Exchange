import React, { useEffect, useState } from 'react'
import { HStack, ButtonGroup, Button, Flex } from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid'

import { Sort } from '@/types'
import { useIsMobile } from '@/hooks'

type SortFilterProps = {
  onChange: (option: Sort) => void
}

const sortOptions = [Sort.HIGHEST_VOLUME, Sort.HIGHEST_LIQUIDITY, Sort.COMING_DEADLINE, Sort.NEWEST]

export default function SortFilter({ onChange }: SortFilterProps) {
  const [selectedSortFilter, setSelectedSortFilter] = useState<Sort>(Sort.HIGHEST_VOLUME)

  const handleFilterItemClicked = (option: Sort) => {
    setSelectedSortFilter(option)
  }

  const isMobile = useIsMobile()

  useEffect(() => {
    onChange(selectedSortFilter)
  }, [selectedSortFilter])

  return (
    <HStack
      spacing={2}
      mt={'16px'}
      mb={'24px'}
      wrap={'wrap'}
      alignItems={'start'}
      w={'full'}
      overflowX='auto'
    >
      <ButtonGroup
        variant='outline'
        gap={0}
        w='fit-content'
        p='2px'
        bg='grey.300'
        borderRadius='2px'
      >
        {sortOptions.map((option) => (
          <Button
            variant='grey'
            key={uuidv4()}
            fontSize={isMobile ? '14px' : '12px'}
            color={option === selectedSortFilter ? 'white' : 'black'}
            bg={option === selectedSortFilter ? 'black' : 'unset'}
            onClick={() => handleFilterItemClicked(option)}
            rounded={0}
            flex={1}
            _hover={{ bg: option === selectedSortFilter ? 'black' : 'grey.200' }}
            borderRadius='2px'
          >
            {option}
          </Button>
        ))}
      </ButtonGroup>
    </HStack>
  )
}
