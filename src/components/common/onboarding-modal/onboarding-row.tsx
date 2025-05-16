import { Text, HStack, Stack, Divider, Checkbox } from '@chakra-ui/react'
import CheckedIcon from '@/resources/icons/checked-icon.svg'
import { paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

export interface OnboardRowProps {
  key?: number
  isChecked?: boolean
  title: string
  description?: string
  points?: string
  onToggle?: () => void
}

export const OnboardRow = ({
  key,
  isChecked,
  title,
  description,
  points,
  onToggle,
}: OnboardRowProps) => {
  const withCheckbox = typeof isChecked === 'boolean'
  return (
    <>
      {!withCheckbox ? <Divider borderColor='grey.200' /> : null}
      <HStack key={key} gap='12px' alignItems='start'>
        {withCheckbox ? (
          <Checkbox
            isChecked={!!isChecked}
            onChange={onToggle}
            mt='3px'
            icon={<CheckedIcon color='grey.50' width={12} height={12} />}
            variant='green'
          />
        ) : null}

        <Stack gap='4px'>
          <HStack justifyContent='space-between'>
            <Text
              {...paragraphMedium}
              color={isChecked ? 'grey.500' : undefined}
              textDecoration={!!isChecked ? 'line-through' : undefined}
              pl={!withCheckbox ? '23px' : 0}
            >
              {title}
            </Text>
            <Stack>
              {points ? (
                <Text
                  {...paragraphMedium}
                  color={isChecked ? 'grey.500' : undefined}
                  textDecoration={isChecked ? 'line-through' : undefined}
                >
                  {points}
                </Text>
              ) : null}
            </Stack>
          </HStack>
          {description ? (
            <Text {...paragraphRegular} color='grey.500'>
              {description}
            </Text>
          ) : null}
        </Stack>
      </HStack>
    </>
  )
}
