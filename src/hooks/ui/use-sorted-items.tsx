import { useMemo } from 'react'

interface UseSortedItemsProps<T> {
  items: T[]
  condition: (item: T) => boolean
  render: (item: T) => React.ReactNode
}

export function useSortedItems<T>({ items, condition, render }: UseSortedItemsProps<T>) {
  const [checkedItems, uncheckedItems] = useMemo(() => {
    const checked: React.ReactNode[] = []
    const unchecked: React.ReactNode[] = []

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
