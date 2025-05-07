import { Button, ButtonProps } from '@chakra-ui/react'
import { setTimeout } from '@wry/context'
import React, { useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import CopyIcon from '@/resources/icons/copy-icon.svg'

interface CopyButtonProps extends ButtonProps {
  link: string
  onCopyClicked: () => void
  startIcon?: boolean
  endIcon?: boolean
}

export default function CopyButton({
  link,
  startIcon = false,
  endIcon = false,
  onCopyClicked,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let hideRefCopiedMessage: NodeJS.Timeout | undefined

    if (copied) {
      hideRefCopiedMessage = setTimeout(() => {
        setCopied(false)
      }, 2000)
    }

    return () => {
      if (hideRefCopiedMessage) {
        clearTimeout(hideRefCopiedMessage)
      }
    }
  }, [copied])

  return (
    //@ts-ignore
    <CopyToClipboard
      text={link}
      onCopy={() => {
        onCopyClicked()
        setCopied(true)
      }}
    >
      <Button {...props} justifyContent='flex-start'>
        {startIcon && <CopyIcon width='16px' height='16px' />}
        {copied ? 'Copied' : 'Copy Link'}
        {endIcon && <CopyIcon width='16px' height='16px' />}
      </Button>
    </CopyToClipboard>
  )
}
