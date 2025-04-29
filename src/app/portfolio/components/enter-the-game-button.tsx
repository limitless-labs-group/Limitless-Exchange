import { Button } from '@chakra-ui/react'
import { sleep } from '@etherspot/prime-sdk/dist/sdk/common'
import Cookies from 'js-cookie'
import { useState } from 'react'
import { ClickEvent, useAmplitude } from '@/services'

export default function EnterTheGameButton() {
  const [showNewMessage, setShowNewMessage] = useState<boolean>(false)
  const [hideButton, setHideButton] = useState<boolean>(!!Cookies.get('points-button-clicked'))

  const { trackClicked } = useAmplitude()

  const onClickButton = async () => {
    setShowNewMessage(true)
    trackClicked(ClickEvent.PointsButtonClicked, {
      page: 'Portfolio Page',
    })
    await sleep(5)
    Cookies.set('points-button-clicked', 'true')
    setHideButton(true)
  }

  return hideButton ? null : (
    <Button variant='contained' onClick={onClickButton}>
      {showNewMessage ? "You're in" : 'Enter the Game'}
    </Button>
  )
}
