import { useEffect, useState } from 'react'
import { Address, formatUnits } from 'viem'
import ConvertStep from '@/components/common/markets/convert-modal/convert-step'
import ReviewStep from '@/components/common/markets/convert-modal/review-step'
import { ClobPositionWithType, usePosition, useTradingService } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'

interface ConvertModalContentProps {
  step: number
  setStep: (val: number) => void
}

export type ClobPositionWithTypeAndSelected = ClobPositionWithType & {
  selected: boolean
}

export default function ConvertModalContent({ step, setStep }: ConvertModalContentProps) {
  const { data: allPositions } = usePosition()
  const { groupMarket, market } = useTradingService()
  const { checkAllowanceForAll } = useWeb3Service()
  const [convertPositions, setConvertPositions] = useState<ClobPositionWithTypeAndSelected[]>([])
  const [sharesToConvert, setSharesToConvert] = useState('')
  const [isApproved, setIsApproved] = useState(false)

  const prepareInitialPositions = () => {
    const currentPositions = allPositions?.positions
      ?.filter((position) => position.type === 'clob')
      .filter((position) =>
        groupMarket?.markets?.some(
          (market) =>
            position.market.slug === market?.slug &&
            !!+(position as ClobPositionWithType).tokensBalance.no
        )
      )
      .map((position) => ({
        ...position,
        selected: false,
        amount: '',
      }))
    if (currentPositions?.length) {
      setConvertPositions(currentPositions as ClobPositionWithTypeAndSelected[])
    }
  }

  useEffect(() => {
    prepareInitialPositions()
  }, [])

  const maxShares = Math.min(
    ...convertPositions.map(
      (position) =>
        +formatUnits(BigInt(position.tokensBalance.no), market?.collateralToken.decimals || 6)
    )
  )

  const checkConvertAllowance = async () => {
    const isApproved = await checkAllowanceForAll(
      process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address,
      process.env.NEXT_PUBLIC_CTF_CONTRACT as Address
    )
    setIsApproved(isApproved)
  }

  useEffect(() => {
    checkConvertAllowance()
  }, [])

  return step === 1 ? (
    <ConvertStep
      positions={convertPositions as ClobPositionWithTypeAndSelected[]}
      setConvertPositions={setConvertPositions}
      maxShares={maxShares.toString()}
      setSharesToConvert={setSharesToConvert}
      sharesToConvert={sharesToConvert}
      onReviewClick={() => setStep(2)}
    />
  ) : (
    <ReviewStep
      positions={convertPositions as ClobPositionWithTypeAndSelected[]}
      onBack={() => setStep(1)}
      sharesToConvert={sharesToConvert}
      checkConvertAllowance={checkConvertAllowance}
      isApproved={isApproved}
    />
  )
}
