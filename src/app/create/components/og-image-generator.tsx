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
  px: number
  p: number
  height: number
  width: number | string
  fontSize: number
  borderRadius: string
  divider: {
    borderWidth: number
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
  height: 1100,
  width: 2110,
  fontSize: 114,
  borderRadius: 'none',
  divider: {
    borderWidth: 5,
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
    borderWidth: 1,
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
  const previewRef = useRef<HTMLDivElement>(null)

  const [image, setImage] = useState('')
  const [generatorOptions, setGeneratorOptions] = useState<IOgImageGeneratorOptions>(previewOptions)

  const handleGenerateBlob = async () => {
    const canvas = await html2canvas(previewRef.current!, {
      useCORS: true,
      logging: true,
    })
    const imageDataUrl = canvas.toDataURL('image/png')
    setImage(imageDataUrl)
    canvas.toBlob((blob) => {
      if (!blob) return
      onBlobGenerated(blob)
    })
  }

  const handleDownloadPreviewImage = () => {
    // setGeneratorOptions(exportOptions)
    const link = document.createElement('a')
    link.href = image
    link.download = 'preview-og-image.png'
    link.click()
    // setGeneratorOptions(previewOptions)
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
    handleGenerateBlob()
  }, [generateBlob])

  return (
    <>
      <Tooltip hasArrow label='Click to download OG Image for preview in full size.'>
        <VStack
          gap='5px'
          w='full'
          onClick={handleDownloadPreviewImage}
          borderRadius={generatorOptions.borderRadius}
          cursor='pointer'
        >
          <Box
            ref={previewRef}
            bg={backgroundColor}
            width={generatorOptions.width}
            height={generatorOptions.height}
            p={generatorOptions.p}
            px={generatorOptions.px}
            borderRadius={generatorOptions.borderRadius}
          >
            <VStack w='full' h='full' display='flex'>
              <Divider color='white' borderWidth={generatorOptions.divider.borderWidth} />

              <Text fontSize={generatorOptions.fontSize} color='white' w='full'>
                {firstWord} <span style={{ fontFamily: theme.fonts.heading }}> {secondWord} </span>
                {words.join(' ')}
              </Text>

              <Spacer />

              <HStack w='full' gap='10px'>
                <StackItem>
                  <Img
                    src='/logo.png'
                    alt='Limitless Logo'
                    width={generatorOptions.logo.width}
                    height={generatorOptions.logo.height}
                  />
                </StackItem>
                <StackItem>
                  <Box px='8px' py='1px' bg='white' borderRadius='sm'>
                    <Text fontSize={generatorOptions.fontSize / 1.5} color={backgroundColor}>
                      /{category}
                    </Text>
                  </Box>
                </StackItem>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Tooltip>
    </>
  )
}
