import {
  Heading,
  Text,
  ListItem,
  Box,
  Link,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Thead,
  UnorderedList,
  OrderedList,
  TableContainer,
} from '@chakra-ui/react'
import parse, { domToReact, HTMLReactParserOptions, Element, DOMNode } from 'html-react-parser'
import { isMobile } from 'react-device-detect'
import { h1Bold, h2Bold, paragraphMedium, paragraphRegular } from '@/styles/fonts/fonts.styles'

interface ContentParserProps {
  html: string
}

export default function ContentParser({ html }: ContentParserProps) {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode.type === 'tag') {
        const el = domNode as Element
        switch (el.name) {
          case 'h1':
            return (
              <Text {...(isMobile ? { ...h2Bold } : { ...h1Bold })} mb='24px'>
                {domToReact(el.children as DOMNode[], options)}
              </Text>
            )
          case 'h2':
            return (
              <Text mb='24px' {...paragraphMedium} fontSize='16px'>
                {domToReact(el.children as DOMNode[], options)}
              </Text>
            )
          case 'h3':
            return (
              <Heading as='h3' size='lg' my={4}>
                {domToReact(el.children as DOMNode[], options)}
              </Heading>
            )
          case 'h4':
            return (
              <Heading as='h4' size='md' my={4}>
                {domToReact(el.children as DOMNode[], options)}
              </Heading>
            )
          case 'p':
            return (
              <Text mb='24px' {...paragraphRegular} color='grey.700'>
                {domToReact(el.children as DOMNode[], options)}
              </Text>
            )
          case 'ul':
            return (
              <UnorderedList mb='24px'>
                {domToReact(el.children as DOMNode[], options)}
              </UnorderedList>
            )
          case 'ol':
            return (
              <OrderedList mb='24px'>{domToReact(el.children as DOMNode[], options)}</OrderedList>
            )
          case 'li':
            return (
              <ListItem {...paragraphRegular} color='grey.700' mb='16px'>
                {domToReact(el.children as DOMNode[], options)}
              </ListItem>
            )
          case 'a':
            return (
              <Link href={el.attribs.href} color='blue.500' isExternal>
                {domToReact(el.children as DOMNode[], options)}
              </Link>
            )
          case 'table':
            return (
              <TableContainer
                overflow={'auto'}
                mb='24px'
                borderRadius='6px'
                border='1px solid'
                borderColor='grey.300'
              >
                <Table variant={'grey'}>{domToReact(el.children as DOMNode[], options)}</Table>
              </TableContainer>
            )
          case 'thead':
            return <Thead>{domToReact(el.children as DOMNode[], options)}</Thead>
          case 'tbody':
            return <Tbody>{domToReact(el.children as DOMNode[], options)}</Tbody>
          case 'tr':
            return <Tr>{domToReact(el.children as DOMNode[], options)}</Tr>
          case 'td':
            return <Td>{domToReact(el.children as DOMNode[], options)}</Td>
          case 'th':
            return <Th bg='grey.300'>{domToReact(el.children as DOMNode[], options)}</Th>
          case 'img':
            return (
              <Box marginBottom='24px'>
                <img
                  src={el.attribs.src}
                  alt={el.attribs.alt || ''}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    objectFit: 'contain',
                    height: isMobile ? '240px' : '368px',
                  }}
                />
              </Box>
            )
        }
      }
    },
  }

  return <Box>{parse(html, options)}</Box>
}
