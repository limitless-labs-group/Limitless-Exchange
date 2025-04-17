'use client'

import { Box } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'
import { isFormattedText, formatTextWithLinks } from '@/utils/html-utils'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export type TextEditorProps = Readonly<{
  value?: string
  readOnly?: boolean
  onChange?: (value: string) => void
  style?: React.CSSProperties
  className?: string
}>

export default function TextEditor({
  value = '',
  readOnly = false,
  onChange,
  style,
  className,
}: TextEditorProps) {
  const isHtml = isFormattedText(value)

  //need for keeping both options (plain text and html) for transition period
  const getFormattedValue = (value: string): string => {
    if (!value) return ''

    if (readOnly) {
      return formatTextWithLinks(value, isHtml)
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
        className={getClassNames(className, readOnly)}
        value={getFormattedValue(value)}
        readOnly={readOnly}
        onChange={onChange}
        modules={{ toolbar: !readOnly }} // Disable toolbar in read mode
        style={{ ...style, wordBreak: 'break-all' }}
      />
    </Box>
  )
}
