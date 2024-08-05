import { defaultChain } from '@/constants'
import { HistoryTrade } from '@/services'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { HStack, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { useMarket } from '@/services/MarketsService'
import NextLink from 'next/link'

interface IPortfolioHistoryTradeItem extends TableRowProps {
  trade: HistoryTrade
}

export const PortfolioHistoryTradeItem = ({ trade, ...props }: IPortfolioHistoryTradeItem) => {
  /**
   * MARKET DATA
   */
  const { data: market } = useMarket(trade.market.id)

  return (
    <Tr pos={'relative'} {...props}>
      <Td pl={0} pr={2}>
        <NextLink href={`/markets/${trade.market.id}`}>
          <HStack
            style={{ textWrap: 'wrap' }}
            cursor={'pointer'}
            _hover={{ textDecor: 'underline' }}
          >
            <Text size={'sm'} wordBreak={'break-word'} maxW={'400px'} minW={'200px'}>
              {market?.proxyTitle ?? market?.title ?? 'Noname market'}
            </Text>
          </HStack>
        </NextLink>
      </Td>

      <Td px={2}>
        <Text color={trade.outcomeIndex == 0 ? 'green.500' : 'red.500'}>
          {market?.outcomeTokens[trade.outcomeIndex ?? 0]}{' '}
          {NumberUtil.formatThousands(trade.outcomeTokenPrice, 3)}{' '}
          {market?.tokenTicker[defaultChain.id]}
        </Text>
      </Td>

      <Td px={2}>{trade.strategy}</Td>

      {/* Amount */}
      <Td px={2} isNumeric>
        <Text>
          {`${NumberUtil.formatThousands(
            Number(trade.collateralAmount ?? 0) * (trade.strategy == 'Sell' ? -1 : 1),
            6
          )} ${market?.tokenTicker[defaultChain.id]}`}
        </Text>
      </Td>

      {/* Contracts */}
      <Td px={2} isNumeric>
        {NumberUtil.formatThousands(trade.outcomeTokenAmount, 4)}
      </Td>

      {/* Tx */}
      <Td pl={2} pr={0}>
        <HStack
          p={'2px 6px'}
          bg={'bgLight'}
          borderRadius={'6px'}
          fontSize={'13px'}
          spacing={1}
          cursor={'pointer'}
          _hover={{ textDecor: 'underline' }}
          onClick={() =>
            window.open(
              `${defaultChain.blockExplorers.default.url}/tx/${trade.transactionHash}`,
              '_blank',
              'noopener'
            )
          }
        >
          <Text>{truncateEthAddress(trade.transactionHash)}</Text>
          <FaExternalLinkAlt size={'10px'} />
        </HStack>
      </Td>
    </Tr>
  )
}
