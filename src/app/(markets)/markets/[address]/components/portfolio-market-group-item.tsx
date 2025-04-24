import { Button, Td, Tr } from '@chakra-ui/react'
import { formatUnits } from 'viem'
import { useClobWidget } from '@/components/common/markets/clob-widget/context'
import ConvertPositionsButton from '@/app/(markets)/markets/[address]/components/convert-positions-button'
import { useTradingService } from '@/services'
import { MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

interface PortfolioMarketGroupItemProps {
  outcome: number
  quantity: string
}

export default function PortfolioMarketGroupItem({
  outcome,
  quantity,
}: PortfolioMarketGroupItemProps) {
  const { setPrice, sharesAvailable } = useClobWidget()
  const { market, strategy, setStrategy, clobOutcome, setClobOutcome } = useTradingService()

  const totalShares = formatUnits(BigInt(quantity), market?.collateralToken.decimals || 6)

  const marketEnded = market
    ? new Date(market.expirationTimestamp).getTime() < new Date().getTime() ||
      market.status === MarketStatus.RESOLVED
    : false

  const onClickSell = () => {
    if (strategy === 'Buy') {
      setStrategy('Sell')
    }
    if (outcome !== clobOutcome) {
      setClobOutcome(outcome)
    }
    setPrice(
      formatUnits(sharesAvailable[outcome ? 'no' : 'yes'], market?.collateralToken.decimals || 6)
    )
  }

  return (
    <Tr>
      <Td>{outcome ? 'No' : 'Yes'}</Td>
      <Td>{NumberUtil.formatThousands(totalShares)}</Td>
      <Td>{outcome && !marketEnded ? <ConvertPositionsButton /> : null}</Td>
      <Td>
        {!marketEnded ? (
          <Button variant='white' onClick={onClickSell}>
            Sell
          </Button>
        ) : null}
      </Td>
    </Tr>
  )
}
