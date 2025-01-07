import { Link, List, ListItem } from '@chakra-ui/react'

export type SelectedMarkets = {
  title: string
  id: number
}
export type SelectedMarketsProps = {
  market: SelectedMarkets[]
}

export const SelectedMarkets = ({ market }: SelectedMarketsProps) => {
  return !!market.length ? (
    <List
      display='flex'
      bg={'var(--chakra-colors-draftCard-selectedBg)'}
      p='5px'
      gap='5px'
      flexDirection='column'
      color='grey.800'
      borderRadius='5px'
      border={'2px dashed var(--chakra-colors-draftCard-border)'}
    >
      {market?.map((market: SelectedMarkets) => (
        <ListItem key={market.id}>
          <Link href={`#${market.id}`}>{market.title}</Link>
        </ListItem>
      ))}
    </List>
  ) : null
}