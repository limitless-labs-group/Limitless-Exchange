import { useToast } from '@chakra-ui/react'
import { toZonedTime } from 'date-fns-tz'
import { useAtom } from 'jotai'
import { MultiValue } from 'react-select'
import { allTimezones, useTimezoneSelect } from 'react-timezone-select'
import { Toast } from '@/components/common/toast'
import {
  tokenLimits,
  defaultProbability,
  defaultMarketFee,
  defaultCreatorId,
  defaultTokenSymbol,
} from './const'
import { draftMarketTypeAtom, formDataAtom, groupMarketsAtom } from '@/atoms/draft'
import { Category, Market } from '@/types'
import { Tag, IFormData, SelectOption, MarketData, MarketInput } from '@/types/draft'
import { findDuplicateMarketGroupTitles } from '@/utils/market'

export function dailyToEpochRewards(daily: number) {
  return daily / (24 * 60) // 24 hours, 60 minutes
}

export function epochToDailyRewards(epoch: number) {
  return epoch * (24 * 60) // 24 hours, 60 minutes
}

export const useCreateMarket = () => {
  const [formData, setFormData] = useAtom(formDataAtom)
  const [marketType, setMarketType] = useAtom(draftMarketTypeAtom)
  const [markets, setMarkets] = useAtom(groupMarketsAtom)
  const isClob = marketType === 'clob'
  const isAmm = marketType === 'amm'
  const isGroup = marketType === 'group'
  const { parseTimezone } = useTimezoneSelect({
    labelStyle: 'original',
    timezones: allTimezones,
  })
  const toast = useToast()
  const showToast = (message: string) => {
    const id = toast({
      render: () => <Toast title={message} id={id} />,
    })
  }

  const populateDraftMarketData = (draftMarket: any) => {
    if (!draftMarket) return

    setFormData((prevFormData) => ({
      ...prevFormData,
      title: draftMarket.title || '',
      description: draftMarket.description || '',
      deadline: toZonedTime(draftMarket.deadline, 'America/New_York'),
      token: draftMarket.collateralToken
        ? { symbol: draftMarket.collateralToken.symbol, id: draftMarket.collateralToken.id }
        : prevFormData.token,
      liquidity:
        draftMarket.draftMetadata?.liquidity ||
        tokenLimits[draftMarket.collateralToken.symbol]?.min,
      probability: draftMarket.draftMetadata?.initialProbability * 100 || defaultProbability,
      marketFee: draftMarket.draftMetadata?.fee || defaultMarketFee,
      isBannered: draftMarket.metadata?.isBannered || false,
      tag:
        draftMarket.tags.map((tag: Tag) => ({
          id: tag.id,
          value: tag.name,
          label: tag.name,
        })) ?? [],
      creatorId: draftMarket.creator?.id || defaultCreatorId,
      categories:
        draftMarket.categories.map((cat: Category) => ({
          id: cat.id,
          value: cat.name,
          label: cat.name,
        })) ?? [],
      type: draftMarket.type,
      priorityIndex: draftMarket.priorityIndex,
      ...(isClob
        ? {
            minSize: draftMarket.settings?.minSize,
            maxSpread: draftMarket.settings?.maxSpread,
            c: draftMarket.settings?.c,
            maxDailyReward: draftMarket.settings?.rewardsEpoch
              ? epochToDailyRewards(draftMarket.settings.rewardsEpoch)
              : undefined,
          }
        : {}),
    }))
    if (isGroup && draftMarket.markets?.length > 0) {
      setMarketType('group')
      setMarkets(
        draftMarket.markets.map((market: MarketInput) => ({
          title: market.title ?? '',
          description: market.description ?? '',
          id: market.id ?? '',
        }))
      )
    }
  }

  const populateActiveMarketData = (activeMarket: Market) => {
    if (!activeMarket) return

    setFormData((prevFormData) => ({
      ...prevFormData,
      title: activeMarket.title || '',
      description: activeMarket.description || '',
      deadline: toZonedTime(activeMarket.expirationTimestamp, 'America/New_York'),
      marketFee: 0,
      isBannered: activeMarket.metadata?.isBannered || false,
      tag:
        activeMarket.tags.map((tag: string | Tag) => {
          const tagName = typeof tag === 'string' ? tag : tag.name || ''
          const tagId = typeof tag === 'string' ? tag : tag.id || ''
          return {
            id: tagId,
            value: tagName,
            label: tagName,
          }
        }) ?? [],
      //TODO: creator id is not available in active markets
      creatorId: activeMarket.creator?.name || defaultCreatorId,
      categories:
        activeMarket.categories.map((cat: string | Category) => {
          const catName = typeof cat === 'string' ? cat : cat.name || ''
          const catId = typeof cat === 'string' ? cat : cat.id || ''
          return {
            id: String(catId),
            value: catName,
            label: catName,
          }
        }) ?? [],
      ...(isClob
        ? {
            minSize: activeMarket.settings?.minSize,
            maxSpread: activeMarket.settings?.maxSpread,
            c: activeMarket.settings?.c,
            maxDailyReward: activeMarket.settings?.rewardsEpoch
              ? epochToDailyRewards(activeMarket.settings.rewardsEpoch)
              : undefined,
          }
        : {}),
    }))
  }

  const handleChange = <K extends keyof IFormData>(
    field: string,
    value: IFormData[K] | MultiValue<SelectOption> | MarketInput[]
  ) => {
    if (Array.isArray(value)) {
      if (field === 'tag' || field === 'categories') {
        setFormData((prevFormData) => ({
          ...prevFormData,
          //@ts-ignore
          [field]: [...value] as TagOption[],
        }))
      }
      if (field === 'markets') {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [field]: [...value] as MarketInput[],
        }))
      }
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [field]: value as IFormData[K],
      }))
    }
  }

  const handleTokenSelect = (option: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTokenId = +option.target.value
    const selectedTokenSymbol =
      option.target.selectedOptions[0].getAttribute('data-name') ?? defaultTokenSymbol

    handleChange('token', { symbol: selectedTokenSymbol, id: selectedTokenId })
    handleChange('liquidity', tokenLimits[selectedTokenSymbol].min)
  }

  const createOption = (id: string, name: string): SelectOption => ({
    id,
    label: name,
    value: name,
  })

  const prepareMarketData = (formData: FormData): MarketData | null => {
    const tokenId = Number(formData.get('tokenId'))
    const marketFee = Number(formData.get('marketFee'))
    const deadline = Number(formData.get('deadline'))

    if (isNaN(tokenId) || isNaN(marketFee) || isNaN(deadline)) {
      showToast(`Invalid numeric values in form data`)
      return null
    }

    const title = formData.get('title')
    const description = formData.get('description')
    if (!title) {
      showToast(`Missing required fields`)
      return null
    }

    const baseData = {
      title: title?.toString() ?? '',
      tokenId,
      marketFee,
      deadline,
      isBannered: formData.get('isBannered') === 'true',
      creatorId: formData.get('creatorId')?.toString() ?? '',
      categoryIds: formData.get('categoryIds')?.toString() ?? '',
      ogFile: formData.get('ogFile') as File | null,
      tagIds: formData.get('tagIds')?.toString() ?? '',
    }

    if (isClob) {
      return {
        ...baseData,
        description: description?.toString() ?? '',
        priorityIndex: formData.get('priorityIndex')
          ? Number(formData.get('priorityIndex'))
          : undefined,
        minSize: formData.get('minSize') ? Number(formData.get('minSize')) : undefined,
        maxSpread: formData.get('maxSpread') ? Number(formData.get('maxSpread')) : undefined,
        c: formData.get('c') ? Number(formData.get('c')) : undefined,
        maxDailyReward: formData.get('maxDailyReward')
          ? Number(formData.get('maxDailyReward'))
          : undefined,
      }
    } else if (isGroup) {
      return {
        ...baseData,
        marketsInput: JSON.parse(formData.get('marketsInput')?.toString() ?? '[]'),
      }
    } else {
      return {
        ...baseData,
        priorityIndex: formData.get('priorityIndex')
          ? Number(formData.get('priorityIndex'))
          : undefined,
        description: description?.toString() ?? '',
        liquidity: Number(formData.get('liquidity')),
        initialYesProbability: Number(formData.get('initialYesProbability')),
      }
    }
  }

  const prepareData = async () => {
    try {
      const { title, description, creatorId, tag } = formData

      const missingFields: string[] = []

      if (!title) missingFields.push('Title')
      if (!description && !isGroup) missingFields.push('Description')
      if (!creatorId) missingFields.push('Creator')
      if (tag.length === 0) missingFields.push('Tag')

      if (isGroup) {
        if (!markets || markets.length < 2) {
          missingFields.push('At least 2 markets')
        } else {
          const invalidMarkets = markets.filter(
            (market) => !market.title?.trim() || !market.description?.trim()
          )

          const duplicatedTitles = findDuplicateMarketGroupTitles(markets)

          if (duplicatedTitles.length) {
            showToast(`All markets in the group must have unique titles.`)
            return
          }

          if (invalidMarkets.length > 0) {
            showToast(
              `All markets in the group must have both title and description. Please check market${
                invalidMarkets.length > 1 ? 's' : ''
              } #${markets.findIndex((m) => !m.title?.trim() || !m.description?.trim()) + 1}`
            )
            return
          }
        }
      }

      if (missingFields.length > 0) {
        showToast(
          `${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required!`
        )
        return
      }

      const differenceInOffset =
        (parseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone).offset ?? 1) -
        (parseTimezone(formData.timezone)?.offset ?? 1)
      const zonedTime = new Date(formData.deadline).getTime() + differenceInOffset * 60 * 60 * 1000

      const marketFormData = new FormData()
      marketFormData?.set('title', formData.title)
      marketFormData?.set('description', formData.description)
      marketFormData?.set('tokenId', formData.token.id.toString())
      if (isAmm) {
        marketFormData?.set('liquidity', formData.liquidity?.toString() || '')
        marketFormData?.set('initialYesProbability', (formData.probability / 100).toString())
      }
      if (isClob) {
        if (formData.minSize !== undefined) {
          marketFormData.set('minSize', formData.minSize.toString())
        }
        if (formData.maxSpread !== undefined) {
          marketFormData.set('maxSpread', formData.maxSpread.toString())
        }
        if (formData.c !== undefined) {
          marketFormData.set('c', formData.c.toString())
        }
        if (formData.maxDailyReward !== undefined) {
          marketFormData.set('maxDailyReward', formData.maxDailyReward.toString())
        }
      }
      marketFormData?.set('marketFee', formData.marketFee.toString())
      marketFormData?.set('deadline', zonedTime.toString())
      marketFormData?.set('isBannered', formData.isBannered.toString())

      if (isGroup && markets.length > 0) {
        marketFormData.set('marketsInput', JSON.stringify(markets))
      }

      if (formData.creatorId) {
        marketFormData.set('creatorId', formData.creatorId)
      }

      if (formData.categories.length) {
        marketFormData.set('categoryIds', formData.categories.map((c) => c.id).join(','))
      }

      if (formData.ogLogo) {
        marketFormData.set('ogFile', formData.ogLogo)
      }

      if (formData.tag.length) {
        marketFormData.set('tagIds', formData.tag.map((t) => t.id).join(','))
      }

      if (formData.priorityIndex) {
        marketFormData.set('priorityIndex', formData.priorityIndex.toString())
      }

      return marketFormData
    } catch (e) {}
  }

  return {
    handleChange,
    populateDraftMarketData,
    populateActiveMarketData,
    handleTokenSelect,
    createOption,
    prepareMarketData,
    prepareData,
  }
}
