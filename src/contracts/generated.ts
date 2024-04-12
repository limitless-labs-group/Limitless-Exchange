import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

import {
  createReadContract,
  createWriteContract,
  createSimulateContract,
  createWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConditionalTokens
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const conditionalTokensAbi = [
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'parentCollectionId', type: 'bytes32' },
      { name: 'conditionId', type: 'bytes32' },
      { name: 'indexSets', type: 'uint256[]' },
    ],
    name: 'redeemPositions',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: '', type: 'bytes32' },
      { name: '', type: 'uint256' },
    ],
    name: 'payoutNumerators',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'ids', type: 'uint256[]' },
      { name: 'values', type: 'uint256[]' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'safeBatchTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'collectionId', type: 'bytes32' },
    ],
    name: 'getPositionId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'owners', type: 'address[]' },
      { name: 'ids', type: 'uint256[]' },
    ],
    name: 'balanceOfBatch',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'parentCollectionId', type: 'bytes32' },
      { name: 'conditionId', type: 'bytes32' },
      { name: 'partition', type: 'uint256[]' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'splitPosition',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'oracle', type: 'address' },
      { name: 'questionId', type: 'bytes32' },
      { name: 'outcomeSlotCount', type: 'uint256' },
    ],
    name: 'getConditionId',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'pure',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'parentCollectionId', type: 'bytes32' },
      { name: 'conditionId', type: 'bytes32' },
      { name: 'indexSet', type: 'uint256' },
    ],
    name: 'getCollectionId',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'collateralToken', type: 'address' },
      { name: 'parentCollectionId', type: 'bytes32' },
      { name: 'conditionId', type: 'bytes32' },
      { name: 'partition', type: 'uint256[]' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'mergePositions',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    name: 'setApprovalForAll',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'questionId', type: 'bytes32' },
      { name: 'payouts', type: 'uint256[]' },
    ],
    name: 'reportPayouts',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: 'conditionId', type: 'bytes32' }],
    name: 'getOutcomeSlotCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'oracle', type: 'address' },
      { name: 'questionId', type: 'bytes32' },
      { name: 'outcomeSlotCount', type: 'uint256' },
    ],
    name: 'prepareCondition',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: '', type: 'bytes32' }],
    name: 'payoutDenominator',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    name: 'isApprovedForAll',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'id', type: 'uint256' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'safeTransferFrom',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'conditionId', type: 'bytes32', indexed: true },
      { name: 'oracle', type: 'address', indexed: true },
      { name: 'questionId', type: 'bytes32', indexed: true },
      { name: 'outcomeSlotCount', type: 'uint256', indexed: false },
    ],
    name: 'ConditionPreparation',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'conditionId', type: 'bytes32', indexed: true },
      { name: 'oracle', type: 'address', indexed: true },
      { name: 'questionId', type: 'bytes32', indexed: true },
      { name: 'outcomeSlotCount', type: 'uint256', indexed: false },
      { name: 'payoutNumerators', type: 'uint256[]', indexed: false },
    ],
    name: 'ConditionResolution',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'stakeholder', type: 'address', indexed: true },
      { name: 'collateralToken', type: 'address', indexed: false },
      { name: 'parentCollectionId', type: 'bytes32', indexed: true },
      { name: 'conditionId', type: 'bytes32', indexed: true },
      { name: 'partition', type: 'uint256[]', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
    name: 'PositionSplit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'stakeholder', type: 'address', indexed: true },
      { name: 'collateralToken', type: 'address', indexed: false },
      { name: 'parentCollectionId', type: 'bytes32', indexed: true },
      { name: 'conditionId', type: 'bytes32', indexed: true },
      { name: 'partition', type: 'uint256[]', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
    name: 'PositionsMerge',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'redeemer', type: 'address', indexed: true },
      { name: 'collateralToken', type: 'address', indexed: true },
      { name: 'parentCollectionId', type: 'bytes32', indexed: true },
      { name: 'conditionId', type: 'bytes32', indexed: false },
      { name: 'indexSets', type: 'uint256[]', indexed: false },
      { name: 'payout', type: 'uint256', indexed: false },
    ],
    name: 'PayoutRedemption',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'operator', type: 'address', indexed: true },
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'id', type: 'uint256', indexed: false },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'TransferSingle',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'operator', type: 'address', indexed: true },
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'ids', type: 'uint256[]', indexed: false },
      { name: 'values', type: 'uint256[]', indexed: false },
    ],
    name: 'TransferBatch',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'operator', type: 'address', indexed: true },
      { name: 'approved', type: 'bool', indexed: false },
    ],
    name: 'ApprovalForAll',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'value', type: 'string', indexed: false },
      { name: 'id', type: 'uint256', indexed: true },
    ],
    name: 'URI',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Erc20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: '_amount', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'guy', type: 'address' },
      { name: 'wad', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'src', type: 'address' },
      { name: 'dst', type: 'address' },
      { name: 'wad', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [{ name: 'wad', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: '', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'dst', type: 'address' },
      { name: 'wad', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: true,
    type: 'function',
    inputs: [],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: '', type: 'address' },
      { name: '', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  { payable: true, type: 'fallback', stateMutability: 'payable' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', type: 'address', indexed: true },
      { name: 'guy', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', type: 'address', indexed: true },
      { name: 'dst', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'dst', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'src', type: 'address', indexed: true },
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Withdrawal',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MarketMaker
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const marketMakerAbi = [
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'resume',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'pmSystem',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'outcomeTokenAmounts', type: 'int256[]' },
      { name: 'collateralLimit', type: 'int256' },
    ],
    name: 'trade',
    outputs: [{ name: 'netCost', type: 'int256' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'returnAmount', type: 'uint256' },
      { name: 'outcomeIndex', type: 'uint256' },
    ],
    name: 'calcSellAmount',
    outputs: [{ name: 'outcomeTokenSellAmount', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'close',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'withdrawFees',
    outputs: [{ name: 'fees', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: 'outcomeTokenAmounts', type: 'int256[]' }],
    name: 'calcNetCost',
    outputs: [{ name: 'netCost', type: 'int256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [{ name: 'fundingChange', type: 'int256' }],
    name: 'changeFunding',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'isOwner',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'whitelist',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: 'outcomeTokenCost', type: 'uint256' }],
    name: 'calcMarketFee',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'collateralToken',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: 'outcomeTokenIndex', type: 'uint8' }],
    name: 'calcMarginalPrice',
    outputs: [{ name: 'price', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: '_operator', type: 'address' },
      { name: '', type: 'address' },
      { name: '', type: 'uint256[]' },
      { name: '', type: 'uint256[]' },
      { name: '', type: 'bytes' },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [{ name: '', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'stage',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'funding',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: '', type: 'uint256' }],
    name: 'conditionIds',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'atomicOutcomeSlotCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'fee',
    outputs: [{ name: '', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [{ name: '_fee', type: 'uint64' }],
    name: 'changeFee',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: '', type: 'address' },
      { name: '', type: 'uint256' },
      { name: '', type: 'uint256' },
      { name: '', type: 'bytes' },
    ],
    name: 'onERC1155Received',
    outputs: [{ name: '', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [{ name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'investmentAmount', type: 'uint256' },
      { name: 'outcomeIndex', type: 'uint256' },
    ],
    name: 'calcBuyAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'FEE_RANGE',
    outputs: [{ name: '', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'initialFunding', type: 'uint256', indexed: false }],
    name: 'AMMCreated',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'AMMPaused' },
  { type: 'event', anonymous: false, inputs: [], name: 'AMMResumed' },
  { type: 'event', anonymous: false, inputs: [], name: 'AMMClosed' },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'fundingChange', type: 'int256', indexed: false }],
    name: 'AMMFundingChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'newFee', type: 'uint64', indexed: false }],
    name: 'AMMFeeChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'fees', type: 'uint256', indexed: false }],
    name: 'AMMFeeWithdrawal',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'transactor', type: 'address', indexed: true },
      { name: 'outcomeTokenAmounts', type: 'int256[]', indexed: false },
      { name: 'outcomeTokenNetCost', type: 'int256', indexed: false },
      { name: 'marketFees', type: 'uint256', indexed: false },
    ],
    name: 'AMMOutcomeTokenTrade',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'previousOwner', type: 'address', indexed: true },
      { name: 'newOwner', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const useReadConditionalTokens = /*#__PURE__*/ createUseReadContract({
  abi: conditionalTokensAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadConditionalTokensBalanceOf =
  /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'balanceOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadConditionalTokensSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"payoutNumerators"`
 */
export const useReadConditionalTokensPayoutNumerators =
  /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'payoutNumerators',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getPositionId"`
 */
export const useReadConditionalTokensGetPositionId =
  /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'getPositionId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"balanceOfBatch"`
 */
export const useReadConditionalTokensBalanceOfBatch =
  /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'balanceOfBatch',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getConditionId"`
 */
export const useReadConditionalTokensGetConditionId =
  /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'getConditionId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getCollectionId"`
 */
export const useReadConditionalTokensGetCollectionId =
  /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'getCollectionId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getOutcomeSlotCount"`
 */
export const useReadConditionalTokensGetOutcomeSlotCount =
  /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'getOutcomeSlotCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"payoutDenominator"`
 */
export const useReadConditionalTokensPayoutDenominator =
  /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'payoutDenominator',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const useReadConditionalTokensIsApprovedForAll =
  /*#__PURE__*/ createUseReadContract({
    abi: conditionalTokensAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const useWriteConditionalTokens = /*#__PURE__*/ createUseWriteContract({
  abi: conditionalTokensAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"redeemPositions"`
 */
export const useWriteConditionalTokensRedeemPositions =
  /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'redeemPositions',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useWriteConditionalTokensSafeBatchTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'safeBatchTransferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"splitPosition"`
 */
export const useWriteConditionalTokensSplitPosition =
  /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'splitPosition',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"mergePositions"`
 */
export const useWriteConditionalTokensMergePositions =
  /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'mergePositions',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useWriteConditionalTokensSetApprovalForAll =
  /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"reportPayouts"`
 */
export const useWriteConditionalTokensReportPayouts =
  /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'reportPayouts',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"prepareCondition"`
 */
export const useWriteConditionalTokensPrepareCondition =
  /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'prepareCondition',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useWriteConditionalTokensSafeTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const useSimulateConditionalTokens =
  /*#__PURE__*/ createUseSimulateContract({ abi: conditionalTokensAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"redeemPositions"`
 */
export const useSimulateConditionalTokensRedeemPositions =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'redeemPositions',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const useSimulateConditionalTokensSafeBatchTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'safeBatchTransferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"splitPosition"`
 */
export const useSimulateConditionalTokensSplitPosition =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'splitPosition',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"mergePositions"`
 */
export const useSimulateConditionalTokensMergePositions =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'mergePositions',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const useSimulateConditionalTokensSetApprovalForAll =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"reportPayouts"`
 */
export const useSimulateConditionalTokensReportPayouts =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'reportPayouts',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"prepareCondition"`
 */
export const useSimulateConditionalTokensPrepareCondition =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'prepareCondition',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const useSimulateConditionalTokensSafeTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const useWatchConditionalTokensEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: conditionalTokensAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"ConditionPreparation"`
 */
export const useWatchConditionalTokensConditionPreparationEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'ConditionPreparation',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"ConditionResolution"`
 */
export const useWatchConditionalTokensConditionResolutionEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'ConditionResolution',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"PositionSplit"`
 */
export const useWatchConditionalTokensPositionSplitEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'PositionSplit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"PositionsMerge"`
 */
export const useWatchConditionalTokensPositionsMergeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'PositionsMerge',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"PayoutRedemption"`
 */
export const useWatchConditionalTokensPayoutRedemptionEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'PayoutRedemption',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"TransferSingle"`
 */
export const useWatchConditionalTokensTransferSingleEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'TransferSingle',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"TransferBatch"`
 */
export const useWatchConditionalTokensTransferBatchEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'TransferBatch',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const useWatchConditionalTokensApprovalForAllEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"URI"`
 */
export const useWatchConditionalTokensUriEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'URI',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20 = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc20Name = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20 = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"mint"`
 */
export const useWriteErc20Mint = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteErc20Withdraw = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"deposit"`
 */
export const useWriteErc20Deposit = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'deposit',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20 = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"mint"`
 */
export const useSimulateErc20Mint = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'mint',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateErc20Withdraw = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi, functionName: 'withdraw' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20Transfer = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi, functionName: 'transfer' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateErc20Deposit = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'deposit',
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWatchErc20Event = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20ApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20TransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchErc20DepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Withdrawal"`
 */
export const useWatchErc20WithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Withdrawal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const useReadMarketMaker = /*#__PURE__*/ createUseReadContract({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadMarketMakerSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"pmSystem"`
 */
export const useReadMarketMakerPmSystem = /*#__PURE__*/ createUseReadContract({
  abi: marketMakerAbi,
  functionName: 'pmSystem',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"calcSellAmount"`
 */
export const useReadMarketMakerCalcSellAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'calcSellAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"calcNetCost"`
 */
export const useReadMarketMakerCalcNetCost =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'calcNetCost',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"owner"`
 */
export const useReadMarketMakerOwner = /*#__PURE__*/ createUseReadContract({
  abi: marketMakerAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"isOwner"`
 */
export const useReadMarketMakerIsOwner = /*#__PURE__*/ createUseReadContract({
  abi: marketMakerAbi,
  functionName: 'isOwner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"whitelist"`
 */
export const useReadMarketMakerWhitelist = /*#__PURE__*/ createUseReadContract({
  abi: marketMakerAbi,
  functionName: 'whitelist',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"calcMarketFee"`
 */
export const useReadMarketMakerCalcMarketFee =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'calcMarketFee',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"collateralToken"`
 */
export const useReadMarketMakerCollateralToken =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'collateralToken',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"calcMarginalPrice"`
 */
export const useReadMarketMakerCalcMarginalPrice =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'calcMarginalPrice',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"stage"`
 */
export const useReadMarketMakerStage = /*#__PURE__*/ createUseReadContract({
  abi: marketMakerAbi,
  functionName: 'stage',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"funding"`
 */
export const useReadMarketMakerFunding = /*#__PURE__*/ createUseReadContract({
  abi: marketMakerAbi,
  functionName: 'funding',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"conditionIds"`
 */
export const useReadMarketMakerConditionIds =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'conditionIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"atomicOutcomeSlotCount"`
 */
export const useReadMarketMakerAtomicOutcomeSlotCount =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'atomicOutcomeSlotCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"fee"`
 */
export const useReadMarketMakerFee = /*#__PURE__*/ createUseReadContract({
  abi: marketMakerAbi,
  functionName: 'fee',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"calcBuyAmount"`
 */
export const useReadMarketMakerCalcBuyAmount =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'calcBuyAmount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"FEE_RANGE"`
 */
export const useReadMarketMakerFeeRange = /*#__PURE__*/ createUseReadContract({
  abi: marketMakerAbi,
  functionName: 'FEE_RANGE',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const useWriteMarketMaker = /*#__PURE__*/ createUseWriteContract({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"resume"`
 */
export const useWriteMarketMakerResume = /*#__PURE__*/ createUseWriteContract({
  abi: marketMakerAbi,
  functionName: 'resume',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"trade"`
 */
export const useWriteMarketMakerTrade = /*#__PURE__*/ createUseWriteContract({
  abi: marketMakerAbi,
  functionName: 'trade',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"close"`
 */
export const useWriteMarketMakerClose = /*#__PURE__*/ createUseWriteContract({
  abi: marketMakerAbi,
  functionName: 'close',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"withdrawFees"`
 */
export const useWriteMarketMakerWithdrawFees =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'withdrawFees',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteMarketMakerRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"pause"`
 */
export const useWriteMarketMakerPause = /*#__PURE__*/ createUseWriteContract({
  abi: marketMakerAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"changeFunding"`
 */
export const useWriteMarketMakerChangeFunding =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'changeFunding',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useWriteMarketMakerOnErc1155BatchReceived =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"changeFee"`
 */
export const useWriteMarketMakerChangeFee =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'changeFee',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useWriteMarketMakerOnErc1155Received =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteMarketMakerTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const useSimulateMarketMaker = /*#__PURE__*/ createUseSimulateContract({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"resume"`
 */
export const useSimulateMarketMakerResume =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'resume',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"trade"`
 */
export const useSimulateMarketMakerTrade =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'trade',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"close"`
 */
export const useSimulateMarketMakerClose =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'close',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"withdrawFees"`
 */
export const useSimulateMarketMakerWithdrawFees =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'withdrawFees',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateMarketMakerRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"pause"`
 */
export const useSimulateMarketMakerPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"changeFunding"`
 */
export const useSimulateMarketMakerChangeFunding =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'changeFunding',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useSimulateMarketMakerOnErc1155BatchReceived =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"changeFee"`
 */
export const useSimulateMarketMakerChangeFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'changeFee',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const useSimulateMarketMakerOnErc1155Received =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateMarketMakerTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const useWatchMarketMakerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: marketMakerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMCreated"`
 */
export const useWatchMarketMakerAmmCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMPaused"`
 */
export const useWatchMarketMakerAmmPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMPaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMResumed"`
 */
export const useWatchMarketMakerAmmResumedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMResumed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMClosed"`
 */
export const useWatchMarketMakerAmmClosedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMClosed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMFundingChanged"`
 */
export const useWatchMarketMakerAmmFundingChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMFundingChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMFeeChanged"`
 */
export const useWatchMarketMakerAmmFeeChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMFeeChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMFeeWithdrawal"`
 */
export const useWatchMarketMakerAmmFeeWithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMFeeWithdrawal',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMOutcomeTokenTrade"`
 */
export const useWatchMarketMakerAmmOutcomeTokenTradeEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMOutcomeTokenTrade',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchMarketMakerOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'OwnershipTransferred',
  })

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Action
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const readConditionalTokens = /*#__PURE__*/ createReadContract({
  abi: conditionalTokensAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"balanceOf"`
 */
export const readConditionalTokensBalanceOf = /*#__PURE__*/ createReadContract({
  abi: conditionalTokensAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const readConditionalTokensSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: conditionalTokensAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"payoutNumerators"`
 */
export const readConditionalTokensPayoutNumerators =
  /*#__PURE__*/ createReadContract({
    abi: conditionalTokensAbi,
    functionName: 'payoutNumerators',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getPositionId"`
 */
export const readConditionalTokensGetPositionId =
  /*#__PURE__*/ createReadContract({
    abi: conditionalTokensAbi,
    functionName: 'getPositionId',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"balanceOfBatch"`
 */
export const readConditionalTokensBalanceOfBatch =
  /*#__PURE__*/ createReadContract({
    abi: conditionalTokensAbi,
    functionName: 'balanceOfBatch',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getConditionId"`
 */
export const readConditionalTokensGetConditionId =
  /*#__PURE__*/ createReadContract({
    abi: conditionalTokensAbi,
    functionName: 'getConditionId',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getCollectionId"`
 */
export const readConditionalTokensGetCollectionId =
  /*#__PURE__*/ createReadContract({
    abi: conditionalTokensAbi,
    functionName: 'getCollectionId',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"getOutcomeSlotCount"`
 */
export const readConditionalTokensGetOutcomeSlotCount =
  /*#__PURE__*/ createReadContract({
    abi: conditionalTokensAbi,
    functionName: 'getOutcomeSlotCount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"payoutDenominator"`
 */
export const readConditionalTokensPayoutDenominator =
  /*#__PURE__*/ createReadContract({
    abi: conditionalTokensAbi,
    functionName: 'payoutDenominator',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"isApprovedForAll"`
 */
export const readConditionalTokensIsApprovedForAll =
  /*#__PURE__*/ createReadContract({
    abi: conditionalTokensAbi,
    functionName: 'isApprovedForAll',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const writeConditionalTokens = /*#__PURE__*/ createWriteContract({
  abi: conditionalTokensAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"redeemPositions"`
 */
export const writeConditionalTokensRedeemPositions =
  /*#__PURE__*/ createWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'redeemPositions',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const writeConditionalTokensSafeBatchTransferFrom =
  /*#__PURE__*/ createWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'safeBatchTransferFrom',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"splitPosition"`
 */
export const writeConditionalTokensSplitPosition =
  /*#__PURE__*/ createWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'splitPosition',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"mergePositions"`
 */
export const writeConditionalTokensMergePositions =
  /*#__PURE__*/ createWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'mergePositions',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const writeConditionalTokensSetApprovalForAll =
  /*#__PURE__*/ createWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"reportPayouts"`
 */
export const writeConditionalTokensReportPayouts =
  /*#__PURE__*/ createWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'reportPayouts',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"prepareCondition"`
 */
export const writeConditionalTokensPrepareCondition =
  /*#__PURE__*/ createWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'prepareCondition',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const writeConditionalTokensSafeTransferFrom =
  /*#__PURE__*/ createWriteContract({
    abi: conditionalTokensAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const simulateConditionalTokens = /*#__PURE__*/ createSimulateContract({
  abi: conditionalTokensAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"redeemPositions"`
 */
export const simulateConditionalTokensRedeemPositions =
  /*#__PURE__*/ createSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'redeemPositions',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeBatchTransferFrom"`
 */
export const simulateConditionalTokensSafeBatchTransferFrom =
  /*#__PURE__*/ createSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'safeBatchTransferFrom',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"splitPosition"`
 */
export const simulateConditionalTokensSplitPosition =
  /*#__PURE__*/ createSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'splitPosition',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"mergePositions"`
 */
export const simulateConditionalTokensMergePositions =
  /*#__PURE__*/ createSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'mergePositions',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"setApprovalForAll"`
 */
export const simulateConditionalTokensSetApprovalForAll =
  /*#__PURE__*/ createSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'setApprovalForAll',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"reportPayouts"`
 */
export const simulateConditionalTokensReportPayouts =
  /*#__PURE__*/ createSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'reportPayouts',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"prepareCondition"`
 */
export const simulateConditionalTokensPrepareCondition =
  /*#__PURE__*/ createSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'prepareCondition',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link conditionalTokensAbi}__ and `functionName` set to `"safeTransferFrom"`
 */
export const simulateConditionalTokensSafeTransferFrom =
  /*#__PURE__*/ createSimulateContract({
    abi: conditionalTokensAbi,
    functionName: 'safeTransferFrom',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__
 */
export const watchConditionalTokensEvent =
  /*#__PURE__*/ createWatchContractEvent({ abi: conditionalTokensAbi })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"ConditionPreparation"`
 */
export const watchConditionalTokensConditionPreparationEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'ConditionPreparation',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"ConditionResolution"`
 */
export const watchConditionalTokensConditionResolutionEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'ConditionResolution',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"PositionSplit"`
 */
export const watchConditionalTokensPositionSplitEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'PositionSplit',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"PositionsMerge"`
 */
export const watchConditionalTokensPositionsMergeEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'PositionsMerge',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"PayoutRedemption"`
 */
export const watchConditionalTokensPayoutRedemptionEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'PayoutRedemption',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"TransferSingle"`
 */
export const watchConditionalTokensTransferSingleEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'TransferSingle',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"TransferBatch"`
 */
export const watchConditionalTokensTransferBatchEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'TransferBatch',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"ApprovalForAll"`
 */
export const watchConditionalTokensApprovalForAllEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'ApprovalForAll',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link conditionalTokensAbi}__ and `eventName` set to `"URI"`
 */
export const watchConditionalTokensUriEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: conditionalTokensAbi,
    eventName: 'URI',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const readErc20 = /*#__PURE__*/ createReadContract({ abi: erc20Abi })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const readErc20Name = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const readErc20TotalSupply = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const readErc20Decimals = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const readErc20BalanceOf = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const readErc20Symbol = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const readErc20Allowance = /*#__PURE__*/ createReadContract({
  abi: erc20Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const writeErc20 = /*#__PURE__*/ createWriteContract({ abi: erc20Abi })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"mint"`
 */
export const writeErc20Mint = /*#__PURE__*/ createWriteContract({
  abi: erc20Abi,
  functionName: 'mint',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const writeErc20Approve = /*#__PURE__*/ createWriteContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const writeErc20TransferFrom = /*#__PURE__*/ createWriteContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"withdraw"`
 */
export const writeErc20Withdraw = /*#__PURE__*/ createWriteContract({
  abi: erc20Abi,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const writeErc20Transfer = /*#__PURE__*/ createWriteContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"deposit"`
 */
export const writeErc20Deposit = /*#__PURE__*/ createWriteContract({
  abi: erc20Abi,
  functionName: 'deposit',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const simulateErc20 = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"mint"`
 */
export const simulateErc20Mint = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
  functionName: 'mint',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const simulateErc20Approve = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const simulateErc20TransferFrom = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"withdraw"`
 */
export const simulateErc20Withdraw = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
  functionName: 'withdraw',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const simulateErc20Transfer = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"deposit"`
 */
export const simulateErc20Deposit = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
  functionName: 'deposit',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const watchErc20Event = /*#__PURE__*/ createWatchContractEvent({
  abi: erc20Abi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const watchErc20ApprovalEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Approval',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const watchErc20TransferEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Transfer',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Deposit"`
 */
export const watchErc20DepositEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Deposit',
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Withdrawal"`
 */
export const watchErc20WithdrawalEvent = /*#__PURE__*/ createWatchContractEvent(
  { abi: erc20Abi, eventName: 'Withdrawal' },
)

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const readMarketMaker = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const readMarketMakerSupportsInterface =
  /*#__PURE__*/ createReadContract({
    abi: marketMakerAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"pmSystem"`
 */
export const readMarketMakerPmSystem = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'pmSystem',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"calcSellAmount"`
 */
export const readMarketMakerCalcSellAmount = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'calcSellAmount',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"calcNetCost"`
 */
export const readMarketMakerCalcNetCost = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'calcNetCost',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"owner"`
 */
export const readMarketMakerOwner = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'owner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"isOwner"`
 */
export const readMarketMakerIsOwner = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'isOwner',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"whitelist"`
 */
export const readMarketMakerWhitelist = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'whitelist',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"calcMarketFee"`
 */
export const readMarketMakerCalcMarketFee = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'calcMarketFee',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"collateralToken"`
 */
export const readMarketMakerCollateralToken = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'collateralToken',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"calcMarginalPrice"`
 */
export const readMarketMakerCalcMarginalPrice =
  /*#__PURE__*/ createReadContract({
    abi: marketMakerAbi,
    functionName: 'calcMarginalPrice',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"stage"`
 */
export const readMarketMakerStage = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'stage',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"funding"`
 */
export const readMarketMakerFunding = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'funding',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"conditionIds"`
 */
export const readMarketMakerConditionIds = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'conditionIds',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"atomicOutcomeSlotCount"`
 */
export const readMarketMakerAtomicOutcomeSlotCount =
  /*#__PURE__*/ createReadContract({
    abi: marketMakerAbi,
    functionName: 'atomicOutcomeSlotCount',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"fee"`
 */
export const readMarketMakerFee = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'fee',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"calcBuyAmount"`
 */
export const readMarketMakerCalcBuyAmount = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'calcBuyAmount',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"FEE_RANGE"`
 */
export const readMarketMakerFeeRange = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'FEE_RANGE',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const writeMarketMaker = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"resume"`
 */
export const writeMarketMakerResume = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'resume',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"trade"`
 */
export const writeMarketMakerTrade = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'trade',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"close"`
 */
export const writeMarketMakerClose = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'close',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"withdrawFees"`
 */
export const writeMarketMakerWithdrawFees = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'withdrawFees',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const writeMarketMakerRenounceOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: marketMakerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"pause"`
 */
export const writeMarketMakerPause = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"changeFunding"`
 */
export const writeMarketMakerChangeFunding = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'changeFunding',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const writeMarketMakerOnErc1155BatchReceived =
  /*#__PURE__*/ createWriteContract({
    abi: marketMakerAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"changeFee"`
 */
export const writeMarketMakerChangeFee = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'changeFee',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const writeMarketMakerOnErc1155Received =
  /*#__PURE__*/ createWriteContract({
    abi: marketMakerAbi,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const writeMarketMakerTransferOwnership =
  /*#__PURE__*/ createWriteContract({
    abi: marketMakerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const simulateMarketMaker = /*#__PURE__*/ createSimulateContract({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"resume"`
 */
export const simulateMarketMakerResume = /*#__PURE__*/ createSimulateContract({
  abi: marketMakerAbi,
  functionName: 'resume',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"trade"`
 */
export const simulateMarketMakerTrade = /*#__PURE__*/ createSimulateContract({
  abi: marketMakerAbi,
  functionName: 'trade',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"close"`
 */
export const simulateMarketMakerClose = /*#__PURE__*/ createSimulateContract({
  abi: marketMakerAbi,
  functionName: 'close',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"withdrawFees"`
 */
export const simulateMarketMakerWithdrawFees =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'withdrawFees',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const simulateMarketMakerRenounceOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"pause"`
 */
export const simulateMarketMakerPause = /*#__PURE__*/ createSimulateContract({
  abi: marketMakerAbi,
  functionName: 'pause',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"changeFunding"`
 */
export const simulateMarketMakerChangeFunding =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'changeFunding',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const simulateMarketMakerOnErc1155BatchReceived =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"changeFee"`
 */
export const simulateMarketMakerChangeFee =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'changeFee',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"onERC1155Received"`
 */
export const simulateMarketMakerOnErc1155Received =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'onERC1155Received',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const simulateMarketMakerTransferOwnership =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const watchMarketMakerEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMCreated"`
 */
export const watchMarketMakerAmmCreatedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMCreated',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMPaused"`
 */
export const watchMarketMakerAmmPausedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMPaused',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMResumed"`
 */
export const watchMarketMakerAmmResumedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMResumed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMClosed"`
 */
export const watchMarketMakerAmmClosedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMClosed',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMFundingChanged"`
 */
export const watchMarketMakerAmmFundingChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMFundingChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMFeeChanged"`
 */
export const watchMarketMakerAmmFeeChangedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMFeeChanged',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMFeeWithdrawal"`
 */
export const watchMarketMakerAmmFeeWithdrawalEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMFeeWithdrawal',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"AMMOutcomeTokenTrade"`
 */
export const watchMarketMakerAmmOutcomeTokenTradeEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'AMMOutcomeTokenTrade',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const watchMarketMakerOwnershipTransferredEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'OwnershipTransferred',
  })
