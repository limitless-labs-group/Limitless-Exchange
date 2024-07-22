import { Box, Button, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { useBalanceService } from '@/services'
import { borderRadius } from '@/styles'
import { FaEthereum } from 'react-icons/fa6'
import { NumberUtil } from '@/utils'
import { FaArrowAltCircleRight } from 'react-icons/fa'
import React, { ChangeEvent, useMemo, useState } from 'react'
import { Modal } from '@/components/common/modals/modal'
import { Input } from '@/components/common/input'
import Loader from '@/components/common/loader'

export default function WrapModal() {
  const [displayAmount, setDisplayAmount] = useState('')
  const { eoaWrapModalOpened, setEOAWrapModalOpened, ethBalance, wrapETHManual, isWrapPending } =
    useBalanceService()

  const isExceedsBalance = useMemo(() => {
    if (+displayAmount && ethBalance) {
      return +displayAmount > +ethBalance
    }
  }, [displayAmount, ethBalance])

  const handleWrap = async () => {
    await wrapETHManual(displayAmount)
  }

  return (
    <Modal
      size={'sm'}
      title={`Wrap ETH`}
      isOpen={eoaWrapModalOpened}
      onClose={() => setEOAWrapModalOpened(false)}
      isCentered={false}
      maxW='460px'
    >
      <Stack w={'full'} p={5} borderRadius={borderRadius} bg={'bgLight'} spacing={4} mb={5}>
        <HStack w={'full'}>
          <Text color={'fontLight'}>ETH balance</Text>
        </HStack>
        <Text fontSize={'26px'}>{NumberUtil.formatThousands(ethBalance, 6)} ETH</Text>
      </Stack>
      <Text fontSize={'24px'} fontWeight={'bold'} textAlign='center' mb={5}>
        Wrap outcome
      </Text>
      <HStack>
        <Stack w={'full'} p={5} borderRadius={borderRadius} bg={'bgLight'} spacing={4}>
          <HStack w={'full'}>
            <Text color={'fontLight'}>ETH</Text>
          </HStack>
          <Text fontSize={'18px'}>{+displayAmount ? displayAmount : '0.00'} ETH</Text>
        </Stack>
        <Box>
          <FaArrowAltCircleRight />
        </Box>
        <Stack w={'full'} p={5} borderRadius={borderRadius} bg={'bgLight'} spacing={4}>
          <HStack w={'full'}>
            <Text color={'fontLight'}>WETH</Text>
          </HStack>
          <Text fontSize={'18px'}>{+displayAmount ? displayAmount : '0.00'} WETH</Text>
        </Stack>
      </HStack>
      <Stack
        w={'full'}
        spacing={1}
        px={3}
        py={2}
        borderRadius={borderRadius}
        border={'1px solid'}
        mt={5}
        borderColor={isExceedsBalance ? 'red' : 'border'}
      >
        <HStack h={'34px'} w='full' spacing={0}>
          <Input
            type={'number'}
            h={'full'}
            fontWeight={'bold'}
            placeholder={'0'}
            border={'none'}
            px={0}
            _focus={{
              boxShadow: 'none',
            }}
            value={displayAmount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDisplayAmount(e.target.value)}
          />

          <Button variant='contained'>
            <FaEthereum />
            <Text>ETH</Text>
          </Button>
        </HStack>
      </Stack>
      <VStack>
        <Button
          variant='contained'
          isDisabled={isExceedsBalance || !+displayAmount || isWrapPending}
          isLoading={isWrapPending}
          spinner={<Loader />}
          w='full'
          onClick={handleWrap}
        >
          Wrap
        </Button>
      </VStack>
    </Modal>
  )
}
