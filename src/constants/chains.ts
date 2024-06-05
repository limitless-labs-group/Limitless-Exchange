import { base, baseSepolia } from 'viem/chains'

export const defaultChain = process.env.NEXT_PUBLIC_NETWORK === 'testnet' ? baseSepolia : base
