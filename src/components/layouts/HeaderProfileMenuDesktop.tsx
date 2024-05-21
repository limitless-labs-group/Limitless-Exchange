import {
  ClickEvent,
  ProfileBurgerMenuClickedMetadata,
  useAccount,
  useAmplitude,
  useAuth,
} from '@/services'
import { colors } from '@/styles'
import { truncateEthAddress } from '@/utils'
import {
  Button,
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
import { FaWallet } from 'react-icons/fa6'
import HeaderButtons from '@/components/layouts/HeaderButtons'

export const HeaderProfileMenuDesktop = () => {
  const { trackClicked } = useAmplitude()
  const { signOut } = useAuth()
  const { userInfo, account } = useAccount()
  const { onCopy, hasCopied } = useClipboard(account ?? '')
  const router = useRouter()

  return (
    <Popover placement={'bottom-end'} trigger={'hover'} isLazy>
      <PopoverTrigger>
        <Flex h={'full'}>
          <Button variant='text' h={'full'} alignItems={'center'} fontWeight={'normal'} px={0}>
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
            <HeaderButtons account={account || ''} />
          </Stack>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
