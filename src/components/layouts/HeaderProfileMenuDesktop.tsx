import { Button, IButton } from '@/components'
import {
  ClickEvent,
  ProfileBurgerMenuClickedMetadata,
  useAccount,
  useAmplitude,
  useAuth,
  useBalanceService,
  useEtherspot,
} from '@/services'
import { colors } from '@/styles'
import { truncateEthAddress } from '@/utils'
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
import { FaBriefcase, FaChevronDown, FaCopy, FaRegUserCircle, FaSignOutAlt } from 'react-icons/fa'
import { FaEthereum, FaWallet } from 'react-icons/fa6'

export const HeaderProfileMenuDesktop = ({ ...props }: IButton) => {
  const { trackClicked } = useAmplitude()
  const { signOut } = useAuth()
  const { userInfo, account } = useAccount()
  const { onCopy, hasCopied } = useClipboard(account ?? '')
  const router = useRouter()
  const { etherspot } = useEtherspot()
  const { setEOAWrapModalOpened } = useBalanceService()

  return (
    <Popover placement={'bottom-end'} trigger={'hover'} isLazy>
      <PopoverTrigger>
        <Flex h={'full'}>
          <Button
            bg={'none'}
            h={'full'}
            alignItems={'center'}
            fontWeight={'normal'}
            px={0}
            {...props}
          >
            <HStack>
              {userInfo?.profileImage?.includes('http') ? (
                <Image src={userInfo.profileImage} borderRadius={'full'} h={'20px'} w={'20px'} />
              ) : (
                <FaRegUserCircle size={'18px'} />
              )}
              <Text>{userInfo?.name ?? userInfo?.email ?? 'My Profile'}</Text>
              <FaChevronDown size={'14px'} fill={'#aaa'} />
            </HStack>
          </Button>
        </Flex>
      </PopoverTrigger>
      <Portal>
        <PopoverContent bg={'bg'} border={`1px solid ${colors.border}`} w={'240px'} p={3}>
          <Stack>
            <Button
              w={'full'}
              justifyContent={'space-between'}
              color={'grey'}
              fontWeight={'normal'}
              h={'40px'}
              onClick={() => {
                trackClicked<ProfileBurgerMenuClickedMetadata>(
                  ClickEvent.ProfileBurgerMenuClicked,
                  {
                    option: 'Copy Wallet Address',
                  }
                )
                onCopy()
              }}
            >
              <Text>{truncateEthAddress(account)}</Text>
              <FaCopy fontSize={'14px'} fill={hasCopied ? colors.brand : colors.fontLight} />
            </Button>
            {!!etherspot ? (
              <Button
                w={'full'}
                fontWeight={'normal'}
                h={'40px'}
                colorScheme={'transparent'}
                justifyContent={'start'}
                onClick={() => {
                  trackClicked<ProfileBurgerMenuClickedMetadata>(
                    ClickEvent.ProfileBurgerMenuClicked,
                    {
                      option: 'Wallet',
                    }
                  )
                  router.push('/wallet')
                }}
              >
                <HStack w={'full'}>
                  <FaWallet size={'16px'} fill={colors.fontLight} />
                  <Text>Wallet</Text>
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
              fontWeight={'normal'}
              h={'40px'}
              colorScheme={'transparent'}
              justifyContent={'start'}
              onClick={() => {
                trackClicked<ProfileBurgerMenuClickedMetadata>(
                  ClickEvent.ProfileBurgerMenuClicked,
                  {
                    option: 'Portfolio',
                  }
                )
                router.push('/portfolio')
              }}
            >
              <HStack w={'full'}>
                <FaBriefcase size={'16px'} fill={colors.fontLight} />
                <Text>Portfolio</Text>
              </HStack>
            </Button>
            <Button
              w={'full'}
              h={'40px'}
              colorScheme={'transparent'}
              justifyContent={'start'}
              onClick={() => {
                trackClicked<ProfileBurgerMenuClickedMetadata>(
                  ClickEvent.ProfileBurgerMenuClicked,
                  {
                    option: 'Sign Out',
                  }
                )
                signOut()
              }}
            >
              <HStack w={'full'}>
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
