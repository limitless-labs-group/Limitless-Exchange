import { defaultChain } from '@/constants'
import { HistoryRedeem } from '@/services'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { Box, HStack, Link, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { useAllMarkets, useMarketByConditionId } from '@/services/MarketsService'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import NextLink from 'next/link'

interface IPortfolioHistoryRedeemItem extends TableRowProps {
  redeem: HistoryRedeem
}

export const PortfolioHistoryRedeemItem = ({ redeem, ...props }: IPortfolioHistoryRedeemItem) => {
  /**
   * MARKET DATA
   */
  const market = useMarketByConditionId(redeem.conditionId)

  const allMarkets = useAllMarkets()

  const targetMarket = allMarkets.find((market) => market.conditionId === redeem.conditionId)

  // @ts-ignore
  const link = targetMarket?.slug
    ? // @ts-ignore
      `/market-group/${targetMarket.slug}`
    : `/markets/${targetMarket?.address}`

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
    4
  )

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
            {/* that's temporal solution since the bug is on indexer side. it returns not formatted values that's why we need to * on 10e12 */}
            {`${formattedAmount} ${market?.collateralToken.symbol}`}
          </Text>
        </Box>
      </Td>
      <Td
        textDecoration='underline'
        w='420px'
        maxW='420px'
        whiteSpace='nowrap'
        overflow='hidden'
        textOverflow='ellipsis'
      >
        <NextLink href={link}>{targetMarket?.proxyTitle ?? targetMarket?.title}</NextLink>
      </Td>
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
