import { Box, HStack, Link, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import MarketPage from '@/components/common/markets/market-page'
import Skeleton from '@/components/common/skeleton'
import { defaultChain } from '@/constants'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import {
  ClickEvent,
  HistoryAction,
  HistoryRedeem,
  useAmplitude,
  useTradingService,
} from '@/services'
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
  const { onOpenMarketPage } = useTradingService()
  const { trackClicked } = useAmplitude()

  const formattedAmountWithSymbol = useMemo(() => {
    const precision = redeem.collateralSymbol === 'USDC' ? 2 : 6
    const minDisplayValue = redeem.collateralSymbol === 'USDC' ? 0.01 : 0.000001

    const rawAmount = Number(redeem.collateralAmount) ?? 0
    const formattedAmount = NumberUtil.formatThousands(rawAmount, precision)

    if (rawAmount > 0 && rawAmount < minDisplayValue) {
      return `< ${minDisplayValue} ${redeem.collateralSymbol}`
    }

    return `${formattedAmount} ${redeem.collateralSymbol}`
  }, [redeem.collateralAmount, redeem.collateralSymbol])

  const handleOpenMarketPage = async () => {
    if (targetMarket?.address) {
      if (!market) {
        const { data: fetchedMarket } = await refetchMarket()
        if (fetchedMarket) {
          onOpenMarketPage(fetchedMarket)
          trackClicked(ClickEvent.PortfolioMarketClicked, {
            marketAddress: fetchedMarket.slug,
            marketType: fetchedMarket.marketType,
            marketTags: fetchedMarket.tags,
            type: 'History',
          })
        }
      } else {
        onOpenMarketPage(market)
        trackClicked(ClickEvent.PortfolioMarketClicked, {
          marketAddress: market.slug,
          marketType: market.marketType,
          marketTags: market.tags,
          type: 'History',
        })
      }
    }
  }

  return (
    <Tr
      pos={'relative'}
      {...props}
      bg={redeem.action === HistoryAction.WON ? 'greenTransparent.100' : 'redTransparent.100'}
    >
      <Td
        w='92px'
        color={redeem.action === HistoryAction.WON ? 'green.500 !important' : 'red.500 !important'}
      >
        {redeem.action === HistoryAction.WON ? 'Won' : 'Loss'}
      </Td>
      <Td
        color={redeem.action === HistoryAction.WON ? 'green.500 !important' : 'red.500 !important'}
      >
        <HStack gap='4px'>
          {redeem.outcomeIndex ? (
            <ThumbsDownIcon width={16} height={16} />
          ) : (
            <ThumbsUpIcon width={16} height={16} />
          )}{' '}
          <Text
            {...paragraphRegular}
            color={
              redeem.action === HistoryAction.WON ? 'green.500 !important' : 'red.500 !important'
            }
          >
            {redeem.outcomeIndex ? 'No' : 'Yes'}
          </Text>
        </HStack>
      </Td>
      <Td></Td>
      <Td isNumeric>
        <Box verticalAlign='middle'>
          {!redeem ? (
            <Skeleton height={20} />
          ) : (
            <Text
              color={
                redeem.action === HistoryAction.WON ? 'green.500 !important' : 'red.500 !important'
              }
            >
              {formattedAmountWithSymbol}
            </Text>
          )}
        </Box>
      </Td>
      <Td>
        <Box verticalAlign='middle'>
          <Text
            color={
              redeem.action === HistoryAction.WON ? 'green.500 !important' : 'red.500 !important'
            }
          >
            {new Date(Number(redeem.blockTimestamp) * 1000).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: false,
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
              color={
                redeem.action === HistoryAction.WON ? 'green.500 !important' : 'red.500 !important'
              }
            >
              {redeem.title}
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
          color={
            redeem.action === HistoryAction.WON ? 'green.500 !important' : 'red.500 !important'
          }
        >
          {redeem.title}
        </Td>
      )}
      <Td>
        <Link
          href={`${defaultChain.blockExplorers.default.url}/tx/${redeem.transactionHash}`}
          target='_blank'
          rel='noopener'
          variant='textLink'
          color={
            redeem.action === HistoryAction.WON ? 'green.500 !important' : 'red.500 !important'
          }
        >
          {truncateEthAddress(redeem.transactionHash)}
        </Link>
      </Td>
    </Tr>
  )
}
