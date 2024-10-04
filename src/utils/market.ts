import { Market, MarketSingleCardResponse, MarketStatus } from '@/types'
import { Address } from 'viem'

export function dailyMarketToMarket(
  market: MarketSingleCardResponse,
  conllateralAddress?: Address
): Market {
  return {
    ...market,
    description: 'dumb description',
    ogImageURI: '',
    expirationDate: '',
    expirationTimestamp: +market.deadline,
    winningOutcomeIndex: null,
    expired: false,
    tags: [],
    address: market.address as Address,
    status: MarketStatus.FUNDED,
    collateralToken: {
      ...market.collateralToken,
      address: conllateralAddress || (market.collateralToken.address as Address),
    },
  }
}
