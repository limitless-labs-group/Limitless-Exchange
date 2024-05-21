import { Button, Flex, HStack, Image, Text, useClipboard } from '@chakra-ui/react'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { FaBriefcase, FaCopy, FaSignOutAlt } from 'react-icons/fa'
import { colors } from '@/styles'
import { useRouter } from 'next/navigation'
import {
  ClickEvent,
  ProfileBurgerMenuClickedMetadata,
  useAmplitude,
  useAuth,
  useBalanceService,
} from '@/services'
import { FaTableCellsLarge } from 'react-icons/fa6'
import { useIsMobile } from '@/hooks'
import { useMemo } from 'react'

export default function HeaderButtons({ account }: { account: string }) {
  const { onCopy, hasCopied } = useClipboard(account ?? '')
  const { overallBalanceUsd } = useBalanceService()
  const router = useRouter()
  const { trackClicked } = useAmplitude()
  const { signOut } = useAuth()
  const isMobile = useIsMobile()

  const actions = [
    {
      onClick: onCopy,
      content: (
        <Flex justifyContent='space-between' w='full'>
          <Text>{truncateEthAddress(account)}</Text>
          <FaCopy fontSize={'14px'} fill={hasCopied ? colors.brand : colors.fontLight} />
        </Flex>
      ),
      variant: 'outline',
    },
    {
      onClick: () => router.push('/wallet'),
      content: (
        <>
          <Image alt='wallet' src='/assets/images/wallet.svg' width={'16px'} height={'16px'} />
          <HStack spacing={1}>
            <Text>Balance</Text>
            <Text fontWeight={'bold'}>{NumberUtil.formatThousands(overallBalanceUsd)}</Text>
            <Text>USD</Text>
          </HStack>
        </>
      ),
      variant: 'transparent',
    },
    {
      onClick: () => {
        trackClicked(ClickEvent.ExploreMarketsClicked)
        router.push('/')
      },
      content: (
        <>
          <FaTableCellsLarge size={'16px'} />
          <Text>Explore markets</Text>
        </>
      ),
      variant: 'transparent',
    },
    {
      onClick: () => {
        trackClicked<ProfileBurgerMenuClickedMetadata>(ClickEvent.ProfileBurgerMenuClicked, {
          option: 'Portfolio',
        })
        router.push('/portfolio')
      },
      content: (
        <>
          <FaBriefcase size={'16px'} />
          <Text>Portfolio</Text>
        </>
      ),
      variant: 'transparent',
    },
    {
      onClick: signOut,
      content: (
        <>
          <FaSignOutAlt size={'16px'} />
          <Text>Sign Out</Text>
        </>
      ),
      variant: 'transparent',
    },
  ]

  const preparedActions = useMemo(() => {
    return isMobile ? actions : [...actions.slice(0, 2), ...actions.slice(3)]
  }, [isMobile])

  return preparedActions.map(({ onClick, content, variant }, index) => (
    <Button
      key={index}
      w={'full'}
      h={'40px'}
      gap={'8px'}
      variant={variant}
      justifyContent={'start'}
      onClick={onClick}
      fontWeight={variant === 'outline' ? 'semibold' : 'normal'}
    >
      {content}
    </Button>
  ))
}
