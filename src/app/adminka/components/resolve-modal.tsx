import { Text, Switch, HStack, Divider, Button, Stack, Flex, VStack } from '@chakra-ui/react'
import { useState } from 'react'

export interface Resolve {
  marketId: number
  winningIndex: number
}

export interface MarketsToResolve {
  markets: Row[]
  onResolve: (args: Resolve[]) => Promise<void>
}
export const ResolveModal = ({
  markets,
  onResolve,
}: {
  markets: Row[]
  onResolve: (resolvedMarkets: Resolve[]) => void
}) => {
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
    <VStack spacing={4} align='stretch' width='100%'>
      {marketsToResolve.map((market) => (
        <ResolveRow key={market.id} row={market} onWinningIndexChange={handleWinningIndexChange} />
      ))}
      <Button colorScheme='blue' onClick={handleResolve} mt={4}>
        Confirm Resolution
      </Button>
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
    <HStack justifyContent='space-between' alignItems='start' width='100%'>
      <Text fontWeight='medium' flex='2'>
        {title}
      </Text>
      <HStack justifyContent='end'>
        <Text color={parseFloat(odds) > 50 ? 'green.500' : 'red.500'} flex='1'>
          {odds}%
        </Text>
        <Flex alignItems='center' flex='1'>
          <Text minW='24px' mr={2}>
            {winningIndex === 0 ? 'No' : 'Yes'}
          </Text>
          <Switch isChecked={winningIndex === 1} onChange={handleChange} colorScheme='green' />
        </Flex>
      </HStack>
    </HStack>
  )
}
