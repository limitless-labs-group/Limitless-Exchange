import { Box, Text, HStack, Menu, MenuButton, MenuItem, MenuList, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { Address } from 'viem'
import BlockUserIcon from '@/resources/icons/block-user.svg'
import OkIcon from '@/resources/icons/ok-icon.svg'
import Dots from '@/resources/icons/three-horizontal-dots.svg'
import { useAccount } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { cutUsername } from '@/utils/string'

interface UserContextMenuProps {
  username?: string
  userAccount?: string
}

export const UserContextMenu = ({ username, userAccount }: UserContextMenuProps) => {
  const [menuState, setMenuState] = useState<'default' | 'success'>('default')

  const { onBlockUser } = useAccount()

  const block = async () => {
    await onBlockUser.mutateAsync({ account: userAccount as Address })
    setMenuState('success')
  }

  const undo = () => {
    setMenuState('success')
  }
  const close = () => {
    setMenuState('default')
  }

  const defaultItem = (
    <>
      <HStack
        gap='4px'
        cursor='pointer'
        onClick={block}
        _hover={{ bg: 'grey.200' }}
        borderRadius='12px'
        p='4px'
        color='red.500'
      >
        <BlockUserIcon />
        <Text {...paragraphMedium} color='red.500'>
          Block user
        </Text>
      </HStack>
      <Box color='grey.500'>
        You will no longer see activities or comments from{' '}
        {username ? cutUsername(username as string) : cutUsername(userAccount as string)} after
        blocking
      </Box>
    </>
  )
  const successItem = (
    <>
      <HStack gap='4px'>
        <OkIcon />
        <Text {...paragraphMedium} color='green.500'>
          {username ? cutUsername(username as string) : cutUsername(userAccount as string)} Howard
          is blocked
        </Text>
      </HStack>
      {/*<Box onClick={undo}>*/}
      {/*  <HStack gap='4px' cursor='pointer'>*/}
      {/*    <CloseIcon width={16} />*/}
      {/*    <Text {...paragraphMedium}>Undo</Text>*/}
      {/*  </HStack>*/}
      {/*</Box>*/}
    </>
  )

  const node = () => {
    return (
      <MenuItem as='div'>
        <VStack w='250px' alignItems='start' bg='grey.100'>
          {menuState === 'default' ? defaultItem : successItem}
        </VStack>
      </MenuItem>
    )
  }
  return (
    <Menu variant='block' closeOnSelect={false} onClose={close} direction='rtl'>
      <MenuButton as='div' style={{ cursor: 'pointer' }}>
        <Dots color='grey.500' />
      </MenuButton>
      <MenuList>{node()}</MenuList>
    </Menu>
  )
}
