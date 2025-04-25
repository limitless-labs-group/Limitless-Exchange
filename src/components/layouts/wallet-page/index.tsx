import { Box, Button, Divider, HStack, Text, useDisclosure, VStack } from '@chakra-ui/react'
import { setTimeout } from '@wry/context'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { isMobile } from 'react-device-detect'
import MobileDrawer from '@/components/common/drawer'
import WrapModal from '@/components/common/modals/wrap-modal'
import Paper from '@/components/common/paper'
import Withdraw from '@/components/layouts/wallet-page/components/withdraw'
import { WithdrawModal } from '@/components/layouts/wallet-page/components/withdraw-modal'
import usePageName from '@/hooks/use-page-name'
import { usePriceOracle } from '@/providers'
import BaseIcon from '@/resources/crypto/base.svg'
import CloseIcon from '@/resources/icons/close-icon.svg'
import CopyIcon from '@/resources/icons/copy-icon.svg'
import WalletIcon from '@/resources/icons/wallet-icon.svg'
import {
  ClickEvent,
  useAccount,
  useAmplitude,
  useBalanceQuery,
  useBalanceService,
  useLimitlessApi,
} from '@/services'
import { headline, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil, truncateEthAddress } from '@/utils'

export default function WalletPage() {
  const [copied, setCopied] = useState(false)
  const { overallBalanceUsd } = useBalanceService()
  const { balanceOfSmartWallet } = useBalanceQuery()
  const { supportedTokens } = useLimitlessApi()
  const { account: address, setWalletPageOpened } = useAccount()
  const { marketTokensPrices, convertAssetAmountToUsd } = usePriceOracle()
  const pageName = usePageName()
  const {
    isOpen: isWithdrawOpen,
    onOpen: onOpenWithdraw,
    onClose: onCloseWithdraw,
  } = useDisclosure()
  const {
    isOpen: isWrapModalOpen,
    onOpen: onOpenWrapModal,
    onClose: onCloseWrapModal,
  } = useDisclosure()

  const { trackClicked } = useAmplitude()

  const sortedBalance = balanceOfSmartWallet?.sort((balanceItemA, balanceItemB) => {
    return (
      convertAssetAmountToUsd(balanceItemB.id, balanceItemB.formatted) -
      convertAssetAmountToUsd(balanceItemA.id, balanceItemA.formatted)
    )
  })

  const onClickCopy = () => {
    trackClicked(ClickEvent.CopyAddressClicked, {
      page: pageName,
    })
    setCopied(true)
  }

  const handleOpenWithdrawModal = () => {
    onOpenWithdraw()
  }

  const withdrawButton = isMobile ? (
    <MobileDrawer
      trigger={
        <Button
          variant='white'
          onClick={() => {
            trackClicked(ClickEvent.WithdrawClicked)
          }}
        >
          Withdraw
        </Button>
      }
      variant='common'
      title='Withdraw crypto'
      triggerStyle={{
        width: 'unset',
      }}
    >
      <Box mx='16px'>
        <Withdraw isOpen={true} />
      </Box>
    </MobileDrawer>
  ) : (
    <Button
      variant='white'
      onClick={() => {
        trackClicked(ClickEvent.WithdrawClicked)
        handleOpenWithdrawModal()
      }}
    >
      Withdraw
    </Button>
  )

  useEffect(() => {
    const hideCopiedMessage = setTimeout(() => {
      setCopied(false)
    }, 2000)

    return () => clearTimeout(hideCopiedMessage)
  }, [copied])

  return (
    <Box onClick={(e) => e.stopPropagation()} px={isMobile ? '16px' : 0}>
      {!isMobile && (
        <Button variant='outlined' onClick={() => setWalletPageOpened(false)} mb='12px'>
          <CloseIcon width={16} height={16} />
          Close
        </Button>
      )}
      <Text fontSize='32px'>Wallet</Text>
      <Paper bg='blue.500' mt='24px'>
        <HStack w='full' justifyContent='space-between'>
          <HStack gap='4px' color='white'>
            <WalletIcon width='16px' height='16px' />
            <Text {...paragraphMedium} color='white'>
              Available balance
            </Text>
          </HStack>
          {withdrawButton}
        </HStack>
        <Text color='white' fontSize='24px' fontWeight={500} mb='16px'>
          ~{NumberUtil.formatThousands(overallBalanceUsd, 2)} USD
        </Text>
        <Text {...paragraphMedium} color='white'>
          Address
        </Text>
        {/*// @ts-ignore*/}
        <CopyToClipboard text={address as string} onCopy={onClickCopy}>
          <HStack gap='4px' color='white' cursor='pointer'>
            <Text {...paragraphRegular} color='white'>
              {truncateEthAddress(address)}
            </Text>
            <CopyIcon width='16px' height='16px' />
            {copied && (
              <Text {...paragraphRegular} ml='4px' color='white'>
                Copied!
              </Text>
            )}
          </HStack>
        </CopyToClipboard>
      </Paper>
      {!isMobile && (
        <>
          <HStack gap='4px' mt='16px'>
            <Text as='span'>We use</Text>
            <BaseIcon />
            <Text as='span'>Base network.</Text>
          </HStack>
          <Text>Send any of these coins using the same address:</Text>
          <HStack mt='8px' rowGap='4px' columnGap='8px' flexWrap='wrap'>
            <HStack gap='4px'>
              <Image
                src='https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628'
                alt='ETH'
                width={16}
                height={16}
              />
              <Text>Ethereum</Text>
            </HStack>
            {supportedTokens?.map((token) => (
              <HStack gap='4px' key={token.id}>
                <Image src={token.logoUrl} alt={token.symbol} width={16} height={16} />
                <Text>{token.symbol}</Text>
              </HStack>
            ))}
          </HStack>
        </>
      )}
      <Text {...headline} fontSize='16px' mt='24px' mb='8px'>
        All tokens
      </Text>
      <VStack w='full' mb='24px'>
        {sortedBalance?.map((balanceItem) => (
          <Paper key={balanceItem.id} w='full'>
            <HStack justifyContent='space-between'>
              <HStack gap='4px'>
                <Image src={balanceItem.image} alt='token' width={16} height={16} />
                <Text {...paragraphMedium}>{balanceItem.symbol}</Text>
                {balanceItem.symbol === 'WETH' && (
                  <Button
                    variant='white'
                    ml='8px'
                    onClick={() => {
                      trackClicked(ClickEvent.UnwrapETHClicked)
                      onOpenWrapModal()
                    }}
                  >
                    Unwrap
                  </Button>
                )}
                {balanceItem.symbol === 'ETH' && (
                  <Button
                    variant='white'
                    ml='8px'
                    onClick={() => {
                      trackClicked(ClickEvent.WrapETHClicked)
                      onOpenWrapModal()
                    }}
                  >
                    Wrap
                  </Button>
                )}
              </HStack>

              <Text {...paragraphMedium}>
                {NumberUtil.formatThousands(balanceItem.formatted, 4)}
              </Text>
            </HStack>
            <Divider my='12px' orientation='horizontal' variant='dark' h='1px' />
            <HStack justifyContent='space-between' mb='8px'>
              <Text {...paragraphMedium} color='grey.500'>
                Current price
              </Text>
              <Text {...paragraphRegular}>
                {NumberUtil.formatThousands(
                  marketTokensPrices?.[balanceItem.id].usd,
                  // @ts-ignore
                  marketTokensPrices?.[balanceItem.id].usd > 1 ? 2 : 4
                )}{' '}
                USD
              </Text>
            </HStack>
            <HStack justifyContent='space-between'>
              <Text {...paragraphMedium} color='grey.500'>
                Value
              </Text>
              <Text {...paragraphRegular}>
                {NumberUtil.formatThousands(
                  convertAssetAmountToUsd(balanceItem.id, balanceItem.formatted),
                  2
                )}{' '}
                USD
              </Text>
            </HStack>
          </Paper>
        ))}
      </VStack>
      {isWithdrawOpen && <WithdrawModal isOpen={isWithdrawOpen} onClose={onCloseWithdraw} />}
      {isWrapModalOpen && <WrapModal isOpen={isWrapModalOpen} onClose={onCloseWrapModal} />}
    </Box>
  )
}
