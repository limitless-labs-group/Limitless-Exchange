import { Box, Button, Divider, HStack, Text, VStack } from '@chakra-ui/react'
import Paper from '@/components/common/paper'
import WalletIcon from '@/resources/icons/wallet-icon.svg'
import { ClickEvent, useAmplitude, useBalanceService, useLimitlessApi } from '@/services'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { NumberUtil, truncateEthAddress } from '@/utils'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import CopyIcon from '@/resources/icons/copy-icon.svg'
import React, { useEffect, useState } from 'react'
import BaseIcon from '@/resources/crypto/base.svg'
import Image from 'next/image'
import { usePriceOracle } from '@/providers'
import { isMobile } from 'react-device-detect'
import { h1Regular, headline, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { setTimeout } from '@wry/context'
import usePageName from '@/hooks/use-page-name'

interface WalletPageProps {
  onClose: () => void
  onOpenWithdraw: () => void
}

export default function WalletPage({ onClose, onOpenWithdraw }: WalletPageProps) {
  const [copied, setCopied] = useState(false)
  const { overallBalanceUsd, balanceOfSmartWallet } = useBalanceService()
  const { supportedTokens } = useLimitlessApi()
  const address = useWalletAddress()
  const { marketTokensPrices, convertAssetAmountToUsd } = usePriceOracle()
  const pageName = usePageName()

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
    onClose()
    onOpenWithdraw()
  }

  useEffect(() => {
    const hideCopiedMessage = setTimeout(() => {
      setCopied(false)
    }, 2000)

    return () => clearTimeout(hideCopiedMessage)
  }, [copied])

  return (
    <Box
      bg='grey.100'
      w={isMobile ? 'full' : '328px'}
      p={isMobile ? 0 : '8px'}
      h='full'
      onClick={(e) => e.stopPropagation()}
      overflow='auto'
    >
      <Text {...h1Regular}>Wallet</Text>
      <Paper bg='blue.500' mt='24px'>
        <HStack w='full' justifyContent='space-between'>
          <HStack gap='4px' color='white'>
            <WalletIcon width='16px' height='16px' />
            <Text {...paragraphMedium} color='white'>
              Available balance
            </Text>
          </HStack>
          <Button
            variant='white'
            onClick={() => {
              trackClicked(ClickEvent.WithdrawClicked)
              handleOpenWithdrawModal()
            }}
          >
            Withdraw
          </Button>
        </HStack>
        <Text color='white' fontSize='24px' fontWeight={500} mb='16px'>
          ~{NumberUtil.formatThousands(overallBalanceUsd, 2)} USD
        </Text>
        <Text {...paragraphMedium} color='white'>
          Address
        </Text>
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
            {supportedTokens?.map((token) => (
              <HStack gap='4px' key={token.symbol}>
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
              </HStack>

              <Text {...paragraphMedium}>
                {NumberUtil.formatThousands(balanceItem.formatted, 4)}
              </Text>
            </HStack>
            <Divider my='12px' bg='grey.400' orientation='horizontal' h='1px' />
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
    </Box>
  )
}
