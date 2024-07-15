import React, { useEffect, useState } from 'react'
import { HStack, ButtonGroup, Button, Flex } from '@chakra-ui/react'
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
        gap='2px'
        w='fit-content'
        p='2px'
        bg='grey.300'
        borderRadius='2px'
      >
        {sortOptions.map((option) => (
          <Button
            variant='grey'
            key={uuidv4()}
            color={option === selectedSortFilter ? 'grey.50' : 'grey.800'}
            bg={option === selectedSortFilter ? 'grey.800' : 'unset'}
            onClick={() => handleFilterItemClicked(option)}
            _hover={{ bg: option === selectedSortFilter ? 'grey.800' : 'grey.400' }}
            px='12px'
            marginInlineStart='0px !important'
          >
            {option}
          </Button>
        ))}
      </ButtonGroup>
    </HStack>
  )
}
