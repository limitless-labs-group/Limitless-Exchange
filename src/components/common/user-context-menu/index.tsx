import { Box, Text, HStack, Menu, MenuButton, MenuItem, MenuList, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import BlockUserIcon from '@/resources/icons/block-user.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
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
  const [showUndo, setShowUndo] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const wallet = useWalletAddress()

  const { onBlockUser } = useAccount()

  const block = async () => {
    setShowUndo(true)
    const id = setTimeout(async () => {
      await onBlockUser.mutateAsync({ account: userAccount as Address })
      setShowUndo(false)
    }, 5000)

    setTimeoutId(id)
    setMenuState('success')
  }

  const undo = async () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setMenuState('default')
  }
  const close = () => {
    setMenuState('default')
  }

  useEffect(() => {
    return () => {
      setTimeoutId(null)
    }
  }, [])

  const defaultItem =
    wallet === userAccount ? (
      <Text {...paragraphMedium} color='red.500'>
        You cannot block yourself
      </Text>
    ) : (
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
      {showUndo && (
        <Box
          onClick={undo}
          _hover={{ bg: 'grey.200' }}
          borderRadius='12px'
          p='4px'
          cursor='pointer'
        >
          <HStack gap='4px' cursor='pointer'>
            <CloseIcon width={16} />
            <Text {...paragraphMedium}>Undo</Text>
          </HStack>
        </Box>
      )}
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
