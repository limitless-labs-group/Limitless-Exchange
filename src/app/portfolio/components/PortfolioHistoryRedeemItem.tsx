import { collateralToken, defaultChain, markets } from '@/constants'
import { HistoryRedeem } from '@/services'
import { borderRadius } from '@/styles'
import { Market } from '@/types'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { HStack, Heading, Image, TableRowProps, Td, Text, Tr } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { FaExternalLinkAlt } from 'react-icons/fa'

interface IPortfolioHistoryRedeemItem extends TableRowProps {
  redeem: HistoryRedeem
}

export const PortfolioHistoryRedeemItem = ({
  redeem,
  children,
  ...props
}: IPortfolioHistoryRedeemItem) => {
  const router = useRouter()

  const market: Market | null = useMemo(
    () =>
      markets.find(
        (market) =>
          market.conditionId[defaultChain.id]?.toLowerCase() === redeem.conditionId.toLowerCase()
      ) ?? null,
    [redeem, markets]
  )

  return (
    <Tr pos={'relative'} {...props}>
      <Td pl={0} pr={2}>
        <HStack
          style={{ textWrap: 'wrap' }}
          cursor={'pointer'}
          _hover={{ textDecor: 'underline' }}
          onClick={() => router.push(`/markets/${market?.address[defaultChain.id]}`)}
        >
          <Image
            src={market?.imageURI}
            w={'40px'}
            h={'40px'}
            fit={'cover'}
            bg={'brand'}
            borderRadius={borderRadius}
          />
          <Heading size={'sm'} wordBreak={'break-word'} maxW={'400px'} minW={'200px'}>
            {market?.title ?? 'Noname market'}
          </Heading>
        </HStack>
      </Td>

      <Td px={2}>
        <Text color={redeem.outcomeIndex == 0 ? 'green' : 'red'} fontWeight={'bold'}>
          {market?.outcomeTokens[redeem.outcomeIndex ?? 0]}
        </Text>
      </Td>

      <Td px={2}>Claim</Td>

      {/* Amount */}
      <Td px={2} isNumeric>
        <Text fontWeight={'bold'}>
          {`${NumberUtil.toFixed(Number(redeem.collateralAmount ?? 0), 6)} ${
            collateralToken.symbol
          }`}
        </Text>
      </Td>

      {/* Contracts */}
      <Td px={2} isNumeric>
        {NumberUtil.toFixed(redeem.collateralAmount, 6)}
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
