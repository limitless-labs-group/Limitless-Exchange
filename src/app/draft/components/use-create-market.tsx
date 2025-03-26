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
import { formDataAtom, marketTypeAtom } from '@/atoms/draft'
import { Category, Market } from '@/types'
import { Tag, IFormData, SelectOption, MarketData } from '@/types/draft'

export function dailyToEpochRewards(daily: number) {
  return daily / (24 * 60) // 24 hours, 60 minutes
}

export function epochToDailyRewards(epoch: number) {
  return epoch * (24 * 60) // 24 hours, 60 minutes
}

export const useCreateMarket = () => {
  const [formData, setFormData] = useAtom(formDataAtom)
  const [createClobMarket, setCreateClobMarket] = useAtom(marketTypeAtom)
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
      // Add CLOB-specific parameters if available
      ...(createClobMarket
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
      // Add CLOB-specific parameters if available
      ...(createClobMarket
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
    value: IFormData[K] | MultiValue<SelectOption>
  ) => {
    if (field === 'tag' && Array.isArray(value)) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [field]: [...value] as SelectOption[],
      }))
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

  const prepareMarketData = (formData: FormData): MarketData => {
    const tokenId = Number(formData.get('tokenId'))
    const marketFee = Number(formData.get('marketFee'))
    const deadline = Number(formData.get('deadline'))

    if (isNaN(tokenId) || isNaN(marketFee) || isNaN(deadline)) {
      throw new Error('Invalid numeric values in form data')
    }

    const title = formData.get('title')
    const description = formData.get('description')
    if (!title || !description) {
      throw new Error('Missing required fields')
    }

    const baseData = {
      title: title.toString(),
      description: description.toString(),
      tokenId,
      marketFee,
      deadline,
      isBannered: formData.get('isBannered') === 'true',
      creatorId: formData.get('creatorId')?.toString() ?? '',
      categoryIds: formData.get('categoryIds')?.toString() ?? '',
      ogFile: formData.get('ogFile') as File | null,
      tagIds: formData.get('tagIds')?.toString() ?? '',
      priorityIndex: formData.get('priorityIndex')?.toString() ?? '',
    }

    if (createClobMarket) {
      // Add CLOB-specific parameters
      const clobData: Record<string, any> = {}

      const minSize = formData.get('minSize')
      if (minSize) {
        // Ensure we're passing a number, not a string
        clobData.minSize = Number(minSize)
      }

      const maxSpread = formData.get('maxSpread')
      if (maxSpread) {
        clobData.maxSpread = Number(maxSpread)
      }

      const c = formData.get('c')
      if (c) {
        clobData.c = Number(c)
      }

      const maxDailyReward = formData.get('maxDailyReward')
      if (maxDailyReward) {
        clobData.maxDailyReward = Number(maxDailyReward)
      }

      return { ...baseData, ...clobData }
    } else {
      // AMM-specific parameters
      return {
        ...baseData,
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
      if (!description) missingFields.push('Description')
      if (!creatorId) missingFields.push('Creator')
      if (tag.length === 0) missingFields.push('Tag')

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
      if (!createClobMarket) {
        marketFormData?.set('liquidity', formData.liquidity?.toString() || '')
        marketFormData?.set('initialYesProbability', (formData.probability / 100).toString())
      } else {
        // Add CLOB-specific parameters
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
