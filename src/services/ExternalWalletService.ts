import { config as wagmiConfig, publicClient } from '@/providers'
import { Address, encodeFunctionData, erc20Abi, getContract, parseUnits } from 'viem'
import { conditionalTokensABI, fixedProductMarketMakerABI, wethABI } from '@/contracts'
import { defaultChain } from '@/constants'
import { useAccount, useSendTransaction, useWriteContract } from 'wagmi'
import { contractABI } from '@/contracts/utils'
import { useLimitlessApi } from '@/services/LimitlessApi'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { switchChain } from '@wagmi/core'

export const useExternalWalletService = () => {
  const account = useWalletAddress()
  const { writeContractAsync } = useWriteContract()
  const { sendTransactionAsync } = useSendTransaction()
  const { supportedTokens } = useLimitlessApi()
  const { chainId } = useAccount()

  const collateralTokenAddress = supportedTokens ? supportedTokens[0].address : '0x'

  const wrapEth = async (value: bigint) => {
    await checkAndSwitchChainIfNeeded()
    let txHash = ''
    await writeContractAsync(
      {
        abi: wethABI,
        address: collateralTokenAddress,
        functionName: 'deposit',
        value,
      },
      {
        onSuccess: (data) => {
          txHash = data
        },
        onError: (data) => console.log(data),
      }
    )
    return txHash
  }

  const unwrapEth = async (value: bigint) => {
    await checkAndSwitchChainIfNeeded()
    let txHash = ''
    await writeContractAsync(
      {
        abi: wethABI,
        address: collateralTokenAddress,
        functionName: 'withdraw',
        args: [value],
      },
      {
        onSuccess: (data) => {
          txHash = data
        },
        onError: (data) => console.log(data),
      }
    )
    return txHash
  }

  const checkAllowanceEOA = async (spender: Address, contractAddress: Address): Promise<bigint> => {
    const contract = getContract({
      address: contractAddress,
      abi: erc20Abi,
      client: publicClient,
    })
    return await contract.read.allowance([account as Address, spender])
  }

  const checkAllowanceForAllEOA = async (spender: Address, contractAddress: Address) => {
    const contract = getContract({
      address: contractAddress,
      abi: conditionalTokensABI,
      client: publicClient,
    })
    const isApprovedForAll = await contract.read.isApprovedForAll([account as Address, spender])
    return isApprovedForAll as boolean
  }

  const approveContractEOA = async (
    spender: Address,
    contractAddress: Address,
    value: bigint
  ): Promise<string> => {
    await checkAndSwitchChainIfNeeded()
    let txHash = ''
    await writeContractAsync(
      {
        abi: spender === collateralTokenAddress ? wethABI : erc20Abi,
        args: [spender, value],
        address: contractAddress,
        functionName: 'approve',
      },
      {
        onSuccess: (data) => {
          txHash = data
        },
        onError: (data) => console.log(data),
      }
    )
    return txHash
  }

  const approveContractForAllEOA = async (spender: Address, contractAddress: Address) => {
    await checkAndSwitchChainIfNeeded()
    let txHash = ''
    await writeContractAsync(
      {
        abi: conditionalTokensABI,
        address: contractAddress,
        functionName: 'setApprovalForAll',
        args: [spender, true],
      },
      {
        onSuccess: (data) => {
          txHash = data
        },
        onError: (data) => console.log(data),
      }
    )
    return txHash
  }

  const mintErc20 = async (
    token: Address,
    value: bigint,
    smartWalletAddress: Address,
    newToken?: boolean
  ) => {
    await checkAndSwitchChainIfNeeded()
    const args = newToken ? [smartWalletAddress, value] : [value]
    let txHash = ''
    await writeContractAsync(
      {
        abi: newToken ? contractABI[defaultChain.id] : wethABI,
        address: token,
        functionName: 'mint',
        args,
      },
      {
        onSuccess: (data) => {
          txHash = data
        },
        onError: (data) => console.log(data),
      }
    )
    return txHash
  }

  const transferEthers = async (to: Address, value: bigint) => {
    await checkAndSwitchChainIfNeeded()
    let txHash = ''
    const data = encodeFunctionData({
      abi: wethABI,
      functionName: 'transfer',
      args: [to, value],
    })
    await sendTransactionAsync(
      {
        data,
        to,
      },
      {
        onSuccess: (data) => {
          txHash = data
        },
        onError: (data) => console.log(data),
      }
    )
    return txHash
  }

  const transferErc20 = async (token: Address, to: Address, value: bigint) => {
    await checkAndSwitchChainIfNeeded()
    let txHash = ''
    await writeContractAsync(
      {
        abi: wethABI,
        address: token,
        functionName: 'transfer',
        args: [to, value],
      },
      {
        onSuccess: (data) => {
          txHash = data
        },
        onError: (data) => console.log(data),
      }
    )
    return txHash
  }

  const buyOutcomeTokens = async (
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    minOutcomeTokensToBuy: bigint
  ) => {
    await checkAndSwitchChainIfNeeded()
    let txHash = ''
    await writeContractAsync(
      {
        abi: fixedProductMarketMakerABI,
        address: fixedProductMarketMakerAddress,
        functionName: 'buy',
        args: [collateralAmount, outcomeIndex, minOutcomeTokensToBuy],
      },
      {
        onSuccess: (data) => {
          txHash = data
        },
        onError: (data) => console.log(data),
      }
    )
    return txHash
  }

  const sellOutcomeTokens = async (
    fixedProductMarketMakerAddress: Address,
    collateralAmount: bigint,
    outcomeIndex: number,
    maxOutcomeTokensToSell: bigint
  ) => {
    await checkAndSwitchChainIfNeeded()
    let txHash = ''
    console.log('sellOutcomeTokens', outcomeIndex, maxOutcomeTokensToSell)
    await writeContractAsync(
      {
        abi: fixedProductMarketMakerABI,
        address: fixedProductMarketMakerAddress,
        functionName: 'sell',
        args: [collateralAmount, outcomeIndex, maxOutcomeTokensToSell],
      },
      {
        onSuccess: (data) => {
          txHash = data
        },
        onError: (data) => console.log(data),
      }
    )
    return txHash
  }

  const redeemPositions = async (
    conditionalTokensAddress: Address,
    collateralAddress: Address,
    parentCollectionId: Address,
    marketConditionId: Address,
    indexSets: number[]
  ) => {
    await checkAndSwitchChainIfNeeded()
    let txHash = ''
    await writeContractAsync(
      {
        abi: conditionalTokensABI,
        functionName: 'redeemPositions',
        address: conditionalTokensAddress,
        args: [collateralAddress, parentCollectionId, marketConditionId, indexSets],
      },
      {
        onSuccess: (data) => {
          txHash = data
        },
        onError: (data) => console.log(data),
      }
    )
    return txHash
  }

  const checkAndSwitchChainIfNeeded = async () => {
    if (chainId !== defaultChain.id) {
      await switchChain(wagmiConfig, { chainId: defaultChain.id })
    }
  }

  return {
    wrapEth,
    unwrapEth,
    mintErc20,
    transferErc20,
    transferEthers,
    buyOutcomeTokens,
    sellOutcomeTokens,
    checkAllowanceEOA,
    checkAllowanceForAllEOA,
    approveContractEOA,
    approveContractForAllEOA,
    redeemPositions,
  }
}
