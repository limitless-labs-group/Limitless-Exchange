import {
  Box,
  Divider,
  HStack,
  Img,
  Link,
  Spacer,
  Spinner,
  StackItem,
  Text,
  Tooltip,
  useTheme,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'

interface IOgImageGeneratorOptions {
  px: string
  p: string
  height: string
  width: string
  fontSize: number
  borderRadius: string
  divider: {
    borderWidth: string
  }
  logo: {
    width: number
    height: number
  }
}

const [backgroundColor] = ['#0000EE']
const exportOptions: IOgImageGeneratorOptions = {
  px: '100px',
  p: '10px',
  height: `1100px`,
  width: `2110px`,
  fontSize: 114,
  borderRadius: 'none',
  divider: {
    borderWidth: '5px',
  },
  logo: {
    width: 370,
    height: 80,
  },
}
const previewOptions: IOgImageGeneratorOptions = {
  px: '10px',
  p: '5px',
  height: '280px',
  width: 'full',
  fontSize: 32,
  borderRadius: 'md',
  divider: {
    borderWidth: '1px',
  },
  logo: {
    width: 185,
    height: 40,
  },
}

export interface IOgImageGenerator {
  title: string
  category: string
  onBlobGenerated: (blob: Blob) => void
  generateBlob: boolean
}
export const OgImageGenerator = ({
  title,
  category,
  generateBlob,
  onBlobGenerated,
}: IOgImageGenerator) => {
  const theme = useTheme()
  const canvasRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLHRElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const categoryTextRef = useRef<HTMLDivElement>(null)

  const [image, setImage] = useState('')
  const [generatorOptions, setGeneratorOptions] = useState<IOgImageGeneratorOptions>(previewOptions)

  const handleMofidifyStyles = (options: IOgImageGeneratorOptions) => {
    canvasRef!.current!.style.width = options.width
    canvasRef!.current!.style.height = options.height
    canvasRef!.current!.style.padding = options.p
    canvasRef!.current!.style.paddingLeft = options.px
    canvasRef!.current!.style.paddingRight = options.px
    canvasRef!.current!.style.borderRadius = options.borderRadius

    // Modify Divider component props
    dividerRef!.current!.style.borderWidth = options.divider.borderWidth

    // Modify Img component props
    imgRef!.current!.width = options.logo.width
    imgRef!.current!.height = options.logo.height

    // Modify Text component props
    categoryTextRef!.current!.style.fontSize = `${options.fontSize}px`
  }

  const handleGenerateBlob = async () => {
    try {
      handleMofidifyStyles(exportOptions)

      const componentWidth = canvasRef!.current!.offsetWidth
      const componentHeight = canvasRef!.current!.offsetHeight
      const scale = 2110 / componentWidth! // calculate the scale factor
      const canvas = await html2canvas(canvasRef.current!, {
        useCORS: true,
        logging: true,
        scale,
        width: componentWidth * scale,
        height: componentHeight * scale,
      })
      handleMofidifyStyles(previewOptions)

      const imageDataUrl = canvas.toDataURL('image/png')
      setImage(imageDataUrl)

      canvas.toBlob((blob) => {
        if (!blob) return
        onBlobGenerated(blob)
      })
    } catch (error) {
      console.error(error)
    } finally {
      handleMofidifyStyles(previewOptions)
    }
  }

  const handleDownloadPreviewImage = () => {
    const link = document.createElement('a')
    link.href = image
    link.download = 'preview-og-image.png'
    link.click()
  }

  const handleClick = () => {
    handleGenerateBlob()
    handleDownloadPreviewImage()
  }

  const { firstWord, secondWord, words } = useMemo(() => {
    const [firstWord, secondWord, ...words] = title.split(' ')
    return {
      firstWord,
      secondWord,
      words,
    }
  }, [title])

  // useEffect(() => {
  //   handleGenerateBlob()
  // }, [generateBlob])

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     handleGenerateBlob()
  //   }, 6000) // 6000ms = 6 seconds

  //   return () => {
  //     clearInterval(intervalId)
  //   }
  // }, [])

  interface IOgImage {
    options: IOgImageGeneratorOptions
  }
  const OgImage = ({ options }: IOgImage) => (
    <Box
      ref={canvasRef}
      bg={backgroundColor}
      width={options.width}
      height={options.height}
      p={options.p}
      px={options.px}
      borderRadius={options.borderRadius}
    >
      <VStack w='full' h='full' display='flex'>
        <Divider ref={dividerRef} color='white' borderWidth={options.divider.borderWidth} />

        <Text fontSize={options.fontSize} color='white' w='full'>
          {firstWord} <span style={{ fontFamily: theme.fonts.heading }}> {secondWord} </span>
          {words.join(' ')}
        </Text>

        <Spacer />

        <HStack w='full' gap='10px'>
          <StackItem>
            <Img
              ref={imgRef}
              src='/logo.png'
              alt='Limitless Logo'
              width={options.logo.width}
              height={options.logo.height}
            />
          </StackItem>
          <StackItem>
            <Box px='8px' py='1px' bg='white' borderRadius='sm'>
              <Text ref={categoryTextRef} fontSize={options.fontSize / 1.5} color={backgroundColor}>
                /{category}
              </Text>
            </Box>
          </StackItem>
        </HStack>
      </VStack>
    </Box>
  )

  return (
    <>
      <Tooltip hasArrow label='Click to download OG Image for preview in full size.'>
        <VStack gap='5px' w='full' onClick={handleClick} cursor='pointer'>
          <OgImage options={previewOptions} />
        </VStack>
      </Tooltip>
    </>
  )
}
