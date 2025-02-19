import DOMPurify from 'dompurify'
import { htmlToText } from 'html-to-text'

export const linkify = (text: string): string => {
  const urlRegex = /(\()?((https?:\/\/[^\s)]+))/g
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
  return text.replace(urlRegex, (match, openParen, url, cleanUrl) => {
    let lastIndex = cleanUrl.length - 1
    const punctuationChars = new Set(['.', ',', '!', '?', ';', ':', ')'])

    while (lastIndex >= 0 && punctuationChars.has(cleanUrl[lastIndex])) {
      lastIndex--
    }

    const finalUrl = cleanUrl.substring(0, lastIndex + 1)
    const trailingPunctuation = cleanUrl.substring(lastIndex + 1)

    const prefix = openParen || ''

    return isValidUrl(finalUrl)
      ? `${prefix}<a href="${escapeHtml(
          finalUrl
        )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
          finalUrl
        )}</a>${trailingPunctuation}`
      : match
  })
}

export const stripHTML = (html: string): string => {
  if (typeof window === 'undefined') return html
  const tmp = document.createElement('div')
  try {
    tmp.innerHTML = DOMPurify.sanitize(html)
    return tmp.textContent || tmp.innerText || ''
  } finally {
    tmp.remove()
  }
}

export const isFormattedText = (text: string): boolean => {
  if (!text || typeof text !== 'string') return false
  const htmlPatterns = [
    /<[a-z][\s\S]*?>/i, // General HTML tags
    /&(?:#\d+|\w+);/, // HTML entities
    /<(p|div|span|a|strong|em|u|s|ul|ol|li|br|img|h[1-6]|blockquote|pre|code)\b/i, // Quill-related tags
  ]

  const containsHtmlTags = htmlPatterns.some((regex) => regex.test(text))
  const strippedText = stripHTML(text)
  const isPlainText = strippedText === text

  return containsHtmlTags || !isPlainText
}

export const formatTextWithLinks = (value: string, isHtml: boolean): string => {
  if (!value) return ''
  if (typeof window === 'undefined') {
    if (isHtml) {
      return value
        .replace(
          /<(p|div|span|a|strong|em|u|s|ul|ol|li|br|img|h[1-6]|blockquote|pre|code)[^>]*>|<\/[^>]*>|&(?:#\d+|\w+);/gi,
          ' '
        )
        .replace(/\s+/g, ' ')
        .trim()
    }
    return value
  }

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

  if (isHtml) {
    walkTextNodes(div)
    return div.innerHTML
  }

  return linkify(value)
}

export const convertHtmlToText = (htmlContent: string) => {
  return htmlToText(htmlContent, {
    wordwrap: 130,
    selectors: [{ selector: 'a', options: { ignoreHref: true } }],
  })
}
