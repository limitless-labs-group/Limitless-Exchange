import { Text } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import MarketFeedCardContainer from '@/components/feed/components/market-feed-card-container'
import { useTradingService } from '@/services'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { FeedEventType } from '@/types'
import { ClobTradeEvent } from '@/types/orders'
import { NumberUtil } from '@/utils'

interface ActivityClobItemProps {
  data: ClobTradeEvent
}

export default function ActivityClobItem({ data }: ActivityClobItemProps) {
  const { market, groupMarket } = useTradingService()
  const targetMarket = groupMarket
    ? groupMarket?.markets?.find(
        (market) => market.tokens.yes === data.tokenId || market.tokens.no === data.tokenId
      )
    : market
  const title = data.side === 0 ? 'Bought' : 'Sold'
  const contracts = NumberUtil.toFixed(
    formatUnits(BigInt(data.matchedSize), market?.collateralToken.decimals || 6),
    6
  )
  const outcome = targetMarket?.tokens.yes === data.tokenId ? 'Yes' : 'No'
  const price = new BigNumber(data.price).multipliedBy(100).decimalPlaces(1).toString()
  const totalAmount = formatUnits(BigInt(data.takerAmount), market?.collateralToken.decimals || 6)

  const textComponent = (
    <Text
      {...paragraphRegular}
      fontSize='16px'
      marginTop={isMobile ? '16px' : '12px'}
      marginBottom={isMobile ? '12px' : '8px'}
      userSelect='text'
    >
      {title}{' '}
      <Text color={outcome === 'Yes' ? 'green.500' : 'red.500'} as='span'>
        {contracts} {outcome}
      </Text>{' '}
      {market?.marketType == 'group' && (
        <>
          for <strong>{data.title}</strong>
        </>
      )}{' '}
      at {price}¢{' '}
      <span style={{ opacity: 0.5 }}>(${NumberUtil.convertWithDenomination(totalAmount, 2)})</span>
    </Text>
  )

  const user = {
    name: data.profile?.displayName ?? data.profile?.account ?? '',
    imageURI: data.profile?.pfpUrl ?? '',
    link: data.profile?.socialUrl ?? '',
    account: data.profile?.smartWallet ?? data.profile?.account ?? '',
  }

  return (
    <MarketFeedCardContainer
      user={user}
      eventType={FeedEventType.NewTrade}
      timestamp={new Date(data.createdAt).getTime() / 1000}
      title=''
      isActivityTab={true}
      titleAsComponent={textComponent}
    />
  )
}
