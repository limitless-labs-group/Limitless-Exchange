import { isMobile } from 'react-device-detect'
import LeadersDesktop from '@/app/leaderboard/components/leaders-desktop'
import LeadersMobile from '@/app/leaderboard/components/leaders-mobile'

export default function Leaders() {
  return isMobile ? <LeadersMobile /> : <LeadersDesktop />
}
