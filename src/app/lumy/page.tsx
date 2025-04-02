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
import BaseWhiteIcon from '@/resources/icons/base-icon-white.svg'
import CopyIcon from '@/resources/icons/copy-icon.svg'
import LumyDesktopIcon from '@/resources/icons/lumy-desktop.svg'
import LumyImage from '@/resources/icons/lumy-image.svg'
import PigIcon from '@/resources/icons/pig-icon.svg'
import TrophyIcon from '@/resources/icons/trophy-icon.svg'
import { ClickEvent, useAmplitude } from '@/services'
import { captionRegular, headline, paragraphMedium } from '@/styles/fonts/fonts.styles'
import { truncateEthAddress } from '@/utils'

export default function LumyPage() {
  const [copied, setCopied] = useState(false)

  const { trackClicked } = useAmplitude()

  const { data } = useLumyBalance()

  const rules = [
    {
      title: 'Kickstart a Market',
      description: 'Send Lumy $ to start a new game. $250 is the minimum for a new market. ',
    },
    {
      title: 'Market Growth',
      description: 'Every time Lumy’s balance reaches $250, a new market launches automatically.',
    },
    {
      title: 'Scale Open Interest',
      description:
        'Large PVP open interest can be scaled up despite low initial starting liquidity.',
    },
    {
      title: 'Make Your Moves',
      description: 'Place your positions responsibly, or not.',
    },
    {
      title: 'Stay Updated',
      description: 'Stay updated with Lumy’s shitposting on X.',
    },
  ]

  const psItems = [
    {
      icon: <TrophyIcon width={16} height={16} />,
      title: 'Rewards for Liquidity Providers (LPs)',
      description:
        'LPs may receive skin in the game as a retroactive reward, if Lumy’s accrues value in other tokens (ie memecoins).',
    },
    {
      icon: <PigIcon width={16} height={16} />,
      title: 'Profit Note',
      description:
        'The market’s Automated Market Maker (AMM) is not designed for profit. Any remaining funds post-market resolution will roll over to the next market. Enjoy and play responsibly!',
    },
  ]

  const lumyMobileImage = '/assets/images/ai-logo-mobile.svg'

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
      <Box
        ml={isMobile ? 0 : '200px'}
        w={isMobile ? 'full' : '648px'}
        pb={isMobile ? '40px' : 0}
        bg='grey.50'
        mt={isMobile ? '16px' : 0}
      >
        {isMobile ? (
          <img
            src={lumyMobileImage}
            alt='ai-logo'
            style={{
              marginTop: -16,
              width: isMobile ? '100%' : 'unset',
            }}
          />
        ) : (
          <Box mt={'-16px'}>
            <LumyDesktopIcon />
          </Box>
        )}

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
            <Text fontWeight={400} fontSize='96px' lineHeight='normal' mt='-20px'>
              Lumy
            </Text>
            <Paper
              mt='24px'
              bg='radial-gradient(120.21% 216.83% at 0% 50%, #5F1BEC 0%, #FF3756 47.2%, #FFCB00 100%)'
              w={isMobile ? 'full' : '312px'}
              p='8px'
            >
              <Text {...paragraphMedium} color='white'>
                Raise to start a market
              </Text>
              <Text {...paragraphMedium} color='white' mt='4px'>
                {data ? (+formatUnits(data, 6)).toFixed(0) : 0}/250 USDC
              </Text>
              <HStack w='full' justifyContent='space-between' alignItems='flex-end'>
                <Box mt='16px'>
                  <Text {...paragraphMedium} color='white'>
                    Address
                  </Text>
                  <HStack gap='4px'>
                    {/*// @ts-ignore*/}
                    <CopyToClipboard
                      text={'0x6bb3d8A69656d1865708242223190a29D3a7E3c7'}
                      onCopy={onClickCopy}
                    >
                      <HStack gap='4px' color='white' cursor='pointer'>
                        <Text {...paragraphMedium} color='white'>
                          {truncateEthAddress('0x6bb3d8A69656d1865708242223190a29D3a7E3c7')}
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
                <HStack gap='4px' color='white'>
                  <BaseWhiteIcon />
                  <Text {...captionRegular} color='white'>
                    BASE NETWORK
                  </Text>
                </HStack>
              </HStack>
            </Paper>
            <Box mt={isMobile ? '32px' : '24px'} w={isMobile ? 'full' : '312px'}>
              <Text {...headline} color='grey.white'>
                How it works
              </Text>
              <Box mt={isMobile ? '16px' : '8px'}>
                {rules.map((rule, index) => (
                  <Box key={index} mb='12px'>
                    <Text {...paragraphMedium} color='#FFA318'>
                      {index + 1}/ {rule.title}
                    </Text>
                    <Text {...paragraphMedium}>{rule.description}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
            <NextLink
              href='https://x.com/limitless_lumy?s=21&t=v3nPJR7JbdUvpTSZN9WOIA'
              target='_blank'
              rel='noreferrer'
            >
              <Box w={isMobile ? 'full' : '312px'}>
                <Text mt='24px' mb='12px' {...paragraphMedium} fontSize='16px' color='grey.white'>
                  Lumy on X
                </Text>
                <Box borderRadius='8px' bg='#5098EB' p='16px' position='relative' mb='24px'>
                  <HStack
                    w='full'
                    justifyContent='flex-end'
                    position='absolute'
                    top='8px'
                    right='8px'
                  >
                    <ArrowExternalIcon />
                  </HStack>

                  <HStack w='full' gap='8px'>
                    <LumyImage />
                    <VStack gap='4px' alignItems='flex-start'>
                      <Text {...paragraphMedium} fontSize='16px' color='white'>
                        Lumy by Limitless Lab
                      </Text>
                      <Text
                        {...paragraphMedium}
                        color='white'
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
            </NextLink>
            <Box w={isMobile ? 'full' : '312px'}>
              <Text {...paragraphMedium} fontSize='16px' color='grey.white'>
                PS
              </Text>
            </Box>
            <VStack mt='8px' gap='8px' w={isMobile ? 'full' : '312px'}>
              {psItems.map((item) => (
                <Paper key={item.title} w='full'>
                  <HStack gap='4px' color='grey.800'>
                    {item.icon}
                    <Text {...paragraphMedium}>{item.title}</Text>
                  </HStack>
                  <Text mt='8px' {...paragraphMedium} color='grey.500' lineHeight='16px'>
                    {item.description}
                  </Text>
                </Paper>
              ))}
            </VStack>
          </VStack>
        </Box>
      </Box>
    </MainLayout>
  )
}
