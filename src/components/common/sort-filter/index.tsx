import React, { useEffect, useState } from 'react'
import { HStack, ButtonGroup, Button, Flex } from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid'

import { Sort } from '@/types'
import { useIsMobile } from '@/hooks'
import { controlsMedium } from '@/styles/fonts/fonts.styles'

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
      h={isMobile ? '32px' : '24px'}
    >
      <ButtonGroup variant='outline' gap={0} p='2px' bg='grey.300' borderRadius='2px'>
        {sortOptions.map((option) => (
          <Button
            variant='grey'
            key={uuidv4()}
            bg={option === selectedSortFilter ? 'grey.800' : 'unset'}
            onClick={() => handleFilterItemClicked(option)}
            rounded={0}
            flex={1}
            _hover={{ bg: option === selectedSortFilter ? 'grey.800' : 'grey.400' }}
            borderRadius='2px'
            h={isMobile ? '28px' : '20px'}
            whiteSpace='nowrap'
            {...controlsMedium}
            color={option === selectedSortFilter ? 'grey.50' : 'grey.800'}
            p={'2px 12px 2px 12px'}
          >
            {option}
          </Button>
        ))}
      </ButtonGroup>
    </HStack>
  )
}
