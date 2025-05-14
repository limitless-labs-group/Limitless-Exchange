import { Box } from '@chakra-ui/react'
import { usePrivy } from '@privy-io/react-auth'
import { JsonRpcProvider, SwapWidget } from '@uniswap/widgets'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { base } from 'viem/chains'
import { string } from 'yup'
import './widget.styles.css'
import { useAccount } from '@/services'

interface SwapWidgetProps {
  defaultOutputTokenAddress: Address
}

const UniswapWidget = ({ defaultOutputTokenAddress }: SwapWidgetProps) => {
  const { provider } = useAccount()

  const BASE_CHAINS = [
    {
      id: 8453,
      name: 'Base',
      rpcUrls: ['https://mainnet.base.org'], // or your preferred Base RPC
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorers: [
        {
          name: 'Basescan',
          url: 'https://basescan.org',
        },
      ],
    },
  ]
  return (
    <Box
      width='full'
      // style={{
      //   width: '100%',
      //   height: '600px',
      //   borderRadius: '16px',
      //   overflow: 'hidden',
      // }}
    >
      <SwapWidget
        width='100%'
        tokenList='https://ipfs.io/ipns/tokens.uniswap.org'
        provider={provider}
        defaultChainId={8453}
      />
    </Box>
  )
}

export default UniswapWidget
