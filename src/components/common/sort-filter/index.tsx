import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, HStack } from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid'

import { Sort } from '@/types'
import { useIsMobile } from '@/hooks'
import { controlsMedium } from '@/styles/fonts/fonts.styles'
import { ClickEvent, useAmplitude } from '@/services'

type SortFilterProps = {
  onChange: (option: Sort) => void
}

const sortOptions = [Sort.HIGHEST_VOLUME, Sort.HIGHEST_LIQUIDITY, Sort.ENDING_SOON, Sort.NEWEST]

export default function SortFilter({ onChange }: SortFilterProps) {
  const [selectedSortFilter, setSelectedSortFilter] = useState<Sort>(
    (window.sessionStorage.getItem('SORT') as Sort) ?? Sort.HIGHEST_VOLUME
  )
  const { trackClicked } = useAmplitude()

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
      <ButtonGroup variant='outline' gap='2px' p='2px' bg='grey.300' borderRadius='2px'>
        {sortOptions.map((option) => (
          <Button
            variant='grey'
            key={uuidv4()}
            bg={option === selectedSortFilter ? 'grey.800' : 'unset'}
            onClick={() => {
              trackClicked(ClickEvent.SortClicked, {
                oldValue: selectedSortFilter,
                newValue: option,
              })
              handleFilterItemClicked(option)
            }}
            _hover={{ bg: option === selectedSortFilter ? 'grey.800' : 'grey.400' }}
            borderRadius='2px'
            h={isMobile ? '28px' : '20px'}
            whiteSpace='nowrap'
            {...controlsMedium}
            fontSize={isMobile ? '14px' : '12px'}
            color={option === selectedSortFilter ? 'grey.50' : 'grey.800'}
            p={'2px 12px 2px 12px'}
            marginInlineStart='0px !important'
          >
            {option}
          </Button>
        ))}
      </ButtonGroup>
    </HStack>
  )
}
