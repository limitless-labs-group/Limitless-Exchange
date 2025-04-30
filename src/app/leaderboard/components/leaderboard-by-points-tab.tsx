import { Box, HStack, Link, Td, Tr } from '@chakra-ui/react'
import NextLink from 'next/link'
import React from 'react'
import Avatar from '@/components/common/avatar'
import LeaderIcon from '@/app/leaderboard/components/leader-icon'
import LeaderboardTabContainer from '@/app/leaderboard/components/leaderboard-tab-container'
import LeaderboardTableContainer from '@/app/leaderboard/components/leaderboard-table-container'
import { paragraphRegular } from '@/styles/fonts/fonts.styles'
import { NumberUtil } from '@/utils'

export default function LeaderboardByPointsTab() {
  return (
    <LeaderboardTabContainer heading='Points Leaderboard'>
      <Box>
        <LeaderboardTableContainer valueName='Points'>
          {/*{leaderboardStats?.data?.data.map((data, index) => (*/}
          {/*  <Tr key={index}>*/}
          {/*    <Td h='44px'>*/}
          {/*      {currentPage === 1 && index < 3 ? (*/}
          {/*        <LeaderIcon index={index} />*/}
          {/*      ) : (*/}
          {/*        `${(currentPage - 1) * 10 + (index + 1)}`*/}
          {/*      )}*/}
          {/*    </Td>*/}
          {/*    <Td>*/}
          {/*      <HStack gap='4px'>*/}
          {/*        <Avatar account={data.account} avatarUrl={data.pfpUrl} />*/}
          {/*        <NextLink*/}
          {/*          href={`https://basescan.org/address/${data.account}`}*/}
          {/*          target='_blank'*/}
          {/*          rel='noopener'*/}
          {/*          passHref*/}
          {/*        >*/}
          {/*          <Link variant='textLinkSecondary' {...paragraphRegular} isExternal>*/}
          {/*            {getUserDisplayName(data)}*/}
          {/*          </Link>*/}
          {/*        </NextLink>*/}
          {/*      </HStack>*/}
          {/*    </Td>*/}
          {/*    /!*<Td>{data.outcome}</Td>*!/*/}
          {/*    /!*<Td textAlign='right'>{data.shares}</Td>*!/*/}
          {/*    <Td textAlign='right'>*/}
          {/*      {NumberUtil.convertWithDenomination(data.totalVolume, 0)} USDC*/}
          {/*    </Td>*/}
          {/*  </Tr>*/}
          {/*))}*/}
        </LeaderboardTableContainer>
      </Box>
    </LeaderboardTabContainer>
  )
}
