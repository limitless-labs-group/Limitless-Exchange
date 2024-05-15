import { ERC20ABI } from './abi/ERC20ABI'
import { base, baseSepolia } from 'viem/chains'
import { mockERC20ABI } from './abi/mockERC20ABI'

export const contractABI = {
  [baseSepolia.id]: mockERC20ABI,
  [base.id]: ERC20ABI,
}
