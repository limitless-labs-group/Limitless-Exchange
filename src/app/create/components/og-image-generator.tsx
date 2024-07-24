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
  px: 100,
  p: 10,
  height: `1100px`,
  width: `2110px`,
  fontSize: 114,
  borderRadius: 'none',
  divider: {
    borderWidth: '5px',
  },
  logo: {
    width: '370px',
    height: '80px',
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
  // const dividerRef = useRef<HTMLHRElement>(null)
  // const imgRef = useRef<HTMLImageElement>(null)
  // const categoryTextRef = useRef<HTMLDivElement>(null)

  const [image, setImage] = useState('')
  // const [generatorOptions, setGeneratorOptions] = useState<IOgImageGeneratorOptions>(previewOptions)

  // const handleMofidifyStyles = (options: IOgImageGeneratorOptions) => {
  //   canvasRef!.current!.style.width = options.width
  //   canvasRef!.current!.style.height = options.height
  //   canvasRef!.current!.style.padding = options.p
  //   canvasRef!.current!.style.paddingLeft = options.px
  //   canvasRef!.current!.style.paddingRight = options.px
  //   canvasRef!.current!.style.borderRadius = options.borderRadius

  //   // Modify Divider component props
  //   dividerRef!.current!.style.borderWidth = options.divider.borderWidth

  //   // Modify Img component props
  //   imgRef!.current!.width = options.logo.width
  //   imgRef!.current!.height = options.logo.height

  //   // Modify Text component props
  //   categoryTextRef!.current!.style.fontSize = `${options.fontSize}px`
  // }

  const handleGenerateBlob = async () => {
    try {
      // handleMofidifyStyles(exportOptions)

      const componentWidth = canvasRef!.current!.offsetWidth
      const componentHeight = canvasRef!.current!.offsetHeight
      const scale = 2110 / componentWidth! // calculate the scale factor
      const canvas = await html2canvas(canvasRef.current!, {
        useCORS: true,
        logging: true,
        scale,
        width: componentWidth * scale,
        height: componentHeight * scale,
        backgroundColor: backgroundColor,
        // allowTaint: true,
        // scrollX: 0,
        // scrollY: 0,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        // windowWidth: document.documentElement.offsetWidth,
        // windowHeight: document.documentElement.offsetHeight,
        // x: window.scrollX,
        // y: window.scrollY,
      })
      // handleMofidifyStyles(previewOptions)

      const imageDataUrl = canvas.toDataURL('image/png')
      setImage(imageDataUrl)

      canvas.toBlob((blob) => {
        if (!blob) return
        onBlobGenerated(blob)
        handleDownloadPreviewImage()
      })
    } catch (error) {
      console.error(error)
    }
    // finally {
    //   handleMofidifyStyles(previewOptions)
    // }
  }

  const handleDownloadPreviewImage = () => {
    const link = document.createElement('a')
    link.href = image
    link.download = 'preview-og-image.png'
    link.click()
  }

  const handleClick = async () => {
    await handleGenerateBlob()
    // handleDownloadPreviewImage()

    // // Create a new canvas element
    // const canvas = document.createElement('canvas')
    // canvas.width = 2110
    // canvas.height = 1100

    // // Get the 2D drawing context
    // const ctx = canvas.getContext('2d')

    // // Draw something on the canvas
    // ctx!.fillStyle = backgroundColor
    // ctx!.fillRect(50, 50, 2110, 1100)

    // ctx?.fillText(title, 50, 50)

    // // Convert the canvas to a PNG image
    // const pngImage = canvas.toDataURL('image/png')

    // // Do something with the PNG image (e.g., display it in an image element)
    // const imageElement = document.createElement('img')
    // imageElement.src = pngImage
    // document.body.appendChild(imageElement)

    // const link = document.createElement('a')
    // link.href = pngImage
    // link.download = 'image.png'
    // link.click()
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

  return (
    <>
      <Tooltip hasArrow label='Click to download OG Image for preview in full size.'>
        <VStack gap='5px' w='full' onClick={handleClick} cursor='pointer'>
          {/* <OgImage options={previewOptions} /> */}
          <Box
            bg={backgroundColor}
            width={previewOptions.width}
            height={previewOptions.height}
            p={previewOptions.p}
            px={previewOptions.px}
            borderRadius={previewOptions.borderRadius}
          >
            <VStack w='full' h='full' display='flex'>
              <Divider
                // ref={dividerRef}
                color='white'
                borderWidth={previewOptions.divider.borderWidth}
              />

              <Text fontSize={previewOptions.fontSize} color='white' w='full'>
                {firstWord} <span style={{ fontFamily: theme.fonts.heading }}> {secondWord} </span>
                {words.join(' ')}
              </Text>

              <Spacer />

              <HStack w='full' gap='10px'>
                <StackItem>
                  <Img
                    // ref={imgRef}
                    src='/logo.png'
                    alt='Limitless Logo'
                    width={previewOptions.logo.width}
                    height={previewOptions.logo.height}
                  />
                </StackItem>
                <StackItem
                // scrollMarginY={0}
                // scrollPaddingY={0}
                // scrollMarginX={0}
                // scrollPaddingX={0}
                // transform='none'
                >
                  <Box
                    px='8px'
                    py='1px'
                    bg='white'
                    borderRadius='sm'
                    // scrollMarginY={0}
                    // scrollPaddingY={0}
                    // scrollMarginX={0}
                    // scrollPaddingX={0}
                    // transform='none'
                  >
                    <Text
                      // ref={categoryTextRef}
                      fontSize={previewOptions.fontSize / 1.5}
                      color={backgroundColor}
                      // scrollMarginY={0}
                      // scrollPaddingY={0}
                      // scrollMarginX={0}
                      // scrollPaddingX={0}
                    >
                      /{category}
                    </Text>
                  </Box>
                </StackItem>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Tooltip>

      <Box display='block' w='full' position='absolute' top='-9999px'>
        <Box
          ref={canvasRef}
          bg={backgroundColor}
          width={exportOptions.width}
          height={exportOptions.height}
          p={exportOptions.p}
          px={exportOptions.px}
          borderRadius={exportOptions.borderRadius}
        >
          <VStack w='full' h='full' display='flex'>
            <Divider color='white' borderWidth={exportOptions.divider.borderWidth} />

            <Text fontSize={exportOptions.fontSize} color='white' w='full'>
              {firstWord} <span style={{ fontFamily: theme.fonts.heading }}> {secondWord} </span>
              {words.join(' ')}
            </Text>

            <Spacer />

            <Box display='flex' justifyContent='start' w='full'>
              <Img
                src='/logo.png'
                alt='Limitless Logo'
                width={exportOptions.logo.width}
                height={exportOptions.logo.height}
              />

              <Box mx={5} />

              <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                borderRadius='md'
                px={5}
                // pb={5}
                height={exportOptions.logo.height}
                // minWidth={200}
                // maxWidth={300}
                // w='auto'
                bg='white'
                boxSizing='border-box'
                fontSize={48}
              >
                <h1 style={{ top: '100px' }} color={backgroundColor}>
                  /{category}
                </h1>
                {/* <Text
                  // pos='absolute'
                  fontSize={48}
                  color={backgroundColor}
                >
                  /{category}
                </Text> */}
              </Box>
            </Box>
          </VStack>
        </Box>
      </Box>
    </>
  )
}
