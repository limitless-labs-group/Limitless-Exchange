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
  className?: string
  onBlur?: () => Promise<void> | undefined
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
  // Check for common HTML tags, including self-closing tags and tags with attributes
  const htmlTagRegex = /<(?:\/)?(?:p|div|span|a|strong|em|ul|ol|li|br|img|h[1-6])\b[^>]*>/i

  // Check for HTML entities
  const htmlEntityRegex = /&[a-z]+;|&#\d+;/i

  return htmlTagRegex.test(text) || htmlEntityRegex.test(text)
}

export default function TextEditor({
  value = '',
  readOnly = false,
  onChange,
  style,
  className,
  onBlur,
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
  const getClassNames = (className?: string, readOnly?: boolean): string => {
    const classes: string[] = []

    if (className) {
      classes.push(className)
    }

    if (readOnly) {
      classes.push('read-only')
    }

    return classes.join(' ')
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
        className={getClassNames(className, readOnly)}
        onChange={onChange}
        modules={{ toolbar: !readOnly }} // Disable toolbar in read mode
        style={style}
        onBlur={async () => {
          if (onBlur) {
            await onBlur()
          }
        }}
      />
    </Box>
  )
}
