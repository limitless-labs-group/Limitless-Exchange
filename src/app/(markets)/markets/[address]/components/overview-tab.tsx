import { Box, HStack, Link, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { isMobile } from 'react-device-detect'
import TextEditor from '@/components/common/text-editor'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'

interface MarketOverviewTabProps {
  market: Market | null
}

function MarketOverviewTab({ market }: MarketOverviewTabProps) {
  const url =
    'https://www.notion.so/limitlesslabs/Limitless-Docs-0e59399dd44b492f8d494050969a1567?pvs=4#5dd6f962c66044eaa00e28d2c61b92bb'
  return (
    <>
      <HStack
        w='full'
        justifyContent='space-between'
        alignItems={isMobile ? 'flex-start' : 'center'}
        marginTop='16px'
        mb='8px'
        flexDirection={isMobile ? 'column' : 'row'}
      >
        <Box w={isMobile ? 'full' : 'fit-content'}>
          {market?.tags?.includes('Lumy') ? (
            <NextLink href={url} target='_blank' rel='noopener' passHref>
              <Link variant='textLinkSecondary' {...paragraphRegular} isExternal color='grey.500'>
                Resolution is decentralised
              </Link>
            </NextLink>
          ) : (
            <Box whiteSpace='pre-wrap'>
              <NextLink href={url} target='_blank' rel='noopener' passHref>
                <Link variant='textLinkSecondary' {...paragraphRegular} isExternal color='grey.500'>
                  Resolution is centralised
                </Link>
              </NextLink>
              <Text {...paragraphRegular} color='grey.500' as='span'>
                {' '}
                and made by the Limitless team
              </Text>
            </Box>
          )}
        </Box>
      </HStack>
      <TextEditor value={market?.description ?? ''} readOnly={true} />
    </>
  )
}

export default MarketOverviewTab
