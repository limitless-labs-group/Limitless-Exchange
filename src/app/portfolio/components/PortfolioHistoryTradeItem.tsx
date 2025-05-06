import { HStack, Link, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import { defaultChain } from '@/constants'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import { ClickEvent, HistoryTrade, useAmplitude, useTradingService } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil, truncateEthAddress } from '@/utils'

interface IPortfolioHistoryTradeItem extends TableRowProps {
  trade: HistoryTrade
}

export const PortfolioHistoryTradeItem = ({ trade, ...props }: IPortfolioHistoryTradeItem) => {
  const { onOpenMarketPage, setMarket } = useTradingService()

  const { data: market, refetch: refetchMarket } = useMarket(
    trade.market.group?.slug || trade.market.slug || trade.market.id,
    false,
    false
  )

  const { trackClicked } = useAmplitude()

  const handleOpenMarketPage = async () => {
    if (!market) {
      const { data: fetchedMarket } = await refetchMarket()
      if (fetchedMarket) {
        onOpenMarketPage(fetchedMarket)
        if (fetchedMarket.negRiskMarketId) {
          const targetMarket = fetchedMarket?.markets?.find(
            (market) => market.slug === trade.market.slug
          )
          setMarket(targetMarket || null)
        }
        trackClicked(ClickEvent.PortfolioMarketClicked, {
          marketCategory: fetchedMarket.categories,
          marketAddress: fetchedMarket.slug,
          marketType: 'single',
          marketTags: fetchedMarket.tags,
          type: 'History',
        })
      }
      return
    } else {
      onOpenMarketPage(market)
      if (market.negRiskMarketId) {
        const targetMarket = market.markets?.find((market) => market.slug === trade.market.slug)
        setMarket(targetMarket || null)
      }
      trackClicked(ClickEvent.PortfolioMarketClicked, {
        marketCategory: market.categories,
        marketAddress: market.slug,
        marketType: 'single',
        marketTags: market.tags,
        type: 'History',
      })
    }
  }

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
            trade.market.collateral?.symbol === 'USDC' ? 2 : 6
          )} ${trade.market.collateral?.symbol ?? ''}`}
        </Text>
      </Td>
      <Td>
        {new Date(Number(trade.blockTimestamp) * 1000).toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        })}
      </Td>
      {isMobile ? (
        <MobileDrawer
          trigger={
            <Td
              textDecoration='underline'
              w='420px'
              maxW='420px'
              whiteSpace='nowrap'
              overflow='hidden'
              textOverflow='ellipsis'
              onClick={handleOpenMarketPage}
              cursor='pointer'
            >
              {trade.market.title}
            </Td>
          }
          variant='black'
        >
          <MarketPage />
        </MobileDrawer>
      ) : (
        <Td
          textDecoration='underline'
          w='420px'
          maxW='420px'
          whiteSpace='nowrap'
          overflow='hidden'
          textOverflow='ellipsis'
          onClick={handleOpenMarketPage}
          cursor='pointer'
        >
          {trade.market.title}
        </Td>
      )}
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
