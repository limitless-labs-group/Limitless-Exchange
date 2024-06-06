import { Box, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { Button, Input, Modal } from '@/components'
import { useBalanceService } from '@/services'
import { borderRadius } from '@/styles'
import { FaEthereum } from 'react-icons/fa6'
import { NumberUtil } from '@/utils'
import { FaArrowAltCircleRight } from 'react-icons/fa'
import { useMemo, useState } from 'react'

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
        <Heading fontSize={'26px'}>{NumberUtil.formatThousands(ethBalance, 6)} ETH</Heading>
      </Stack>
      <Text fontSize={'24px'} fontWeight={'bold'} textAlign='center' mb={5}>
        Wrap outcome
      </Text>
      <HStack>
        <Stack w={'full'} p={5} borderRadius={borderRadius} bg={'bgLight'} spacing={4}>
          <HStack w={'full'}>
            <Text color={'fontLight'}>ETH</Text>
          </HStack>
          <Heading fontSize={'18px'}>{+displayAmount ? displayAmount : '0.00'} ETH</Heading>
        </Stack>
        <Box>
          <FaArrowAltCircleRight />
        </Box>
        <Stack w={'full'} p={5} borderRadius={borderRadius} bg={'bgLight'} spacing={4}>
          <HStack w={'full'}>
            <Text color={'fontLight'}>WETH</Text>
          </HStack>
          <Heading fontSize={'18px'}>{+displayAmount ? displayAmount : '0.00'} WETH</Heading>
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
            onChange={(e) => setDisplayAmount(e.target.value)}
          />

          <Button
            h={'full'}
            colorScheme={'transparent'}
            border={'1px solid'}
            borderColor={'border'}
            gap={1}
            minW={'110px'}
          >
            <FaEthereum />
            <Text>ETH</Text>
          </Button>
        </HStack>
      </Stack>
      <VStack>
        <Button
          mt='24px'
          colorScheme={'brand'}
          isDisabled={isExceedsBalance || !+displayAmount || isWrapPending}
          isLoading={isWrapPending}
          w='full'
          onClick={handleWrap}
        >
          Wrap
        </Button>
      </VStack>
    </Modal>
  )
}
