import { Box, HStack, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react'
import { Dispatch, SetStateAction, useState } from 'react'
import { useLimitlessApi } from '@/services'
import { Token } from '@/types'
import Image from 'next/image'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'

type SelectTokenFieldProps = {
  setToken: Dispatch<SetStateAction<Token>>
  token: Token
}

export default function SelectTokenField({ token, setToken }: SelectTokenFieldProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { supportedTokens } = useLimitlessApi()

  return (
    <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
      <MenuButton
        w='full'
        py='4px'
        px='8px'
        borderRadius='2px'
        border='1px solid'
        borderColor='grey.300'
        onClick={() => setIsMenuOpen(true)}
      >
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
      <MenuList borderRadius='2px' w='full'>
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
