import { Link, Text, List, ListItem, Stack } from '@chakra-ui/react'
import { captionMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { DraftMarket } from '@/types/draft'

export type SelectedMarketsProps = {
  markets: Market[] | DraftMarket[]
}

export const SelectedMarketsList = ({ markets }: SelectedMarketsProps) => {
  return !!markets.length ? (
    <List
      display='flex'
      bg='grey.100'
      p='12px'
      flexDirection='column'
      color='grey.800'
      borderRadius='12px'
      maxWidth='350px'
      width='100%'
    >
      <Stack gap='16px'>
        <Text {...captionMedium} color='grey.500' textTransform='uppercase'>
          Selected markets
        </Text>
        {markets?.map((market) => (
          <ListItem key={market.id} width='100%'>
            <Link
              href={`#${market.id}`}
              display='block'
              overflow='hidden'
              textOverflow='ellipsis'
              whiteSpace='nowrap'
              width='100%'
              borderBottom='1px solid'
              borderColor='grey.300'
            >
              <Text {...paragraphRegular} color='grey.800'>
                {market.title}
              </Text>
            </Link>
          </ListItem>
        ))}
      </Stack>
    </List>
  ) : null
}
