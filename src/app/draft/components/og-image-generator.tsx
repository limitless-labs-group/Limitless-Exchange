import { Box, Divider, HStack, Img, Spacer, Text, useTheme, VStack } from '@chakra-ui/react'
import html2canvas from 'html2canvas'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SelectOption } from '@/types/draft'

export interface IOgImageGeneratorOptions {
  px: number | string
  p: number | string
  height: number | string
  width: number | string
  fontSize: number
  borderRadius: string
  divider: {
    borderWidth: string
  }
  logo: {
    width: number | string
    height: number | string
  }
}

const [backgroundColor] = ['#0000EE']
const exportOptions: IOgImageGeneratorOptions = {
  px: 150,
  p: 10,
  height: `1100px`,
  width: `2110px`,
  fontSize: 113.68,
  borderRadius: 'none',
  divider: {
    borderWidth: '4px',
  },
  logo: {
    width: '847px',
    height: '148px',
  },
}
const previewOptions: IOgImageGeneratorOptions = {
  px: 10,
  p: 5,
  height: 280,
  width: 'full',
  fontSize: 32,
  borderRadius: 'md',
  divider: {
    borderWidth: '1px',
  },
  logo: {
    width: '185px',
    height: '40px',
  },
}

export interface IOgImageGenerator {
  title: string
  categories: SelectOption[]
  onBlobGenerated: (blob: Blob) => void
  generateBlob: boolean
  setReady?: (param: boolean) => void
}
export const OgImageGenerator = ({
  title,
  categories,
  generateBlob,
  onBlobGenerated,
  setReady,
}: IOgImageGenerator) => {
  const theme = useTheme()
  const canvasRef = useRef<HTMLDivElement>(null)

  const [image, setImage] = useState('')

  const handleGenerateBlob = async () => {
    if (!canvasRef.current) return
    try {
      if (setReady) {
        setReady(false)
      }
      const componentWidth = canvasRef?.current.offsetWidth
      const componentHeight = canvasRef?.current.offsetHeight
      const scale = 2110 / componentWidth // calculate the scale factor
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        logging: true,
        scale,
        width: componentWidth * scale,
        height: componentHeight * scale,
        backgroundColor: backgroundColor,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
      })

      const imageDataUrl = canvas.toDataURL('image/png', 1.0)
      setImage(imageDataUrl)
      canvas.toBlob(
        async (blob) => {
          if (blob) {
            onBlobGenerated(blob)
            // let downloadLink = document.createElement('a')
            // downloadLink.setAttribute('download', 'preview-og-image.png')
            // let url = URL.createObjectURL(blob)
            // downloadLink.setAttribute('href', url)
            // downloadLink.click()
          } else {
            console.error('Blob generation failed')
          }
        },
        'image/png',
        1.0
      )
      if (setReady) {
        setReady(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDownloadPreviewImage = () => {
    const link = document.createElement('a')
    link.href = image
    link.download = 'preview-og-image.png'
    link.click()
  }

  const { firstWord, secondWord, words } = useMemo(() => {
    const [firstWord, secondWord, ...words] = title.split(' ')
    return {
      firstWord,
      secondWord,
      words,
    }
  }, [title])

  useEffect(() => {
    if (generateBlob) {
      handleGenerateBlob()
    }
  }, [generateBlob])

  const SmallPreview = () => (
    <>
      {/* <Tooltip hasArrow label='Click to download OG Image for preview in full size.'>...</Tooltip> */}
      <VStack gap='5px' w='full' onClick={handleGenerateBlob} cursor='pointer'>
        <Box
          bg={backgroundColor}
          width={previewOptions.width}
          height={previewOptions.height}
          p={previewOptions.p}
          px={previewOptions.px}
          borderRadius={previewOptions.borderRadius}
        >
          <VStack w='full' h='full' display='flex'>
            <Divider color='white' borderWidth={previewOptions.divider.borderWidth} />

            <Text fontSize={previewOptions.fontSize} color='white' w='full'>
              {firstWord} <span style={{ fontFamily: theme.fonts.heading }}> {secondWord} </span>
              {words.join(' ')}
            </Text>

            <Spacer />

            <HStack w='full' gap='10px'>
              <HStack>
                <Img
                  src='/logo.png'
                  alt='Limitless Logo'
                  width={previewOptions.logo.width}
                  height={previewOptions.logo.height}
                />
              </HStack>
              <HStack>
                <Box px='8px' py='1px' bg='white' borderRadius='sm'>
                  <Text fontSize={previewOptions.fontSize / 1.5} color={backgroundColor}>
                    /{' '}
                    {categories.length > 0
                      ? categories.map((cat) => cat.label).join(', ')
                      : 'Other'}
                  </Text>
                </Box>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </>
  )

  return (
    <>
      <SmallPreview />

      <Box display='inline-block' w='full' position='absolute' top='-9999px'>
        <Box
          ref={canvasRef}
          bg={backgroundColor}
          width={exportOptions.width}
          height={exportOptions.height}
          p={exportOptions.p}
          pt={35}
          pb={112}
          px={exportOptions.px}
          borderRadius={exportOptions.borderRadius}
          style={{
            lineHeight: '0.5 !important',
          }}
        >
          <Divider
            color='white'
            borderWidth={exportOptions.divider.borderWidth}
            pos='absolute'
            top='75px'
            w={1800}
            // p={0} m={0}
          />

          <VStack w='full' h='full' display='flex' gap={0}>
            <Text
              // bg='red'
              fontWeight={400}
              height='146px'
              fontSize={exportOptions.fontSize}
              color='white'
              w='full'
              pb={50}
              style={{
                lineHeight: '0.5 !important',
              }}
            >
              <span style={{ fontFamily: theme.fonts.body }}>{firstWord}</span>{' '}
              <span style={{ fontFamily: theme.fonts.heading }}> {secondWord} </span>
              <span style={{ fontFamily: theme.fonts.body }}>{words.join(' ')}</span>
            </Text>

            <Spacer />

            <Box display='flex' justifyContent='start' alignItems='center' w='full'>
              <Img
                src='/logo-og-markets.png'
                // src='/logo-og.png' // use this for dynamic category
                alt='Limitless Logo'
                width={exportOptions.logo.width}
                height={exportOptions.logo.height}
              />

              {/* ! DOES NOT WORK: Dynamic Category */}
              {/* <Box mx={5} /> */}
              {/* <Box
                display='flex'
                justifyContent='center'
                alignItems='start'
                borderRadius='md'
                px={5}
                height='90px'
                bg='white'
                boxSizing='border-box'
              >
                <Text
                  color={backgroundColor}
                  fontSize={60}
                  noOfLines={1}
                  height='90px'
                  style={{
                    lineHeight: '0.5 !important',
                  }}
                >
                  /{category}
                </Text>
              </Box> */}
            </Box>
          </VStack>
        </Box>
      </Box>
    </>
  )
}
