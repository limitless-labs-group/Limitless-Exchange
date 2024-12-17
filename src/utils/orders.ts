import {
  Order,
  EIP712TypedData,
  EIP712_DOMAIN,
  ORDER_STRUCTURE,
  PROTOCOL_NAME,
  PROTOCOL_VERSION,
} from '@polymarket/order-utils'
import { defaultChain } from '@/constants'

export const buildOrderTypedData = (order: Order): EIP712TypedData => {
  return {
    primaryType: 'Order',
    types: {
      EIP712Domain: EIP712_DOMAIN,
      Order: ORDER_STRUCTURE,
    },
    domain: {
      name: PROTOCOL_NAME,
      version: PROTOCOL_VERSION,
      chainId: defaultChain.id,
      verifyingContract: process.env.NEXT_PUBLIC_CTF_EXCHANGE_ADDR as string,
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
