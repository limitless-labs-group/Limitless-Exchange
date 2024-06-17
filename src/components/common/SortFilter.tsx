import React, { useEffect, useState } from 'react'
import {
  Text,
  HStack,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  useDisclosure,
} from '@chakra-ui/react'
import { LuArrowUpDown, LuCheck } from 'react-icons/lu'
import { v4 as uuidv4 } from 'uuid'
import TextButton from '@/components/common/buttons/TextButton'
import { colors } from '@/styles'
import { Sort } from '@/types'

type SortFilterProps = {
  onChange: (option: Sort) => void
}

const sortOptions = [Sort.NEWEST, Sort.COMING_DEADLINE, Sort.HIGHEST_LIQUIDITY, Sort.HIGHEST_VOLUME]

export default function SortFilter({ onChange }: SortFilterProps) {
  const { onOpen, onClose, isOpen } = useDisclosure()

  const [selectedSortFilter, setSelectedSortFilter] = useState<Sort>(Sort.BASE)

  const handleFilterItemClicked = (option: Sort) => {
    setSelectedSortFilter(option)
    onClose()
  }

  useEffect(() => {
    onChange(selectedSortFilter)
  }, [selectedSortFilter])

  return (
    <HStack minH={'33px'} spacing={2} wrap={'wrap'}>
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement={'bottom-start'}>
        <PopoverTrigger>
          <HStack cursor='pointer'>
            <LuArrowUpDown />
            {selectedSortFilter === Sort.BASE ? (
              <Text>Sort</Text>
            ) : (
              <Text fontWeight={600} color={colors.brand}>
                {selectedSortFilter}
              </Text>
            )}
          </HStack>
        </PopoverTrigger>
        <Portal>
          <PopoverContent bg={'bg'} border={`1px solid ${colors.border}`} w={'fit-content'} p={3}>
            <TextButton onClick={() => setSelectedSortFilter(Sort.BASE)} label='Clear all' py={2} />
            {sortOptions.map((option) => (
              <TextButton
                key={uuidv4()}
                label={option}
                h={'33px'}
                fontWeight={'normal'}
                onClick={() => handleFilterItemClicked(option)}
                py={2}
                rightIcon={option === selectedSortFilter ? <LuCheck /> : undefined}
              />
            ))}
          </PopoverContent>
        </Portal>
      </Popover>
    </HStack>
  )
}
