import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { isMobile } from 'react-device-detect'
import { useTotalTradingVolume } from '@/hooks/use-total-trading-volume'
import ArrowRightIcon from '@/resources/icons/arrow-right-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { ClickEvent, useAmplitude } from '@/services'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export default function VolumeCard() {
  const { data } = useTotalTradingVolume()

  const { trackClicked } = useAmplitude()

  const handleLinkClicked = () => {
    trackClicked(ClickEvent.WidgetClicked, {
      platform: isMobile ? 'mobile' : 'desktop',
      type: 'Total Trading Volume',
    })
  }

  return (
    <Box
      border='2px solid'
      borderColor='grey.100'
      borderRadius='12px'
      p='16px'
      flex='1 1 calc(50% - 8px)'
      minW='calc(50% - 8px)'
      w={isMobile ? '100%' : 'unset'}
    >
      <VStack h='full' justifyContent='space-between' alignItems='flex-start'>
        <Box>
          <Text {...paragraphRegular} color='grey.500' mb='8px'>
            Total Trading Volume
          </Text>
          <HStack color='blue.500' gap='8px' py='4px' mb='16px'>
            <VolumeIcon width={24} height={24} />
            <Text {...paragraphMedium} fontSize='16px' color='grey.800'>
              ${NumberUtil.convertWithDenomination(data, 0)}
            </Text>
          </HStack>
          <Text {...paragraphRegular} color='grey.500'>
            Get deeper insights into our markets
          </Text>
        </Box>
        <HStack w='full' justifyContent='flex-end'>
          <NextLink
            href='https://dune.com/limitless_exchange/limitless'
            target='_blank'
            onClick={handleLinkClicked}
          >
            <HStack gap='4px'>
              <Text {...paragraphMedium}>View data on Dune</Text>
              <Box transform='rotate(315deg)'>
                <ArrowRightIcon width={16} height={16} />
              </Box>
            </HStack>
          </NextLink>
        </HStack>
      </VStack>
    </Box>
  )
}
