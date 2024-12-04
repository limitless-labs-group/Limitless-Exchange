import { Box, HStack, Link, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import Skeleton from '@/components/common/skeleton'
import { defaultChain } from '@/constants'
import useMarketGroup from '@/hooks/use-market-group'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import { HistoryRedeem, useTradingService } from '@/services'
import { useAllMarkets, useMarketByConditionId } from '@/services/MarketsService'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil, truncateEthAddress } from '@/utils'

interface IPortfolioHistoryRedeemItem extends TableRowProps {
  redeem: HistoryRedeem
}

export const PortfolioHistoryRedeemItem = ({ redeem, ...props }: IPortfolioHistoryRedeemItem) => {
  /**
   * MARKET DATA
   */
  const allMarkets = useAllMarkets()
  const targetMarket = allMarkets.find((market) => market.conditionId === redeem.conditionId)

  const { market, refetchMarket } = useMarketByConditionId(redeem.conditionId, false)
  const { data: marketGroup, refetch: refetchMarketGroup } = useMarketGroup(
    targetMarket?.group?.slug,
    false,
    false
  )
  const { onOpenMarketPage } = useTradingService()

  const multiplier = (symbol: string | undefined) => {
    switch (symbol) {
      case 'USDC':
        return Math.pow(10, 12)
      case 'cbBTC':
        return Math.pow(10, 10)
      default:
        return 1
    }
  }

  const formattedAmount = NumberUtil.formatThousands(
    Number(redeem.collateralAmount) * multiplier(market?.collateralToken.symbol) ?? 0,
    market?.collateralToken.symbol === 'USDC' ? 2 : 6
  )

  const handleOpenMarketPage = async () => {
    if (targetMarket?.address) {
      if (!market) {
        const { data: fetchedMarket } = await refetchMarket()
        if (fetchedMarket) {
          onOpenMarketPage(fetchedMarket, 'History card')
        }
      } else {
        onOpenMarketPage(market, 'History card')
      }
    }

    if (targetMarket?.group?.slug) {
      if (!marketGroup) {
        const { data: fetchedMarketGroup } = await refetchMarketGroup()
        if (fetchedMarketGroup) {
          onOpenMarketPage(fetchedMarketGroup, 'History card')
        }
      } else {
        onOpenMarketPage(marketGroup, 'History card')
      }
    }
  }

  return (
    <Tr pos={'relative'} {...props}>
      <Td w='92px'>Won</Td>
      <Td>
        <HStack gap='4px'>
          {redeem.outcomeIndex ? (
            <ThumbsDownIcon width={16} height={16} />
          ) : (
            <ThumbsUpIcon width={16} height={16} />
          )}{' '}
          <Text {...paragraphRegular}>{redeem.outcomeIndex ? 'No' : 'Yes'}</Text>
        </HStack>
      </Td>
      <Td></Td>
      <Td isNumeric>
        <Box verticalAlign='middle'>
          <Text>
            {!market ? (
              <Skeleton height={20} />
            ) : (
              `${formattedAmount} ${market?.collateralToken.symbol}`
            )}
          </Text>
        </Box>
      </Td>
      <Td>
        <Box verticalAlign='middle'>
          <Text>
            {new Date(Number(redeem.blockTimestamp) * 1000).toLocaleDateString(undefined, {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Box>
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
              {targetMarket?.proxyTitle ?? targetMarket?.title}
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
          {targetMarket?.proxyTitle ?? targetMarket?.title}
        </Td>
      )}
      <Td>
        <Link
          href={`${defaultChain.blockExplorers.default.url}/tx/${redeem.transactionHash}`}
          target='_blank'
          rel='noopener'
          variant='textLink'
        >
          {truncateEthAddress(redeem.transactionHash)}
        </Link>
      </Td>
    </Tr>
  )
}
