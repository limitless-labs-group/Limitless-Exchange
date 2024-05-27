import { useAccount } from '@/services'
import { colors } from '@/styles'
import {
  Button,
  ButtonProps,
  Flex,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FaBars, FaRegUserCircle } from 'react-icons/fa'
import HeaderButtons from '@/components/layouts/HeaderButtons'

export const HeaderProfileMenuMobile = ({ ...props }: ButtonProps) => {
  const { userInfo, account } = useAccount()

  return (
    <Popover placement={'bottom-end'} trigger={'click'} isLazy>
      <PopoverTrigger>
        <Flex h={'full'}>
          <Button variant='transparent' alignItems={'center'} {...props}>
            <Flex justifyContent={'end'}>
              <FaBars size={'18px'} fill={colors.fontLight} />
            </Flex>
          </Button>
        </Flex>
      </PopoverTrigger>
      <Portal>
        <PopoverContent bg={'bg'} border={`1px solid ${colors.border}`} w={'250px'} p={3}>
          <Stack>
            {/*{(!!userInfo?.name || !!userInfo?.email) && (*/}
            {/*  <HStack w={'full'} px={4} alignItems={'center'}>*/}
            {/*    {userInfo?.profileImage?.includes('http') ? (*/}
            {/*      <Image*/}
            {/*        src={userInfo.profileImage}*/}
            {/*        borderRadius={'full'}*/}
            {/*        h={'18px'}*/}
            {/*        w={'18px'}*/}
            {/*        alt='profile'*/}
            {/*      />*/}
            {/*    ) : (*/}
            {/*      <FaRegUserCircle size={'16px'} />*/}
            {/*    )}*/}
            {/*    <Text>{userInfo.name ?? userInfo.email}</Text>*/}
            {/*  </HStack>*/}
            {/*)}*/}

            <HStack>
              {/*{userInfo?.profileImage?.includes('http') ? (*/}
              {/*  <Image src={userInfo.profileImage} borderRadius={'full'} h={'20px'} w={'20px'} />*/}
              {/*) : (*/}
              {/*  <FaRegUserCircle size={'18px'} />*/}
              {/*)}*/}
              <FaRegUserCircle size={'18px'} />
              {/*Todo search for a name*/}
              <Text>{userInfo?.email?.address ? userInfo.email.address : 'My Profile'}</Text>
            </HStack>

            <HeaderButtons account={account || ''} />
          </Stack>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
