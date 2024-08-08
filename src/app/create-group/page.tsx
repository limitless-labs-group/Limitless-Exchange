'use client'

import { MainLayout } from '@/components'
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  Spinner,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useToast } from '@/hooks'
import { Toast } from '@/components/common/toast'
import { OgImageGenerator } from '@/app/create/components'
import { useMutation } from '@tanstack/react-query'

interface MarketsGroupBody {
  marketsGroupTitle: string
  marketsGroupCategory: string
  marketsGroupCollateralToken: string
  marketsGroupLiquidity: number
  marketsGroupCreator: string
  marketsGroupDeadline: string
  marketsGroupTags: string[]
  markets: object[]
}

const CreateOwnMarketPage = () => {
  const template: MarketsGroupBody = {
    marketsGroupTitle: 'Presidential Election Winner 2024',
    marketsGroupCollateralToken: 'WETH',
    marketsGroupLiquidity: 0.25,
    marketsGroupCreator: 'CJ',
    marketsGroupCategory: 'Crypto',
    marketsGroupDeadline: '5 August, 2025',
    marketsGroupTags: ['Tag1', 'Tag2'],
    markets: [
      {
        title: 'Dunald Tremp',
        description: 'Dunald Tremp descr',
        startingYesProbability: 41,
      },
      {
        title: 'Komila Huris',
        description: 'Komila Huris descr',
        startingYesProbability: 39,
      },
      {
        title: 'Dart Vader',
        description: 'Dart Vader descr',
        startingYesProbability: 99,
      },
    ],
  }

  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [body, setBody] = useState(JSON.stringify(template, null, 2))
  const [parseError, setParseError] = useState(false)
  const [ogLogo, setOgLogo] = useState<File | undefined>()
  const [parsedTemplate, setParsedTemplate] = useState<MarketsGroupBody>(template)

  const { mutateAsync: generateOgImage, isPending: isGeneratingOgImage } = useMutation({
    mutationKey: ['generate-og-image'],
    mutationFn: async () => new Promise((resolve) => setTimeout(resolve, 1_000)),
  })

  const toast = useToast()

  const createMarket = async () => {
    setIsCreating(true)

    const _body = JSON.parse(body) as MarketsGroupBody

    const formData = new FormData()
    formData?.set('title', _body.marketsGroupTitle)
    formData?.set('category', _body.marketsGroupCategory)
    formData?.set('creator', _body.marketsGroupCreator)
    formData?.set('deadline', _body.marketsGroupDeadline)
    formData?.set('collateralToken', _body.marketsGroupCollateralToken)
    formData?.set('liquidity', _body.marketsGroupLiquidity.toString())
    formData?.set('tags', JSON.stringify(_body.marketsGroupTags))
    formData?.set('markets', JSON.stringify(_body.markets))
    formData?.set('ogFile', ogLogo!)

    axios
      .post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets-group/admin`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        if (res.status === 201) {
          const newTab = window.open('', '_blank')
          if (newTab) {
            newTab.location.href = res.data.multisigTxLink
          } else {
            // Fallback if the browser blocks the popup
            window.location.href = res.data.multisigTxLink
          }
        }
      })
      .catch((res) => {
        toast({
          render: () => <Toast title={`${res.title} ${res.message}`} id={1} />,
        })
      })
      .finally(() => {
        setIsCreating(false)
      })
  }

  useEffect(() => {
    try {
      const parsedTemplate = JSON.parse(body) as MarketsGroupBody
      setParseError(false)
      setParsedTemplate(parsedTemplate)
    } catch (err) {
      setParseError(true)
      setParsedTemplate(template)
    }
  }, [body])

  return (
    <MainLayout>
      <Flex justifyContent={'center'}>
        <VStack w='1200px' spacing={4}>
          <FormControl>
            <OgImageGenerator
              //@ts-ignore
              title={parsedTemplate.marketsGroupTitle ?? 'Title'}
              //@ts-ignore
              category={parsedTemplate.marketsGroupCategory ?? 'Category'}
              onBlobGenerated={(blob) => {
                console.log('Blob generated', blob)
                const _ogLogo = new File([blob], 'og.png', {
                  type: blob.type,
                  lastModified: Date.now(),
                })
                console.log('Blob transformed to File', _ogLogo)

                setOgLogo(_ogLogo)
              }}
              generateBlob={isGeneratingOgImage}
            />
            <Textarea
              value={body}
              height={'600px'}
              w={'full'}
              mt={2}
              contentEditable={true}
              onChange={(e) => {
                setBody(e.target.value)
              }}
              onBlur={() => generateOgImage()}
              borderColor={parseError ? 'red' : 'auto'}
            />
            <ButtonGroup spacing='6' mt={5}>
              <Button variant='outline' width='222px' disabled>
                Cancel
              </Button>
              {isCreating ? (
                <Box width='222px' display='flex' justifyContent='center' alignItems='center'>
                  <Spinner />
                </Box>
              ) : (
                <Button colorScheme='blue' width='222px' height='52px' onClick={createMarket}>
                  Create
                </Button>
              )}
            </ButtonGroup>
          </FormControl>
        </VStack>
      </Flex>
    </MainLayout>
  )
}

export default CreateOwnMarketPage
