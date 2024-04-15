import { Button, Modal } from '@/components'
import { CopyEvent, useAccount, useAmplitude } from '@/services'
import { borderRadius, colors } from '@/styles'
import { truncateEthAddress } from '@/utils'
import {
  Avatar,
  Flex,
  HStack,
  Heading,
  Stack,
  StackProps,
  Text,
  useClipboard,
  useDisclosure,
} from '@chakra-ui/react'
import { FaQrcode } from 'react-icons/fa'
import QRCode from 'react-qr-code'

export const DepositByQrCard = ({ ...props }: StackProps) => {
  const { trackCopied } = useAmplitude()
  const { account } = useAccount()
  const { isOpen: isOpenQR, onOpen: onOpenQR, onClose: onCloseQR } = useDisclosure()
  const { onCopy, hasCopied } = useClipboard(account ?? '')

  return (
    <Stack
      h={'fit-content'}
      w={'full'}
      p={5}
      border={`1px solid ${colors.border}`}
      //   boxShadow={'0 0 8px #ddd'}
      borderRadius={borderRadius}
      spacing={4}
      {...props}
    >
      {/* <HStack
        fontSize={'11px'}
        fontWeight={'bold'}
        color={'fontLight'}
        textTransform={'uppercase'}
        letterSpacing={'0.15em'}
      >
        <Text color={'white'} bg={'brand'} p={'2px 8px'} borderRadius={'3px'} fontSize={'9px'}>
          EASIEST METHOD
        </Text>
        <Text>1 minute</Text>
        <FaCircle fill='grey' size={'3px'} />
        <Text>Free</Text>
      </HStack> */}

      <HStack w={'full'}>
        <Heading fontSize={'24px'}>Deposit ETH (Base)</Heading>
        {/* <Avatar src={collateralToken.imageURI} size={'sm'} /> */}
      </HStack>

      <HStack w={'full'} spacing={4}>
        <Avatar name='1' size={'sm'} bg={'blue.50'} color={'font'} fontWeight={'bold'} />
        <Text>
          <b>Buy ETH</b> on Coinbase, Binance or any other exchange / fiat onramp that supports
          withdrawals on Base.
        </Text>
      </HStack>

      <HStack w={'full'} spacing={4}>
        <Avatar name='2' size={'sm'} bg={'blue.50'} color={'font'} fontWeight={'bold'} />
        <Text>
          <b>Send it</b> to the address below & ensure to select Base as the network.
        </Text>
      </HStack>

      <Stack w={'full'} flexDir={{ sm: 'column', md: 'row' }}>
        <Flex w={'full'} pos={'relative'}>
          <Button
            w={'full'}
            justifyContent={'start'}
            color={'grey'}
            fontWeight={'normal'}
            onClick={() => {
              onCopy()
              trackCopied(CopyEvent.WalletAddressCopied, 'Deposit')
            }}
          >
            <Text display={{ sm: 'none', md: 'contents' }}>{account}</Text>
            <Text display={{ sm: 'contents', md: 'none' }}>{truncateEthAddress(account)}</Text>
          </Button>
          <Button
            pos={'absolute'}
            h={'full'}
            w={'50px'}
            right={'0'}
            colorScheme='transparent'
            p={0}
            fontWeight={'normal'}
            onClick={onOpenQR}
          >
            <FaQrcode size={'20px'} fill='grey' />
          </Button>
        </Flex>
        <Button colorScheme={'brand'} w={{ sm: 'full', md: '200px' }} onClick={onCopy}>
          {hasCopied ? 'Copied!' : 'Copy'}
        </Button>
      </Stack>

      <Modal isOpen={isOpenQR} onClose={onCloseQR} size={'xs'} title={`Send ETH (Base)`}>
        <Flex w={'full'} justifyContent={'center'}>
          {account && (
            <QRCode value={account} fgColor={'black'} style={{ paddingBottom: '24px' }} />
          )}
        </Flex>
      </Modal>
    </Stack>
  )
}
