import { Button, HStack, Text } from '@chakra-ui/react'
import ChevronDownIcon from '@/resources/icons/chevron-down-icon.svg'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

type TablePaginationProps = {
  totalPages: number
  currentPage: number
  onPageChange: (val: number) => void
}

export default function TablePagination({
  totalPages,
  currentPage,
  onPageChange,
}: TablePaginationProps) {
  if (totalPages < 2) {
    return null
  }
  const renderPagination = () => {
    const pages = []
    const showDots = totalPages > 5

    if (showDots) {
      if (currentPage === 3) {
        pages.push(1)
      }
      if (currentPage > 3) {
        pages.push(1, '...') // +
      }

      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
        pages.push(i)
      }

      if (currentPage === totalPages - 2) {
        pages.push(totalPages)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...', totalPages)
      }
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    }

    return pages.map((page, index) =>
      typeof page === 'number' ? (
        <Button
          key={index}
          variant='transparent'
          onClick={() => onPageChange(page)}
          color={currentPage === page ? 'grey.800' : 'grey.500'}
          p='8px'
          h='unset'
        >
          {page}
        </Button>
      ) : (
        <Text key={index} {...paragraphMedium} color='grey.500'>
          {page}
        </Text>
      )
    )
  }
  return (
    <HStack gap='8px'>
      <Button
        variant='transparent'
        color='grey.500'
        transform='rotate(90deg)'
        p='4px'
        h='unset'
        onClick={() => {
          if (currentPage !== 1) {
            onPageChange(currentPage - 1)
          }
        }}
      >
        <ChevronDownIcon />
      </Button>
      {renderPagination()}
      <Button
        variant='transparent'
        color='grey.500'
        transform='rotate(270deg)'
        p='4px'
        h='unset'
        onClick={() => {
          if (currentPage !== totalPages) {
            onPageChange(currentPage + 1)
          }
        }}
      >
        <ChevronDownIcon />
      </Button>
    </HStack>
  )
}
