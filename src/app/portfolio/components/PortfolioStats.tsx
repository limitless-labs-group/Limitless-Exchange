import { Flex, HStack, StackProps, Text, Box, VStack, Stack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import Skeleton from '@/components/common/skeleton'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import WalletIcon from '@/resources/icons/wallet-icon.svg'
import { useBalanceQuery, useBalanceService, useHistory } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

const StatBox = ({
  title,
  icon,
  value,
  border,
  isLast,
  isFirst,
  w,
}: {
  title: string
  icon: JSX.Element
  value: string | JSX.Element
  border: boolean
  isLast?: boolean
  isFirst?: boolean
  w?: string
}) => {
  const paddingLeft = useMemo(() => {
    if (isMobile) {
      return !isFirst && !isLast
    }
    return !isFirst
  }, [isLast, isFirst])

  const borderRight = useMemo(() => {
    if (isMobile) {
      return isFirst || isLast
    }
    return border && !isLast
  }, [isLast, isFirst, border])

  return (
    <Box
      pt='7px'
      pb='11px'
      flex={isMobile ? 1 : 'unset'}
      borderRight={borderRight ? '1px solid' : 'unset'}
      pl={paddingLeft ? '8px' : 0}
      w={w && !isMobile ? w : 'unset'}
      borderTop={isMobile ? '1px solid' : 'unset'}
    >
      <Text {...paragraphMedium}>{value}</Text>
      <HStack gap='4px' color='grey.500'>
        {icon}
        <Text {...paragraphMedium} color='grey.500'>
          {title}
        </Text>
      </HStack>
    </Box>
  )
}

export const PortfolioStats = ({ ...props }: StackProps) => {
  const { overallBalanceUsd, balanceLoading } = useBalanceService()
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { balanceInvested, balanceToWin, tradesAndPositionsLoading, positions } = useHistory()
  const stats = [
    {
      title: 'Portfolio',
      icon: <PortfolioIcon width={16} height={16} />,
      value:
        tradesAndPositionsLoading || !positions ? (
          <Skeleton height={20} />
        ) : (
          `${NumberUtil.formatThousands(balanceInvested, 2)} USD`
        ),
      border: true,
      w: '213px',
    },
    {
      title: 'To win',
      icon: <CalendarIcon width={16} height={16} />,
      value:
        tradesAndPositionsLoading || !positions ? (
          <Skeleton height={20} />
        ) : (
          `${NumberUtil.formatThousands(balanceToWin, 2)} USD`
        ),
      border: !isMobile,
      w: '166px',
    },
    {
      title: 'Available Balance',
      icon: <WalletIcon width={16} height={16} />,
      value:
        balanceLoading || !balanceOfSmartWallet ? (
          <Skeleton height={20} />
        ) : (
          `${NumberUtil.formatThousands(overallBalanceUsd, 2)} USD`
        ),
      border: true,
    },
  ]

  return (
    <Stack w={'full'} mb={isMobile ? '48px' : '24px'}>
      {isMobile ? (
        <Flex mt={'24px'}>
          <VStack w={'full'} gap={0}>
            <HStack gap={0} w={'full'}>
              <StatBox {...stats[0]} isFirst />
              <StatBox {...stats[1]} />
            </HStack>
            <HStack gap={0} w={'full'} h={'full'}>
              <StatBox {...stats[2]} isLast />
              <Box
                pt='7px'
                pb='11px'
                flex={1}
                borderColor='grey.800'
                borderTop='1px solid'
                pl={'8px'}
                w={'full'}
                h={'full'}
              />
            </HStack>
          </VStack>
        </Flex>
      ) : (
        <Flex {...props} w='full' borderColor='grey.800' borderTop='1px solid'>
          {stats.map((stat, index) => (
            <StatBox
              key={stat.title}
              {...stat}
              isLast={index === stats.length - 1}
              isFirst={!index}
            />
          ))}
        </Flex>
      )}
    </Stack>
  )
}
