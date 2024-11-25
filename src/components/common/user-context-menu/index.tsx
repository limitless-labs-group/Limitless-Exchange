import { Box, Text, HStack, Menu, MenuButton, MenuItem, MenuList, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import BlockUserIcon from '@/resources/icons/block-user.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import OkIcon from '@/resources/icons/ok-icon.svg'
import Dots from '@/resources/icons/three-horizontal-dots.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export const UserContextMenu = () => {
  const [menuState, setMenuState] = useState<'default' | 'success'>('default')

  const block = () => {
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
      <Box onClick={block}>
        <HStack gap='4px' cursor='pointer'>
          <BlockUserIcon />
          <Text {...paragraphMedium} color='red.500'>
            Block user
          </Text>
        </HStack>
      </Box>
      <Box color='grey.500'>
        You will no longer see activities or comments from @Esther Howard after blocking
      </Box>
    </>
  )
  const successItem = (
    <>
      <HStack gap='4px'>
        <OkIcon />
        <Text {...paragraphMedium} color='green.500'>
          @Esther Howard is blocked
        </Text>
      </HStack>
      <Box onClick={undo}>
        <HStack gap='4px' cursor='pointer'>
          <CloseIcon width={16} />
          <Text {...paragraphMedium}>Undo</Text>
        </HStack>
      </Box>
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
    <Menu variant='block' closeOnSelect={false} onClose={close}>
      <MenuButton as='div' cursor='pointer'>
        <Dots color='grey.500' />
      </MenuButton>
      <MenuList>{node()}</MenuList>
    </Menu>
  )
}
