import { useAccount } from '@/services'
import { colors } from '@/styles'
import {
  Button,
  Flex,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FaChevronDown, FaRegUserCircle } from 'react-icons/fa'
import HeaderButtons from '@/components/layouts/HeaderButtons'

export const HeaderProfileMenuDesktop = () => {
  const { userInfo, account } = useAccount()

  return (
    <Popover placement={'bottom-end'} trigger={'hover'} isLazy>
      <PopoverTrigger>
        <Flex h={'full'}>
          <Button variant='text' h={'full'} alignItems={'center'} fontWeight={'normal'} px={0}>
            <HStack>
              {/*{userInfo?.profileImage?.includes('http') ? (*/}
              {/*  <Image src={userInfo.profileImage} borderRadius={'full'} h={'20px'} w={'20px'} />*/}
              {/*) : (*/}
              {/*  <FaRegUserCircle size={'18px'} />*/}
              {/*)}*/}
              <FaRegUserCircle size={'18px'} />
              {/*Todo search for a name*/}
              <Text>{userInfo?.email?.address ? userInfo.email.address : 'My Profile'}</Text>
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
