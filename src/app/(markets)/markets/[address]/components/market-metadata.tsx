import { Flex, HStack, Text, Box } from '@chakra-ui/react'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import MarketCountdown from '@/components/common/markets/market-cards/market-countdown'
import MarketTimer from '@/components/common/markets/market-cards/market-timer'
import Skeleton from '@/components/common/skeleton'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { Market, MarketStatus } from '@/types'
import { NumberUtil } from '@/utils'

export interface IMarketMetadata {
  market?: Market
  winningIndex: number | undefined | null
  resolved: boolean
  marketLoading: boolean
}

export const MarketMetadata = ({
  market,
  resolved,
  winningIndex,
  marketLoading,
}: IMarketMetadata) => {
  const stats = [
    {
      title: 'Liquidity',
      icon: <LiquidityIcon width={16} height={16} />,
      value: `${NumberUtil.formatThousands(market?.liquidityFormatted, 6)} ${
        market?.collateralToken.symbol
      }`,
      border: true,
    },
    {
      title: 'Volume',
      icon: <VolumeIcon width={16} height={16} />,
      value: `${NumberUtil.formatThousands(market?.volumeFormatted, 6)} ${
        market?.collateralToken.symbol
      }`,
      border: !isMobile,
    },
    {
      title: 'Deadline',
      icon: <CalendarIcon width={16} height={16} />,
      value:
        market?.expirationTimestamp &&
        market.expirationTimestamp - new Date().getTime() < 1000 * 24 * 60 * 60 ? (
          <MarketCountdown
            deadline={market.expirationTimestamp}
            deadlineText={market.expirationDate}
            color='grey.800'
            showDays={false}
            ended={market.status === MarketStatus.RESOLVED}
          />
        ) : (
          market?.expirationDate
        ),
      border: false,
    },
  ]

  const [yesProbability, noProbability] = useMemo(
    () => [
      !resolved ? NumberUtil.toFixed(market?.prices?.[0], 1) : winningIndex === 0 ? '100' : '0',
      !resolved ? NumberUtil.toFixed(market?.prices?.[1], 1) : winningIndex === 1 ? '100' : '0',
    ],
    [market, resolved, winningIndex]
  )

  return (
    <Box>
      <Flex w='full' pb='10px' borderBottom='1px solid' borderColor='grey.800'>
        <HStack gap='24px'>
          {marketLoading ? (
            <Box w='80px'>
              <Skeleton height={21} />
            </Box>
          ) : (
            <HStack gap={'4px'} color='green.500'>
              <ThumbsUpIcon width={16} height={16} />
              <Text fontWeight={500}>{yesProbability}%</Text>
              <Text fontWeight={500}>Yes</Text>
            </HStack>
          )}
          {marketLoading ? (
            <Box w='80px'>
              <Skeleton height={21} />
            </Box>
          ) : (
            <HStack gap={'4px'} color='red.500'>
              <ThumbsDownIcon width={16} height={16} />
              <Text fontWeight={500}>{noProbability}%</Text>
              <Text fontWeight={500}>No</Text>
            </HStack>
          )}
        </HStack>
      </Flex>
      <Flex borderBottom={isMobile ? '1px solid' : 'unset'} borderColor='grey.800'>
        {!isMobile &&
          stats.map((stat, index) => (
            <Box
              pt='7px'
              pb='11px'
              key={stat.title}
              flex={1}
              borderRight={stat.border ? '1px solid' : 'unset'}
              borderColor='grey.800'
              pl={index ? '8px' : 0}
            >
              {marketLoading ? (
                <Skeleton height={20} />
              ) : (
                <Text {...paragraphMedium}>{stat.value}</Text>
              )}
              <HStack gap='4px' color='grey.500'>
                {stat.icon}
                <Text {...paragraphMedium} color='grey.500'>
                  {stat.title}
                </Text>
              </HStack>
            </Box>
          ))}
        {isMobile &&
          [0, 1].map((index) => (
            <Box
              pt='7px'
              pb='11px'
              key={stats[index].title}
              flex={1}
              borderRight={stats[index].border ? '1px solid' : 'unset'}
              borderColor='grey.800'
              pl={index ? '8px' : 0}
            >
              {marketLoading ? (
                <Skeleton height={20} />
              ) : (
                <Text {...paragraphMedium}>{stats[index].value}</Text>
              )}
              <HStack gap='4px' color='grey.500'>
                {stats[index].icon}
                <Text {...paragraphMedium} color='grey.500'>
                  {stats[index].title}
                </Text>
              </HStack>
            </Box>
          ))}
      </Flex>
      {isMobile && (
        <Box
          pt='7px'
          pb='11px'
          key={stats[2].title}
          flex={1}
          borderRight={stats[2].border ? '1px solid' : 'unset'}
          borderColor='grey.800'
          pl={0}
        >
          <Text {...paragraphMedium}>{stats[2].value}</Text>
          <HStack gap='4px' color='grey.500'>
            {stats[2].icon}
            <Text {...paragraphMedium} color='grey.500'>
              {stats[2].title}
            </Text>
          </HStack>
        </Box>
      )}
    </Box>
  )
}
