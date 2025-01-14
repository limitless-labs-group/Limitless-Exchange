'use client'

import { Box } from '@chakra-ui/react'
import DOMPurify from 'dompurify'
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
  if (!text || typeof text !== 'string') return false
  const htmlPatterns = [
    /<[a-z][\s\S]*?>/i, // General HTML tags
    /&(?:#\d+|\w+);/, // HTML entities
    /<(p|div|span|a|strong|em|u|s|ul|ol|li|br|img|h[1-6]|blockquote|pre|code)\b/i, // Quill-related tags
  ]

  // Check if text matches any of the patterns
  const containsHtmlTags = htmlPatterns.some((regex) => regex.test(text))

  // Check if stripping HTML produces a different result
  const strippedText = stripHTML(text)
  const isPlainText = strippedText === text

  // Determine if the text is formatted
  return containsHtmlTags || !isPlainText
}

// Helper function to strip HTML
const stripHTML = (html: string): string => {
  const tmp = document.createElement('div')
  try {
    tmp.innerHTML = DOMPurify.sanitize(html) // Sanitize input for safety
    return tmp.textContent || tmp.innerText || ''
  } finally {
    tmp.remove()
  }
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
    if (!value) return ''

    if (readOnly) {
      if (isHtml) {
        const div = document.createElement('div')
        div.innerHTML = DOMPurify.sanitize(value)

        const walkTextNodes = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const newText = linkify(node.textContent || '')
            if (newText !== node.textContent) {
              const span = document.createElement('span')
              span.innerHTML = newText
              node.parentNode?.replaceChild(span, node)
            }
          } else {
            if (node.nodeName !== 'A') {
              node.childNodes.forEach(walkTextNodes)
            }
          }
        }

        walkTextNodes(div)
        return div.innerHTML
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
