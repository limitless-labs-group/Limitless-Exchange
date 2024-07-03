import { Button } from '@/components'
import { defaultChain } from '@/constants'
import { useIsMobile, useMarketData } from '@/hooks'
import {
  ClickEvent,
  ShareClickedMetadata,
  createMarketShareUrls,
  useAmplitude,
  useTradingService,
} from '@/services'
import { borderRadius, colors } from '@/styles'
import { NumberUtil } from '@/utils'
import {
  Divider,
  Flex,
  HStack,
  Heading,
  Image,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  StackProps,
  Text,
  VStack,
  useClipboard,
  Box,
} from '@chakra-ui/react'
import { FaShareSquare } from 'react-icons/fa'
import { FaLink, FaXTwitter } from 'react-icons/fa6'
import { useToken } from '@/hooks/use-token'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import LiquidityIcon from '@/resources/icons/liquidity-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import { Market } from '@/types'

interface MarketMetadataProps {
  market: Market | null
}

export const MarketMetadata = ({ market }: MarketMetadataProps) => {
  /**
   * ANALYTICS
   */
  const { trackClicked } = useAmplitude()

  const { onCopy, hasCopied } = useClipboard(window.location.href)

  const { tweetURI, castURI } = createMarketShareUrls(market, market?.prices)

  const isMobile = useIsMobile()

  const stats = [
    {
      title: 'Liquidity',
      icon: <LiquidityIcon width={16} height={16} />,
      value: `${market?.liquidityFormatted} ${market?.tokenTicker[defaultChain.id]}`,
      border: true,
    },
    {
      title: 'Volume',
      icon: <VolumeIcon width={16} height={16} />,
      value: `${market?.volumeFormatted} ${market?.tokenTicker[defaultChain.id]}`,
      border: !isMobile,
    },
    {
      title: 'Deadline',
      icon: <CalendarIcon width={16} height={16} />,
      value: market?.expirationDate,
      border: false,
    },
  ]

  return (
    <Box>
      <Flex w='full' pb='10px' borderBottom='1px solid' borderColor='grey.800'>
        <HStack gap='24px'>
          <HStack gap={'4px'} color='green.500'>
            <ThumbsUpIcon width={16} height={16} />
            <Text fontWeight={500}>{market?.prices[0]}%</Text>
            <Text fontWeight={500}>Yes</Text>
          </HStack>
          <HStack gap={'4px'} color='red.500'>
            <ThumbsDownIcon width={16} height={16} />
            <Text fontWeight={500}>{market?.prices[1]}%</Text>
            <Text fontWeight={500}>No</Text>
          </HStack>
        </HStack>
      </Flex>
      <Flex>
        {stats.map((stat, index) => (
          <Box
            pt='7px'
            pb='11px'
            key={stat.title}
            flex={1}
            borderRight={stat.border ? '1px solid' : 'unset'}
            borderColor='grey.800'
            pl={index ? '8px' : 0}
          >
            <Text fontWeight={500}>{stat.value}</Text>
            <HStack gap='4px' color='grey.500'>
              {stat.icon}
              <Text fontWeight={500}>{stat.title}</Text>
            </HStack>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}
