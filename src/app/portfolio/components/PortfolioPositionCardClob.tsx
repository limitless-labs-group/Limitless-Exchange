import { Box, BoxProps, Divider, HStack, Icon, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { Address, formatUnits } from 'viem'
import ClaimButton from '@/components/common/markets/claim-button'
import ActiveIcon from '@/resources/icons/active-icon.svg'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import ClosedIcon from '@/resources/icons/close-rounded-icon.svg'
import { ClobPositionWithType } from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

export type PortfolioPositionCardClobProps = BoxProps & {
  positionData: ClobPositionWithType
  cardColors: {
    main: string
    secondary: string
  }
}

const StatusIcon = ({ isClosed, color }: { isClosed: boolean | undefined; color: string }) => {
  return isClosed ? (
    <>
      <Icon as={ClosedIcon} width={'16px'} height={'16px'} color={color} />
      <Text {...paragraphMedium} color={color}>
        Closed
      </Text>
    </>
  ) : (
    <>
      <ActiveIcon width={16} height={16} />
      <Text {...paragraphMedium} color={color}>
        Active
      </Text>
    </>
  )
}

const PortfolioPositionCardClob = ({
  positionData,
  cardColors,
  ...props
}: PortfolioPositionCardClobProps) => {
  const marketClosed = positionData.market.status === MarketStatus.RESOLVED

  const deadline = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(positionData.market.deadline))

  const showContracts = (side: 0 | 1) => {
    if (marketClosed) {
      return positionData.market.winningOutcomeIndex === side
    }
    return true
  }

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
      cursor='pointer'
      border='2px solid'
      borderColor={marketClosed ? 'green.500' : 'grey.100'}
      w={'full'}
      borderRadius='8px'
      _hover={{
        bg: marketClosed ? 'green.500' : 'grey.100',
      }}
      bg={marketClosed ? 'green.500' : 'unset'}
      p={isMobile ? '16px' : '8px'}
    >
      <HStack w='full' justifyContent='space-between'>
        <Text {...paragraphMedium} color={cardColors.main}>
          {positionData.market.group?.title || positionData.market.title}
        </Text>
        {isMobile && (
          <Icon as={ArrowRightIcon} width={'16px'} height={'16px'} color={cardColors.main} />
        )}
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
              positionData.market.collateralToken.decimals
            )}
            symbol={positionData.market.collateralToken.symbol}
            amounts={amountsToNegriskClaim}
            negRiskRequestId={positionData.market.negRiskRequestId}
          />
        )}
      </HStack>
      {isMobile && (
        <>
          <HStack color={cardColors.secondary} mt='8px'>
            <HStack gap={1}>
              {<StatusIcon isClosed={marketClosed} color={cardColors.secondary} />}
            </HStack>
            <HStack gap={1} color={cardColors.secondary}>
              <CalendarIcon width={'16px'} height={'16px'} />
              <Text {...paragraphMedium} color={cardColors.secondary}>
                {deadline}
              </Text>
            </HStack>
          </HStack>
          {marketClosed && (
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
                positionData.market.collateralToken.decimals
              )}
              symbol={positionData.market.collateralToken.symbol}
              mt='12px'
              amounts={amountsToNegriskClaim}
              negRiskRequestId={positionData.market.negRiskRequestId}
            />
          )}
          <Divider w={'full'} h={'1px'} mb={'10px'} mt={'10px'} />
        </>
      )}
      {positionData.market.group && (
        <Text {...paragraphMedium} mt='24px' color={cardColors.main}>
          {positionData.market.title}
        </Text>
      )}
      <HStack w='full' justifyContent='space-between' alignItems='flex-end' mt='16px'>
        <Box w={isMobile ? 'full' : 'unset'}>
          <HStack
            gap='12px'
            w={isMobile ? 'full' : 'unset'}
            pb='2px'
            borderBottom='1px solid'
            borderColor={marketClosed ? 'whiteAlpha.50' : 'grey.100'}
          >
            <Text
              {...paragraphMedium}
              color={cardColors.secondary}
              w={isMobile ? 'unset' : '60px'}
              flex={isMobile ? 1 : 'unset'}
              textAlign={isMobile ? 'left' : 'unset'}
            >
              Position
            </Text>
            <Text
              {...paragraphMedium}
              color={cardColors.secondary}
              w={isMobile ? 'unset' : '120px'}
              flex={isMobile ? 1 : 'unset'}
              textAlign={isMobile ? 'left' : 'center'}
            >
              Contracts
            </Text>
          </HStack>
          {Boolean(+positionData.tokensBalance.yes) && showContracts(0) && (
            <HStack gap='12px' mt='4px' w={isMobile ? 'full' : 'unset'}>
              <Text
                {...paragraphRegular}
                color={cardColors.main}
                w={isMobile ? 'unset' : '60px'}
                flex={isMobile ? 1 : 'unset'}
                textAlign={isMobile ? 'left' : 'unset'}
              >
                Yes
              </Text>
              <Text
                {...paragraphRegular}
                color={cardColors.main}
                w={isMobile ? 'unset' : '120px'}
                flex={isMobile ? 1 : 'unset'}
                textAlign={isMobile ? 'left' : 'center'}
              >
                {`${NumberUtil.toFixed(
                  formatUnits(
                    BigInt(positionData.tokensBalance.yes),
                    positionData.market.collateralToken.decimals
                  ),
                  6
                )}`}
              </Text>
            </HStack>
          )}
          {Boolean(+positionData.tokensBalance.no) && showContracts(1) && (
            <HStack gap='12px' mt='4px' w={isMobile ? 'full' : 'unset'}>
              <Text
                {...paragraphRegular}
                color={cardColors.main}
                w={isMobile ? 'unset' : '60px'}
                flex={isMobile ? 1 : 'unset'}
                textAlign={isMobile ? 'left' : 'unset'}
              >
                No
              </Text>
              <Text
                {...paragraphRegular}
                color={cardColors.main}
                w={isMobile ? 'unset' : '120px'}
                flex={isMobile ? 1 : 'unset'}
                textAlign={isMobile ? 'left' : 'center'}
              >
                {`${NumberUtil.toFixed(
                  formatUnits(
                    BigInt(positionData.tokensBalance.no),
                    positionData.market.collateralToken.decimals
                  ),
                  6
                )}`}
              </Text>
            </HStack>
          )}
        </Box>
        {!isMobile && (
          <HStack color={cardColors.secondary} mt='8px'>
            <HStack gap={1}>
              {<StatusIcon isClosed={marketClosed} color={cardColors.secondary} />}
            </HStack>
            <HStack gap={1} color={cardColors.secondary}>
              <CalendarIcon width={'16px'} height={'16px'} />
              <Text {...paragraphMedium} color={cardColors.secondary}>
                {deadline}
              </Text>
            </HStack>
          </HStack>
        )}
      </HStack>
    </Box>
  )
}

export default PortfolioPositionCardClob
