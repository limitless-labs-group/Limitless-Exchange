import { Button } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import { useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { ClickEvent, useAmplitude } from '@/services'
import { useAxiosPrivateClient } from '@/services/AxiosPrivateClient'

export default function EnterTheGameButton() {
  const queryClient = useQueryClient()
  const [showNewMessage, setShowNewMessage] = useState<boolean>(false)
  const [hideButton, setHideButton] = useState<boolean>(!!Cookies.get('points-button-clicked'))

  const privateClient = useAxiosPrivateClient()

  const { trackClicked } = useAmplitude()

  const onClickButton = async () => {
    setShowNewMessage(true)
    trackClicked(ClickEvent.PointsButtonClicked, {
      page: 'Portfolio Page',
    })
    await privateClient.post('points/enroll')
    await sleep(5)
    setHideButton(true)
    await queryClient.refetchQueries({
      queryKey: ['portfolio'],
    })
  }

  return hideButton ? null : (
    <Button variant='contained' onClick={onClickButton}>
      {showNewMessage ? "You're in" : 'Enter the Game'}
    </Button>
  )
}
