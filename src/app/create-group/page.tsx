'use client'

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  HStack,
  List,
  ListItem,
  Spinner,
  Textarea,
  VStack,
  Text,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Multicall } from 'ethereum-multicall'
import { ethers } from 'ethers'
import React, { useState, useEffect } from 'react'
import { Toast } from '@/components/common/toast'
import { OgImageGenerator } from '@/app/draft/components'
import { MainLayout } from '@/components'
import { defaultChain } from '@/constants'
import { conditionalTokensABI } from '@/contracts'
import { useToast } from '@/hooks'
import { createQuestionId } from '@/utils/ctf.utils'

interface MarketsGroupMetadata {
  marketsGroupTitle: string
  marketsGroupCategory: string
  marketsGroupCollateralToken: string
  marketsGroupLiquidity: number
  marketsGroupCreator: string
  marketsGroupDeadline: string
  marketsGroupTags: string[]
  markets: MarketMetadata[]
}

interface SafeToken {
  tokenInfo: {
    decimals: number
    symbol: string
  }
  balance: string
}

type MarketMetadata = {
  title: string
  description: string
  startingYesProbability: number
}

type ConditioMetadata = {
  name: string
  created: boolean
}

enum BalanceStatusCheck {
  VALID,
  INVALID,
  NOT_INIT,
}

const CreateOwnMarketPage = () => {
  const metadata: MarketsGroupMetadata = {
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
  const [isCheckingConditionId, setIsCheckingConditionId] = useState<boolean>(false)
  const [isCheckingBalance, setIsCheckingBalance] = useState<boolean>(false)
  const [marketsGroupMetadata, setMarketsGroupMetadata] = useState(
    JSON.stringify(metadata, null, 2)
  )
  const [parseError, setParseError] = useState(false)
  const [ogLogo, setOgLogo] = useState<File | undefined>()
  const [existingConditionIDs, setExistingConditionIDs] = useState<ConditioMetadata[] | []>([])
  const [parsedTemplate, setParsedTemplate] = useState<MarketsGroupMetadata>(metadata)
  const [isBalanceValid, setIsBalanceValid] = useState<BalanceStatusCheck>(
    BalanceStatusCheck.NOT_INIT
  )

  const { mutateAsync: generateOgImage, isPending: isGeneratingOgImage } = useMutation({
    mutationKey: ['generate-og-image'],
    mutationFn: async () => new Promise((resolve) => setTimeout(resolve, 1_000)),
  })

  const toast = useToast()

  const createMulticallInstance = () => {
    return new Multicall({
      ethersProvider: new ethers.providers.JsonRpcProvider(
        defaultChain.rpcUrls.default.http.toString()
      ),
      tryAggregate: true,
      multicallCustomContractAddress: defaultChain.contracts.multicall3.address,
    })
  }

  const getContractAddresses = () => {
    const isDefaultChain = defaultChain?.id === 8453
    return {
      conditionalTokenAddress: isDefaultChain
        ? '0xC9c98965297Bc527861c898329Ee280632B76e18'
        : '0x828Fd8B3544021590bA9F9A994ADDB8B44DDd951',
      oracleAddress: isDefaultChain
        ? '0x32e52896663De88a65c2D94917b006404415A89f'
        : '0x4c3C0583dEb9E081b2481FB26E8e5aD914Dcee23',
      outcomeSlotCount: 2,
    }
  }

  const checkTheBalance = async () => {
    setIsCheckingBalance(true)
    setExistingConditionIDs([])

    try {
      const addresses = getContractAddresses()
      const balanceRes = await axios.get(
        `https://safe-client.safe.global/v1/chains/${defaultChain.id}/safes/${addresses.oracleAddress}/balances/USD?trusted=false&exclude_spam=true`
      )

      const items = balanceRes.data.items as SafeToken[]
      const token = items.findLast(
        (item) => item.tokenInfo.symbol === parsedTemplate.marketsGroupCollateralToken
      )

      const totalBalanceForNewMarkets =
        Number(parsedTemplate.marketsGroupLiquidity * parsedTemplate.markets.length) *
        Math.pow(10, token?.tokenInfo.decimals || 18)
      const safeBalance = Number(token?.balance)

      setIsBalanceValid(
        safeBalance > totalBalanceForNewMarkets
          ? BalanceStatusCheck.VALID
          : BalanceStatusCheck.INVALID
      )
    } catch (err) {
      toast({
        render: () => <Toast title={`Validation failed`} id={1} />,
      })
    } finally {
      setIsCheckingBalance(false)
    }
  }

  /**
   * Transform title -> question id -> condition id
   *
   * Important highlight that condition id EXISTS for all titles/question
   * even if they are not registered in conditional token contract
   *
   * returns title and condition id to maintain tracebility
   */
  const getConditionIds = async () => {
    const multicall = createMulticallInstance()
    const addresses = getContractAddresses()

    const titles = (JSON.parse(marketsGroupMetadata) as MarketsGroupMetadata).markets.map(
      (market) => market.title
    )

    const contractCallContext = titles.map((title) => {
      const questionID = createQuestionId(title)

      return {
        reference: questionID,
        contractAddress: addresses.conditionalTokenAddress,
        abi: conditionalTokensABI,
        calls: [
          {
            reference: 'getConditionId',
            methodName: 'getConditionId',
            methodParameters: [addresses.oracleAddress, questionID, addresses.outcomeSlotCount],
          },
        ],
      }
    })

    const results = await multicall.call(contractCallContext)

    return titles.map((title) => {
      const questionID = createQuestionId(title)
      const conditionID = results.results[questionID].callsReturnContext[0].returnValues[0]

      return { title, conditionID }
    })
  }

  /**
   * Check that condition ids have some outcome slots, if it returns not 0 that means question is registered already
   *
   */
  const checkConditionIDs = async () => {
    setIsCheckingConditionId(true)
    setIsBalanceValid(BalanceStatusCheck.NOT_INIT)

    try {
      const multicall = createMulticallInstance()
      const addresses = getContractAddresses()
      const conditionIDs = await getConditionIds()

      const contractCallContext = conditionIDs.map((titleObj) => {
        return {
          reference: titleObj.conditionID,
          contractAddress: addresses.conditionalTokenAddress,
          abi: conditionalTokensABI,
          calls: [
            {
              reference: 'getOutcomeSlotCount',
              methodName: 'getOutcomeSlotCount',
              methodParameters: [titleObj.conditionID],
            },
          ],
        }
      })

      const results = await multicall.call(contractCallContext)

      setExistingConditionIDs(
        conditionIDs.map((titleObj) => {
          const result = results.results[titleObj.conditionID].callsReturnContext[0]
          return {
            name: titleObj.title,
            created: BigInt(result.returnValues[0].hex) !== BigInt(0),
          } as ConditioMetadata
        })
      )
    } catch (err) {
      toast({
        render: () => <Toast title={`Validation failed`} id={1} />,
      })
    } finally {
      setIsCheckingConditionId(false)
    }
  }

  const createMarket = async () => {
    setIsCreating(true)

    const _body = JSON.parse(marketsGroupMetadata) as MarketsGroupMetadata

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
      .post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/markets-groups/admin`, formData, {
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
      const parsedTemplate = JSON.parse(marketsGroupMetadata) as MarketsGroupMetadata
      setParseError(false)
      setParsedTemplate(parsedTemplate)
    } catch (err) {
      setParseError(true)
      setParsedTemplate(metadata)
    }
  }, [marketsGroupMetadata])

  return (
    <MainLayout>
      <Flex justifyContent={'center'}>
        <VStack w='1200px' spacing={4}>
          <FormControl>
            <OgImageGenerator
              title={parsedTemplate.marketsGroupTitle ?? 'Title'}
              categories={[]}
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
              value={marketsGroupMetadata}
              height={'600px'}
              w={'full'}
              mt={2}
              contentEditable={true}
              onChange={(e) => {
                setMarketsGroupMetadata(e.target.value)
              }}
              onBlur={() => generateOgImage()}
              borderColor={parseError ? 'red' : 'auto'}
            />
            <ButtonGroup spacing='6' mt={5}>
              <HStack>
                {isCheckingConditionId ? (
                  <Box width='222px' display='flex' justifyContent='center' alignItems='center'>
                    <Spinner />
                  </Box>
                ) : (
                  <Button
                    colorScheme='blue'
                    width='222px'
                    height='52px'
                    onClick={checkConditionIDs}
                  >
                    Condition check
                  </Button>
                )}
                {isCheckingBalance ? (
                  <Box width='222px' display='flex' justifyContent='center' alignItems='center'>
                    <Spinner />
                  </Box>
                ) : (
                  <Button colorScheme='blue' width='222px' height='52px' onClick={checkTheBalance}>
                    Balance check
                  </Button>
                )}
                {isCreating ? (
                  <Box width='222px' display='flex' justifyContent='center' alignItems='center'>
                    <Spinner />
                  </Box>
                ) : (
                  <Button
                    bg='black'
                    color='white'
                    width='222px'
                    height='52px'
                    onClick={createMarket}
                  >
                    Create
                  </Button>
                )}
              </HStack>
              <HStack>
                {isBalanceValid !== BalanceStatusCheck.NOT_INIT &&
                  (isBalanceValid === BalanceStatusCheck.INVALID ? (
                    <Text color={'red'}>{"Don't create the market, not enough funds"}</Text>
                  ) : (
                    <Text color={'green'}>
                      {'Safe has enough funds, proceed with market creation'}
                    </Text>
                  ))}
                <List>
                  {existingConditionIDs.map((condition) => {
                    if (condition.created) {
                      return (
                        <ListItem key={condition.name}>
                          {condition.name} has already created
                        </ListItem>
                      )
                    }
                  })}
                </List>
              </HStack>
            </ButtonGroup>
          </FormControl>
        </VStack>
      </Flex>
    </MainLayout>
  )
}

export default CreateOwnMarketPage
