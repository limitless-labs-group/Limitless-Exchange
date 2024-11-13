'use client'

import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { setTimeout } from '@wry/context'
import NextLink from 'next/link'
import React, { useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import Paper from '@/components/common/paper'
import { MainLayout } from '@/components'
import { useLumyBalance } from '@/hooks/use-lumy-balance'
import ArrowExternalIcon from '@/resources/icons/arrow-external.svg'
import CopyIcon from '@/resources/icons/copy-icon.svg'
import LumyLogoCircle from '@/resources/icons/lumy-logo-circle.svg'
import { ClickEvent, useAmplitude } from '@/services'
import { headline, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { truncateEthAddress } from '@/utils'

export default function LumyPage() {
  const [copied, setCopied] = useState(false)

  const { trackClicked } = useAmplitude()

  const { data } = useLumyBalance()

  const rules = [
    'Add liquidity',
    'Once liquidity is 500 USDC market will start',
    'Lumy will generate a market',
    'Follow Lumy on X',
    'etc',
  ]

  const onClickCopy = () => {
    trackClicked(ClickEvent.CopyAddressClicked, {
      page: 'Lumy',
      address: '0x',
    })
    setCopied(true)
  }

  useEffect(() => {
    const hideCopiedMessage = setTimeout(() => {
      setCopied(false)
    }, 2000)

    return () => clearTimeout(hideCopiedMessage)
  }, [copied])

  return (
    <MainLayout layoutPadding={isMobile ? '0' : '16px'}>
      <Box ml={isMobile ? 0 : '200px'} w={isMobile ? 'full' : '648px'} pb={isMobile ? '40px' : 0}>
        <img
          src={isMobile ? '/assets/images/ai-logo-mobile.png' : '/assets/images/ai-logo-main.png'}
          alt='ai-logo'
          style={{
            marginTop: -16,
          }}
        />
        <Box px='16px'>
          <HStack w='full' justifyContent='center'>
            <Text
              fontWeight={400}
              fontSize='20px'
              bgGradient='linear-gradient(90deg, #5F1BEC 0%, #FF3756 27.04%, #FFCB00 99.11%)'
              bgClip='text'
              width='fit-content'
            >
              AI Agent
            </Text>
          </HStack>
          <VStack gap={0} w='full'>
            <Text
              fontWeight={400}
              fontSize='96px'
              lineHeight='normal'
              mt='-20px'
              color='grey.white'
            >
              Lumy
            </Text>
            <Paper
              mt='24px'
              bg='radial-gradient(120.21% 216.83% at 0% 50%, #5F1BEC 0%, #FF3756 47.2%, #FFCB00 100%)'
              borderRadius='8px'
              w={isMobile ? 'full' : '312px'}
              p='8px'
            >
              <Text {...paragraphMedium} color='white'>
                Raise to start a market
              </Text>
              <Text {...paragraphMedium} color='white' mt='4px'>
                {data ? (+formatUnits(data, 6)).toFixed(0) : 0}/500 USDC
              </Text>
              <Box mt='16px'>
                <Text {...paragraphMedium} color='white'>
                  Address
                </Text>
                <HStack gap='4px'>
                  <CopyToClipboard
                    text={'0x54B34a6FF1f74359252984C7ff70bBf848492AFa'}
                    onCopy={onClickCopy}
                  >
                    <HStack gap='4px' color='white' cursor='pointer'>
                      <Text {...paragraphMedium} color='white'>
                        {truncateEthAddress('0x54B34a6FF1f74359252984C7ff70bBf848492AFa')}
                      </Text>
                      <CopyIcon width='16px' height='16px' />
                      {copied && (
                        <Text {...paragraphMedium} color='white' ml='4px'>
                          Copied!
                        </Text>
                      )}
                    </HStack>
                  </CopyToClipboard>
                </HStack>
              </Box>
            </Paper>
            <Box mt={isMobile ? '32px' : '24px'} w={isMobile ? 'full' : '312px'}>
              <Text {...headline} color='grey.white'>
                Simple rules
              </Text>
              <Box mt={isMobile ? '16px' : '8px'}>
                {rules.map((rule, index) => (
                  <HStack gap='2px' key={index}>
                    <Box {...paragraphMedium} color='#FFA318'>
                      {index + 1}/
                    </Box>
                    <Text {...paragraphMedium} color='grey.white'>
                      {rule}
                    </Text>
                  </HStack>
                ))}
              </Box>
            </Box>
            <Box w={isMobile ? 'full' : '312px'}>
              <Text
                mt={isMobile ? '44px' : '56px'}
                mb='12px'
                {...paragraphMedium}
                fontSize='16px'
                color='grey.white'
              >
                Lumy on X
              </Text>
              <Box borderRadius='8px' bg='#5098EB' p='16px' position='relative'>
                <NextLink href='https://limitless.exchange' target='_blank' rel='noreferrer'>
                  <HStack
                    w='full'
                    justifyContent='flex-end'
                    position='absolute'
                    top='8px'
                    right='8px'
                  >
                    <ArrowExternalIcon />
                  </HStack>
                </NextLink>

                <HStack w='full' gap='8px'>
                  <LumyLogoCircle />
                  <VStack gap='4px' alignItems='flex-start'>
                    <Text {...paragraphMedium} fontSize='16px' color='grey.white'>
                      Lumy by Limitless Lab
                    </Text>
                    <Text
                      {...paragraphMedium}
                      color='grey.white'
                      fontSize='14px'
                      opacity={0.7}
                      w='177px'
                    >
                      World first prediction market AI Agent
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </Box>
          </VStack>
        </Box>
      </Box>
    </MainLayout>
  )
}
