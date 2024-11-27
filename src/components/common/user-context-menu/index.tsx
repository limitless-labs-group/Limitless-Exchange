import { Box, Text, HStack, Menu, MenuButton, MenuItem, MenuList, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Address } from 'viem'
import usePageName from '@/hooks/use-page-name'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import BlockUserIcon from '@/resources/icons/block-user.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import OkIcon from '@/resources/icons/ok-icon.svg'
import Dots from '@/resources/icons/three-horizontal-dots.svg'
import { ClickEvent, useAccount, useAmplitude } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { cutUsername } from '@/utils/string'

interface UserContextMenuProps {
  username?: string
  userAccount?: string
  setMessageBlocked: (val: boolean) => void
}

export const UserContextMenu = ({
  username,
  userAccount,
  setMessageBlocked,
}: UserContextMenuProps) => {
  const pageName = usePageName()
  const [menuState, setMenuState] = useState<'default' | 'success'>('default')
  const [showUndo, setShowUndo] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const { trackClicked } = useAmplitude()

  const wallet = useWalletAddress()

  const { onBlockUser } = useAccount()

  const handleEventClicked = (event: ClickEvent) => {
    trackClicked(event, {
      source: pageName,
      platform: isMobile ? 'mobile' : 'desktop',
    })
  }

  const block = async () => {
    handleEventClicked(ClickEvent.BlockedUserClicked)
    setShowUndo(true)
    setMessageBlocked(true)
    const id = setTimeout(async () => {
      await onBlockUser.mutateAsync({ account: userAccount as Address })
      setShowUndo(false)
    }, 5000)

    setTimeoutId(id)
    setMenuState('success')
  }

  const undo = async () => {
    handleEventClicked(ClickEvent.UndoBlockingUser)
    setMessageBlocked(false)
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
          borderRadius='8px'
          p='4px'
          color='red.500'
          w='full'
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
          {username ? cutUsername(username as string) : cutUsername(userAccount as string)}
          is blocked
        </Text>
      </HStack>
      {showUndo && (
        <Box
          onClick={undo}
          _hover={{ bg: 'grey.200' }}
          borderRadius='8px'
          p='4px'
          cursor='pointer'
          w='full'
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
        <VStack w='250px' alignItems='start' bg='grey.100' gap={0}>
          {menuState === 'default' ? defaultItem : successItem}
        </VStack>
      </MenuItem>
    )
  }
  return (
    <Menu variant='block' closeOnSelect={false} onClose={close} placement='bottom-end'>
      <MenuButton
        style={{ cursor: 'pointer' }}
        onClick={() => handleEventClicked(ClickEvent.ThreeDotsClicked)}
      >
        <Dots color='grey.500' />
      </MenuButton>
      <MenuList>{node()}</MenuList>
    </Menu>
  )
}
