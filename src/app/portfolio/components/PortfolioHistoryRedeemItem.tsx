import { defaultChain } from '@/constants'
import { HistoryRedeem } from '@/services'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { Box, HStack, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { useMarketByConditionId } from '@/services/MarketsService'

interface IPortfolioHistoryRedeemItem extends TableRowProps {
  redeem: HistoryRedeem
}

export const PortfolioHistoryRedeemItem = ({ redeem, ...props }: IPortfolioHistoryRedeemItem) => {
  /**
   * NAVIGATION
   */
  const router = useRouter()

  /**
   * MARKET DATA
   */
  const market = useMarketByConditionId(redeem.conditionId)

  return (
    <Tr pos={'relative'} {...props}>
      <Td pl={0} pr={2}>
        <HStack
          style={{ textWrap: 'wrap' }}
          cursor={'pointer'}
          _hover={{ textDecor: 'underline' }}
          onClick={() => router.push(`/markets/${market?.address}`)}
        >
          <Text size={'sm'} wordBreak={'break-word'} maxW={'400px'} minW={'200px'}>
            {market?.proxyTitle ?? market?.title ?? 'Noname market'}
          </Text>
        </HStack>
      </Td>

      <Td px={2}>
        <Text color={redeem.outcomeIndex == 0 ? 'green.500' : 'red.500'}>
          {redeem.outcomeIndex ? 'No' : 'Yes'}
        </Text>
      </Td>

      <Td px={2}>Claim</Td>

      <Td px={2} isNumeric colSpan={2}>
        <Box textAlign='center' verticalAlign='middle'>
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
              `${defaultChain.blockExplorers.default.url}/tx/${redeem.transactionHash}`,
              '_blank',
              'noopener'
            )
          }
        >
          <Text>{truncateEthAddress(redeem.transactionHash)}</Text>
          <FaExternalLinkAlt size={'10px'} />
        </HStack>
      </Td>
    </Tr>
  )
}
