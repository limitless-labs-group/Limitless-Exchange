import { defaultChain } from '@/constants'

const ALLOWED_CHAINS_TESTNET = [
  {
    id: 84531,
    name: 'Base Goerli',
    network: 'base-goerli',
  },
  // {
  //   id: 80001,
  //   name: 'Mumbai',
  //   network: 'maticmum',
  // },
]

const ALLOWED_CHAINS_MAINNET = [
  {
    id: 8453,
    name: 'Base',
    network: 'base',
  },
  // {
  //   id: 80001,
  //   name: 'Mumbai',
  //   network: 'maticmum',
  // },
]

export const ALLOWED_CHAINS =
  process.env.NEXT_PUBLIC_NETWORK === 'testnet' ? ALLOWED_CHAINS_TESTNET : ALLOWED_CHAINS_MAINNET

//
// const TESTNET_TOKENS = [
//   {
//     address: '0x4200000000000000000000000000000000000006',
//     chainId: 84531,
//     decimals: 18,
//     symbol: 'WETH',
//     name: 'Wrapped Ether',
//   },
//   {
//     address: '0xD7788FfC73C9AE39CE24dfc1098b375792dD42Ac',
//     chainId: 84531,
//     decimals: 6,
//     symbol: 'USDC',
//     name: 'USD Coin',
//   },
//   {
//     address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
//     chainId: 84531,
//     decimals: 18,
//     symbol: 'DAI',
//     name: 'Dai Stablecoin',
//   },
//   {
//     address: '0x853154e2A5604E5C74a2546E2871Ad44932eB92C',
//     chainId: 84531,
//     decimals: 6,
//     symbol: 'USDT',
//     name: 'Tether USD',
//   },
//   {
//     address: '0x631657daCe08155708B377AdB536e76bE8C6f82a',
//     chainId: 84531,
//     decimals: 18,
//     symbol: 'cbBTC',
//     name: 'Wrapped Bitcoin',
//   },
//   // Mumbai Testnet Tokens
//   {
//     address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
//     chainId: 80001,
//     decimals: 18,
//     symbol: 'WETH',
//     name: 'Wrapped Ether',
//   },
//   {
//     address: '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747',
//     chainId: 80001,
//     decimals: 6,
//     symbol: 'USDC',
//     name: 'USD Coin',
//   },
//   {
//     address: '0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F',
//     chainId: 80001,
//     decimals: 18,
//     symbol: 'DAI',
//     name: 'Dai Stablecoin',
//   },
//   {
//     address: '0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832',
//     chainId: 80001,
//     decimals: 6,
//     symbol: 'USDT',
//     name: 'Tether USD',
//   },
//   {
//     address: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
//     chainId: 80001,
//     decimals: 18,
//     symbol: 'WBTC',
//     name: 'Wrapped Bitcoin',
//   },
// ]
//
// const MAINNET_TOKENS = [
//   // Base Mainnet Tokens
//   {
//     address: '0x4200000000000000000000000000000000000006',
//     chainId: 8453,
//     decimals: 18,
//     symbol: 'WETH',
//     name: 'Wrapped Ether',
//   },
//   {
//     address: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
//     chainId: 8453,
//     decimals: 8,
//     symbol: 'cbBTC',
//     name: 'Wrapped Bitcoin',
//   },
//   {
//     address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
//     chainId: 8453,
//     decimals: 18,
//     symbol: 'DAI',
//     name: 'Dai Stablecoin',
//   },
//   {
//     address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
//     chainId: 8453,
//     decimals: 6,
//     symbol: 'USDT',
//     name: 'Tether USD',
//   },
//   {
//     address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
//     chainId: 8453,
//     decimals: 6,
//     symbol: 'USDC',
//     name: 'USD Coin',
//   },
//   // Polygon Mainnet Tokens
//   // {
//   //   address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH
//   //   chainId: 137,
//   //   decimals: 18,
//   //   symbol: 'WETH',
//   //   name: 'Wrapped Ether',
//   // },
//   // {
//   //   address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WBTC
//   //   chainId: 137,
//   //   decimals: 8,
//   //   symbol: 'WBTC',
//   //   name: 'Wrapped Bitcoin',
//   // },
//   // {
//   //   address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
//   //   chainId: 137,
//   //   decimals: 18,
//   //   symbol: 'DAI',
//   //   name: 'Dai Stablecoin',
//   // },
//   // {
//   //   address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
//   //   chainId: 137,
//   //   decimals: 6,
//   //   symbol: 'USDT',
//   //   name: 'Tether USD',
//   // },
//   // {
//   //   address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
//   //   chainId: 137,
//   //   decimals: 6,
//   //   symbol: 'USDC',
//   //   name: 'USD Coin',
//   // },
// ]
