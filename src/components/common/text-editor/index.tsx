'use client'

import { Box } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export type TextEditorProps = Readonly<{
  value?: string
  readOnly?: boolean
  onChange?: (value: string) => void
  style?: React.CSSProperties
}>

const linkify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const escapeHtml = (unsafe: string) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  return text.replace(urlRegex, (url) =>
    isValidUrl(url)
      ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
          url
        )}</a>`
      : url
  )
}

const isFormattedText = (text: string): boolean => {
  const htmlTagRegex = /<\/?[a-z][\s\S]*>/i
  return htmlTagRegex.test(text)
}

export default function TextEditor({
  value = '',
  readOnly = false,
  onChange,
  style,
}: TextEditorProps) {
  const isHtml = isFormattedText(value)

  //need for keeping both options (plain text and html) for transition period
  const getFormattedValue = (value: string): string => {
    if (readOnly) {
      if (isHtml) {
        return value
      }
      return linkify(value)
    }
    return value
  }

  return (
    <Box
      className={readOnly ? 'read-only' : ''}
      overflow={readOnly ? 'visible' : 'hidden'}
      zIndex={1}
    >
      <ReactQuill
        theme={readOnly ? undefined : 'snow'}
        value={getFormattedValue(value)}
        readOnly={readOnly}
        onChange={onChange}
        modules={{ toolbar: !readOnly }} // Disable toolbar in read mode
        style={style}
      />
    </Box>
  )
}
