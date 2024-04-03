import { Button } from '@/components'
import { defaultChain } from '@/constants'
import { useMarketData } from '@/hooks'
import { useAmplitude, useTradingService } from '@/services'
import { borderRadius, colors } from '@/styles'
import { ClickedEvent } from '@/types'
import { NumberUtil } from '@/utils'

import {
  Avatar,
  Divider,
  Flex,
  HStack,
  Heading,
  Image,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  StackProps,
  Text,
  VStack,
  useClipboard,
} from '@chakra-ui/react'
import { FaShareSquare } from 'react-icons/fa'
import { FaLink, FaXTwitter } from 'react-icons/fa6'

export const MarketMetadata = ({ ...props }: StackProps) => {
  const { market } = useTradingService()
  const { trackClicked } = useAmplitude()
  const { liquidity, holdersCount, sharesCost } = useMarketData({
    marketAddress: market?.address[defaultChain.id],
  })
  const { onCopy, hasCopied } = useClipboard(window.location.href)

  const tweetURI = encodeURI(
    `https://x.com/intent/tweet?text="${market?.title}" by ${market?.creator.name}\n${
      market?.outcomeTokens[0]
    } ${sharesCost?.[0].toFixed(1) ?? 0}% | ${market?.outcomeTokens[1]} ${
      sharesCost?.[1].toFixed(1) ?? 0
    }%\nMake your bet on ${window.location.href}`
  )

  return (
    <Stack w={'full'} alignItems={'start'} spacing={4} {...props}>
      <Stack
        flexDir={{ sm: 'column', md: 'row' }}
        alignItems={{ sm: 'center', md: 'start' }}
        spacing={4}
        w={'full'}
      >
        <Image
          src={market?.imageURI}
          minW={{ sm: 'full', md: '35%' }}
          // minH={{ sm: '200px', md: '30%' }}
          aspectRatio={'4/3'}
          fit={'cover'}
          bg={'brand'}
          borderRadius={borderRadius}
        />

        <VStack alignItems={'start'} spacing={4} w={'full'}>
          <HStack spacing={4} px={{ sm: 2, md: 0 }}>
            <HStack>
              <Text color={'fontLight'}>Pool</Text>
              <Text fontWeight={'bold'}>${NumberUtil.formatThousands(liquidity)}</Text>
            </HStack>
            <HStack>
              <Text color={'fontLight'}>Investors</Text>
              <Text fontWeight={'bold'}>{holdersCount ?? 0}</Text>
            </HStack>
            <HStack>
              <Text color={'fontLight'}>Deadline</Text>
              <Text noOfLines={1} fontWeight={'bold'}>
                {market?.expirationData}
              </Text>
            </HStack>
          </HStack>

          <Heading fontSize={'28px'}>{market?.title}</Heading>

          <Text>{market?.description}</Text>

          <Popover placement={'bottom-end'} trigger={'click'} isLazy>
            <PopoverTrigger>
              <Flex h={'full'} w={'full'}>
                <Button
                  w={'full'}
                  h={'40px'}
                  gap={2}
                  fontWeight={'normal'}
                  colorScheme={'transparent'}
                  border={`1px solid ${colors.border}`}
                >
                  <FaShareSquare />
                  <Text>Share</Text>
                </Button>
              </Flex>
            </PopoverTrigger>
            <Portal>
              <PopoverContent bg={'bg'} border={`1px solid ${colors.border}`} w={'200px'}>
                <Button
                  w={'full'}
                  h={'40px'}
                  gap={2}
                  fontWeight={'normal'}
                  colorScheme={'transparent'}
                  justifyContent={'start'}
                  onClick={() => {
                    onCopy()
                    trackClicked(ClickedEvent.ShareClicked, 'Copy Link')
                  }}
                >
                  <FaLink />
                  {hasCopied ? 'Copied' : 'Copy link'}
                </Button>
                <Divider />
                <Button
                  w={'full'}
                  h={'40px'}
                  gap={2}
                  fontWeight={'normal'}
                  colorScheme={'transparent'}
                  justifyContent={'start'}
                  onClick={() => {
                    window.open(tweetURI, '_blank')
                    trackClicked(ClickedEvent.ShareClicked, 'X/Twitter')
                  }}
                >
                  <FaXTwitter />
                  <Text>Share on X</Text>
                </Button>
              </PopoverContent>
            </Portal>
          </Popover>

          <HStack>
            <Link href={market?.creator.link} isExternal>
              <Avatar
                size={'sm'}
                src={market?.creator.imageURI ?? '/assets/images/logo.svg'}
                name={market?.creator.name}
                bg={'brand'}
                p={0}
                cursor={'pointer'}
              />
            </Link>
            <VStack spacing={0} alignItems={'start'}>
              <Link href={market?.creator.link} isExternal>
                <Text cursor={'pointer'} _hover={{ textDecor: 'underline' }}>
                  {market?.creator.name}
                </Text>
              </Link>
              <HStack spacing={1} fontSize={'12px'}>
                <Text p={'2px 6px'} bg={'bgLight'} borderRadius={'full'}>
                  Bitcoin
                </Text>
                <Text p={'2px 6px'} bg={'bgLight'} borderRadius={'full'}>
                  Oracle
                </Text>
                <Text p={'2px 6px'} bg={'bgLight'} borderRadius={'full'}>
                  Ethereum
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      </Stack>
    </Stack>
  )
}
