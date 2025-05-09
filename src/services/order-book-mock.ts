export const orderBookMock = {
  data: {
    bids: [
      {
        price: 0.163,
        size: 300000000,
        side: 'BUY',
      },
      {
        price: 0.162,
        size: 200000000,
        side: 'BUY',
      },
      {
        price: 0.16,
        size: 2200000000,
        side: 'BUY',
      },
    ],
    asks: [
      {
        price: 0.19,
        size: 500000000,
        side: 'SELL',
      },
      {
        price: 0.2,
        size: 200000000,
        side: 'SELL',
      },
    ],
    tokenId: '1691244802922192511306691803241361072537705243188272077972825633472206567331',
    lastTradePrice: 0.162,
    adjustedMidpoint: 0.1765,
    maxSpread: '0.035',
    minSize: '50000000',
  },
}
