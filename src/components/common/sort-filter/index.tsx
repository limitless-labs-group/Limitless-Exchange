import { Button, ButtonGroup, HStack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useIsMobile } from '@/hooks'
import { ClickEvent, useAmplitude } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Sort, SortStorageName } from '@/types'

const mobileStyles = {
  mt: '16px',
  mb: '24px',
  justifyContent: 'start',
  h: '32px',
  px: '0',
} as const

const desktopStyles = {
  mt: '8px',
  mb: '8px',
  justifyContent: 'end',
  h: '24px',
  px: 0,
} as const

type SortFilterProps = {
  onChange: (option: Sort, storageName: SortStorageName) => void
  storageName: SortStorageName
}

const sortOptions = [Sort.ENDING_SOON, Sort.HIGHEST_VALUE, Sort.HIGHEST_VOLUME, Sort.NEWEST]

export default function SortFilter({ onChange, storageName }: SortFilterProps) {
  const [selectedSortFilter, setSelectedSortFilter] = useState<Sort>(
    (window.sessionStorage.getItem(storageName) as Sort) ?? Sort.ENDING_SOON
  )
  const { trackClicked } = useAmplitude()

  const handleFilterItemClicked = (option: Sort) => {
    window.sessionStorage.setItem(storageName, option)
    setSelectedSortFilter(option)
  }

  const isMobile = useIsMobile()

  useEffect(() => {
    if (onChange) {
      onChange(selectedSortFilter, storageName)
    }
  }, [selectedSortFilter])

  return (
    <HStack
      spacing={2}
      wrap={'wrap'}
      alignItems={'start'}
      w={'auto'}
      overflowX='auto'
      {...(isMobile ? mobileStyles : desktopStyles)}
    >
      <ButtonGroup variant='outline' gap='2px' p='2px' bg='grey.100' borderRadius='8px'>
        {sortOptions.map((option) => (
          <Button
            variant='grey'
            key={uuidv4()}
            bg={option === selectedSortFilter ? 'grey.50' : 'unset'}
            onClick={() => {
              trackClicked(ClickEvent.SortClicked, {
                oldValue: selectedSortFilter,
                newValue: option,
              })
              handleFilterItemClicked(option)
            }}
            _hover={{ bg: option === selectedSortFilter ? 'grey.50' : 'grey.400' }}
            borderRadius='8px'
            h={isMobile ? '28px' : '20px'}
            whiteSpace='nowrap'
            {...paragraphMedium}
            fontSize={isMobile ? '13px' : 'unset'}
            color={'grey.800'}
            p={'2px 12px 2px 12px'}
            marginInlineStart='0px !important'
            position={isMobile ? 'unset' : 'relative'}
          >
            {option}
          </Button>
        ))}
      </ButtonGroup>
    </HStack>
  )
}
