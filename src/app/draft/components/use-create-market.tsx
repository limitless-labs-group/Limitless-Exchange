import { useToast } from '@chakra-ui/react'
import { toZonedTime } from 'date-fns-tz'
import { useAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
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
import { useCategories } from '@/services'
import { useTags } from '@/services/TagService'
import { Category, Market } from '@/types'
import { Tag, IFormData, SelectOption, MarketData, MarketInput } from '@/types/draft'
import { findDuplicateMarketGroupTitles } from '@/utils/market'

export function dailyToEpochRewards(daily: number) {
  return daily / (24 * 60) // 24 hours, 60 minutes
}

export function epochToDailyRewards(epoch: number) {
  return Math.round(epoch * 24 * 60).toString() // 24 hours, 60 minutes
}

export const calculateMinSize = (size: number | undefined) => {
  if (!size) return 0
  return size * 10 ** 6
}

export const calculateMaxSpread = (spread: number | undefined) => {
  if (!spread) return 0
  return Number((spread / 100 + 0.005).toFixed(3))
}

export const reverseCalculateMinSize = (size: number | undefined) => {
  if (!size) return 0
  return size / 10 ** 6
}

export const reverseCalculateMaxSpread = (spread: number | undefined) => {
  if (!spread) return 0
  const res = Number(((spread - 0.005) * 100).toFixed(3))
  return res > 0 ? res : 0
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

  const { data: categories } = useCategories()
  const { data: tags } = useTags()

  const toast = useToast()
  const showToast = (message: string) => {
    const id = toast({
      render: () => <Toast title={message} id={id} />,
    })
  }

  const populateDraftMarketData = (draftMarket: any) => {
    if (!draftMarket) return
    console.log('draft', draftMarket)

    setFormData((prevFormData) => ({
      ...prevFormData,
      title: draftMarket.title ?? '',
      description: draftMarket.description ?? '',
      deadline: toZonedTime(draftMarket.deadline, 'UTC'),
      token: draftMarket.collateralToken
        ? { symbol: draftMarket.collateralToken.symbol, id: draftMarket.collateralToken.id }
        : prevFormData.token,
      liquidity:
        draftMarket.draftMetadata?.liquidity ??
        tokenLimits[draftMarket.collateralToken.symbol]?.min,
      probability: (draftMarket.draftMetadata?.initialProbability ?? 0) * 100 || defaultProbability,
      marketFee: draftMarket.draftMetadata?.fee ?? defaultMarketFee,
      isBannered: draftMarket.metadata?.isBannered ?? false,
      tag:
        draftMarket.tags.map((tag: Tag) => ({
          id: tag.id,
          value: tag.name,
          label: tag.name,
        })) ?? [],
      creatorId: draftMarket.creator?.id ?? defaultCreatorId,
      categories:
        draftMarket.categories.map((cat: Category) => ({
          id: cat.id,
          value: cat.name,
          label: cat.name,
        })) ?? [],
      type: draftMarket.type,
      priorityIndex: draftMarket.priorityIndex,
      timezone: 'Etc/GMT',
      ...(isClob
        ? {
            minSize: reverseCalculateMinSize(draftMarket.settings?.minSize),
            maxSpread: reverseCalculateMaxSpread(draftMarket.settings?.maxSpread),
            c: draftMarket.settings?.c,
            rewardsEpoch: draftMarket.settings?.rewardsEpoch,
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
          settings: {
            maxSpread: reverseCalculateMaxSpread(Number(market.settings?.maxSpread)) ?? 0,
            c: Number(market.settings?.c) ?? 0,
            rewardsEpoch: Number(market.settings?.rewardsEpoch) ?? 0,
            minSize: reverseCalculateMinSize(Number(market.settings?.minSize)) ?? 0,
          },
        }))
      )
    }
  }

  const populateActiveMarketData = (activeMarket: Market) => {
    if (!activeMarket) return

    setFormData((prevFormData) => ({
      ...prevFormData,
      id: activeMarket.id,
      title: activeMarket.title ?? '',
      description: activeMarket.description ?? '',
      deadline: toZonedTime(activeMarket.expirationTimestamp, 'UTC'),
      marketFee: 0,
      priorityIndex: activeMarket.priorityIndex,
      isBannered: activeMarket.metadata?.isBannered ?? false,
      tag:
        activeMarket.tags.map((tag: string | Tag) => {
          const tagName = typeof tag === 'string' ? tag : tag.name ?? ''
          const tagId = typeof tag === 'string' ? tag : tag.id ?? ''
          return {
            id: tagId,
            value: tagName,
            label: tagName,
          }
        }) ?? [],
      creatorId: activeMarket.creator?.name ?? defaultCreatorId,
      categories:
        activeMarket.categories.map((cat: string | Category) => {
          const catName = typeof cat === 'string' ? cat : cat.name ?? ''
          const catId = typeof cat === 'string' ? cat : cat.id ?? ''
          return {
            id: String(catId),
            value: catName,
            label: catName,
          }
        }) ?? [],
      slug: activeMarket.slug ?? '',
      timezone: 'Etc/GMT',
      ...(activeMarket.tradeType === 'clob'
        ? {
            minSize: reverseCalculateMinSize(activeMarket.settings?.minSize),
            maxSpread: reverseCalculateMaxSpread(activeMarket.settings?.maxSpread),
            c: activeMarket.settings?.c,
            rewardsEpoch: Number(activeMarket.settings?.rewardsEpoch ?? 0),
          }
        : {}),
    }))
    if (
      activeMarket.marketType === 'group' &&
      activeMarket.tradeType === 'clob' &&
      activeMarket.markets &&
      activeMarket.markets.length > 0
    ) {
      setMarketType('group')
      setMarkets(
        activeMarket.markets.map((market) => ({
          title: market.title ?? '',
          description: market.description ?? '',
          id: market.id,
          settings: {
            maxSpread: reverseCalculateMaxSpread(Number(market.settings?.maxSpread)) ?? 0,
            c: Number(market.settings?.c) ?? 0,
            rewardsEpoch: Number(market.settings?.rewardsEpoch) ?? 0,
            minSize: reverseCalculateMinSize(Number(market.settings?.minSize)) ?? 0,
          },
        }))
      )
    }
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

  const calculateZonedTime = (deadline: Date, timezone: string): number => {
    const currentTimezoneOffset =
      parseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone).offset ?? 1
    const formTimezoneOffset = parseTimezone(timezone)?.offset ?? 1
    const differenceInOffset = currentTimezoneOffset - formTimezoneOffset
    return new Date(deadline).getTime() + differenceInOffset * 60 * 60 * 1000
  }

  const createOption = (id: string, name: string): SelectOption => ({
    id,
    label: name,
    value: name,
  })

  const prepareDraftMarketData = (): MarketData | null => {
    if (!validateData()) {
      return null
    }

    const {
      title,
      description,
      token,
      marketFee,
      isBannered,
      creatorId,
      ogLogo,
      deadline,
      timezone,
      priorityIndex,
    } = formData

    const matchedCategoryIds = formData.categories.map((cat) => {
      const matchedCategory = categories?.find((c) => c.name === cat.value)
      return matchedCategory ? Number(matchedCategory.id) : Number(cat.id)
    })

    const matchedTagIds = formData.tag.map((tag) => {
      const matchedTag = tags?.find((t) => t.label === tag.value)
      return matchedTag ? Number(matchedTag.id) : Number(tag.id)
    })
    const tokenId = token.id

    const baseData = {
      title: title ?? '',
      tokenId,
      marketFee,
      deadline: String(calculateZonedTime(deadline, timezone)),
      isBannered: isBannered,
      creatorId: creatorId ?? '',
      categoryIds: matchedCategoryIds,
      ogFile: ogLogo as File | null,
      tagIds: matchedTagIds,
      priorityIndex: priorityIndex ?? undefined,
    }

    if (isClob) {
      return {
        ...baseData,
        description: description ?? '',
        minSize: formData.minSize !== undefined ? calculateMinSize(formData.minSize) : undefined,
        maxSpread: calculateMaxSpread(formData.maxSpread),
        c: formData.c,
        rewardsEpoch: formData.rewardsEpoch,
      }
    } else if (isGroup) {
      return {
        ...baseData,
        marketsInput: markets.map((market) => ({
          ...market,
          settings: {
            ...market.settings,
            minSize: calculateMinSize(market.settings?.minSize),
            maxSpread: calculateMaxSpread(market.settings?.maxSpread),
            c: Number(market.settings?.c),
            rewardsEpoch: Number(market.settings?.rewardsEpoch),
          },
        })),
      }
    } else {
      return {
        ...baseData,
        description: description ?? '',
        liquidity: formData.liquidity ?? 0,
        initialYesProbability: formData.probability ? formData.probability / 100 : 0,
      }
    }
  }

  const prepareActiveMarketData = () => {
    if (!validateData()) {
      return null
    }

    const matchedCategoryIds = formData.categories.map((cat) => {
      const matchedCategory = categories?.find((c) => c.name === cat.value)
      return matchedCategory ? Number(matchedCategory.id) : Number(cat.id)
    })

    const matchedTagIds = formData.tag.map((tag) => {
      const matchedTag = tags?.find((t) => t.label === tag.value)
      return matchedTag ? Number(matchedTag.id) : Number(tag.id)
    })
    const { id, title, isBannered, deadline, timezone } = formData

    const baseData = {
      id,
      title,
      isBannered,
      categoryIds: matchedCategoryIds,
      tagIds: matchedTagIds,
      deadline: String(calculateZonedTime(deadline, timezone)),
      priorityIndex: formData.priorityIndex,
    }

    if (isClob) {
      return {
        ...baseData,
        description: formData.description ?? '',
        minSize: calculateMinSize(Number(formData.minSize)),
        maxSpread: calculateMaxSpread(Number(formData.maxSpread)),
        c: Number(formData.c),
        rewardsEpoch: formData.rewardsEpoch,
      }
    } else if (isGroup) {
      return {
        ...baseData,
        marketsInput: markets.map((market) => ({
          ...market,
          settings: {
            ...market.settings,
            minSize: calculateMinSize(market.settings?.minSize),
            maxSpread: calculateMaxSpread(market.settings?.maxSpread),
            c: Number(market.settings?.c),
            rewardsEpoch: Number(market.settings?.rewardsEpoch),
          },
        })),
      }
    } else {
      return {
        ...baseData,
        description: formData.description ?? '',
      }
    }
  }

  const prepareMarketData = (isActiveMarket = false) => {
    const result = isActiveMarket ? prepareActiveMarketData() : prepareDraftMarketData()
    return result
  }

  const validateData = (): boolean => {
    const { probability, liquidity, title, description, deadline, creatorId, token } = formData

    const missingFields: string[] = []

    if (!title) missingFields.push('Title')
    if (!description && !isGroup) missingFields.push('Description')
    if (!creatorId) missingFields.push('Creator')
    if (isNaN(token.id) || !deadline) {
      missingFields.push('Token id or Deadline')
    }
    if (isAmm && (!probability || !liquidity)) {
      missingFields.push('Liq or Prob')
    }

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
          return false
        }

        if (invalidMarkets.length > 0) {
          showToast(
            `All markets in the group must have both title and description. Please check market${
              invalidMarkets.length > 1 ? 's' : ''
            } #${markets.findIndex((m) => !m.title?.trim() || !m.description?.trim()) + 1}`
          )
          return false
        }
      }
    }

    if (missingFields.length > 0) {
      showToast(`${missingFields.join(', ')} ${missingFields.length > 1 ? 'are' : 'is'} required!`)
      return false
    }

    return true
  }

  const memoizedHandleChange = useCallback(
    <K extends keyof IFormData>(
      field: string,
      value: IFormData[K] | MultiValue<SelectOption> | MarketInput[]
    ) => {
      handleChange(field, value)
    },
    [setFormData]
  )

  const memoizedPopulateDraftMarketData = useCallback(
    (draftMarket: any) => {
      populateDraftMarketData(draftMarket)
    },
    [setFormData, setMarketType, setMarkets, isGroup]
  )

  const memoizedPopulateActiveMarketData = useCallback(
    (activeMarket: Market) => {
      populateActiveMarketData(activeMarket)
    },
    [setFormData]
  )

  const memoizedHandleTokenSelect = useCallback(
    (option: React.ChangeEvent<HTMLSelectElement>) => {
      handleTokenSelect(option)
    },
    [handleChange]
  )

  const memoizedCreateOption = useCallback(
    (id: string, name: string): SelectOption => createOption(id, name),
    []
  )

  const memoizedPrepareMarketData = useCallback(
    (isActiveMarket = false) => prepareMarketData(isActiveMarket),
    [formData, markets, isClob, isAmm, isGroup, validateData, categories, tags]
  )

  return useMemo(
    () => ({
      handleChange: memoizedHandleChange,
      populateDraftMarketData: memoizedPopulateDraftMarketData,
      populateActiveMarketData: memoizedPopulateActiveMarketData,
      handleTokenSelect: memoizedHandleTokenSelect,
      createOption: memoizedCreateOption,
      prepareMarketData: memoizedPrepareMarketData,
    }),
    [
      memoizedHandleChange,
      memoizedPopulateDraftMarketData,
      memoizedPopulateActiveMarketData,
      memoizedHandleTokenSelect,
      memoizedCreateOption,
      memoizedPrepareMarketData,
    ]
  )
}
