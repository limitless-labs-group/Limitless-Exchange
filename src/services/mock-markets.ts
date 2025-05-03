import { defaultChain } from '@/constants'
import { Market } from '@/types'

export const mockMarkets: { data: Market[] } = {
  data: [
    {
      address: {
        [defaultChain.id]: '0x1',
      },
      questionId: {
        [defaultChain.id]: '0x1',
      },
      conditionId: {
        [defaultChain.id]: '0x1',
      },
      collateralToken: {
        [defaultChain.id]: '0x1',
      },
      hidden: {
        [defaultChain.id]: false,
      },
      resolved: {
        [defaultChain.id]: false,
      },
      outcomeTokens: ['Yes', 'No'],
      title: 'Will CJ buy a white suit in July?',
      description:
        'This market will resolve to YES if CJ is posted any photo confirming he bought a white suit during July, 2025',
      placeholderURI: 'assets/images/cj.png',
      imageURI: '/assets/images/cj.png',
      expirationDate: '11 May, 2025',
      expirationTimestamp: 1747007999,
      createdAt: 1754006399,
      expired: false,
      tokenTicker: {
        [defaultChain.id]: 'USDC',
      },
      tokenURI: {
        [defaultChain.id]:
          'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
      },
      creator: {
        imageURI: 'https://limitless.exchange/assets/images/logo.svg',
        link: 'https://x.com/trylimitless',
        name: 'Limitless',
      },
      prices: [15, 85],
      tags: ['sashko'],
      winningOutcomeIndex: null,
      volume: '75000000',
      liquidity: '1000000000',
      outcomeTokensPercent: [15, 85],
    },
    {
      address: {
        [defaultChain.id]: '0x4',
      },
      questionId: {
        [defaultChain.id]: '0x4',
      },
      conditionId: {
        [defaultChain.id]: '0x4',
      },
      collateralToken: {
        [defaultChain.id]: '0x4',
      },
      hidden: {
        [defaultChain.id]: false,
      },
      resolved: {
        [defaultChain.id]: false,
      },
      outcomeTokens: ['Yes', 'No'],
      title: 'Will Dima put 5 stars 2 times in a row during tech syncs?',
      description:
        'This market will be resolved to YES if Dima put 5 stars at some tech sync and the other exactly after previous. The resolution is based on tech syncs outcomes but you can always ask Dima to do this and share some moni (not sure he will go for it).',
      placeholderURI: 'assets/images/val.png',
      imageURI: '/assets/images/val.png',
      expirationDate: '01 Jan, 2027',
      expirationTimestamp: 1798761600,
      createdAt: 1754006399,
      expired: false,
      tokenTicker: {
        [defaultChain.id]: 'USDC',
      },
      tokenURI: {
        [defaultChain.id]:
          'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
      },
      creator: {
        imageURI: 'https://limitless.exchange/assets/images/logo.svg',
        link: 'https://x.com/trylimitless',
        name: 'Limitless',
      },
      prices: [63, 37],
      tags: ['dima'],
      winningOutcomeIndex: null,
      volume: '780000000',
      liquidity: '500000000',
      outcomeTokensPercent: [63, 37],
    },
    {
      address: {
        [defaultChain.id]: '0x2',
      },
      questionId: {
        [defaultChain.id]: '0x2',
      },
      conditionId: {
        [defaultChain.id]: '0x2',
      },
      collateralToken: {
        [defaultChain.id]: '0x2',
      },
      hidden: {
        [defaultChain.id]: false,
      },
      resolved: {
        [defaultChain.id]: false,
      },
      outcomeTokens: ['Yes', 'No'],
      title: 'Will Roman not abuse Sashko on the next week?',
      description:
        "This market will resolve to YES if Roman will not abuse Sashko until the next week. If no one from the Limitless team or Sashko himself reports about Roman's abusive attitude market resolved to YES. If only Roman reports that he was abusive towards Sashko, this statement is not considered, market resolved to NO.",
      placeholderURI: 'assets/images/sashko.png',
      imageURI: '/assets/images/sashko.png',
      expirationDate: '31 Jul, 2025',
      expirationTimestamp: 1754006399,
      createdAt: 1754006399,
      expired: false,
      tokenTicker: {
        [defaultChain.id]: 'USDC',
      },
      tokenURI: {
        [defaultChain.id]:
          'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
      },
      creator: {
        imageURI: 'https://limitless.exchange/assets/images/logo.svg',
        link: 'https://x.com/trylimitless',
        name: 'Limitless',
      },
      prices: [1, 99],
      tags: ['cj'],
      winningOutcomeIndex: null,
      volume: '2600000000',
      liquidity: '1000000000',
      outcomeTokensPercent: [1, 99],
    },
    {
      address: {
        [defaultChain.id]: '0x3',
      },
      questionId: {
        [defaultChain.id]: '0x3',
      },
      conditionId: {
        [defaultChain.id]: '0x3',
      },
      collateralToken: {
        [defaultChain.id]: '0x3',
      },
      hidden: {
        [defaultChain.id]: false,
      },
      resolved: {
        [defaultChain.id]: false,
      },
      outcomeTokens: ['Yes', 'No'],
      title: 'Will Val be promoted to the higher position as a Chef Technical Officer this year?👨‍🍳',
      description:
        "This market will resolve to YES if Val is promoted and resigned a contract with a new position of Chef Technical Officer👨‍🍳. No confirmation is needed it's obvious.",
      placeholderURI: 'assets/images/val.png',
      imageURI: '/assets/images/val.png',
      expirationDate: '31 Dec, 2025',
      expirationTimestamp: 1767225599,
      createdAt: 1754006399,
      expired: false,
      tokenTicker: {
        [defaultChain.id]: 'USDC',
      },
      tokenURI: {
        [defaultChain.id]:
          'https://assets.coingecko.com/coins/images/6319/standard/usdc.png?1696506694',
      },
      creator: {
        imageURI: 'https://limitless.exchange/assets/images/logo.svg',
        link: 'https://x.com/trylimitless',
        name: 'Limitless',
      },
      prices: [99, 1],
      tags: ['val'],
      winningOutcomeIndex: null,
      volume: '1200000000',
      liquidity: '1000000000',
      outcomeTokensPercent: [99, 1],
    },
  ],
}
