import { Table, TableContainer, Tbody, Th, Thead, Tr, Td } from '@chakra-ui/react'
import React from 'react'
import { PostTable, PostTableRow, PostValue } from '@/types/blog'

interface BlogTableProps {
  header: PostValue[]
  rows: PostTableRow[]
}

export default function BlogTable({ header, rows }: BlogTableProps) {
  console.log(rows)
  return (
    <TableContainer overflow={'auto'} mb='24px'>
      <Table variant={'grey'}>
        <Thead>
          <Tr>
            {header.map((header) => (
              <Th key={header.value}>{header.value}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row, index) => (
            <Tr key={index}>
              {row.value.map((value, index) => (
                <Td key={index}>{value.value}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
