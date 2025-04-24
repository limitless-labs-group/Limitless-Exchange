import { Text, Switch, HStack, Divider, Button, Stack, Flex, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { Switcher } from '@/components/common/switcher'
import OddsIcon from '@/resources/icons/odds-icon.svg'

export interface Resolve {
  marketId: number
  winningIndex: number
}

export interface MarketsToResolve {
  markets: Row[]
  onResolve: (args: Resolve[]) => Promise<void>
  isLoading: boolean
}
export const ResolveModal = ({ markets, onResolve, isLoading }: MarketsToResolve) => {
  const [marketsToResolve, setMarketToResolve] = useState<Row[]>(() => {
    return markets.map((market) => {
      const oddsValue = parseFloat(market.odds)
      const recommendedIndex = oddsValue > 50 ? 1 : 0
      return {
        ...market,
        winningIndex: recommendedIndex,
      }
    })
  })

  const handleWinningIndexChange = (id: number, newIndex: number) => {
    setMarketToResolve((prevMarkets) =>
      prevMarkets.map((market) =>
        market.id === id ? { ...market, winningIndex: newIndex } : market
      )
    )
  }

  const handleResolve = () => {
    const resolveData = marketsToResolve.map((market) => ({
      marketId: market.id,
      winningIndex: market.winningIndex,
    }))
    onResolve(resolveData)
  }

  return (
    <VStack
      align='stretch'
      width='100%'
      gap='16px'
      minH='480px'
      minW='460px'
      justifyContent='space-between'
      mt='24px'
    >
      <VStack gap='16px'>
        {marketsToResolve.map((market) => (
          <ResolveRow
            key={market.id}
            row={market}
            onWinningIndexChange={handleWinningIndexChange}
          />
        ))}
      </VStack>
      <VStack justifyContent='space-between' alignItems='end'>
        <Divider borderColor='grey.200' />
        <HStack alignItems='end'>
          <Button
            isDisabled={isLoading}
            size='sm'
            color='grey.800'
            borderColor='grey.200'
            border='1px solid'
          >
            Cancel
          </Button>
          <Button isDisabled={isLoading} colorScheme='blue' size='sm' onClick={handleResolve}>
            {`Resolve ${marketsToResolve.length} markets`}
          </Button>
        </HStack>
      </VStack>
    </VStack>
  )
}

export interface Row {
  id: number
  title: string
  odds: string
  winningIndex: number
}

const ResolveRow = ({
  row,
  onWinningIndexChange,
}: {
  row: Row
  onWinningIndexChange: (id: number, newIndex: number) => void
}) => {
  const { title, id, odds, winningIndex } = row

  const handleChange = () => {
    const newIndex = winningIndex === 1 ? 0 : 1
    onWinningIndexChange(id, newIndex)
  }

  return (
    <HStack
      justifyContent='space-between'
      alignItems='center'
      width='100%'
      borderTop='1px solid'
      borderColor='grey.200'
      pt='16px'
    >
      <Text fontWeight='medium' flex='2'>
        {title}
      </Text>
      <HStack justifyContent='end'>
        <OddsIcon width='16px' height='16px' color='grey.500' />
        <Text flex='1'>{odds}%</Text>
        <Flex alignItems='center' flex='1'>
          <Switcher mode='default' onSwitch={handleChange} isOn={winningIndex === 1} />
        </Flex>
      </HStack>
    </HStack>
  )
}
