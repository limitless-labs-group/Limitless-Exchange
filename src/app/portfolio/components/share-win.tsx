import { Text, Stack, Button, Image, Box, Flex, HStack, Divider } from '@chakra-ui/react'
import html2canvas from 'html2canvas'
import { useState, useEffect, useRef } from 'react'
import { isMobile } from 'react-device-detect'
import Loader from '@/components/common/loader'
import { WinChart } from './win-chart'
import { useWinChartData } from '@/hooks/use-win-chart-data'
import CopyIcon from '@/resources/icons/copy-icon.svg'
import CupIcon from '@/resources/icons/cup-icon.svg'
import { useAccount } from '@/services'
import { useMarket } from '@/services/MarketsService'
import {
  captionMedium,
  h2Bold,
  h3Bold,
  headline,
  paragraphBold,
  paragraphMedium,
} from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

interface ShareWinProps {
  amountToClaim?: string
  marketSlug?: string
  symbol?: string
}

const getHtml2CanvasOptions = () => ({
  backgroundColor: null,
  scale: 2,
  removeContainer: true,
  onclone: (clonedDoc: Document) => {
    const clonedElement = clonedDoc.querySelector('[data-share-capture]')
    if (clonedElement) {
      Array.from(clonedElement.querySelectorAll('*')).forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.transition = 'none'
          // Remove any border radius from all elements in the capture
          if (el.style.borderRadius) {
            el.style.borderRadius = '0px'
          }
        }
      })
    }
  },
})

export const ShareWin = ({ marketSlug, amountToClaim, symbol = 'USDC' }: ShareWinProps) => {
  const [isCopying, setIsCopying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const captureRef = useRef<HTMLDivElement>(null)

  const { name } = useAccount()

  const { data: market } = useMarket(marketSlug)
  const activeMarketSlug = marketSlug ?? market?.slug

  const {
    data: chartData,
    isLoading: isChartDataLoading,
    isError: isChartDataError,
    error: chartDataError,
    refetch: refetchChartData,
  } = useWinChartData({ marketSlug: activeMarketSlug })

  const [chartImageUrl, setChartImageUrl] = useState<string | null>(null)
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null)

  const captureToCanvas = async () => {
    if (!captureRef.current) return null

    try {
      const canvas = await html2canvas(captureRef.current, {
        ...getHtml2CanvasOptions(),
        allowTaint: true,
        useCORS: true,
        logging: false,
      })
      return canvas
    } catch (err) {
      console.error('Error capturing to canvas:', err)
      return null
    }
  }

  const canvasToBlob = async (canvas: HTMLCanvasElement): Promise<Blob | null> => {
    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0))
  }

  const shareImage = async (blob: Blob): Promise<boolean> => {
    setCachedBlob(blob)

    if (navigator.clipboard?.write) {
      const item = new ClipboardItem({
        [blob.type]: blob,
      })
      await navigator.clipboard.write([item])
      return true
    } else {
      const url = URL.createObjectURL(blob)
      setChartImageUrl(url)

      const link = document.createElement('a')
      link.href = url
      link.download = `prediction-win-${activeMarketSlug ?? 'chart'}.png`
      link.click()
      return true
    }
  }

  const handleCapture = async () => {
    if (!captureRef.current) return false

    try {
      if (cachedBlob) {
        if (navigator.clipboard?.write) {
          const item = new ClipboardItem({
            [cachedBlob.type]: cachedBlob,
          })
          await navigator.clipboard.write([item])
          return true
        } else if (chartImageUrl) {
          const link = document.createElement('a')
          link.href = chartImageUrl
          link.download = `prediction-win-${activeMarketSlug ?? 'chart'}.png`
          link.click()
          return true
        }
      }

      const canvas = await captureToCanvas()
      if (!canvas) return false

      const blob = await canvasToBlob(canvas)
      if (blob) {
        return await shareImage(blob)
      }
      return false
    } catch (err) {
      console.error('Error capturing chart:', err)
      setError('Failed to capture chart image')
      return false
    }
  }

  useEffect(() => {
    setIsLoading(isChartDataLoading)
    setIsError(isChartDataError)
    if (isChartDataError && chartDataError) {
      setError(
        chartDataError instanceof Error ? chartDataError.message : 'Failed to load chart data'
      )
    }
  }, [isChartDataLoading, isChartDataError, chartDataError])

  useEffect(() => {
    if (chartData && !isChartDataLoading && !isChartDataError && captureRef.current) {
      const timeoutId = setTimeout(async () => {
        try {
          const canvas = await captureToCanvas()
          if (!canvas) return

          const blob = await canvasToBlob(canvas)
          if (blob) {
            setCachedBlob(blob)
            const url = URL.createObjectURL(blob)
            setChartImageUrl(url)
          }
        } catch (err) {
          console.error('Error pre-generating chart image:', err)
        }
      }, 500)
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [chartData, isChartDataLoading, isChartDataError])

  useEffect(() => {
    return () => {
      if (chartImageUrl) {
        URL.revokeObjectURL(chartImageUrl)
      }
      setCachedBlob(null)
    }
  }, [chartImageUrl])

  const refetch = () => {
    setIsError(false)
    setError(null)

    if (chartImageUrl) {
      URL.revokeObjectURL(chartImageUrl)
      setChartImageUrl(null)
    }
    setCachedBlob(null)
    refetchChartData()
  }

  const handleCopyImage = async () => {
    setIsCopying(true)

    try {
      await handleCapture()
    } catch (err) {
      console.error('Error in copy handler:', err)
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <Stack spacing={4}>
      <Text {...h2Bold}>You were right!</Text>
      <Flex mt='10px'>
        <Text {...headline} lineHeight={{ base: '24px', md: 'auto' }}>
          Your prediction won. You earned{' '}
          <Text as='span' mt='5px' {...headline} color='green.500' display='inline'>
            {`+${NumberUtil.formatThousands(amountToClaim, 2)} ${symbol}`}
          </Text>
        </Text>
      </Flex>
      <Divider borderColor='grey.200' />
      <HStack>
        <Text {...paragraphMedium}>Let the world know. </Text>
        <Button
          variant='outlined'
          w='fit-content'
          size='sm'
          onClick={handleCopyImage}
          isLoading={isCopying}
          isDisabled={isLoading || isError}
        >
          <HStack>
            <CopyIcon width={16} height={16} />
            <Text> Copy Image</Text>
          </HStack>
        </Button>
      </HStack>

      {market && !isLoading && !isError && chartData && (
        <Flex
          borderRadius='md'
          overflow='hidden'
          maxW='100%'
          my={3}
          maxH={{ base: 'auto', md: '470px' }}
          h='fit-content'
          alignItems='center'
          justifyContent='center'
          position='relative'
          className='share-preview-container'
        >
          <Stack
            ref={captureRef}
            data-share-capture
            maxW='732px'
            w='full'
            maxH={{ base: 'auto', md: '470px' }}
            minH={{ base: '235px', md: '400px' }}
            p={{ base: '20px 20px 12px 20px', md: '32px 32px 18px 32px' }}
            h='full'
            background={`linear-gradient(to bottom, #0CACA1 0%, #000000 70%)`}
            alignItems='center'
            justifyContent='center'
            position='relative'
            overflow='hidden'
            borderRadius='12px'
            gap='0px'
          >
            <Stack
              maxW='666px'
              h={{ base: 'auto', md: '354px' }}
              minH={{ base: '200px', md: '354px' }}
              w='full'
              borderRadius='12px'
              p={{ base: '16px', md: '24px' }}
              bg='black'
              border='2px solid'
              borderColor='whiteAlpha.10'
              zIndex={2}
              position='relative'
              overflow='hidden'
              justifyContent='space-between'
              gap='5px'
              mb='10px'
            >
              <HStack justifyContent='space-between'>
                <Stack gap={{ base: '2px', md: '8px' }}>
                  <Text
                    {...(isMobile ? paragraphBold : h3Bold)}
                    fontSize={{ base: '10px', md: 'unset' }}
                    color='white'
                  >
                    {market.title}
                  </Text>
                  <Text
                    {...headline}
                    color='white'
                    fontSize={{ base: '8px', md: 'unset' }}
                  >{`${name} Called it when the odds were still at ${chartData.boughtProbability}%`}</Text>
                </Stack>
                <HStack alignItems='start'>
                  <Stack alignItems='center' gap={{ base: '2px', md: '8px' }}>
                    <Text
                      {...(isMobile ? paragraphBold : h3Bold)}
                      fontSize={{ base: '16px', md: '32px' }}
                      color='green.500'
                      whiteSpace='nowrap'
                    >{`+${
                      chartData
                        ? Math.round(
                            ((100 - chartData.boughtProbability) / chartData.boughtProbability) *
                              100
                          )
                        : 0
                    } %`}</Text>
                    <Text
                      {...(isMobile ? captionMedium : headline)}
                      fontSize={{ base: '7px', md: 'unset' }}
                      color='white'
                    >{`In Profit`}</Text>
                  </Stack>
                  <Stack
                    w={{ base: '16px', md: '32px' }}
                    h={{ base: '16px', md: '32px' }}
                    borderRadius={{ base: '5px', md: '10px' }}
                    bg='green.500'
                    alignItems='center'
                    justifyContent='center'
                  >
                    <CupIcon width={isMobile ? 10 : 22} height={isMobile ? 10 : 22} color='white' />
                  </Stack>
                </HStack>
              </HStack>
              <WinChart chartData={chartData} />
            </Stack>
            <Image src={'/logo-white.svg'} width={{ base: 120, md: 220 }} alt='logo' />
          </Stack>
        </Flex>
      )}
      {isLoading && (
        <Flex alignItems='center' justifyContent='center' h='200px' bg='gray.100' borderRadius='md'>
          <Loader h='fit-content' w='fit-content' />
        </Flex>
      )}

      {(isError || error) && (
        <Box
          height='200px'
          bg='gray.100'
          borderRadius='md'
          display='flex'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
          gap={2}
        >
          <Text color='red.500'>Failed to load chart</Text>
          <Button size='xs' variant='outlined' onClick={() => refetch()}>
            Retry
          </Button>
        </Box>
      )}
    </Stack>
  )
}
