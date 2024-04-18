import { collateralToken, defaultChain, markets } from '@/constants'
import { HistoryTrade } from '@/services'
import { borderRadius } from '@/styles'
import { Market } from '@/types'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { Box, HStack, Heading, Image, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { FaExternalLinkAlt } from 'react-icons/fa'

interface IPortfolioHistoryTableItem extends TableRowProps {
  trade: HistoryTrade
}

export const PortfolioHistoryTableItem = ({
  trade,
  children,
  ...props
}: IPortfolioHistoryTableItem) => {
  const router = useRouter()
  const market: Market | null = useMemo(
    () =>
      markets.find(
        (market) => market.address[defaultChain.id]?.toLowerCase() === trade.market.id.toLowerCase()
      ) ?? null,
    [trade, markets]
  )

  return (
    <Tr pos={'relative'} {...props}>
      <Td pl={0}>
        <HStack
          style={{ textWrap: 'wrap' }}
          cursor={'pointer'}
          onClick={() => router.push(`/markets/${trade.market.id}`)}
        >
          <Image
            src={market?.imageURI}
            w={{ sm: '40px' }}
            h={{ sm: '40px' }}
            fit={'cover'}
            bg={'brand'}
            borderRadius={borderRadius}
          />
          <Heading
            size={'sm'}
            _hover={{ textDecor: 'underline' }}
            wordBreak={'break-word'}
            maxW={'400px'}
            minW={'200px'}
          >
            {market?.title ?? 'Noname market'}
          </Heading>
        </HStack>
      </Td>

      <Td>
        <Box
          w={'fit-content'}
          p={'2px 6px'}
          bg={trade.outcomeTokenId == 0 ? 'green' : 'red'}
          color={trade.outcomeTokenId == 0 ? 'white' : 'white'}
          fontWeight={'bold'}
          borderRadius={'6px'}
          fontSize={'13px'}
        >
          {market?.outcomeTokens[trade.outcomeTokenId ?? 0]}{' '}
          {NumberUtil.toFixed(trade.outcomePercent, 3)} {collateralToken.symbol}
        </Box>
      </Td>

      <Td>{trade.strategy}</Td>

      {/* Amount */}
      <Td isNumeric>
        <Text fontWeight={'bold'}>
          {`${NumberUtil.toFixed(
            Number(trade.collateralAmount ?? 0) * (trade.strategy == 'Sell' ? -1 : 1),
            4
          )} ${collateralToken.symbol}`}
        </Text>
      </Td>

      {/* Shares */}
      <Td isNumeric>{NumberUtil.toFixed(trade.outcomeTokenAmount, 4)}</Td>

      {/* Tx */}
      <Td pr={0}>
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
