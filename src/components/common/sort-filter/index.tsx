import { Button, ButtonGroup, HStack } from '@chakra-ui/react'
import React from 'react'
import { isMobile } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import { ClickEvent, useAmplitude } from '@/services'
import useGoogleAnalytics, { GAEvents } from '@/services/GoogleAnalytics'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Sort, SortStorageName } from '@/types'

const mobileStyles = {
  mt: '16px',
  mb: '24px',
  justifyContent: 'start',
  h: '32px',
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
  sort: Sort
  withPadding?: boolean
}

const sortOptions = [
  Sort.TRENDING,
  Sort.ENDING_SOON,
  Sort.HIGHEST_VALUE,
  Sort.NEWEST,
  Sort.LP_REWARDS,
]

export default function SortFilter({ onChange, sort, withPadding = true }: SortFilterProps) {
  const { trackClicked } = useAmplitude()
  const { pushGA4Event } = useGoogleAnalytics()

  const getGAEventForSort = (option: Sort): GAEvents | undefined => {
    switch (option) {
      case Sort.ENDING_SOON:
        return GAEvents.ClickEndingSoon
      case Sort.HIGHEST_VALUE:
        return GAEvents.ClickHighValue
      case Sort.TRENDING:
        return GAEvents.ClickTrending
      case Sort.NEWEST:
        return GAEvents.ClickNewest
      case Sort.LP_REWARDS:
        return GAEvents.ClickLpRewards
      default:
        return
    }
  }

  return (
    <HStack
      wrap={'wrap'}
      alignItems={'start'}
      w={'auto'}
      maxW={isMobile ? '100%' : 'unset'}
      overflowX='auto'
      paddingLeft={isMobile && withPadding ? '16px' : 0}
      {...(isMobile ? mobileStyles : desktopStyles)}
    >
      <ButtonGroup variant='outline' gap='2px' p='2px' bg='grey.100' borderRadius='8px'>
        {sortOptions.map((option) => (
          <Button
            variant='grey'
            key={uuidv4()}
            bg={option === sort ? 'grey.50' : 'grey.100'}
            onClick={() => {
              trackClicked(ClickEvent.SortClicked, {
                oldValue: sort,
                newValue: option,
              })
              pushGA4Event(getGAEventForSort(option))
              onChange(option, SortStorageName.SORT)
            }}
            _hover={{ bg: option === sort ? 'grey.50' : 'grey.200' }}
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
