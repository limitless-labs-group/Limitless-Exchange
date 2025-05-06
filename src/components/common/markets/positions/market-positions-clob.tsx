import { HStack, VStack, Text, Divider, Box, Button, useDisclosure } from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { isMobile } from 'react-device-detect'
import { formatUnits } from 'viem'
import DeleteOrderModal from '@/components/common/modals/delete-order-modal'
import Paper from '@/components/common/paper'
import Skeleton from '@/components/common/skeleton'
import { useMarketOrders } from '@/hooks/use-market-orders'
import ThumbsDownIcon from '@/resources/icons/thumbs-down-icon.svg'
import ThumbsUpIcon from '@/resources/icons/thumbs-up-icon.svg'
import { useTradingService } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'
import { ClobPosition } from '@/types/orders'

export default function MarketPositionsClob() {
  const { market } = useTradingService()
  const { data: userOrders, isLoading } = useMarketOrders(market?.slug)
  const privateClient = useAxiosPrivateClient()
  const queryClient = useQueryClient()
  const { isOpen: isOpenDeleteOrderModal, onToggle: toggleDeleteOrderModal } = useDisclosure()

  const handleDeleteOrder = async (orderId: string) => {
    await privateClient.delete(`/orders/${orderId}`)
    await queryClient.refetchQueries({
      queryKey: ['user-orders', market?.slug],
    })
    await queryClient.refetchQueries({
      queryKey: ['locked-balance', market?.slug],
    })
  }

  const getOutcome = (order: ClobPosition) => {
    const orderSide = order.side === 'BUY' ? 'Buy' : 'Sell'
    const outcome = market?.tokens.yes === order.token ? 'Yes' : 'No'
    return (
      <HStack gap='8px' w='full' justifyContent='space-between'>
        <HStack>
          <Text {...paragraphMedium} color={order.side === 'BUY' ? 'green.500' : 'red.500'}>
            {orderSide}
          </Text>
          <HStack gap='4px'>
            {outcome === 'Yes' ? (
              <ThumbsUpIcon height={16} width={16} />
            ) : (
              <ThumbsDownIcon height={16} width={16} />
            )}
            <Text {...paragraphMedium}>{outcome}</Text>
          </HStack>
        </HStack>
        <Button
          {...paragraphMedium}
          color='red.500'
          p={0}
          h='unset'
          onClick={toggleDeleteOrderModal}
        >
          Delete ⛌
        </Button>
      </HStack>
    )
  }

  return (
    <VStack w='full' gap='8px' mt='12px'>
      {isLoading
        ? [...Array(4)].map((index) => <Skeleton height={isMobile ? 206 : 112} key={index} />)
        : userOrders?.map((order) => (
            <Paper key={order.id} w='full'>
              <HStack w='full' justifyContent='space-between'>
                {getOutcome(order)}
              </HStack>
              <Divider my='8px' />
              <HStack w='full' justifyContent='space-between'>
                <Box>
                  <Text {...paragraphMedium} color='grey.500' mb='4px'>
                    Price
                  </Text>
                  <Text {...paragraphMedium}>¢ {(+order.price * 100).toFixed()}</Text>
                </Box>
                <Box>
                  <Text {...paragraphMedium} color='grey.500' mb='4px'>
                    Shares total
                  </Text>
                  <Text {...paragraphMedium} textAlign='center'>
                    {formatUnits(BigInt(order.originalSize), market?.collateralToken.decimals || 6)}
                  </Text>
                </Box>
                <Box>
                  <Text {...paragraphMedium} color='grey.500' mb='4px'>
                    Shares remaining
                  </Text>
                  <Text {...paragraphMedium} textAlign='center'>
                    {formatUnits(
                      BigInt(order.remainingSize),
                      market?.collateralToken.decimals || 6
                    )}
                  </Text>
                </Box>
              </HStack>
              <DeleteOrderModal
                isOpen={isOpenDeleteOrderModal}
                onClose={toggleDeleteOrderModal}
                onDeleteOrder={() => handleDeleteOrder(order.id)}
              />
            </Paper>
          ))}
    </VStack>
  )
}
