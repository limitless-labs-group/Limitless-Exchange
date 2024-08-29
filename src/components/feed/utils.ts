import { FeedEventType } from '@/components/feed/types'

export const feedMockData = [
  {
    creator: {
      name: 'CJ',
      imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/8/pfp.png',
      link: 'https://warpcast.com/cjh',
    },
    timestamp: 1724832469,
    eventType: FeedEventType.SoldContracts,
    market: {
      name: 'Will Limitless achieve $10M in volume in the first year since launch?',
      address: '0x4585482A258d66b16a95734E86DCA1Ea338AC100',
    },
    data: {
      price: 20.83,
      outcomeIndex: 1,
      collateralToken: {
        symbol: 'WETH',
        collateralAmount: 1.23456,
        address: '0x4200000000000000000000000000000000000006',
      },
    },
  },
  {
    creator: {
      name: 'CJ',
      imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/8/pfp.png',
      link: 'https://warpcast.com/cjh',
    },
    timestamp: 1724835637,
    eventType: FeedEventType.MarketCreated,
    market: {
      name: 'Will Limitless achieve $10M in volume in the first year since launch?',
      address: '0x4585482A258d66b16a95734E86DCA1Ea338AC100',
    },
    data: {
      liquidity: 1,
      volume: 0,
      prices: [75, 25],
      collateralToken: {
        symbol: 'WETH',
        collateralAmount: 1.23456,
        address: '0x4200000000000000000000000000000000000006',
      },
    },
  },
  {
    creator: {
      name: 'CJ',
      imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/8/pfp.png',
      link: 'https://warpcast.com/cjh',
    },
    timestamp: 1724832469,
    eventType: FeedEventType.BoughtContracts,
    market: {
      name: 'Will Limitless achieve $10M in volume in the first year since launch?',
      address: '0x4585482A258d66b16a95734E86DCA1Ea338AC100',
    },
    data: {
      price: 20.83,
      outcomeIndex: 1,
      collateralToken: {
        symbol: 'WETH',
        collateralAmount: 0.12345,
        address: '0x4200000000000000000000000000000000000006',
      },
    },
  },
  {
    creator: {
      name: 'CJ',
      imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/8/pfp.png',
      link: 'https://warpcast.com/cjh',
    },
    timestamp: 1724746069,
    eventType: FeedEventType.SoldContracts,
    market: {
      name: 'Will Limitless achieve $10M in volume in the first year since launch?',
      address: '0x4585482A258d66b16a95734E86DCA1Ea338AC100',
    },
    data: {
      price: 71.11,
      outcomeIndex: 0,
      collateralToken: {
        symbol: 'WETH',
        collateralAmount: 0.03456,
        address: '0x4200000000000000000000000000000000000006',
      },
    },
  },
  {
    creator: {
      name: 'CJ',
      imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/8/pfp.png',
      link: 'https://warpcast.com/cjh',
    },
    timestamp: 1724659669,
    eventType: FeedEventType.MarketClosed,
    market: {
      name: 'Will Limitless achieve $10M in volume in the first year since launch?',
      address: '0x4585482A258d66b16a95734E86DCA1Ea338AC100',
    },
    data: {
      liquidity: 1,
      volume: 0,
      prices: [75, 25],
      collateralToken: {
        symbol: 'WETH',
        collateralAmount: 1.23456,
        address: '0x4200000000000000000000000000000000000006',
      },
    },
  },
  {
    creator: {
      name: 'CJ',
      imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/8/pfp.png',
      link: 'https://warpcast.com/cjh',
    },
    timestamp: 1724832469,
    eventType: FeedEventType.BoughtContracts,
    market: {
      name: 'Will Limitless achieve $10M in volume in the first year since launch?',
      address: '0x4585482A258d66b16a95734E86DCA1Ea338AC100',
    },
    data: {
      price: 56.11,
      outcomeIndex: 0,
      collateralToken: {
        symbol: 'WETH',
        collateralAmount: 0.12345,
        address: '0x4200000000000000000000000000000000000006',
      },
    },
  },
  {
    creator: {
      name: 'CJ',
      imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/8/pfp.png',
      link: 'https://warpcast.com/cjh',
    },
    timestamp: 1724832469,
    eventType: FeedEventType.BoughtContracts,
    market: {
      name: 'Will Limitless achieve $10M in volume in the first year since launch?',
      address: '0x4585482A258d66b16a95734E86DCA1Ea338AC100',
    },
    data: {
      price: 56.11,
      outcomeIndex: 0,
      collateralToken: {
        symbol: 'WETH',
        collateralAmount: 0.12345,
        address: '0x4200000000000000000000000000000000000006',
      },
    },
  },
  {
    creator: {
      name: 'CJ',
      imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/8/pfp.png',
      link: 'https://warpcast.com/cjh',
    },
    timestamp: 1724832469,
    eventType: FeedEventType.BoughtContracts,
    market: {
      name: 'Will Limitless achieve $10M in volume in the first year since launch?',
      address: '0x4585482A258d66b16a95734E86DCA1Ea338AC100',
    },
    data: {
      price: 56.11,
      outcomeIndex: 0,
      collateralToken: {
        symbol: 'WETH',
        collateralAmount: 0.12345,
        address: '0x4200000000000000000000000000000000000006',
      },
    },
  },
  {
    creator: {
      name: 'CJ',
      imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/8/pfp.png',
      link: 'https://warpcast.com/cjh',
    },
    timestamp: 1724832469,
    eventType: FeedEventType.BoughtContracts,
    market: {
      name: 'Will Limitless achieve $10M in volume in the first year since launch?',
      address: '0x4585482A258d66b16a95734E86DCA1Ea338AC100',
    },
    data: {
      price: 56.11,
      outcomeIndex: 0,
      collateralToken: {
        symbol: 'WETH',
        collateralAmount: 0.12345,
        address: '0x4200000000000000000000000000000000000006',
      },
    },
  },
]
