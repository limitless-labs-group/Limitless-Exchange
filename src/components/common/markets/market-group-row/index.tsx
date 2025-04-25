import { Button, HStack, Text } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import React, { useState } from 'react'
import { captionMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

interface MarketGroupRowProps {
  market: Market
  handleOutcomeClicked: (
    e: React.MouseEvent<HTMLButtonElement>,
    marketToSet: Market,
    outcome: number
  ) => void
}

export default function MarketGroupRow({ market, handleOutcomeClicked }: MarketGroupRowProps) {
  const [yesHovered, setYesHovered] = useState(false)
  const [noHovered, setNoHovered] = useState(false)

  return (
    <HStack w='full' justifyContent='space-between' py='4px'>
      <Text {...paragraphRegular} textAlign='left'>
        {market.title}
      </Text>
      <HStack gap='8px'>
        <Text {...paragraphRegular}>
          {new BigNumber(market.prices[0]).multipliedBy(100).toString()}%
        </Text>
        <HStack gap='4px'>
          <Button
            {...captionMedium}
            h='20px'
            px='4px'
            py='2px'
            color={yesHovered ? 'white' : 'green.500'}
            bg={yesHovered ? 'green.500' : 'greenTransparent.100'}
            onMouseEnter={() => setYesHovered(true)}
            onMouseLeave={() => setYesHovered(false)}
            onClick={(e) => handleOutcomeClicked(e, market, 0)}
          >
            {yesHovered
              ? `${new BigNumber(market.prices[0]).multipliedBy(100).decimalPlaces(1).toString()}%`
              : 'YES'}
          </Button>
          <Button
            {...captionMedium}
            h='20px'
            px='4px'
            py='2px'
            color={noHovered ? 'white' : 'red.500'}
            bg={noHovered ? 'red.500' : 'redTransparent.100'}
            onMouseEnter={() => setNoHovered(true)}
            onMouseLeave={() => setNoHovered(false)}
            onClick={(e) => handleOutcomeClicked(e, market, 1)}
          >
            {noHovered
              ? `${new BigNumber(market.prices[1]).multipliedBy(100).decimalPlaces(1).toString()}%`
              : 'NO'}
          </Button>
        </HStack>
      </HStack>
    </HStack>
  )
}
