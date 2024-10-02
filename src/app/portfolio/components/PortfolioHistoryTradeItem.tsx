import { defaultChain } from '@/constants'
import { HistoryTrade } from '@/services'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { HStack, Link, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { useAllMarkets } from '@/services/MarketsService'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import NextLink from 'next/link'

interface IPortfolioHistoryTradeItem extends TableRowProps {
  trade: HistoryTrade
}

export const PortfolioHistoryTradeItem = ({ trade, ...props }: IPortfolioHistoryTradeItem) => {
  /**
   * MARKET DATA
   */
  const allMarkets = useAllMarkets()

  const targetMarket = allMarkets.find((market) => market.address === trade.market.id)

  const link = targetMarket?.group?.slug
    ? `/market-group/${targetMarket.group.slug}`
    : `/markets/${targetMarket?.address}`

  return (
    <Tr pos={'relative'} {...props}>
      <Td w='92px'>{trade.strategy}</Td>
      <Td>
        <HStack gap='4px'>
          {trade.outcomeIndex ? (
            <ThumbsDownIcon width={16} height={16} />
          ) : (
            <ThumbsUpIcon width={16} height={16} />
          )}{' '}
          <Text {...paragraphRegular}>{trade.outcomeIndex ? 'No' : 'Yes'}</Text>
          <Text {...paragraphRegular}>
            {NumberUtil.toFixed(+(trade.outcomeTokenPrice || 1) * 100, 1)}%
          </Text>
        </HStack>
      </Td>
      <Td isNumeric>{NumberUtil.formatThousands(trade.outcomeTokenAmount, 6)}</Td>
      <Td px={2} isNumeric>
        <Text>
          {`${NumberUtil.formatThousands(
            Number(trade.collateralAmount ?? 0) * (trade.strategy == 'Sell' ? -1 : 1),
            6
          )} ${targetMarket?.collateralToken.symbol}`}
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
        <NextLink href={link}>
          {targetMarket?.group?.id
            ? `${targetMarket.group.title}: ${targetMarket.title}`
            : targetMarket?.proxyTitle ?? targetMarket?.title}
        </NextLink>
      </Td>
      <Td>
        <Link
          href={`${defaultChain.blockExplorers.default.url}/tx/${trade.transactionHash}`}
          target='_blank'
          rel='noopener'
          variant='textLink'
        >
          {truncateEthAddress(trade.transactionHash)}
        </Link>
      </Td>
    </Tr>
  )
}
