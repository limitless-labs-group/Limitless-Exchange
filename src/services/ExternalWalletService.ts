import { EIP712TypedData } from '@polymarket/order-utils'
import { switchChain } from '@wagmi/core'
import { Address, encodeFunctionData, erc20Abi, getContract } from 'viem'
import { useAccount, useSendTransaction, useSignTypedData, useWriteContract } from 'wagmi'
import { defaultChain } from '@/constants'
import { conditionalTokensABI, fixedProductMarketMakerABI, wethABI } from '@/contracts'
import { contractABI } from '@/contracts/utils'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { config as wagmiConfig, publicClient } from '@/providers'
import { useLimitlessApi } from '@/services/LimitlessApi'

export const useExternalWalletService = () => {
  const account = useWalletAddress()
  const { writeContractAsync } = useWriteContract()
  const { sendTransactionAsync } = useSendTransaction()
  const { signTypedDataAsync } = useSignTypedData()
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
      address: contractAddress, // conditional
      abi: conditionalTokensABI,
      client: publicClient,
    })
    // spender - CTF exchange
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

  const checkLumyAccountBalance = async () => {
    const contract = getContract({
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      abi: erc20Abi,
      client: publicClient,
    })
    return contract.read.balanceOf(['0x6bb3d8A69656d1865708242223190a29D3a7E3c7'])
  }

  const signTypedData = async (typedData: EIP712TypedData) => {
    return signTypedDataAsync(typedData)
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
    checkLumyAccountBalance,
    signTypedData,
  }
}
