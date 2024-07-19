import {
  Box,
  Button,
  Divider,
  HStack,
  Img,
  Link,
  Spacer,
  StackItem,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { useTheme } from '@emotion/react'

const [backgroundColor, fontSize] = ['#0000EE', 24]
const exportOptions = {
  px: 100,
  p: 10,
  height: 1100,
  width: 2110,
  fontSize: 114,
  divider: {
    borderWidth: 5,
  },
  logo: {
    width: 185,
    height: 40,
  },
}
const previewOptions = {
  px: 10,
  p: 5,
  height: 280,
  width: 'full',
  fontSize: 32,
  divider: {
    borderWidth: 1,
  },
  logo: {
    width: '185px',
    height: '40px',
  },
}

function _sluggify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-')
}

// w={2110}
// h={1100}

export interface IOgImageGenerator {
  title: string
  category: string
  width?: number | string
  height?: number | string
}

export const OgImageGenerator = ({ title, category, width, height }: IOgImageGenerator) => {
  const [image, setImage] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  const handleGenerateImage = useCallback(async () => {
    const canvas = await html2canvas(previewRef.current!, {
      useCORS: true,
      logging: true,
    })
    const imageDataUrl = canvas.toDataURL('image/png')
    setImage(imageDataUrl)
  }, [fontSize, backgroundColor, image])

  return (
    <VStack gap='5px' w='full'>
      <Box
        ref={previewRef}
        bg={backgroundColor}
        width={previewOptions.width}
        height={previewOptions.height}
        p={previewOptions.p}
        px={previewOptions.px}
      >
        <VStack w='full' h='full' display='flex'>
          <Divider color='white' borderWidth={previewOptions.divider.borderWidth} />

          <Text fontSize={previewOptions.fontSize} color='white'>
            {title}
          </Text>

          <Spacer />

          <HStack w='full' gap='10px'>
            <StackItem>
              <Img
                src='/logo.png'
                alt='Limitless Logo'
                width={previewOptions.logo.width}
                height={previewOptions.logo.height}
              />
            </StackItem>
            <StackItem>
              <Box px='8px' py='1px' bg='white' borderRadius='sm'>
                <Text fontSize={previewOptions.fontSize / 1.5} color={backgroundColor}>
                  /{category}
                </Text>
              </Box>
            </StackItem>
          </HStack>
        </VStack>
      </Box>

      <Button onClick={handleGenerateImage}>Generate Image</Button>
      {image && <Img src={image} alt='Generated OG Image' />}
      <Link href={image} download={`${_sluggify(title)}.png`}>
        Download Image
      </Link>
    </VStack>
  )
}
