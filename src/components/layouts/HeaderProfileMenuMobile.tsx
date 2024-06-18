import { Button, IButton } from '@/components'
import {
  ClickEvent,
  useAccount,
  useAmplitude,
  useAuth,
  useBalanceService,
  useEtherspot,
} from '@/services'
import { colors } from '@/styles'
import { NumberUtil, truncateEthAddress } from '@/utils'
import {
  Flex,
  HStack,
  Image,
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
import { FaBriefcase, FaEthereum, FaTableCellsLarge } from 'react-icons/fa6'

export const HeaderProfileMenuMobile = ({ ...props }: IButton) => {
  const router = useRouter()
  const { signOut } = useAuth()
  const { userInfo, account } = useAccount()
  const { onCopy, hasCopied } = useClipboard(account ?? '')
  const { overallBalanceUsd, setEOAWrapModalOpened } = useBalanceService()
  const { trackClicked } = useAmplitude()
  const { etherspot } = useEtherspot()

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
            {(!!userInfo?.name || !!userInfo?.email) && (
              <HStack w={'full'} px={4} alignItems={'center'}>
                {userInfo?.profileImage?.includes('http') ? (
                  <Image
                    src={userInfo.profileImage}
                    borderRadius={'full'}
                    h={'18px'}
                    w={'18px'}
                    alt='profile'
                  />
                ) : (
                  <FaRegUserCircle size={'16px'} />
                )}
                <Text>{userInfo.name ?? userInfo.email}</Text>
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

            {!!etherspot ? (
              <Button
                h={'40px'}
                fontWeight={'normal'}
                justifyContent={'start'}
                colorScheme={'transparent'}
                onClick={() => router.push('/wallet')}
              >
                <HStack spacing={2}>
                  <Image
                    alt='wallet'
                    src='/assets/images/wallet.svg'
                    width={'16px'}
                    height={'16px'}
                  />
                  <HStack spacing={1}>
                    <Text>Balance</Text>
                    <Text fontWeight={'bold'}>{NumberUtil.formatThousands(overallBalanceUsd)}</Text>
                    <Text>USD</Text>
                  </HStack>
                </HStack>
              </Button>
            ) : (
              <Button
                w={'full'}
                fontWeight={'normal'}
                h={'40px'}
                colorScheme={'transparent'}
                justifyContent={'start'}
                onClick={() => setEOAWrapModalOpened(true)}
              >
                <HStack w={'full'}>
                  <FaEthereum size={'16px'} fill={colors.fontLight} />
                  <Text>Wrap ETH</Text>
                </HStack>
              </Button>
            )}

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
                trackClicked(ClickEvent.ExploreMarketsClicked)
                router.push('/')
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
