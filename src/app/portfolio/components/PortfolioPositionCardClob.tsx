import { Box, BoxProps, HStack, Icon, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { Address, formatUnits } from 'viem'
import ClaimButton from '@/components/common/markets/claim-button'
import FullPositionsTab from '@/app/portfolio/components/full-positions-tab'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import { ClobPositionWithType } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { MarketStatus } from '@/types'

export type PortfolioPositionCardClobProps = BoxProps & {
  positionData: ClobPositionWithType
}

const PortfolioPositionCardClob = ({ positionData, ...props }: PortfolioPositionCardClobProps) => {
  const marketClosed = positionData.market.status === MarketStatus.RESOLVED

  const decimals = positionData.market.collateralToken.decimals

  const symbol = positionData.market.collateralToken.symbol

  const amountsToNegriskClaim = useMemo(() => {
    if (!positionData.market.negRiskRequestId) {
      return
    }
    const yesTokensToClaim =
      positionData.market.winningOutcomeIndex === 0 ? BigInt(positionData.tokensBalance.yes) : 0n
    const noTokensToClaim =
      positionData.market.winningOutcomeIndex === 1 ? BigInt(positionData.tokensBalance.no) : 0n
    return [yesTokensToClaim, noTokensToClaim]
  }, [
    positionData.market.negRiskRequestId,
    positionData.market.winningOutcomeIndex,
    positionData.tokensBalance.no,
    positionData.tokensBalance.yes,
  ])

  return (
    <Box
      {...props}
      border='2px solid'
      borderColor={marketClosed ? 'green.500' : 'grey.100'}
      w={'full'}
      borderRadius='8px'
      bg={marketClosed ? 'green.500' : 'unset'}
      p={isMobile ? '16px' : '8px'}
    >
      <HStack w='full' justifyContent='space-between'>
        <Text {...paragraphMedium}>
          {positionData.market.group?.title || positionData.market.title}
        </Text>
        {isMobile && <Icon as={ArrowRightIcon} width={'16px'} height={'16px'} />}
        {!isMobile && marketClosed && (
          <ClaimButton
            slug={positionData.market.slug}
            conditionId={positionData.market.conditionId as Address}
            collateralAddress={positionData.market.collateralToken.address}
            marketAddress={
              positionData.market.negRiskRequestId
                ? (process.env.NEXT_PUBLIC_NEGRISK_ADAPTER as Address)
                : (process.env.NEXT_PUBLIC_CTF_CONTRACT as Address)
            }
            outcomeIndex={positionData.market.winningOutcomeIndex as number}
            marketType='clob'
            amountToClaim={formatUnits(
              BigInt(
                positionData.tokensBalance[positionData.market.winningOutcomeIndex ? 'no' : 'yes']
              ),
              decimals
            )}
            symbol={symbol}
            amounts={amountsToNegriskClaim}
            negRiskRequestId={positionData.market.negRiskRequestId}
          />
        )}
      </HStack>
      {positionData.market.group?.title && (
        <Text {...paragraphMedium} mt='24px'>
          {positionData.market.title}
        </Text>
      )}
      <Box mt='16px'>
        <FullPositionsTab
          position={positionData.positions}
          contracts={positionData.tokensBalance}
          decimals={positionData.market.collateralToken.decimals}
          symbol={positionData.market.collateralToken.symbol}
          marketClosed={positionData.market.status === MarketStatus.RESOLVED}
          winSide={positionData.market.winningOutcomeIndex}
        />
      </Box>
    </Box>
  )
}

export default PortfolioPositionCardClob
