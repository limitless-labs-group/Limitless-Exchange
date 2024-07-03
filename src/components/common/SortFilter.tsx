import React, { useEffect, useState } from 'react'
import { HStack, ButtonGroup, Button } from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid'

import { Sort } from '@/types'
import { useIsMobile } from '@/hooks'

type SortFilterProps = {
  onChange: (option: Sort) => void
}

const sortOptions = [Sort.NEWEST, Sort.COMING_DEADLINE, Sort.HIGHEST_LIQUIDITY, Sort.HIGHEST_VOLUME]

export default function SortFilter({ onChange }: SortFilterProps) {
  const [selectedSortFilter, setSelectedSortFilter] = useState<Sort>(Sort.NEWEST)

  const handleFilterItemClicked = (option: Sort) => {
    setSelectedSortFilter(option)
  }

  const isMobile = useIsMobile()

  useEffect(() => {
    onChange(selectedSortFilter)
  }, [selectedSortFilter])

  return (
    <HStack spacing={2} mt={'16px'} mb={'24px'} wrap={'wrap'} alignItems={'start'} w={'full'}>
      <ButtonGroup variant='outline' spacing='0' gap={0}>
        {sortOptions.map((option) => (
          <Button
            key={uuidv4()}
            h={'24px'}
            fontWeight={'normal'}
            fontSize={isMobile ? '14px' : '12px'}
            color={option === selectedSortFilter ? 'white' : 'black'}
            bg={option === selectedSortFilter ? 'black' : 'white'}
            onClick={() => handleFilterItemClicked(option)}
            rounded={0}
            py={2}
            maxW={'105px'}
            _hover={{ bg: option === selectedSortFilter ? 'black' : 'grey.200' }}
          >
            {option}
          </Button>
        ))}
      </ButtonGroup>
    </HStack>
  )
}
