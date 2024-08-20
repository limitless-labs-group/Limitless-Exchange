import { defaultChain } from '@/constants'
import { HistoryRedeem } from '@/services'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { Box, HStack, Link, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { useMarketByConditionId } from '@/services/MarketsService'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'

interface IPortfolioHistoryRedeemItem extends TableRowProps {
  redeem: HistoryRedeem
}

export const PortfolioHistoryRedeemItem = ({ redeem, ...props }: IPortfolioHistoryRedeemItem) => {
  /**
   * MARKET DATA
   */
  const market = useMarketByConditionId(redeem.conditionId)

  return (
    <Tr pos={'relative'} {...props}>
      <Td w='92px'>Won</Td>
      <Td>
        <HStack gap='4px'>
          {market?.outcomeTokens[redeem.outcomeIndex] ? (
            <ThumbsDownIcon width={16} height={16} />
          ) : (
            <ThumbsUpIcon width={16} height={16} />
          )}{' '}
          <Text {...paragraphRegular}>{market?.outcomeTokens[redeem.outcomeIndex ?? 0]}</Text>
        </HStack>
      </Td>
      <Td></Td>
      <Td isNumeric>
        <Box verticalAlign='middle'>
          <Text>
            {/* that's temporal solution since the bug is on indexer side. it returns not formatted values that's why we need to * on 10e12 */}
            {`${NumberUtil.formatThousands(
              (market?.tokenTicker[defaultChain.id] === 'USDC'
                ? Math.pow(10, 12) * Number(redeem.collateralAmount)
                : Number(redeem.collateralAmount)) ?? 0,
              4
            )} 
          ${market?.tokenTicker[defaultChain.id]}`}
          </Text>
        </Box>
      </Td>
      <Td w='420px' maxW='420px' whiteSpace='nowrap' overflow='hidden' textOverflow='ellipsis'>
        <Link href={`/markets/${market?.address[defaultChain.id]}`} variant='textLink'>
          {market?.proxyTitle ?? market?.title ?? 'Noname market'}
        </Link>
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
