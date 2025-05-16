export const mockMarketResponse = {
  data: {
    id: 3472,
    conditionId: '0x512fb968da174affb74f206432a2630258662cc2b6f23d1cb076d7ab5741860c',
    negRiskRequestId: null,
    description:
      '<p>This market will resolve to "YES" if the rate of ETH to BTC is greater than 0.04 by June 30, 2025, 23:59 UTC, according to CoinMarketCap (<a href="https://coinmarketcap.com/currencies/ethereum/eth/btc/" rel="noopener noreferrer" target="_blank" style="color: inherit;">https://coinmarketcap.com/currencies/ethereum/eth/btc/</a>). Otherwise, the market will resolve to "NO". The final resolution will be determined based on a .csv file downloaded from CoinMarketCap, using the hourly closing candle price at the specified time.&nbsp;</p>',
    collateralToken: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      symbol: 'USDC',
    },
    title: '💎 ETH to BTC rate > 0.04 by the end of Q2?',
    proxyTitle: null,
    expirationDate: 'Jun 30, 2025',
    expirationTimestamp: 1751327940000,
    createdAt: '2025-03-31T18:11:42.943Z',
    categories: ['Crypto'],
    status: 'FUNDED',
    expired: false,
    creator: {
      name: 'Limitless',
      imageURI: 'https://limitless.exchange/assets/images/logo.svg',
      link: 'https://x.com/trylimitless',
    },
    tags: ['Daily', 'Market Crash'],
    volume: '20389745212',
    volumeFormatted: '20389.745212',
    tokens: {
      yes: '96413826178958720564520549788541489724663941052955793822543917734457132362067',
      no: '113399374688005922732807745620975074927218008519593569194863619491070844153977',
    },
    prices: [0.0255, 0.9745],
    tradePrices: {
      buy: {
        market: [0.03, 0.979],
        limit: [0.021, 0.97],
      },
      sell: {
        market: [0.021, 0.97],
        limit: [0.03, 0.979],
      },
    },
    isRewardable: true,
    slug: 'eth-to-btc-rate-greater-004-by-the-end-of-q2-1743446275657',
    tradeType: 'clob',
    marketType: 'single',
    priorityIndex: 0,
    winningOutcomeIndex: null,
    metadata: {
      isBannered: true,
    },
    settings: {
      minSize: '100000000',
      maxSpread: 0.035,
      dailyReward: '20',
      rewardsEpoch: '0.01388888888888889',
      c: '3',
    },
  },
}
