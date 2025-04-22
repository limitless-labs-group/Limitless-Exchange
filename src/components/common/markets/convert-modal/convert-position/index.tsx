import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { formatUnits } from 'viem'
import { ClobPositionWithTypeAndSelected } from '@/components/common/markets/convert-modal/convert-modal-content'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

interface ConvertPositionProps {
  position: ClobPositionWithTypeAndSelected
  setPositions: (val: ClobPositionWithTypeAndSelected[]) => void
  positions: ClobPositionWithTypeAndSelected[]
}

export default function ConvertPosition({
  position,
  setPositions,
  positions,
}: ConvertPositionProps) {
  const handleButtonClicked = () => {
    setPositions(
      positions.map((pos) => {
        return position.market.slug === pos.market.slug
          ? {
              ...pos,
              selected: !pos.selected,
            }
          : pos
      })
    )
  }

  return (
    <HStack
      gap='4px'
      cursor='pointer'
      key={position.market.slug}
      onClick={handleButtonClicked}
      w='full'
      px='16px'
      py='10px'
      border='3px solid'
      borderColor={position.selected ? 'green.500' : 'grey.200'}
      borderRadius='12px'
    >
      <VStack gap='8px' w='full' alignItems='flex-start'>
        <Text {...paragraphMedium} userSelect='none'>
          {position.market.title}
        </Text>
        <HStack gap='8px' w='full'>
          {Boolean(
            formatUnits(BigInt(position.tokensBalance.no), position.market.collateralToken.decimals)
          ) && (
            <Box py='2px' px='4px' bg='redTransparent.100' borderRadius='8px'>
              <Text {...paragraphRegular} color='red.500' userSelect='none'>
                No{' '}
                {NumberUtil.formatThousands(
                  formatUnits(
                    BigInt(position.tokensBalance.no),
                    position.market.collateralToken.decimals
                  ),
                  2
                )}{' '}
                Contracts
              </Text>
            </Box>
          )}
        </HStack>
      </VStack>
    </HStack>
  )
}
