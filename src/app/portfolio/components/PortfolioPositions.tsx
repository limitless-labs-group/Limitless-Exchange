import { PortfolioPositionCard, PortfolioPositionCardMobile } from '@/app/portfolio/components'
import { useHistory } from '@/services'
import { Flex, Grid, GridProps, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useIsMobile } from '@/hooks'

export const PortfolioPositions = ({ ...props }: GridProps) => {
  const { positions, getPositions } = useHistory()
  const isMobile = useIsMobile()

  useEffect(() => {
    getPositions()
  }, [])

  return positions?.length == 0 ? (
    <Flex w={'full'} h={'200px'} justifyContent={'center'} alignItems={'center'}>
      <Text color={'fontLight'}>No open positions</Text>
    </Flex>
  ) : (
    <Grid
      templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
      gap={{ sm: 6, md: 10 }}
      {...props}
    >
      {positions?.map((position) =>
        isMobile ? (
          <PortfolioPositionCardMobile key={uuidv4()} position={position} />
        ) : (
          <PortfolioPositionCard key={uuidv4()} position={position} />
        )
      )}
    </Grid>
  )
}
