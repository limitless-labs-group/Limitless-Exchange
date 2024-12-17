'use client'

import { Box } from '@chakra-ui/react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function TextEditor({
  value = '',
  readOnly = false,
  onChange,
  style,
}: {
  value?: string
  readOnly?: boolean
  onChange?: (value: string) => void
  style?: React.CSSProperties
}) {
  return (
    <Box className={readOnly ? 'read-only' : ''} overflow='hidden'>
      <ReactQuill
        theme={readOnly ? undefined : 'snow'}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        modules={{ toolbar: readOnly ? false : true }} // Disable toolbar in read mode
        style={style}
      />
    </Box>
  )
}
