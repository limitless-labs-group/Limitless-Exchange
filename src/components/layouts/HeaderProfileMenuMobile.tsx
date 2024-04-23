import { Button, IButton } from '@/components'
import { collateralToken } from '@/constants'
import { ClickEvent, useAccount, useAmplitude, useAuth, useBalanceService } from '@/services'
import { colors } from '@/styles'
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
  const { trackClicked } = useAmplitude()

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
              h={'40px'}
              fontWeight={'normal'}
              justifyContent={'start'}
              onClick={() => router.push('/wallet')}
            >
              <HStack spacing={2}>
                <FaWallet size={'16px'} />
                <HStack spacing={1}>
                  <Text>Balance</Text>
                  <Text fontWeight={'bold'}>
                    {NumberUtil.toFixedWSN(balanceOfSmartWallet?.formatted, 4)}
                  </Text>
                  <Text>{collateralToken.symbol}</Text>
                </HStack>
              </HStack>
            </Button>

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
