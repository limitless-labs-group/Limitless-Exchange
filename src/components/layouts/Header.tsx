import { Flex, FlexProps, HStack, Heading, Image, Text } from '@chakra-ui/react'
import {
  LogInButton,
  HeaderProfileMenuDesktop,
  Button,
  HeaderProfileMenuMobile,
} from '@/components'
import { usePathname, useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ClickEvent, useAmplitude, useBalanceService } from '@/services'
import { borderRadius, colors } from '@/styles'
import { FaBriefcase, FaTableCellsLarge } from 'react-icons/fa6'
import { NumberUtil } from '@/utils'

export const Header = ({ ...props }: FlexProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const { overallBalanceUsd } = useBalanceService()
  // const { balanceUsd: investedUsd, balanceShares } = useHistory()
  const { trackClicked } = useAmplitude()

  return (
    <Flex
      w={'full'}
      h={`56px`}
      justifyContent={'space-between'}
      alignItems={'center'}
      py={2}
      px={{ sm: 4, md: 6 }}
      gap={4}
      // boxShadow={'0 0 8px #ddd'}
      borderBottom={`1px solid ${colors.border}`}
      bg={'bg'}
      zIndex={2}
      {...props}
    >
      <HStack spacing={8} h={'full'} alignItems={'center'}>
        <Heading fontSize={'18px'} onClick={() => router.push('/')} cursor={'pointer'}>
          <HStack h={'full'} alignItems={'center'}>
            <Image
              src={'/assets/images/logo.svg'}
              h={'30px'}
              w={'30px'}
              borderRadius={borderRadius}
              filter={'invert()'}
              alt='logo'
            />
            <Text>Limitless</Text>
            {/* <Text>Play</Text> */}
          </HStack>
        </Heading>

        <Button
          colorScheme={'transparent'}
          size={'sm'}
          h={'40px'}
          display={{ sm: 'none', md: 'block' }}
          fontWeight={pathname == '/' ? 'bold' : 'normal'}
          onClick={() => {
            trackClicked(ClickEvent.ExploreMarketsClicked)
            router.push('/')
          }}
        >
          <HStack>
            <FaTableCellsLarge
              size={'16px'}
              fill={pathname == '/' ? colors.font : colors.fontLight}
            />
            <Text>Explore markets</Text>
          </HStack>
        </Button>
      </HStack>

      <HStack h={'full'}>
        {isConnected ? (
          <>
            <HStack
              h='full'
              spacing={{ sm: 2, md: 6 }}
              display={{ sm: 'none', md: 'flex' }}
              alignItems={'center'}
            >
              <HStack h={'full'} spacing={4}>
                <Button
                  h={'40px'}
                  minWidth={'218px'}
                  gap={2}
                  fontWeight={'normal'}
                  onClick={() => router.push('/wallet')}
                >
                  <Image
                    alt='wallet'
                    src='/assets/images/wallet.svg'
                    width={'16px'}
                    height={'16px'}
                  />
                  <HStack spacing={2}>
                    <Text fontWeight={'medium'}>Balance</Text>
                    <HStack spacing={1}>
                      <Text fontWeight={'bold'}>
                        {NumberUtil.formatThousands(overallBalanceUsd)}
                      </Text>
                      <Text fontWeight={'medium'}>USD</Text>
                    </HStack>
                  </HStack>
                </Button>

                <Button
                  colorScheme={'transparent'}
                  size={'sm'}
                  h={'40px'}
                  fontWeight={pathname.includes('portfolio') ? 'bold' : 'normal'}
                  display={{ sm: 'none', md: 'block' }}
                  onClick={() => router.push('/portfolio')}
                >
                  <HStack>
                    <FaBriefcase
                      size={'16px'}
                      fill={pathname.includes('portfolio') ? colors.font : colors.fontLight}
                    />
                    <Text>Portfolio</Text>
                  </HStack>
                </Button>
              </HStack>

              <HeaderProfileMenuDesktop h={'full'} />
            </HStack>

            <HeaderProfileMenuMobile display={{ sm: 'block', md: 'none' }} />
          </>
        ) : (
          <LogInButton h={'full'} />
        )}
      </HStack>
    </Flex>
  )
}
