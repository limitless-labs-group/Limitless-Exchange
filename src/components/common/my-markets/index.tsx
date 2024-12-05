import { Box, Text, VStack } from '@chakra-ui/react'
import MyMarketCard from '@/components/common/my-markets/components/my-market-card'
import { h3Bold } from '@/styles/fonts/fonts.styles'
import { Market, MarketStatus } from '@/types'

const mockMarkets: Market[] = [
  {
    address: '0x0e03eDc2A0ba38E803DaD62b31b6e6A2f4b216cc',
    conditionId: '0x33173bef347cb768b208efd547d445aec0fa1fc16f869093a7783e13ac2c2fff',
    description:
      'Bet on whether $DEGEN will reach over 1 million holders by the close of 2024! Place your stake and predict the future of the $DEGEN community growth.',
    collateralToken: {
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      symbol: 'WETH',
    },
    title: 'Will $DEGEN have 1M+ holders by the end of 2024?',
    proxyTitle: null,
    ogImageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/markets/1/og.png',
    expirationDate: 'Dec 31, 2024',
    expirationTimestamp: 1735689599000,
    createdAt: '2024-06-08T17:30:35.056Z',
    category: 'Crypto',
    winningOutcomeIndex: null,
    status: MarketStatus.PENDING,
    expired: false,
    creator: {
      name: '/skininthegame',
      imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/2/pfp.jpg',
      link: 'https://warpcast.com/~/channel/skininthegame',
    },
    tags: ['Farcaster', 'Degen', 'Memecoins', 'Base'],
    openInterest: '635578500000000000',
    openInterestFormatted: '0.635579',
    volume: '667934500000000000',
    volumeFormatted: '0.667934',
    liquidity: '1500000000000000000',
    liquidityFormatted: '1.500000',
    priorityIndex: 0,
    prices: [50, 50],
  },
  {
    address: '0x6B3E67E06b77c88C06265E0628A9176F659F423a',
    conditionId: '0x02ac17104c065a37ad2c2d86692fc405822569bacb499a606d5c6785e8a52b7c',
    description:
      'This market will resolve to "YES" if the BRETT price is above $0.1952 on Tuesday, 3 December at 5am Eastern Time according to CoinMarketCap | https://coinmarketcap.com/currencies/based-brett/ . Otherwise, the market will resolve to "NO". The final resolution will be based on a .csv file downloaded from CMC, with our price set to the hourly open candle for a specific time.',
    collateralToken: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      symbol: 'USDC',
    },
    title: 'Will BRETT be above $0.1952 on Tue at 5am ET?',
    proxyTitle: null,
    ogImageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/markets/1334/og.jpg',
    expirationDate: 'Dec 3, 2024',
    expirationTimestamp: 1733220000000,
    createdAt: '2024-12-02T19:30:29.985Z',
    category: 'Crypto',
    winningOutcomeIndex: 1,
    status: MarketStatus.RESOLVED,
    expired: true,
    creator: {
      name: 'Limitless',
      imageURI: 'https://limitless.exchange/assets/images/logo.svg',
      link: 'https://x.com/trylimitless',
    },
    tags: ['Daily', '$BRETT', 'Crypto'],
    openInterest: '17467225975',
    openInterestFormatted: '17467.225975',
    volume: '17636574025',
    volumeFormatted: '17636.574025',
    liquidity: '250000000',
    liquidityFormatted: '250.000000',
    priorityIndex: 0,
    prices: [0, 100],
  },
  {
    address: '0x97F788a6682bCea5322266625bEcabf55811e653',
    conditionId: '0x9907d3533cf9ae9707ba7b516cb2dae69672456ff09830bdf295628dd75b9e5e',
    description:
      'This market will resolve to "YES" if NVDA (NVIDIA Corporation Common Stock) closes above $135.34 at the end of the main market session on Wednesday, 4 December (4:00pm Eastern Time) according to NASDAQ | https://www.nasdaq.com/market-activity/stocks/nvda',
    collateralToken: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      symbol: 'USDC',
    },
    title: 'Will NVDA close above $135.34 on Wed at 4pm ET?',
    proxyTitle: null,
    ogImageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/markets/1246/og.jpg',
    expirationDate: 'Dec 4, 2024',
    expirationTimestamp: 1733346000000,
    createdAt: '2024-11-28T02:16:18.028Z',
    category: 'Stocks',
    winningOutcomeIndex: null,
    status: MarketStatus.FUNDED,
    expired: false,
    creator: {
      name: 'Limitless',
      imageURI: 'https://limitless.exchange/assets/images/logo.svg',
      link: 'https://x.com/trylimitless',
    },
    tags: ['Daily'],
    openInterest: '595877636',
    openInterestFormatted: '595.877636',
    volume: '608122364',
    volumeFormatted: '608.122364',
    liquidity: '250000000',
    liquidityFormatted: '250.000000',
    priorityIndex: 0,
    prices: [50, 50],
  },
  {
    address: '0x0e03eDc2A0ba38E803DaD62b31b6e6A2f4b216cc',
    conditionId: '0x33173bef347cb768b208efd547d445aec0fa1fc16f869093a7783e13ac2c2fff',
    description:
      'Bet on whether $DEGEN will reach over 1 million holders by the close of 2024! Place your stake and predict the future of the $DEGEN community growth.',
    collateralToken: {
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      symbol: 'WETH',
    },
    title: 'Will $DEGEN have 1M+ holders by the end of 2024?',
    proxyTitle: null,
    ogImageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/markets/1/og.png',
    expirationDate: 'Dec 31, 2024',
    expirationTimestamp: 1735689599000,
    createdAt: '2024-06-08T17:30:35.056Z',
    category: 'Crypto',
    winningOutcomeIndex: null,
    status: MarketStatus.PENDING,
    expired: false,
    creator: {
      name: '/skininthegame',
      imageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/creators/2/pfp.jpg',
      link: 'https://warpcast.com/~/channel/skininthegame',
    },
    tags: ['Farcaster', 'Degen', 'Memecoins', 'Base'],
    openInterest: '635578500000000000',
    openInterestFormatted: '0.635579',
    volume: '667934500000000000',
    volumeFormatted: '0.667934',
    liquidity: '1500000000000000000',
    liquidityFormatted: '1.500000',
    priorityIndex: 0,
    prices: [50, 50],
  },
  {
    address: '0x6B3E67E06b77c88C06265E0628A9176F659F423a',
    conditionId: '0x02ac17104c065a37ad2c2d86692fc405822569bacb499a606d5c6785e8a52b7c',
    description:
      'This market will resolve to "YES" if the BRETT price is above $0.1952 on Tuesday, 3 December at 5am Eastern Time according to CoinMarketCap | https://coinmarketcap.com/currencies/based-brett/ . Otherwise, the market will resolve to "NO". The final resolution will be based on a .csv file downloaded from CMC, with our price set to the hourly open candle for a specific time.',
    collateralToken: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      symbol: 'USDC',
    },
    title: 'Will BRETT be above $0.1952 on Tue at 5am ET?',
    proxyTitle: null,
    ogImageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/markets/1334/og.jpg',
    expirationDate: 'Dec 3, 2024',
    expirationTimestamp: 1733220000000,
    createdAt: '2024-12-02T19:30:29.985Z',
    category: 'Crypto',
    winningOutcomeIndex: 1,
    status: MarketStatus.RESOLVED,
    expired: true,
    creator: {
      name: 'Limitless',
      imageURI: 'https://limitless.exchange/assets/images/logo.svg',
      link: 'https://x.com/trylimitless',
    },
    tags: ['Daily', '$BRETT', 'Crypto'],
    openInterest: '17467225975',
    openInterestFormatted: '17467.225975',
    volume: '17636574025',
    volumeFormatted: '17636.574025',
    liquidity: '250000000',
    liquidityFormatted: '250.000000',
    priorityIndex: 0,
    prices: [0, 100],
  },
  {
    address: '0x97F788a6682bCea5322266625bEcabf55811e653',
    conditionId: '0x9907d3533cf9ae9707ba7b516cb2dae69672456ff09830bdf295628dd75b9e5e',
    description:
      'This market will resolve to "YES" if NVDA (NVIDIA Corporation Common Stock) closes above $135.34 at the end of the main market session on Wednesday, 4 December (4:00pm Eastern Time) according to NASDAQ | https://www.nasdaq.com/market-activity/stocks/nvda',
    collateralToken: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      symbol: 'USDC',
    },
    title: 'Will NVDA close above $135.34 on Wed at 4pm ET?',
    proxyTitle: null,
    ogImageURI: 'https://storage.googleapis.com/limitless-exchange-prod-424014/markets/1246/og.jpg',
    expirationDate: 'Dec 4, 2024',
    expirationTimestamp: 1733346000000,
    createdAt: '2024-11-28T02:16:18.028Z',
    category: 'Stocks',
    winningOutcomeIndex: null,
    status: MarketStatus.FUNDED,
    expired: false,
    creator: {
      name: 'Limitless',
      imageURI: 'https://limitless.exchange/assets/images/logo.svg',
      link: 'https://x.com/trylimitless',
    },
    tags: ['Daily'],
    openInterest: '595877636',
    openInterestFormatted: '595.877636',
    volume: '608122364',
    volumeFormatted: '608.122364',
    liquidity: '250000000',
    liquidityFormatted: '250.000000',
    priorityIndex: 0,
    prices: [50, 50],
  },
]

export default function MyMarkets() {
  return (
    <Box
      borderRight='1px solid'
      borderColor='grey.100'
      w='400px'
      h='full'
      backdropFilter='blur(7.5px)'
      bg='background.80'
      p='16px'
      overflowY='scroll'
    >
      <Text {...h3Bold} textAlign='center'>
        My Markets
      </Text>
      <VStack mt='24px' gap='8px' w='full'>
        {mockMarkets.map((mockMarket) => (
          <MyMarketCard key={mockMarket.address} market={mockMarket} />
        ))}
      </VStack>
    </Box>
  )
}
