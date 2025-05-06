import { defaultChain } from '@/constants'
import { HistoryTrade } from '@/services'
import { borderRadius } from '@/styles'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { HStack, Heading, Image, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { useMarket } from '@/services/MarketsService'
import { mockMarkets } from '@/services/mock-markets'

interface IPortfolioHistoryTradeItem extends TableRowProps {
  trade: HistoryTrade
}

export const PortfolioHistoryTradeItem = ({ trade, ...props }: IPortfolioHistoryTradeItem) => {
  /**
   * NAVIGATION
   */
  const router = useRouter()

  /**
   * MARKET DATA
   */
  const market = mockMarkets.data.find(
    (market) => market.address[defaultChain.id] === trade.market.id
  )

  return (
    <Tr pos={'relative'} {...props}>
      <Td pl={0} pr={2}>
        <HStack
          style={{ textWrap: 'wrap' }}
          cursor={'pointer'}
          _hover={{ textDecor: 'underline' }}
          onClick={() => router.push(`/markets/${trade.market.id}`)}
        >
          <Image
            src={market?.imageURI}
            w={'40px'}
            h={'40px'}
            fit={'cover'}
            bg={'brand'}
            borderRadius={borderRadius}
            alt='token'
          />
          <Heading size={'sm'} wordBreak={'break-word'} maxW={'400px'} minW={'200px'}>
            {market?.title ?? 'Noname market'}
          </Heading>
        </HStack>
      </Td>

      <Td px={2}>
        <Text color={trade.outcomeIndex == 0 ? 'green' : 'red'} fontWeight={'bold'}>
          {market?.outcomeTokens[trade.outcomeIndex ?? 0]}{' '}
          {NumberUtil.formatThousands(trade.outcomeTokenPrice, 3)}{' '}
          {market?.tokenTicker[defaultChain.id]}
        </Text>
      </Td>

      <Td px={2}>{trade.strategy}</Td>

      {/* Amount */}
      <Td px={2} isNumeric>
        <Text fontWeight={'bold'}>
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
