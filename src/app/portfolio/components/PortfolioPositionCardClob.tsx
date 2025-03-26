import { Box, BoxProps, Divider, HStack, Icon, Text } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
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
  isPortfolio?: boolean
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
  isPortfolio = false,
  ...props
}: PortfolioPositionCardClobProps) => {
  const marketClosed = positionData.market.status === MarketStatus.RESOLVED

  const deadline = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(positionData.market.deadline))

  const decimals = positionData.market.collateralToken.decimals

  const symbol = positionData.market.collateralToken.symbol

  const calculatePrice = (price: string) => {
    return new BigNumber(price).multipliedBy(100).decimalPlaces(1).toString()
  }

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
          {positionData.market.title}
        </Text>
        {isMobile && (
          <Icon as={ArrowRightIcon} width={'16px'} height={'16px'} color={cardColors.main} />
        )}
        {!isMobile && marketClosed && (
          <ClaimButton
            slug={positionData.market.slug}
            conditionId={positionData.market.conditionId as Address}
            collateralAddress={positionData.market.collateralToken.address}
            marketAddress={process.env.NEXT_PUBLIC_CTF_CONTRACT as Address}
            outcomeIndex={positionData.market.winningOutcomeIndex as number}
            marketType='clob'
            amountToClaim={formatUnits(
              BigInt(
                positionData.tokensBalance[positionData.market.winningOutcomeIndex ? 'no' : 'yes']
              ),
              decimals
            )}
            symbol={symbol}
          />
        )}
      </HStack>
      {isMobile && (
        <>
          {isPortfolio && (
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
          {marketClosed && (
            <ClaimButton
              slug={positionData.market.slug}
              conditionId={positionData.market.conditionId as Address}
              collateralAddress={positionData.market.collateralToken.address}
              marketAddress={process.env.NEXT_PUBLIC_CTF_CONTRACT as Address}
              outcomeIndex={positionData.market.winningOutcomeIndex as number}
              marketType='clob'
              amountToClaim={formatUnits(
                BigInt(
                  positionData.tokensBalance[positionData.market.winningOutcomeIndex ? 'no' : 'yes']
                ),
                decimals
              )}
              symbol={symbol}
              mt='12px'
            />
          )}
          <Divider w={'full'} h={'1px'} mb={'10px'} mt={'10px'} />
        </>
      )}
      <HStack w='full' justifyContent='space-between' alignItems='flex-end' mt='16px'>
        <Box w={isMobile ? 'full' : 'unset'}>
          <HStack
            gap='12px'
            w={isMobile ? 'full' : 'unset'}
            borderBottom='1px solid'
            borderColor='grey.500'
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
            <Text
              {...paragraphMedium}
              color={cardColors.secondary}
              w={isMobile ? 'unset' : '60px'}
              flex={isMobile ? 1 : 'unset'}
              textAlign={isMobile ? 'left' : 'center'}
            >
              Price
            </Text>
            <Text
              {...paragraphMedium}
              color={cardColors.secondary}
              w={isMobile ? 'unset' : '120px'}
              flex={isMobile ? 1 : 'unset'}
              textAlign={isMobile ? 'left' : 'center'}
            >
              Cost
            </Text>
          </HStack>
          {Boolean(+positionData.tokensBalance.yes) &&
            positionData.market.winningOutcomeIndex !== 1 && (
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
                    formatUnits(BigInt(positionData.tokensBalance.yes), decimals),
                    2
                  )}`}
                </Text>
                <Text
                  {...paragraphRegular}
                  color={cardColors.main}
                  w={isMobile ? 'unset' : '60px'}
                  flex={isMobile ? 1 : 'unset'}
                  textAlign={isMobile ? 'left' : 'center'}
                >
                  {calculatePrice(
                    formatUnits(BigInt(positionData.positions.yes.fillPrice), decimals)
                  )}
                  ¢
                </Text>
                <Text
                  {...paragraphRegular}
                  color={cardColors.main}
                  w={isMobile ? 'unset' : '120px'}
                  flex={isMobile ? 1 : 'unset'}
                  textAlign={isMobile ? 'left' : 'center'}
                >
                  {`${NumberUtil.toFixed(
                    formatUnits(BigInt(positionData.positions.yes.cost), decimals),
                    2
                  )}`}{' '}
                  {symbol}
                </Text>
              </HStack>
            )}
          {Boolean(+positionData.tokensBalance.no) && !positionData.market.winningOutcomeIndex && (
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
                  2
                )}`}
              </Text>
              <Text
                {...paragraphRegular}
                color={cardColors.main}
                w={isMobile ? 'unset' : '60px'}
                flex={isMobile ? 1 : 'unset'}
                textAlign={isMobile ? 'left' : 'center'}
              >
                {calculatePrice(formatUnits(BigInt(positionData.positions.no.fillPrice), decimals))}
                ¢
              </Text>
              <Text
                {...paragraphRegular}
                color={cardColors.main}
                w={isMobile ? 'unset' : '120px'}
                flex={isMobile ? 1 : 'unset'}
                textAlign={isMobile ? 'left' : 'center'}
              >
                {`${NumberUtil.toFixed(
                  formatUnits(BigInt(positionData.positions.no.cost), decimals),
                  2
                )}`}{' '}
                {symbol}
              </Text>
            </HStack>
          )}
        </Box>
        {!isMobile && isPortfolio && (
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
