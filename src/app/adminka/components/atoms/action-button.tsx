import { Text, Button, HStack } from '@chakra-ui/react'
import Loader from '@/components/common/loader'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'
import { Market } from '@/types'
import { DraftMarket } from '@/types/draft'

export interface AdminActionButtonProps {
  selectedMarkets: Market[] | DraftMarket[]
  duplicateAction?: () => Promise<void>
  resolveAction?: () => Promise<void>
  createAction?: () => Promise<void>
  isLoading?: boolean
}
export const AdminActionButton = ({
  selectedMarkets,
  duplicateAction,
  resolveAction,
  createAction,
  isLoading,
}: AdminActionButtonProps) => {
  return (
    <HStack position='fixed' bottom='40px' p='12px' bg='grey.800' borderRadius='12px'>
      <Text
        {...paragraphRegular}
        color='grey.600'
      >{`${selectedMarkets.length} markets selected`}</Text>
      {duplicateAction ? (
        <Button
          onClick={duplicateAction}
          variant='outlined'
          w='fit-content'
          borderColor='grey.100'
          _hover={{ bg: 'grey.800' }}
          isDisabled={isLoading}
        >
          <Text {...paragraphMedium} color='grey.50'>
            Duplicate
          </Text>
        </Button>
      ) : null}

      {resolveAction ? (
        <Button variant='contained' w='fit-content' onClick={resolveAction}>
          {isLoading ? <Loader /> : 'Resolve Selected'}
        </Button>
      ) : null}

      {createAction ? (
        <Button variant='contained' w='fit-content' onClick={createAction}>
          {isLoading ? <Loader /> : 'Create Market Batch'}
        </Button>
      ) : null}
    </HStack>
  )
}
