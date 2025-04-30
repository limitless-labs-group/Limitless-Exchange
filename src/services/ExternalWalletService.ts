import { EIP712TypedData } from '@polymarket/order-utils'
import { Address, encodeFunctionData, erc20Abi, getContract } from 'viem'
import { defaultChain } from '@/constants'
import { conditionalTokensABI, fixedProductMarketMakerABI, wethABI } from '@/contracts'
import { negriskAdapterAbi } from '@/contracts/abi/NegriskAdapterAbi'
import { publicClient } from '@/providers/Privy'
import { useAccount } from '@/services/AccountService'
import { useLimitlessApi } from '@/services/LimitlessApi'

export const useExternalWalletService = () => {
  const { supportedTokens } = useLimitlessApi()
  const { web3Wallet } = useAccount()

  const collateralTokenAddress = supportedTokens ? supportedTokens[0].address : '0x'

  const waitForTransaction = async (hash: `0x${string}`) => {
    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: 60_000,
      })
      return receipt
    } catch (error) {
      throw new Error(`Transaction failed: ${error}`)
    }
  }

  const wrapEth = async (value: bigint) => {
    try {
      await checkAndSwitchChainIfNeeded()
      const data = encodeFunctionData({
        abi: wethABI,
        functionName: 'deposit',
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          data,
          to: collateralTokenAddress,
          value,
          account: addresses[0],
          chain: defaultChain,
        })
        await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const unwrapEth = async (value: bigint) => {
    try {
      await checkAndSwitchChainIfNeeded()
      const data = encodeFunctionData({
        abi: wethABI,
        functionName: 'withdraw',
        args: [value],
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          data,
          to: collateralTokenAddress,
          account: addresses[0],
          chain: defaultChain,
        })
        await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const checkAllowanceEOA = async (spender: Address, contractAddress: Address) => {
    try {
      const contract = getContract({
        address: contractAddress,
        abi: erc20Abi,
        client: publicClient,
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        return await contract.read.allowance([addresses[0], spender])
      }
      return 0n
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const checkAllowanceForAllEOA = async (spender: Address, contractAddress: Address) => {
    try {
      const contract = getContract({
        address: contractAddress,
        abi: conditionalTokensABI,
        client: publicClient,
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const isApprovedForAll = await contract.read.isApprovedForAll([addresses[0], spender])
        return isApprovedForAll as boolean
      }
      return false
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const approveContractEOA = async (spender: Address, contractAddress: Address, value: bigint) => {
    try {
      await checkAndSwitchChainIfNeeded()
      const data = encodeFunctionData({
        abi: spender === collateralTokenAddress ? wethABI : erc20Abi,
        args: [spender, value],
        functionName: 'approve',
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          data,
          to: contractAddress,
          account: addresses[0],
          chain: defaultChain,
        })
        await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const approveContractForAllEOA = async (spender: Address, contractAddress: Address) => {
    await checkAndSwitchChainIfNeeded()
    try {
      const data = encodeFunctionData({
        abi: conditionalTokensABI,
        functionName: 'setApprovalForAll',
        args: [spender, true],
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          data,
          to: contractAddress,
          account: addresses[0],
          chain: defaultChain,
        })
        await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const transferEthers = async (to: Address, value: bigint) => {
    try {
      await checkAndSwitchChainIfNeeded()
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          value,
          to,
          account: addresses[0],
          chain: defaultChain,
        })
        await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const transferErc20 = async (token: Address, to: Address, value: bigint) => {
    try {
      await checkAndSwitchChainIfNeeded()
      const data = encodeFunctionData({
        abi: wethABI,
        functionName: 'transfer',
        args: [to, value],
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          data,
          to: token,
          account: addresses[0],
          chain: defaultChain,
        })
        await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const buyOutcomeTokens = async (
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    minOutcomeTokensToBuy: bigint
  ) => {
    try {
      await checkAndSwitchChainIfNeeded()
      const data = encodeFunctionData({
        abi: fixedProductMarketMakerABI,
        functionName: 'buy',
        args: [collateralAmount, outcomeIndex, minOutcomeTokensToBuy],
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          to: fixedProductMarketMakerAddress,
          data,
          account: addresses[0],
          chain: defaultChain,
        })
        // await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const sellOutcomeTokens = async (
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    maxOutcomeTokensToSell: bigint
  ) => {
    try {
      await checkAndSwitchChainIfNeeded()
      const data = encodeFunctionData({
        abi: fixedProductMarketMakerABI,
        functionName: 'sell',
        args: [collateralAmount, outcomeIndex, maxOutcomeTokensToSell],
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          data,
          to: fixedProductMarketMakerAddress,
          account: addresses[0],
          chain: defaultChain,
        })
        // await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const redeemPositions = async (
    conditionalTokensAddress: Address,
    collateralAddress: Address,
    parentCollectionId: Address,
    marketConditionId: Address
  ) => {
    try {
      await checkAndSwitchChainIfNeeded()
      const data = encodeFunctionData({
        abi: conditionalTokensABI,
        functionName: 'redeemPositions',
        args: [collateralAddress, parentCollectionId, marketConditionId, [1, 2]],
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          data,
          to: conditionalTokensAddress,
          account: addresses[0],
          chain: defaultChain,
        })
        await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const splitPositions = async (
    collateralAddress: Address,
    conditionId: string,
    amount: bigint,
    type: 'common' | 'negrisk'
  ) => {
    try {
      const abi = type === 'common' ? conditionalTokensABI : negriskAdapterAbi
      const contract =
        type === 'common'
          ? process.env.NEXT_PUBLIC_CTF_CONTRACT
          : process.env.NEXT_PUBLIC_NEGRISK_ADAPTER
      await checkAndSwitchChainIfNeeded()
      const data = encodeFunctionData({
        abi,
        functionName: 'splitPosition',
        args: [
          collateralAddress,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          conditionId,
          [1, 2],
          amount,
        ],
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          data,
          to: contract as Address,
          account: addresses[0],
          chain: defaultChain,
        })
        await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const mergePositions = async (
    collateralToken: Address,
    conditionId: string,
    amount: bigint,
    type: 'common' | 'negrisk'
  ) => {
    const contractAddress =
      type === 'common'
        ? process.env.NEXT_PUBLIC_CTF_CONTRACT
        : process.env.NEXT_PUBLIC_NEGRISK_ADAPTER
    const abi = type === 'common' ? conditionalTokensABI : negriskAdapterAbi
    try {
      await checkAndSwitchChainIfNeeded()
      const data = encodeFunctionData({
        abi,
        functionName: 'mergePositions',
        args: [
          collateralToken,
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          conditionId,
          [1, 2],
          amount,
        ],
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          data,
          to: contractAddress as Address,
          account: addresses[0],
          chain: defaultChain,
        })
        await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const convertShares = async (negRiskRequestId: string, indexSet: string, amount: bigint) => {
    try {
      await checkAndSwitchChainIfNeeded()
      const data = encodeFunctionData({
        abi: negriskAdapterAbi,
        functionName: 'convertPositions',
        args: [negRiskRequestId, indexSet, amount],
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          data,
          to: process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address,
          account: addresses[0],
          chain: defaultChain,
        })
        await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const redeemNegRiskMarket = async (conditionId: string, amounts: bigint[]) => {
    try {
      const data = encodeFunctionData({
        abi: negriskAdapterAbi,
        functionName: 'redeemPositions',
        args: [conditionId, amounts],
      })
      if (web3Wallet) {
        const addresses = await web3Wallet.getAddresses()
        const hash = await web3Wallet.sendTransaction({
          data,
          to: process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address,
          account: addresses[0],
          chain: defaultChain,
        })
        await waitForTransaction(hash)
        return hash
      }
    } catch (e) {
      const error = e as Error
      throw new Error(error.message)
    }
  }

  const checkAndSwitchChainIfNeeded = async () => {
    if (web3Wallet) {
      await web3Wallet.switchChain(defaultChain)
    }
  }

  const checkLumyAccountBalance = async () => {
    const contract = getContract({
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      abi: erc20Abi,
      client: publicClient,
    })
    return contract.read.balanceOf(['0x6bb3d8A69656d1865708242223190a29D3a7E3c7'])
  }

  const signTypedData = async (typedData: EIP712TypedData) => {
    await checkAndSwitchChainIfNeeded()
    // @ts-ignore
    return web3Wallet?.signTypedData(typedData) as Promise<string>
  }

  return {
    wrapEth,
    unwrapEth,
    transferErc20,
    transferEthers,
    buyOutcomeTokens,
    sellOutcomeTokens,
    checkAllowanceEOA,
    checkAllowanceForAllEOA,
    approveContractEOA,
    approveContractForAllEOA,
    redeemPositions,
    checkLumyAccountBalance,
    signTypedData,
    splitPositions,
    mergePositions,
    convertShares,
    redeemNegRiskMarket,
  }
}
