import { MarketCard } from '@/components'
import { collateralToken, defaultChain, markets } from '@/constants'
import { HistoryTrade } from '@/services'
import { borderRadius } from '@/styles'
import { Market } from '@/types'
import { NumberUtil } from '@/utils'
import {
  Box,
  Flex,
  HStack,
  Heading,
  Image,
  Stack,
  TableRowProps,
  Td,
  Text,
  Tr,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

interface IPortfolioHistoryTableItem extends TableRowProps {
  trade: HistoryTrade
}

export const PortfolioHistoryTableItem = ({
  trade,
  children,
  ...props
}: IPortfolioHistoryTableItem) => {
  const router = useRouter()
  // const { onCopy, hasCopied } = useClipboard(`${window.location.origin}/markets/${marketAddress}`)
  const market: Market | null = useMemo(
    () =>
      markets.find(
        (market) => market.address[defaultChain.id]?.toLowerCase() === trade.market.id.toLowerCase()
      ) ?? null,
    [trade, markets]
  )

  return (
    <Tr
      pos={'relative'}
      cursor={'pointer'}
      onClick={() => router.push(`/markets/${trade.market.id}`)}
      {...props}
    >
      <Td pl={0}>
        <HStack>
          <Image
            src={market?.imageURI}
            w={{ sm: '40px' }}
            h={{ sm: '40px' }}
            fit={'cover'}
            bg={'brand'}
            borderRadius={borderRadius}
          />
          <Heading size={'sm'} _hover={{ textDecor: 'underline' }}>
            {market?.title ?? 'Noname market'}
          </Heading>
        </HStack>
      </Td>
      <Td>
        <Box
          w={'fit-content'}
          p={'2px 6px'}
          bg={trade.outcomeTokenId == 0 ? 'green' : 'red'}
          color={trade.outcomeTokenId == 0 ? 'white' : 'white'}
          fontWeight={'bold'}
          borderRadius={'6px'}
          fontSize={'13px'}
        >
          {market?.outcomeTokens[trade.outcomeTokenId ?? 0]}{' '}
          {NumberUtil.toFixed(trade.outcomeTokenPrice, 2)}%
        </Box>
      </Td>
      <Td>{trade.strategy}</Td>
      <Td isNumeric>
        <Text fontWeight={'bold'}>
          {`${NumberUtil.toFixed(
            Number(trade.collateralAmount ?? 0) * (trade.strategy == 'Sell' ? -1 : 1),
            3
          )} ${collateralToken.symbol}`}
        </Text>
      </Td>
      <Td isNumeric pr={0}>
        {NumberUtil.toFixed(trade.outcomeTokenAmount, 2)}
      </Td>
    </Tr>
  )
}
