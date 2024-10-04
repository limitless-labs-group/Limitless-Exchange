import { MarketFeedData } from '@/hooks/use-market-feed'
import TradeActivityTabItem from '@/app/(markets)/markets/[address]/components/trade-activity-tab-item'
import { Text, VStack } from '@chakra-ui/react'
import Paper from '@/components/common/paper'
import ActivityIcon from '@/resources/icons/activity-icon.svg'
import { headline, paragraphRegular } from '@/styles/fonts/fonts.styles'

interface MarketActivityTabProps {
  activity?: MarketFeedData[]
}

export default function MarketActivityTab({ activity }: MarketActivityTabProps) {
  return !!activity?.length ? (
    activity.map((activityItem) => (
      <TradeActivityTabItem tradeItem={activityItem} key={activityItem.bodyHash} />
    ))
  ) : (
    <VStack w='full' mt='24px'>
      <Paper p='16px'>
        <ActivityIcon width={24} height={24} />
      </Paper>
      <Text {...headline} mt='4px'>
        No recent activity
      </Text>
      <Text {...paragraphRegular}>Get started by selecting an outcome</Text>
    </VStack>
  )
}
