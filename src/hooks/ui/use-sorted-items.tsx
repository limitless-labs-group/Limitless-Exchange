import { useMemo } from 'react'

interface ElementWithId {
  id: number
  node: React.ReactNode
}

interface UseSortedItemsProps<T> {
  items: T[]
  condition: (item: T) => boolean
  render: (item: T) => ElementWithId
}

export function useSortedItems<T>({ items, condition, render }: UseSortedItemsProps<T>) {
  const [checkedItems, uncheckedItems] = useMemo(() => {
    const checked: ElementWithId[] = []
    const unchecked: ElementWithId[] = []

    items?.forEach((item: T) => {
      const isChecked = condition(item)
      const renderedItem = render(item)

      if (isChecked) {
        checked.push(renderedItem)
      } else {
        unchecked.push(renderedItem)
      }
    })

    return [checked, unchecked]
  }, [items, condition, render])

  return { checkedItems, uncheckedItems }
}
