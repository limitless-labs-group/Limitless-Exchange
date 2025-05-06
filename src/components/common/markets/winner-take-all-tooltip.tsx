import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { Tooltip } from '@/components/common/tooltip'
import TrophyIcon from '@/resources/icons/trophy-icon.svg'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'

export default function WinnerTakeAllTooltip() {
  const winnerTooltipLabel = (
    <Box>
      <Text {...headline} mb='16px'>
        Winner-Takes-All Market
      </Text>
      <VStack gap='8px' alignItems='flex-start'>
        <Text {...paragraphRegular}>Only one outcome wins.</Text>
        <Text {...paragraphRegular}>Convert “No” shares into “Yes” shares anytime.</Text>
        <Text {...paragraphRegular}>Automatically gain coverage for any new outcomes.</Text>
      </VStack>
    </Box>
  )

  return (
    <HStack gap='4px' color='grey.500' minW='fit-content'>
      <TrophyIcon width={16} height={16} />
      <Tooltip
        label={winnerTooltipLabel}
        bg='grey.50'
        border='unset'
        p='8px'
        rounded='8px'
        w='236px'
        placement='bottom-start'
      >
        <Text
          {...paragraphRegular}
          color='grey.500'
          textDecorationStyle='dotted'
          textDecorationLine='underline'
          cursor='pointer'
        >
          Winner-takes-all
        </Text>
      </Tooltip>
    </HStack>
  )
}
