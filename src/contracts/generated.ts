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
    inputs: [{ name: 'wad', type: 'uint256' }],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
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
      { name: 'wad', type: 'uint256', indexed: false },
    ],
    name: 'Mint',
  },
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
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'withdrawFees',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'feesWithdrawableBy',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
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
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'addedValue', type: 'uint256' },
    ],
    name: 'increaseAllowance',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'investmentAmount', type: 'uint256' },
      { name: 'outcomeIndex', type: 'uint256' },
      { name: 'minOutcomeTokensToBuy', type: 'uint256' },
    ],
    name: 'buy',
    outputs: [],
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
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'conditionalTokens',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'collectedFees',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'subtractedValue', type: 'uint256' },
    ],
    name: 'decreaseAllowance',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
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
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'from', type: 'address' },
      { name: 'ids', type: 'uint256[]' },
      { name: 'values', type: 'uint256[]' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'onERC1155BatchReceived',
    outputs: [{ name: '', type: 'bytes4' }],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'returnAmount', type: 'uint256' },
      { name: 'outcomeIndex', type: 'uint256' },
      { name: 'maxOutcomeTokensToSell', type: 'uint256' },
    ],
    name: 'sell',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'addedFunds', type: 'uint256' },
      { name: 'distributionHint', type: 'uint256[]' },
    ],
    name: 'addFunding',
    outputs: [],
    stateMutability: 'nonpayable',
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
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: true,
    payable: false,
    type: 'function',
    inputs: [],
    name: 'fee',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [{ name: 'sharesToBurn', type: 'uint256' }],
    name: 'removeFunding',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    constant: false,
    payable: false,
    type: 'function',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'from', type: 'address' },
      { name: 'id', type: 'uint256' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'onERC1155Received',
    outputs: [{ name: '', type: 'bytes4' }],
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
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'funder', type: 'address', indexed: true },
      { name: 'amountsAdded', type: 'uint256[]', indexed: false },
      { name: 'sharesMinted', type: 'uint256', indexed: false },
    ],
    name: 'FPMMFundingAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'funder', type: 'address', indexed: true },
      { name: 'amountsRemoved', type: 'uint256[]', indexed: false },
      { name: 'collateralRemovedFromFeePool', type: 'uint256', indexed: false },
      { name: 'sharesBurnt', type: 'uint256', indexed: false },
    ],
    name: 'FPMMFundingRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'buyer', type: 'address', indexed: true },
      { name: 'investmentAmount', type: 'uint256', indexed: false },
      { name: 'feeAmount', type: 'uint256', indexed: false },
      { name: 'outcomeIndex', type: 'uint256', indexed: true },
      { name: 'outcomeTokensBought', type: 'uint256', indexed: false },
    ],
    name: 'FPMMBuy',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'seller', type: 'address', indexed: true },
      { name: 'returnAmount', type: 'uint256', indexed: false },
      { name: 'feeAmount', type: 'uint256', indexed: false },
      { name: 'outcomeIndex', type: 'uint256', indexed: true },
      { name: 'outcomeTokensSold', type: 'uint256', indexed: false },
    ],
    name: 'FPMMSell',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"mint"`
 */
export const useWriteErc20Mint = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'mint',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"mint"`
 */
export const useSimulateErc20Mint = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'mint',
})

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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Mint"`
 */
export const useWatchErc20MintEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: erc20Abi, eventName: 'Mint' },
)

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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"feesWithdrawableBy"`
 */
export const useReadMarketMakerFeesWithdrawableBy =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'feesWithdrawableBy',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadMarketMakerTotalSupply =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'totalSupply',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"conditionalTokens"`
 */
export const useReadMarketMakerConditionalTokens =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'conditionalTokens',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadMarketMakerBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: marketMakerAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"collectedFees"`
 */
export const useReadMarketMakerCollectedFees =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'collectedFees',
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
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"conditionIds"`
 */
export const useReadMarketMakerConditionIds =
  /*#__PURE__*/ createUseReadContract({
    abi: marketMakerAbi,
    functionName: 'conditionIds',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadMarketMakerAllowance = /*#__PURE__*/ createUseReadContract({
  abi: marketMakerAbi,
  functionName: 'allowance',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const useWriteMarketMaker = /*#__PURE__*/ createUseWriteContract({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteMarketMakerApprove = /*#__PURE__*/ createUseWriteContract({
  abi: marketMakerAbi,
  functionName: 'approve',
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
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteMarketMakerTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"increaseAllowance"`
 */
export const useWriteMarketMakerIncreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"buy"`
 */
export const useWriteMarketMakerBuy = /*#__PURE__*/ createUseWriteContract({
  abi: marketMakerAbi,
  functionName: 'buy',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"decreaseAllowance"`
 */
export const useWriteMarketMakerDecreaseAllowance =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteMarketMakerTransfer = /*#__PURE__*/ createUseWriteContract(
  { abi: marketMakerAbi, functionName: 'transfer' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const useWriteMarketMakerOnErc1155BatchReceived =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"sell"`
 */
export const useWriteMarketMakerSell = /*#__PURE__*/ createUseWriteContract({
  abi: marketMakerAbi,
  functionName: 'sell',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"addFunding"`
 */
export const useWriteMarketMakerAddFunding =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'addFunding',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"removeFunding"`
 */
export const useWriteMarketMakerRemoveFunding =
  /*#__PURE__*/ createUseWriteContract({
    abi: marketMakerAbi,
    functionName: 'removeFunding',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const useSimulateMarketMaker = /*#__PURE__*/ createUseSimulateContract({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateMarketMakerApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'approve',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateMarketMakerTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"increaseAllowance"`
 */
export const useSimulateMarketMakerIncreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"buy"`
 */
export const useSimulateMarketMakerBuy =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'buy',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"decreaseAllowance"`
 */
export const useSimulateMarketMakerDecreaseAllowance =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateMarketMakerTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'transfer',
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
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"sell"`
 */
export const useSimulateMarketMakerSell =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'sell',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"addFunding"`
 */
export const useSimulateMarketMakerAddFunding =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'addFunding',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"removeFunding"`
 */
export const useSimulateMarketMakerRemoveFunding =
  /*#__PURE__*/ createUseSimulateContract({
    abi: marketMakerAbi,
    functionName: 'removeFunding',
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
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const useWatchMarketMakerEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: marketMakerAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"FPMMFundingAdded"`
 */
export const useWatchMarketMakerFpmmFundingAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'FPMMFundingAdded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"FPMMFundingRemoved"`
 */
export const useWatchMarketMakerFpmmFundingRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'FPMMFundingRemoved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"FPMMBuy"`
 */
export const useWatchMarketMakerFpmmBuyEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'FPMMBuy',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"FPMMSell"`
 */
export const useWatchMarketMakerFpmmSellEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'FPMMSell',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchMarketMakerTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchMarketMakerApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'Approval',
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
 * Wraps __{@link writeContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"mint"`
 */
export const writeErc20Mint = /*#__PURE__*/ createWriteContract({
  abi: erc20Abi,
  functionName: 'mint',
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
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"mint"`
 */
export const simulateErc20Mint = /*#__PURE__*/ createSimulateContract({
  abi: erc20Abi,
  functionName: 'mint',
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
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Mint"`
 */
export const watchErc20MintEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Mint',
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
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"feesWithdrawableBy"`
 */
export const readMarketMakerFeesWithdrawableBy =
  /*#__PURE__*/ createReadContract({
    abi: marketMakerAbi,
    functionName: 'feesWithdrawableBy',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"totalSupply"`
 */
export const readMarketMakerTotalSupply = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"calcSellAmount"`
 */
export const readMarketMakerCalcSellAmount = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'calcSellAmount',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"conditionalTokens"`
 */
export const readMarketMakerConditionalTokens =
  /*#__PURE__*/ createReadContract({
    abi: marketMakerAbi,
    functionName: 'conditionalTokens',
  })

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"balanceOf"`
 */
export const readMarketMakerBalanceOf = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"collectedFees"`
 */
export const readMarketMakerCollectedFees = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'collectedFees',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"collateralToken"`
 */
export const readMarketMakerCollateralToken = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'collateralToken',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"conditionIds"`
 */
export const readMarketMakerConditionIds = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'conditionIds',
})

/**
 * Wraps __{@link readContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"allowance"`
 */
export const readMarketMakerAllowance = /*#__PURE__*/ createReadContract({
  abi: marketMakerAbi,
  functionName: 'allowance',
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
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const writeMarketMaker = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"approve"`
 */
export const writeMarketMakerApprove = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'approve',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"withdrawFees"`
 */
export const writeMarketMakerWithdrawFees = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'withdrawFees',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transferFrom"`
 */
export const writeMarketMakerTransferFrom = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"increaseAllowance"`
 */
export const writeMarketMakerIncreaseAllowance =
  /*#__PURE__*/ createWriteContract({
    abi: marketMakerAbi,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"buy"`
 */
export const writeMarketMakerBuy = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'buy',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"decreaseAllowance"`
 */
export const writeMarketMakerDecreaseAllowance =
  /*#__PURE__*/ createWriteContract({
    abi: marketMakerAbi,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transfer"`
 */
export const writeMarketMakerTransfer = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'transfer',
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
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"sell"`
 */
export const writeMarketMakerSell = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'sell',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"addFunding"`
 */
export const writeMarketMakerAddFunding = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'addFunding',
})

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"removeFunding"`
 */
export const writeMarketMakerRemoveFunding = /*#__PURE__*/ createWriteContract({
  abi: marketMakerAbi,
  functionName: 'removeFunding',
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
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const simulateMarketMaker = /*#__PURE__*/ createSimulateContract({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"approve"`
 */
export const simulateMarketMakerApprove = /*#__PURE__*/ createSimulateContract({
  abi: marketMakerAbi,
  functionName: 'approve',
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
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transferFrom"`
 */
export const simulateMarketMakerTransferFrom =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"increaseAllowance"`
 */
export const simulateMarketMakerIncreaseAllowance =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'increaseAllowance',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"buy"`
 */
export const simulateMarketMakerBuy = /*#__PURE__*/ createSimulateContract({
  abi: marketMakerAbi,
  functionName: 'buy',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"decreaseAllowance"`
 */
export const simulateMarketMakerDecreaseAllowance =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'decreaseAllowance',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"transfer"`
 */
export const simulateMarketMakerTransfer = /*#__PURE__*/ createSimulateContract(
  { abi: marketMakerAbi, functionName: 'transfer' },
)

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"onERC1155BatchReceived"`
 */
export const simulateMarketMakerOnErc1155BatchReceived =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'onERC1155BatchReceived',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"sell"`
 */
export const simulateMarketMakerSell = /*#__PURE__*/ createSimulateContract({
  abi: marketMakerAbi,
  functionName: 'sell',
})

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"addFunding"`
 */
export const simulateMarketMakerAddFunding =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'addFunding',
  })

/**
 * Wraps __{@link simulateContract}__ with `abi` set to __{@link marketMakerAbi}__ and `functionName` set to `"removeFunding"`
 */
export const simulateMarketMakerRemoveFunding =
  /*#__PURE__*/ createSimulateContract({
    abi: marketMakerAbi,
    functionName: 'removeFunding',
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
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__
 */
export const watchMarketMakerEvent = /*#__PURE__*/ createWatchContractEvent({
  abi: marketMakerAbi,
})

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"FPMMFundingAdded"`
 */
export const watchMarketMakerFpmmFundingAddedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'FPMMFundingAdded',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"FPMMFundingRemoved"`
 */
export const watchMarketMakerFpmmFundingRemovedEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'FPMMFundingRemoved',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"FPMMBuy"`
 */
export const watchMarketMakerFpmmBuyEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'FPMMBuy',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"FPMMSell"`
 */
export const watchMarketMakerFpmmSellEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'FPMMSell',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"Transfer"`
 */
export const watchMarketMakerTransferEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link watchContractEvent}__ with `abi` set to __{@link marketMakerAbi}__ and `eventName` set to `"Approval"`
 */
export const watchMarketMakerApprovalEvent =
  /*#__PURE__*/ createWatchContractEvent({
    abi: marketMakerAbi,
    eventName: 'Approval',
  })
