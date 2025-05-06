import { Button } from '@chakra-ui/react'
import { setTimeout } from '@wry/context'
import { useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { isMobile } from 'react-device-detect'
import { ClickEvent, useAccount, useAmplitude } from '@/services'

export default function ReferralLinkButton() {
  const [refCopied, setRefCopied] = useState(false)

  const { trackClicked } = useAmplitude()
  const { refLink } = useAccount()

  const onRefLinkCopy = () => {
    trackClicked(ClickEvent.CopyReferralClicked, {
      // @ts-ignore
      from: 'Invite Friend Page',
    })
    setRefCopied(true)
  }

  useEffect(() => {
    let hideRefCopiedMessage: NodeJS.Timeout | undefined

    if (refCopied) {
      hideRefCopiedMessage = setTimeout(() => {
        setRefCopied(false)
      }, 2000)
    }

    return () => {
      if (hideRefCopiedMessage) {
        clearTimeout(hideRefCopiedMessage)
      }
    }
  }, [refCopied])

  return (
    //@ts-ignore
    <CopyToClipboard text={refLink} onCopy={onRefLinkCopy}>
      <Button variant='contained' w={isMobile ? '112px' : '90px'}>
        {refCopied ? 'Copied' : 'Copy Link'}
      </Button>
    </CopyToClipboard>
  )
}
