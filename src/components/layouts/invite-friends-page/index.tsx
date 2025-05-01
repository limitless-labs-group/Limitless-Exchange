import {
  Box,
  Button,
  Divider,
  HStack,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import Avatar from '@/components/common/avatar'
import Paper from '@/components/common/paper'
import Skeleton from '@/components/common/skeleton'
import TablePagination from '@/components/common/table-pagination'
import NoInvitedFriendsSection from '@/components/layouts/invite-friends-page/components/no-invited-friends-section'
import ReferralLinkButton from '@/components/layouts/invite-friends-page/components/referral-link-button'
import { useReferralsTotalVolume } from '@/hooks/use-referrals-total-volume'
import CloseIcon from '@/resources/icons/close-icon.svg'
import HeartIcon from '@/resources/icons/heart-icon.svg'
import VolumeIcon from '@/resources/icons/volume-icon.svg'
import { ChangeEvent, useAccount, useAmplitude } from '@/services'
import {
  h1Bold,
  h3Bold,
  h3Medium,
  headlineRegular,
  paragraphMedium,
  paragraphRegular,
} from '@/styles/fonts/fonts.styles'
import { NumberUtil, timeSinceCreation } from '@/utils'
import { cutUsername } from '@/utils/string'

export default function InviteFriendsPage() {
  const { setReferralPageOpened, refLink, referralData } = useAccount()
  const [currentPage, setCurrentPage] = useState(1)
  const { trackChanged } = useAmplitude()

  const { data, isLoading: referralsVolumeLoading } = useReferralsTotalVolume()

  const statisticsData = [
    {
      icon: <HeartIcon width={16} height={16} />,
      text: 'Invited people',
      value: <Text {...h3Medium}>{referralData?.referralData?.length || 0}</Text>,
    },
    {
      icon: <VolumeIcon width={16} height={16} />,
      text: 'Total volume traded',
      value: referralsVolumeLoading ? (
        <Box w='64px'>
          <Skeleton height={24} />
        </Box>
      ) : (
        <Text {...h3Medium}>
          {NumberUtil.convertToSymbols(data?.referees_trading_usd || 0)} USD
        </Text>
      ),
    },
  ]

  const handlePageChange = (val: number) => {
    trackChanged(ChangeEvent.ReferalsTablePageChanged, {
      platform: isMobile ? 'Mobile' : 'Desktop',
      currentPage: val,
    })
    setCurrentPage(val)
  }

  const startIndex = (currentPage - 1) * 10
  const endIndex = startIndex + 10

  const currentPageItems = referralData?.referralData.slice(startIndex, endIndex)

  const totalPages = referralData?.referralData.length
    ? Math.ceil(referralData.referralData.length / 10)
    : 1

  return (
    <Box onClick={(e) => e.stopPropagation()} px={isMobile ? '16px' : 0} mb={isMobile ? '40px' : 0}>
      {!isMobile && (
        <Button variant='outlined' onClick={() => setReferralPageOpened(false)} mb='12px'>
          <CloseIcon width={16} height={16} />
          Close
        </Button>
      )}
      <Text mt='24px' {...h1Bold}>
        Invite Friends
      </Text>
      <Text mt='8px' {...headlineRegular}>
        Share smarter thinking
      </Text>
      <Text mt='12px' {...paragraphMedium} maxW={isMobile ? 'unset' : '90%'}>
        Invite friends to explore the future through financial prediction markets—and track the
        impact of your invites below.
      </Text>
      <Text mt='28px' {...paragraphMedium}>
        Your referral link
      </Text>
      <HStack w='full' gap='16px' mt='8px'>
        <Input variant='grey' disabled value={refLink} />
        <ReferralLinkButton />
      </HStack>
      <Divider my='24px' />
      <HStack w='full' gap='8px' flexDirection={isMobile ? 'column' : 'row'}>
        {statisticsData.map((data) => (
          <Paper key={data.text} p='16px' w='full'>
            <HStack gap='8px' mb='32px' color='grey.500'>
              {data.icon}
              <Text {...paragraphMedium} color='grey.500'>
                {data.text}
              </Text>
            </HStack>
            {data.value}
          </Paper>
        ))}
      </HStack>
      <Text {...h3Bold} mt='24px'>
        People who signed up
      </Text>
      <TableContainer overflow={'auto'} mt='16px' mb='8px'>
        <Table variant={'simple'}>
          <Thead>
            <Tr>
              <Th w='220px'>Username</Th>
              <Th w='170px' textAlign='right'>
                Joined
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentPageItems?.slice(0, 10).map((user) => (
              <Tr key={user.createdAt}>
                <Td>
                  <HStack gap='4px'>
                    <Avatar account={user.displayName} avatarUrl={user.pfpUrl} />
                    <Text {...paragraphRegular}>{cutUsername(user.displayName, 24)}</Text>
                  </HStack>
                </Td>
                <Td>
                  <Text {...paragraphRegular} textAlign='end'>
                    {timeSinceCreation(new Date(user.createdAt).getTime() / 1000)} ago
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <TablePagination
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
      />
      {!Boolean(referralData?.referralData.length) && <NoInvitedFriendsSection />}
    </Box>
  )
}
