import { Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react'
import React, { PropsWithChildren } from 'react'
import { isMobile } from 'react-device-detect'

interface LeaderboardTableContainerProps {
  valueName: string
}

export default function LeaderboardTableContainer({
  valueName,
  children,
}: PropsWithChildren<LeaderboardTableContainerProps>) {
  return (
    <TableContainer overflow={'auto'} mt='16px' mb='8px' px={isMobile ? '16px' : 0}>
      <Table variant={'simple'}>
        <Thead>
          <Tr>
            <Th w='28px'></Th>
            <Th w='220px'>Username</Th>
            <Th w='170px' textAlign='right'>
              {valueName}
            </Th>
          </Tr>
        </Thead>
        <Tbody>{children}</Tbody>
      </Table>
    </TableContainer>
  )
}
