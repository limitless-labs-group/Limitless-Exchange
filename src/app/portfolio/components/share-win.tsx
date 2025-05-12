import {
  Text,
  Stack,
  Button,
  Image,
  Box,
  useToast,
  Flex,
  HStack,
  VStack,
  Divider,
} from '@chakra-ui/react'
import html2canvas from 'html2canvas'
import { useState, useEffect, useRef } from 'react'
import Loader from '@/components/common/loader'
import { WinChart } from './win-chart'
import { useWinChartData } from '@/hooks/use-win-chart-data'
import CupIcon from '@/resources/icons/cup-icon.svg'
import { useAccount } from '@/services'
import { useMarket } from '@/services/MarketsService'
import { h2Bold, h3Bold, headline, paragraphMedium } from '@/styles/fonts/fonts.styles'

interface ShareWinProps {
  amount?: string
  marketSlug?: string
}

export const ShareWin = ({ amount = '+320.00 USDC', marketSlug }: ShareWinProps) => {
  const [isCopying, setIsCopying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const captureRef = useRef<HTMLDivElement>(null)

  const { name } = useAccount()

  const { data: market } = useMarket(marketSlug)
  const activeMarketSlug = marketSlug || market?.slug

  const {
    data: chartData,
    isLoading: isChartDataLoading,
    isError: isChartDataError,
    error: chartDataError,
    refetch: refetchChartData,
  } = useWinChartData({ marketSlug: activeMarketSlug })

  const [chartImageUrl, setChartImageUrl] = useState<string | null>(null)
  const [cachedBlob, setCachedBlob] = useState<Blob | null>(null)
  const [cachedBuffer, setCachedBuffer] = useState<Buffer | null>(null)

  const handleCapture = async () => {
    if (!captureRef.current) return false

    try {
      if (cachedBlob) {
        if (navigator.clipboard && navigator.clipboard.write) {
          const item = new ClipboardItem({
            [cachedBlob.type]: cachedBlob,
          })
          await navigator.clipboard.write([item])
          return true
        } else {
          if (chartImageUrl) {
            const link = document.createElement('a')
            link.href = chartImageUrl
            link.download = `prediction-win-${activeMarketSlug ?? 'chart'}.png`
            link.click()
            return true
          }
        }
      }

      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: null,
        scale: 2,
        removeContainer: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[ref=captureRef]')
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
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png', 1.0)
      )

      if (blob) {
        setCachedBlob(blob)

        const arrayBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        setCachedBuffer(buffer)

        if (navigator.clipboard && navigator.clipboard.write) {
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
      setTimeout(async () => {
        try {
          //@ts-ignore
          const canvas = await html2canvas(captureRef.current, {
            allowTaint: true,
            useCORS: true,
            logging: false,
            scale: 2,
            backgroundColor: null, // Transparent background
            removeContainer: true, // Remove the container after capture
            onclone: (clonedDoc) => {
              const clonedElement = clonedDoc.querySelector('[ref=captureRef]')
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

          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/png', 1.0)
          )

          if (blob) {
            setCachedBlob(blob)

            const arrayBuffer = await blob.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            setCachedBuffer(buffer)

            const url = URL.createObjectURL(blob)
            setChartImageUrl(url)
          }
        } catch (err) {
          console.error('Error pre-generating chart image:', err)
        }
      }, 500)
    }
  }, [chartData, isChartDataLoading, isChartDataError])

  useEffect(() => {
    return () => {
      if (chartImageUrl) {
        URL.revokeObjectURL(chartImageUrl)
      }
      setCachedBlob(null)
      setCachedBuffer(null)
    }
  }, [])

  const refetch = () => {
    setIsError(false)
    setError(null)

    if (chartImageUrl) {
      URL.revokeObjectURL(chartImageUrl)
      setChartImageUrl(null)
    }
    setCachedBlob(null)
    setCachedBuffer(null)

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
      <Flex gap='5px'>
        <Text {...headline} mt='10px'>
          Your prediction won. You earned
        </Text>

        <Text {...headline} color='green.500' mt='10px'>
          {amount}
        </Text>
      </Flex>
      <Divider borderColor='grey.100' />
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
          Copy Image
        </Button>
      </HStack>

      {market && !isLoading && !isError && chartData && (
        <Flex
          borderRadius='md'
          overflow='hidden'
          maxW='100%'
          my={3}
          maxH='470px'
          h='fit-content'
          alignItems='center'
          justifyContent='center'
          position='relative'
          className='share-preview-container'
        >
          <Stack
            ref={captureRef}
            maxW='732px'
            w='full'
            maxH='470px'
            minH='400px'
            p='32px 32px 18px 32px'
            h='full'
            background={`linear-gradient(to bottom, #0079FF 0%, #000000 70%)`}
            alignItems='center'
            justifyContent='center'
            position='relative'
            overflow='hidden'
            borderRadius='12px'
            gap='0px'
          >
            <Stack
              maxW='666px'
              h='354px'
              w='full'
              borderRadius='12px'
              p='24px'
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
                <Stack>
                  <Text {...h3Bold} color='white'>
                    {market.title}
                  </Text>
                  <Text
                    {...headline}
                    color='white'
                  >{`${name} Called it when the odds were still at ${chartData.boughtProbability}%`}</Text>
                </Stack>
                <HStack alignItems='start'>
                  <Stack alignItems='center'>
                    <Text {...h3Bold} fontSize='32px' color='green.500'>{`+120 %`}</Text>
                    <Text {...headline} color='white'>{`In Profit`}</Text>
                  </Stack>
                  <Stack
                    w='32px'
                    h='32px'
                    borderRadius='10px'
                    bg='green.500'
                    alignItems='center'
                    justifyContent='center'
                  >
                    <CupIcon width={22} height={22} color='white' />
                  </Stack>
                </HStack>
              </HStack>
              <WinChart chartData={chartData} />
            </Stack>
            <Image src={'/logo-white.svg'} width={220} alt='logo' />
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
