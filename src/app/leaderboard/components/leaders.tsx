import { isMobile } from 'react-device-detect'
import LeadersDesktop from '@/app/leaderboard/components/leaders-desktop'
import LeadersMobile from '@/app/leaderboard/components/leaders-mobile'
import { LeaderboardEntity } from '@/hooks/use-leaderboard'

interface LeadersProps {
  data?: LeaderboardEntity[]
}

export default function Leaders({ data }: LeadersProps) {
  return isMobile ? <LeadersMobile data={data} /> : <LeadersDesktop data={data} />
}
