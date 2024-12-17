export interface SignedOrder {
  order: {
    salt: string // '1337817671817'
    maker: string // '0xA2D05BE9fc36d5accA6E2A71919bB1E1cAeb7C5E'
    signer: string //  '0xA2D05BE9fc36d5accA6E2A71919bB1E1cAeb7C5E'
    taker: string // '0x0000000000000000000000000000000000000000'
    tokenId: string //  '75818619657568813474341868652308942079804919287380422192892211131408793125422'
    makerAmount: string // '67000000'
    takerAmount: string // '100000000'
    expiration: string // '0'
    nonce: string // '0'
    feeRateBps: string // '0'
    side: string // 0
    signatureType: string // 0
    signature: string // '0xfefed95802cf74778ad02a46c270b948ce0f79b0209d91f235014c0ea67c73e47b343dcbf379b8aeb794e508869945e98f3ef3faa9a7858d3784cfad3377162b1b'
  }
}
