import { isMobile } from 'react-device-detect'

export const h1Regular = {
  fontSize: '32px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '36px',
  color: 'grey.800',
}

export const h2Medium = {
  fontSize: '24px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '28px',
  color: 'grey.800',
}

export const headline = {
  fontSize: isMobile ? '20px' : '16px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '20px',
  color: 'grey.800',
}

export const paragraphRegular = {
  fontSize: isMobile ? '16px' : '14px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '20px',
  color: 'grey.800',
}

export const paragraphMedium = {
  fontSize: isMobile ? '16px' : '14px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '16px',
  color: 'grey.800',
}

export const paragraphBold = {
  fontSize: isMobile ? '16px' : '14px',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: '20px',
  color: 'grey.800',
}

export const controlsMedium = {
  fontSize: isMobile ? '16px' : '14px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '16px',
  color: 'grey.800',
}

export const captionRegular = {
  fontSize: isMobile ? '14px' : '12px',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '16px',
  color: 'grey.800',
}

export const captionMedium = {
  fontSize: isMobile ? '14px' : '12px',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '16px',
  color: 'grey.800',
}

export const headlineRegular = {
  fontSize: isMobile ? '20px' : '16px',
  fontStyle: 'normal',
  fontWeight: isMobile ? 500 : 400,
  lineHeight: '20px',
  color: 'grey.800',
}

export const headLineLarge = {
  fontSize: isMobile ? '24px' : '48px',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: isMobile ? '22px' : '44px',
  color: 'black',
}
