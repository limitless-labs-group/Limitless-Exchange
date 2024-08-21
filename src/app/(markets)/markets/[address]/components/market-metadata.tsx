import { defaultChain } from '@/constants'
import { Flex, HStack, Text, Box } from '@chakra-ui/react'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import { Market } from '@/types'
import { isMobile } from 'react-device-detect'
import { NumberUtil } from '@/utils'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { useMemo } from 'react'

export interface IMarketMetadata {
  market: Market | null
  winningIndex: number | undefined | null
  resolved: boolean
  outcomeTokensPercent?: number[]
  liquidity: string
  volume: string
}

export const MarketMetadata = ({
  market,
  resolved,
  winningIndex,
  outcomeTokensPercent,
  liquidity,
  volume,
}: IMarketMetadata) => {
  const stats = [
    {
      title: 'Liquidity',
      icon: <LiquidityIcon width={16} height={16} />,
      value: `${NumberUtil.formatThousands(liquidity, 6)} ${market?.collateralToken.symbol}`,
      border: true,
    },
    {
      title: 'Volume',
      icon: <VolumeIcon width={16} height={16} />,
      value: `${NumberUtil.formatThousands(volume, 6)} ${market?.collateralToken.symbol}`,
      border: !isMobile,
    },
    {
      title: 'Deadline',
      icon: <CalendarIcon width={16} height={16} />,
      value: market?.expirationDate,
      border: false,
    },
  ]

  const [yesProbability, noProbability] = useMemo(
    () => [
      !resolved
        ? NumberUtil.toFixed(outcomeTokensPercent?.[0], 1)
        : winningIndex === 0
        ? '100'
        : '0',
      !resolved
        ? NumberUtil.toFixed(outcomeTokensPercent?.[1], 1)
        : winningIndex === 1
        ? '100'
        : '0',
    ],
    [outcomeTokensPercent, resolved, winningIndex, market]
  )

  return (
    <Box>
      <Flex w='full' pb='10px' borderBottom='1px solid' borderColor='grey.800'>
        <HStack gap='24px'>
          <HStack gap={'4px'} color='green.500'>
            <ThumbsUpIcon width={16} height={16} />
            <Text fontWeight={500}>{yesProbability}%</Text>
            <Text fontWeight={500}>Yes</Text>
          </HStack>
          <HStack gap={'4px'} color='red.500'>
            <ThumbsDownIcon width={16} height={16} />
            <Text fontWeight={500}>{noProbability}%</Text>
            <Text fontWeight={500}>No</Text>
          </HStack>
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
              <Text {...paragraphMedium}>{stat.value}</Text>
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
              <Text {...paragraphMedium}>{stats[index].value}</Text>
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
