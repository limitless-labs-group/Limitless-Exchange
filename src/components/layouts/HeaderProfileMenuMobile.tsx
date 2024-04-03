import { Button, IButton } from '@/components'
import { useAccount, useAmplitude, useAuth, useBalanceService } from '@/services'
import { colors } from '@/styles'
import { ClickedEvent, OpenedEvent } from '@/types'
import { NumberUtil, truncateEthAddress } from '@/utils'
import {
  Flex,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  useClipboard,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FaBars, FaCopy, FaRegUserCircle, FaSignOutAlt } from 'react-icons/fa'
import { FaBriefcase, FaTableCellsLarge, FaWallet } from 'react-icons/fa6'

export const HeaderProfileMenuMobile = ({ ...props }: IButton) => {
  const router = useRouter()
  const { signOut } = useAuth()
  const { email, account } = useAccount()
  const { onCopy, hasCopied } = useClipboard(account ?? '')
  const { balanceOfSmartWallet } = useBalanceService()
  const { trackOpened, trackClicked } = useAmplitude()

  return (
    <Popover placement={'bottom-end'} trigger={'click'} isLazy>
      <PopoverTrigger>
        <Flex h={'full'}>
          <Button bg={'none'} h={'full'} alignItems={'center'} {...props}>
            <Flex justifyContent={'end'}>
              <FaBars size={'18px'} fill={colors.fontLight} />
            </Flex>
          </Button>
        </Flex>
      </PopoverTrigger>
      <Portal>
        <PopoverContent bg={'bg'} border={`1px solid ${colors.border}`} w={'250px'} p={3}>
          <Stack>
            {!!email && (
              <HStack w={'full'} px={4} alignItems={'center'} color={'fontLight'}>
                <FaRegUserCircle size={'16px'} />
                <Text>{email}</Text>
              </HStack>
            )}

            <Button
              w={'full'}
              justifyContent={'space-between'}
              color={'grey'}
              fontWeight={'normal'}
              h={'40px'}
              onClick={onCopy}
            >
              <Text>{truncateEthAddress(account)}</Text>
              <FaCopy fontSize={'14px'} fill={hasCopied ? colors.brand : colors.fontLight} />
            </Button>

            <Button
              colorScheme={'brand'}
              h={'40px'}
              justifyContent={'start'}
              onClick={() => router.push('/wallet')}
            >
              <HStack>
                <FaWallet size={'16px'} />
                <Text>Balance: ${NumberUtil.toFixed(balanceOfSmartWallet?.formatted, 1)}</Text>
              </HStack>
            </Button>

            {/* <HStack h='40px' w={'full'}>
              <Button
                colorScheme={'transparent'}
                size={'sm'}
                h={'full'}
                onClick={() => router.push('/wallet')}
              >
                <Stack spacing={0} alignItems={'center'} justifyContent={'center'}>
                  <Text color={'brand'} fontSize={'18px'}>
                    ${NumberUtil.toFixed(balanceOfSmartWallet?.formatted)}
                  </Text>
                  <Text
                    color={'fontLight'}
                    fontSize={'12px'}
                    lineHeight={'12px'}
                    fontWeight={'normal'}
                  >
                    Balance
                  </Text>
                </Stack>
              </Button>

              <Button
                colorScheme={'transparent'}
                size={'sm'}
                h={'full'}
                onClick={() => router.push('/portfolio')}
              >
                <Stack spacing={0} alignItems={'center'} justifyContent={'center'}>
                  <Text color={'brand'} fontSize={'18px'}>
                    ${investedUsd.toFixed()}
                  </Text>
                  <Text
                    color={'fontLight'}
                    fontSize={'12px'}
                    lineHeight={'12px'}
                    fontWeight={'normal'}
                  >
                    Invested
                  </Text>
                </Stack>
              </Button>

              <Button
                colorScheme={'transparent'}
                size={'sm'}
                h={'full'}
                onClick={() => router.push('/portfolio')}
              >
                <Stack spacing={0} alignItems={'center'} justifyContent={'center'}>
                  <Text color={'brand'} fontSize={'18px'}>
                    ${balanceShares.toFixed()}
                  </Text>
                  <Text
                    color={'fontLight'}
                    fontSize={'12px'}
                    lineHeight={'12px'}
                    fontWeight={'normal'}
                  >
                    To win
                  </Text>
                </Stack>
              </Button>
            </HStack> */}

            {/* <Button
              w={'full'}
              h={'40px'}
              gap={3}
              fontWeight={'normal'}
              colorScheme={'transparent'}
              justifyContent={'start'}
              onClick={() => router.push('/wallet')}
            >
                <FaWallet size={'16px'} fill={colors.fontLight} />
                <Text>Wallet</Text>
            </Button> */}

            <Button
              w={'full'}
              h={'40px'}
              fontWeight={'normal'}
              colorScheme={'transparent'}
              justifyContent={'start'}
              gap={2}
              onClick={() => router.push('/portfolio')}
            >
              <HStack>
                <FaBriefcase size={'16px'} fill={colors.fontLight} />
                <Text>Portfolio</Text>
              </HStack>
            </Button>

            <Button
              w={'full'}
              h={'40px'}
              fontWeight={'normal'}
              colorScheme={'transparent'}
              justifyContent={'start'}
              onClick={() => {
                router.push('/')
                trackOpened(OpenedEvent.PageOpened, 'Explore Markets Clicked')
              }}
            >
              <HStack>
                <FaTableCellsLarge size={'16px'} fill={colors.fontLight} />
                <Text>Explore markets</Text>
              </HStack>
            </Button>

            <Button
              w={'full'}
              h={'40px'}
              colorScheme={'transparent'}
              justifyContent={'start'}
              onClick={() => {
                signOut()
                trackClicked(ClickedEvent.LogoutClicked)
              }}
            >
              <HStack>
                <FaSignOutAlt size={'16px'} fill={colors.fontLight} />
                <Text>Sign Out</Text>
              </HStack>
            </Button>
          </Stack>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
