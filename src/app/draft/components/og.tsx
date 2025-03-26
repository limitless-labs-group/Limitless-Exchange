import {
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  Box,
  AccordionIcon,
  AccordionPanel,
  HStack,
  Checkbox,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Toast } from '@/components/common/toast'
import { OgImageGenerator } from './og-image-generator'
import { useCreateMarket } from './use-create-market'
import { formDataAtom } from '@/atoms/draft'
import { useToast } from '@/hooks'

export const Og = () => {
  const [ogImageError, setOgImageError] = useState<string | null>(null)
  const [autoGenerateOg, setAutoGenerateOg] = useState<boolean>(true)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [formData] = useAtom(formDataAtom)
  const toast = useToast()
  const { handleChange } = useCreateMarket()
  useEffect(() => {
    setIsReady(true)
    if (autoGenerateOg && formData.title) {
      const timer = setTimeout(() => {
        generateOgImage()
          .then(() => console.log('Initial OG image generated successfully'))
          .catch(() => {
            setOgImageError('Failed to generate initial OG image. Please try regenerating.')
          })
      }, 500) // Add a small delay to ensure form data is stable

      return () => clearTimeout(timer)
    }
  }, [formData.title, autoGenerateOg])

  const { mutateAsync: generateOgImage, isPending: isGeneratingOgImage } = useMutation({
    mutationKey: ['generate-og-image'],
    mutationFn: async () => {
      setOgImageError(null)
      return new Promise((resolve) => {
        const checkReady = setInterval(() => {
          if (isReady) {
            clearInterval(checkReady)
            resolve(true)
          }
        }, 50)
      })
    },
    onError: (error) => {
      console.error('OG image generation error:', error)
      setOgImageError('Failed to generate OG image. Please try again.')
    },
  })

  const showToast = (message: string) => {
    const id = toast({
      render: () => <Toast title={message} id={id} />,
    })
  }

  const handleBlobGenerated = (blob: Blob | null) => {
    try {
      if (!blob) {
        const errorMessage = 'Failed to generate OG image: No blob received'
        showToast(errorMessage)
        setOgImageError(errorMessage)
        return
      }
      if (!blob.type.startsWith('image/')) {
        const errorMessage = 'Failed to generate OG image: Invalid image type'
        showToast(errorMessage)
        setOgImageError(errorMessage)
        return
      }

      const _ogLogo = new File([blob], 'og.png', {
        type: blob.type,
        lastModified: Date.now(),
      })

      if (!_ogLogo.size) {
        const errorMessage = 'Failed to generate OG image: Empty file'
        showToast(errorMessage)
        setOgImageError(errorMessage)
        return
      }

      if (_ogLogo.size > 1024 * 1024) {
        const errorMessage = 'Failed to generate OG image: File too large'
        showToast('Failed to generate OG image: File too large')
        setOgImageError(errorMessage)
        return
      }

      setOgImageError(null)
      handleChange('ogLogo', _ogLogo)
    } catch (error) {
      const errorMessage = 'Failed to generate OG image: ' + (error as Error).message
      showToast(errorMessage)
      setOgImageError(errorMessage)
    }
  }

  return (
    <Accordion mt='20px' allowToggle defaultIndex={[0]}>
      <AccordionItem>
        <>
          <AccordionButton>
            <Box flex='1' textAlign='left'>
              OG Preview (Click to Expand/Collapse)
              {!formData.ogLogo && ogImageError && (
                <Box as='span' color='red.500' ml={2} fontSize='sm'>
                  (Generation failed)
                </Box>
              )}
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} position='relative'>
            <Box>
              <HStack mb={4} width='full' justifyContent='space-between'>
                <Button
                  size='sm'
                  colorScheme='blue'
                  onClick={async () => {
                    setOgImageError(null)
                    await generateOgImage()
                  }}
                  isLoading={!isReady}
                >
                  Regenerate OG Image
                </Button>
                <Checkbox
                  isChecked={autoGenerateOg}
                  onChange={(e) => setAutoGenerateOg(e.target.checked)}
                >
                  Auto-generate
                </Checkbox>
              </HStack>
              <Box pointerEvents='none'>
                <HStack h='280px' w='600px'>
                  <OgImageGenerator
                    title={formData.title}
                    setReady={(isReady) => {
                      setIsReady(isReady)
                    }}
                    categories={formData.categories ?? []}
                    onBlobGenerated={(blob) => handleBlobGenerated(blob)}
                    generateBlob={isGeneratingOgImage}
                  />
                </HStack>
              </Box>
            </Box>
          </AccordionPanel>
        </>
      </AccordionItem>
    </Accordion>
  )
}
