import { Box, HStack, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react'
import Image from 'next/image'
import { Dispatch, SetStateAction, useState } from 'react'
import { isMobile } from 'react-device-detect'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import { useLimitlessApi } from '@/services'
import { Token } from '@/types'

type SelectTokenFieldProps = {
  setToken: Dispatch<SetStateAction<Token>>
  token: Token
}

export default function SelectTokenField({ token, setToken }: SelectTokenFieldProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { supportedTokens } = useLimitlessApi()

  return (
    <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} variant='outlined'>
      <MenuButton w='full' onClick={() => setIsMenuOpen(true)}>
        <HStack justifyContent='space-between'>
          <HStack gap='4px'>
            <Image src={token.logoUrl} alt={token.symbol} width={16} height={16} />
            <Text fontWeight={500}>{token.symbol}</Text>
          </HStack>
          <Box transform={`rotate(${isMenuOpen ? '180deg' : 0})`} transition='0.5s'>
            <ChevronDownIcon width='16px' height='16px' />
          </Box>
        </HStack>
      </MenuButton>
      <MenuList
        borderRadius='2px'
        w={isMobile ? 'calc(100vw - 32px)' : '416px'}
        maxH={isMobile ? 'unset' : '104px'}
        overflowY={isMobile ? 'unset' : 'auto'}
      >
        {supportedTokens?.map((supportedToken) => (
          <MenuItem onClick={() => setToken(supportedToken)} key={supportedToken.symbol}>
            <HStack gap='4px'>
              <Image
                src={supportedToken.logoUrl}
                alt={supportedToken.symbol}
                width={16}
                height={16}
              />
              <Text fontWeight={500}>{supportedToken.symbol}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}
