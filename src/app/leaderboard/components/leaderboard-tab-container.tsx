import { Heading } from '@chakra-ui/react'
import React, { PropsWithChildren } from 'react'
import { h1Bold } from '@/styles/fonts/fonts.styles'

interface LeaderboardTabContainerProps {
  heading: string
}

export default function LeaderboardTabContainer({
  heading,
  children,
}: PropsWithChildren<LeaderboardTabContainerProps>) {
  return (
    <>
      <Heading as='h1' {...h1Bold} gap={2} userSelect='text' textAlign='center'>
        {heading}
      </Heading>
      {children}
    </>
  )
}
