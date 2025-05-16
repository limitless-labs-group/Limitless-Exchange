import { Order, EIP712TypedData, PROTOCOL_VERSION } from '@polymarket/order-utils'
import { defaultChain } from '@/constants'

export const EIP712_DOMAIN = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
]

export const ORDER_STRUCTURE = [
  { name: 'salt', type: 'uint256' },
  { name: 'maker', type: 'address' },
  { name: 'signer', type: 'address' },
  { name: 'taker', type: 'address' },
  { name: 'tokenId', type: 'uint256' },
  { name: 'makerAmount', type: 'uint256' },
  { name: 'takerAmount', type: 'uint256' },
  { name: 'expiration', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'feeRateBps', type: 'uint256' },
  { name: 'side', type: 'uint8' },
  { name: 'signatureType', type: 'uint8' },
]

export const buildOrderTypedData = (order: Order, type: 'common' | 'negRisk'): EIP712TypedData => {
  const result = {
    primaryType: 'Order',
    types: {
      // EIP712Domain: EIP712_DOMAIN,
      Order: ORDER_STRUCTURE,
    },
    domain: {
      name: 'Limitless CTF Exchange',
      version: PROTOCOL_VERSION,
      chainId: defaultChain.id,
      verifyingContract:
        type === 'common'
          ? (process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as string)
          : (process.env.NEXT_PUBLIC_NEGRISK_CTF_EXCHANGE as string),
    },
    message: {
      salt: order.salt,
      maker: order.maker,
      signer: order.signer,
      taker: order.taker,
      tokenId: order.tokenId,
      makerAmount: order.makerAmount,
      takerAmount: order.takerAmount,
      expiration: order.expiration,
      nonce: order.nonce,
      feeRateBps: order.feeRateBps,
      side: order.side,
      signatureType: order.signatureType,
    },
  }
  return result
}

export const getOrderErrorText = (msg: string): string => {
  if (!msg) return 'An error occurred'

  const errorMsg = msg.toString().toLowerCase()

  if (
    errorMsg.includes('cannot read property') ||
    errorMsg.includes('of null') ||
    errorMsg.includes('of undefined') ||
    errorMsg.includes('undefined') ||
    errorMsg.includes('null')
  ) {
    return 'Something went wrong. Please try again.'
  }

  return msg
}

/*

curl -X POST http://138.68.79.170:3200/build-order \
-H "Content-Type: application/json" \
-d '{
    "tokenID": "75818619657568813474341868652308942079804919287380422192892211131408793125422",
    "price": 0.67,
    "side": "BUY",
    "size": 100,
    "feeRateBps": 0,
    "privateKey": "0x23c3a6cc9c058a220fbc82080d5210471015e4815ec73df7a251cc6d59950b1f"
}'

*/
