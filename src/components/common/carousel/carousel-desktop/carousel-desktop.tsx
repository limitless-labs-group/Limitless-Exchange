import { useToken } from '@chakra-ui/react'
import { EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import React from 'react'
import './carousel-desktop.css'
import { DotButton, useDotButton } from './dot-button'

type PropType = {
  slides: JSX.Element[]
  options?: EmblaOptionsType
}

export default function CarouselMobile({ slides, options }: PropType) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ playOnInit: true, delay: 10000 }),
  ])

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)

  const [grey800, grey300] = useToken('colors', ['grey.800', 'grey.300'])

  return (
    <section className='embla' dir='ltr'>
      <div className='embla__viewport' ref={emblaRef}>
        <div className='embla__container'>
          {slides?.map((slide, index) => (
            <div className='embla__slide' key={index}>
              <div className='embla__slide__number'>{slide}</div>
            </div>
          ))}
        </div>
      </div>

      <div className='embla__controls'>
        <div className='embla__dots'>
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={'embla__dot'.concat(
                index === selectedIndex ? ' embla__dot--selected' : ''
              )}
              style={{
                background: index === selectedIndex ? grey800 : grey300,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
