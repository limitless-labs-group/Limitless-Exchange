import { defaultChain } from '@/constants'
import { HistoryTrade } from '@/services'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { HStack, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { useMarket } from '@/services/MarketsService'
import NextLink from 'next/link'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'

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
      <Td w='92px'>{trade.strategy}</Td>
      <Td>
        <HStack gap='4px'>
          {market?.outcomeTokens[trade.outcomeIndex] ? (
            <ThumbsDownIcon width={16} height={16} />
          ) : (
            <ThumbsUpIcon width={16} height={16} />
          )}{' '}
          <Text {...paragraphRegular}>{market?.outcomeTokens[trade.outcomeIndex ?? 0]}</Text>
          <Text {...paragraphRegular}>
            {NumberUtil.toFixed(+(trade.outcomeTokenPrice || 1) * 100, 1)}%
          </Text>
        </HStack>
      </Td>
      <Td isNumeric>{NumberUtil.formatThousands(trade.outcomeTokenAmount, 4)}</Td>
      <Td px={2} isNumeric>
        <Text>
          {`${NumberUtil.formatThousands(
            Number(trade.collateralAmount ?? 0) * (trade.strategy == 'Sell' ? -1 : 1),
            6
          )} ${market?.tokenTicker[defaultChain.id]}`}
        </Text>
      </Td>
      <Td
        textDecoration='underline'
        w='420px'
        maxW='420px'
        whiteSpace='nowrap'
        overflow='hidden'
        textOverflow='ellipsis'
      >
        <NextLink href={`/markets/${trade.market.id}`}>
          {market?.proxyTitle ?? market?.title ?? 'Noname market'}
        </NextLink>
      </Td>
      <Td textDecoration='underline'>
        <NextLink
          href={`${defaultChain.blockExplorers.default.url}/tx/${trade.transactionHash}`}
          target='_blank'
          rel='noopener'
        >
          {truncateEthAddress(trade.transactionHash)}
        </NextLink>
      </Td>
    </Tr>
  )
}
