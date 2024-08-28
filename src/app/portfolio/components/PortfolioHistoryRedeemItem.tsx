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

  const link = targetMarket?.group?.slug
    ? `/market-group/${targetMarket.group.slug}`
    : `/markets/${targetMarket?.address}`

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
            {`${NumberUtil.formatThousands(
              (market?.collateralToken.symbol === 'USDC'
                ? Math.pow(10, 12) * Number(redeem.collateralAmount)
                : Number(redeem.collateralAmount)) ?? 0,
              4
            )} 
          ${market?.collateralToken.symbol}`}
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
        <NextLink href={link}>
          {targetMarket?.group?.id
            ? `${targetMarket.group.title}: ${targetMarket.title}`
            : targetMarket?.title}
        </NextLink>
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
