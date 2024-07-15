import { useBalanceService, useHistory } from '@/services'
import { Flex, HStack, StackProps, Text, Box, VStack, Stack } from '@chakra-ui/react'
import { NumberUtil } from '@/utils'
import PortfolioIcon from '@/resources/icons/portfolio-icon.svg'
import WalletIcon from '@/resources/icons/wallet-icon.svg'
import CalendarIcon from '@/resources/icons/calendar-icon.svg'
import { isMobile } from 'react-device-detect'

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
  value: string
  border: boolean
  isLast?: boolean
  isFirst?: boolean
  w?: string
}) => (
  <Box
    pt='7px'
    pb='11px'
    flex={isMobile ? 1 : 'unset'}
    borderRight={border && !isLast ? '1px solid' : 'unset'}
    pl={!isFirst ? '8px' : 0}
    w={w && !isMobile ? w : 'unset'}
  >
    <Text fontWeight={500}>{value}</Text>
    <HStack gap='4px' color='grey.500'>
      {icon}
      <Text fontWeight={500}>{title}</Text>
    </HStack>
  </Box>
)

export const PortfolioStats = ({ ...props }: StackProps) => {
  const { overallBalanceUsd } = useBalanceService()
  const { balanceInvested, balanceToWin } = useHistory()
  const stats = [
    {
      title: 'Portfolio',
      icon: <PortfolioIcon width={16} height={16} />,
      value: `~${NumberUtil.formatThousands(balanceInvested, 2)} USD`,
      border: true,
      w: '213px',
    },
    {
      title: 'To win',
      icon: <CalendarIcon width={16} height={16} />,
      value: `${NumberUtil.formatThousands(balanceToWin, 2)} USD`,
      border: !isMobile,
      w: '166px',
    },
    {
      title: 'Available Balance',
      icon: <WalletIcon width={16} height={16} />,
      value: `${NumberUtil.formatThousands(overallBalanceUsd, 2)} USD`,
      border: true,
    },
  ]

  return (
    <Stack w={'full'}>
      {isMobile ? (
        <Flex mt={'24px'}>
          <VStack w={'full'} gap={0}>
            <HStack gap={0} w={'full'}>
              <StatBox {...stats[0]} isFirst />
              <StatBox {...stats[1]} isLast />
            </HStack>
            <HStack gap={0} w={'full'} h={'full'}>
              <StatBox {...stats[2]} />
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
