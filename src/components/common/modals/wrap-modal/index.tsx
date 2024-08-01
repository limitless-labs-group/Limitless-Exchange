import {
  Box,
  Button,
  HStack,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useBalanceService } from '@/services'
import React, { ChangeEvent, useMemo, useState } from 'react'
import { Input } from '@/components/common/input'
import Loader from '@/components/common/loader'
import { isMobile } from 'react-device-detect'
import { Modal } from '@/components/common/modals/modal'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

interface WrapModalPros {
  isOpen: boolean
  onClose: () => void
}

export default function WrapModal({ isOpen, onClose }: WrapModalPros) {
  const [displayAmount, setDisplayAmount] = useState('')
  const { ethBalance, wrapETHManual, isWrapPending } = useBalanceService()

  const isExceedsBalance = useMemo(() => {
    if (+displayAmount && ethBalance) {
      return +displayAmount > +ethBalance
    }
  }, [displayAmount, ethBalance])

  const handleWrap = async () => {
    await wrapETHManual(displayAmount)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Wrap ETH'>
      <HStack justifyContent='space-between' mt={isMobile ? '32px' : '24px'}>
        <Text {...paragraphMedium}>Balance</Text>
        <Text {...paragraphMedium}>{NumberUtil.formatThousands(ethBalance, 6)} ETH</Text>
      </HStack>
    </Modal>
    // <Modal size={isMobile ? 'full' : 'md'} variant='commonModal' isOpen={isOpen} onClose={onClose}>
    //   <ModalOverlay />
    //   <ModalContent>
    //     <ModalHeader p={0}>Wrap ETH</ModalHeader>
    //     <ModalCloseButton />
    //     <ModalBody>
    //       <VStack>
    //         <Text>
    //           In order to proceed with transaction you should approve token for smart-contract
    //           spend.
    //         </Text>
    //         <Button
    //           mt='24px'
    //           variant={isMobile ? 'white' : 'contained'}
    //           w='full'
    //           // isDisabled={status !== 'Ready'}
    //           // isLoading={status === 'Loading'}
    //           spinner={<Loader />}
    //           onClick={handleWrap}
    //         >
    //           Approve
    //         </Button>
    //       </VStack>
    //     </ModalBody>
    //   </ModalContent>
    // </Modal>
    // <Modal
    //   size={'sm'}
    //   title={`Wrap ETH`}
    //   isOpen={isOpen}
    //   onClose={onClose}
    //   h={isMobile ? 'full' : 'unset'}
    //   marginTop={isMobile ? '36px' : 'auto'}
    //   showCloseButton={!isMobile}
    // >
    //   <Stack w={'full'} p={5} borderRadius={borderRadius} bg={'bgLight'} spacing={4} mb={5}>
    //     <HStack w={'full'}>
    //       <Text color={'fontLight'}>ETH balance</Text>
    //     </HStack>
    //     <Text fontSize={'26px'}>{NumberUtil.formatThousands(ethBalance, 6)} ETH</Text>
    //   </Stack>
    //   <Text fontSize={'24px'} fontWeight={'bold'} textAlign='center' mb={5}>
    //     Wrap outcome
    //   </Text>
    //   <HStack>
    //     <Stack w={'full'} p={5} borderRadius={borderRadius} bg={'bgLight'} spacing={4}>
    //       <HStack w={'full'}>
    //         <Text color={'fontLight'}>ETH</Text>
    //       </HStack>
    //       <Text fontSize={'18px'}>{+displayAmount ? displayAmount : '0.00'} ETH</Text>
    //     </Stack>
    //     <Box>
    //       <FaArrowAltCircleRight />
    //     </Box>
    //     <Stack w={'full'} p={5} borderRadius={borderRadius} bg={'bgLight'} spacing={4}>
    //       <HStack w={'full'}>
    //         <Text color={'fontLight'}>WETH</Text>
    //       </HStack>
    //       <Text fontSize={'18px'}>{+displayAmount ? displayAmount : '0.00'} WETH</Text>
    //     </Stack>
    //   </HStack>
    //   <Stack
    //     w={'full'}
    //     spacing={1}
    //     px={3}
    //     py={2}
    //     borderRadius={borderRadius}
    //     border={'1px solid'}
    //     mt={5}
    //     borderColor={isExceedsBalance ? 'red' : 'border'}
    //   >
    //     <HStack h={'34px'} w='full' spacing={0}>
    //       <Input
    //         type={'number'}
    //         h={'full'}
    //         fontWeight={'bold'}
    //         placeholder={'0'}
    //         border={'none'}
    //         px={0}
    //         _focus={{
    //           boxShadow: 'none',
    //         }}
    //         value={displayAmount}
    //         onChange={(e: ChangeEvent<HTMLInputElement>) => setDisplayAmount(e.target.value)}
    //       />
    //
    //       <Button variant='contained'>
    //         <FaEthereum />
    //         <Text>ETH</Text>
    //       </Button>
    //     </HStack>
    //   </Stack>
    //   <VStack>
    //     <Button
    //       variant='contained'
    //       isDisabled={isExceedsBalance || !+displayAmount || isWrapPending}
    //       isLoading={isWrapPending}
    //       spinner={<Loader />}
    //       w='full'
    //       onClick={handleWrap}
    //     >
    //       Wrap
    //     </Button>
    //   </VStack>
    // </Modal>
  )
}
