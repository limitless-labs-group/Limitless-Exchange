import { Button } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ClickEvent, useAccount, useAmplitude } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

export default function EnterTheGameButton() {
  const { profileData } = useAccount()
  const queryClient = useQueryClient()
  const [showNewMessage, setShowNewMessage] = useState<boolean>(false)
  const [hideButton, setHideButton] = useState<boolean>(
    profileData?.enrolledInPointsProgram || false
  )

  const privateClient = useAxiosPrivateClient()

  const { trackClicked } = useAmplitude()

  const onClickButton = async () => {
    if (showNewMessage) {
      return
    }
    setShowNewMessage(true)
    trackClicked(ClickEvent.PointsButtonClicked, {
      page: 'Portfolio Page',
    })
    await privateClient.post('points/enroll')
    await sleep(5)
    setHideButton(true)
    await queryClient.refetchQueries({
      queryKey: ['positions'],
    })
  }

  return hideButton ? null : (
    <Button variant='contained' onClick={onClickButton}>
      {showNewMessage ? "You're in" : 'Enter the Game'}
    </Button>
  )
}
