import { degen, higher, regen, weth } from '@/constants/tokens'
import { Market } from '@/types'
import { zeroAddress } from 'viem'
import { base, baseSepolia } from 'viem/chains'

export const markets: Market[] = [
  {
    address: {
      [base.id]: '0x4585482A258d66b16a95734E86DCA1Ea338AC100', // prod
      [baseSepolia.id]: '0x5856Fb2BAB01b7b8330903eCb61374A9b2fb648c', //testnet
    },
    questionId: {
      [base.id]: '0x0000000000000000000000000000000000000031373134333938343634363738', // prod
      [baseSepolia.id]: '0x0000000000000000000000000000000000000031373135373333323233363833', // testnet
    },
    conditionId: {
      [base.id]: '0x85b3752114969525a2a84dba1c1f2534bf830e64c1293a758095126a4dd165ba', // prod
      [baseSepolia.id]: '0xcfe3e3db08f015e99b4ec97ad3aa01ee694937ce6af526b8c17a3c844788e311', // testnet
    },
    collateralToken: {
      [base.id]: weth.address[base.id], // prod
      [baseSepolia.id]: weth.address[baseSepolia.id], // testnet
    },
    tokenTicker: 'WETH',
    tokenURI: '/assets/images/tokens/weth.png',
    outcomeTokens: ['Yes', 'No'],
    title: 'Will Limitless achieve $10M in volume in the first year since launch?',
    description: `Bet on or against new social prediction market Limitless’ success.`,
    placeholderURI: '/assets/images/markets/market4-placeholder.jpg',
    imageURI: '/assets/images/markets/market4.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market4-og.jpg',
    expirationDate: 'Apr 25, 2025',
    expirationTimestamp: 1745614799000,
    expired: Date.now() > 1745614799000, // TODO: make dynamic
    creator: {
      name: '@grin',
      imageURI: '/assets/images/markets/grin.jpg',
      link: 'https://warpcast.com/grin',
    },
    tags: ['Limitless', 'KPI driven', 'Grin'],
  },
  {
    address: {
      [base.id]: '0x0e03eDc2A0ba38E803DaD62b31b6e6A2f4b216cc', // prod
      [baseSepolia.id]: '0xCA8CD401A4560A0D1B158f8292b85C78cB38Ffc1', // testnet
    },
    questionId: {
      [base.id]: '0x0000000000000000000000000000000000000031373133383836363736333632', // prod
      [baseSepolia.id]: '0x0000000000000000000000000000000000000031373135323436343231383432', // testnet
    },
    conditionId: {
      [base.id]: '0x33173bef347cb768b208efd547d445aec0fa1fc16f869093a7783e13ac2c2fff', // prod
      [baseSepolia.id]: '0x84d5169ac2cecd75741c02d71eb85e11c51ec6d8ed442b37e4d3210fbc03192c', // testnet
    },
    collateralToken: {
      [base.id]: weth.address[base.id], // prod
      [baseSepolia.id]: degen.address[baseSepolia.id], // testnet
    },
    tokenURI: '/assets/images/tokens/degen.svg',
    tokenTicker: 'DEGEN',
    outcomeTokens: ['Yes', 'No'],
    title: 'Will $DEGEN have 1M+ holders by the end of 2024?',
    description:
      'Bet on whether $DEGEN will reach over 1 million holders by the close of 2024! Place your stake and predict the future of the $DEGEN community growth.',
    placeholderURI: '/assets/images/markets/market1-placeholder.jpg',
    imageURI: '/assets/images/markets/market1.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market1-og.jpg',
    expirationDate: 'Dec 31, 2024',
    expirationTimestamp: 1735682399000,
    expired: Date.now() > 1735682399000, // TODO: make dynamic
    creator: {
      name: '/skininthegame',
      imageURI: '/assets/images/markets/skininthegame.jpg',
      link: 'https://warpcast.com/~/channel/skininthegame',
    },
    tags: ['Degen', 'Memecoins', 'Base', 'Farcaster'],
  },
  {
    address: {
      [base.id]: '0x2a5254e52e338228dcd82baa4374608bb884e834', // prod
      [baseSepolia.id]: '0x1a2ba71e69a2ad9ff40555b30586bba0efcd7616',
    },
    questionId: {
      [base.id]: '0x0000000000000000000000000000000000000031373133383836353239313438', // prod
      [baseSepolia.id]: '0x0000000000000000000000000000000000000031373135323436353432323633', // testnet
    },
    conditionId: {
      [base.id]: '0xa397e6687681345146d869a05591b002039d1ed88bfc5e871bf36d26cd89e367', // prod
      [baseSepolia.id]: '0x97e1b00a92cf8041deb17ccf2ea22ff61bec9b8474f77fc66cf2bec33aad4d58', // testnet
    },
    collateralToken: {
      [base.id]: weth.address[base.id], // prod
      [baseSepolia.id]: regen.address[baseSepolia.id], // testnet
    },
    outcomeTokens: ['Yes', 'No'],
    tokenTicker: 'REGEN',
    tokenURI: '/assets/images/tokens/regen.svg',
    title: 'Will Farcaster hit 100k WAUs before the end of Farcon?',
    description: `Think Farcaster will hit 100k WAUs before Farcon finishes on May 5? Bet on your belief and see if Farcaster blows up again!`,
    placeholderURI: '/assets/images/markets/market2-placeholder.jpg',
    imageURI: '/assets/images/markets/market2.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market2-og.jpg',
    expirationDate: 'May 5, 2024',
    expirationTimestamp: 1716305451000,
    expired: false, // TODO: make dynamic
    winningOutcomeIndex: 1, // TODO: report winners
    creator: {
      name: '@rev',
      imageURI: '/assets/images/markets/rev.jpg',
      link: 'https://warpcast.com/rev',
    },
    tags: ['Farcaster', 'Warpcast'],
  },
  {
    address: {
      [base.id]: '0xE47907110663A3F0c06c1929ea52f50bC9821d13', // prod
      [baseSepolia.id]: '0x729873AA483CEd60ACb0B7Ad815f14C8A7794930',
    },
    questionId: {
      [base.id]: '0x0000000000000000000000000000000000000031373133383836363839313539', // prod
      [baseSepolia.id]: '0x0000000000000000000000000000000000000031373135323436373136313237', // testnet
    },
    conditionId: {
      [base.id]: '0x1f7ac97795fbb425912193fc477b009cc6d1bc7b503e9dd938b8a3281093a513', // prod
      [baseSepolia.id]: '0xf0344b254c603d3d44d38629cd6b0c4c6c3c4115411d41c54e0ce2748072685a', // testnet
    },
    collateralToken: {
      [base.id]: weth.address[base.id], // prod
      [baseSepolia.id]: higher.address[baseSepolia.id], // testnet
    },
    tokenTicker: 'HIGHER',
    tokenURI: '/assets/images/tokens/higher.svg',
    outcomeTokens: ['Yes', 'No'],
    title: 'Will $HIGHER hit $100M FDV in May?',
    description: `Will $HIGHER reach a $100M FDV in May? Place your bets today!`,
    placeholderURI: '/assets/images/markets/market3-placeholder.jpg',
    imageURI: '/assets/images/markets/market3.jpg',
    ogImageURI: 'https://limitless.exchange/assets/images/markets/market3-og.jpg',
    expirationDate: 'May 31, 2024',
    expirationTimestamp: 1716305451000,
    expired: Date.now() > 1716305451000, // TODO: make dynamic
    creator: {
      name: '/onchain',
      imageURI: '/assets/images/markets/onchain.jpg',
      link: 'https://warpcast.com/~/channel/onchain',
    },
    tags: ['Onchain', 'Farcaster', 'Memecoins', 'Base'],
  },
]
