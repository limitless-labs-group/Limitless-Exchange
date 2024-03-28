import { Button, IButton } from '@/components'
import { useAccount, useAuth } from '@/services'
import { colors } from '@/styles'
import { truncateEthAddress } from '@/utils'
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
import { FaBriefcase, FaChevronDown, FaCopy, FaRegUserCircle, FaSignOutAlt } from 'react-icons/fa'
import { FaWallet } from 'react-icons/fa6'

export const HeaderProfileMenuDesktop = ({ ...props }: IButton) => {
  const { signOut } = useAuth()
  const { email, account } = useAccount()
  const { onCopy, hasCopied } = useClipboard(account ?? '')
  const router = useRouter()

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
              <FaRegUserCircle size={'18px'} />
              <Text>{email ?? 'My Profile'}</Text>
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
              onClick={onCopy}
            >
              <Text>{truncateEthAddress(account)}</Text>
              <FaCopy fontSize={'14px'} fill={hasCopied ? colors.brand : colors.fontLight} />
            </Button>
            <Button
              w={'full'}
              fontWeight={'normal'}
              h={'40px'}
              colorScheme={'transparent'}
              justifyContent={'start'}
              onClick={() => router.push('/wallet')}
            >
              <HStack w={'full'}>
                <FaWallet size={'16px'} fill={colors.fontLight} />
                <Text>Wallet</Text>
              </HStack>
            </Button>
            <Button
              w={'full'}
              fontWeight={'normal'}
              h={'40px'}
              colorScheme={'transparent'}
              justifyContent={'start'}
              onClick={() => router.push('/portfolio')}
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
              onClick={() => signOut()}
            >
              <HStack w={'full'}>
                <FaSignOutAlt size={'16px'} fill={colors.fontLight} />
                <Text>Sing Out</Text>
              </HStack>
            </Button>
          </Stack>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
