import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import React from 'react'
import './carousel.css'

type CarouselProps = {
  slides: JSX.Element[]
  options?: EmblaOptionsType
}

export default function Carousel({ slides, options }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options)

  return (
    <section className='embla'>
      <div className='embla__viewport' ref={emblaRef}>
        <div className='embla__container'>
          {slides.map((slide, index) => (
            <div className='embla__slide' key={index}>
              <div className='embla__slide__number'>{slide}</div>
            </div>
          ))}
        </div>
      </div>
      <div className='embla__controls'></div>
    </section>
  )
}
