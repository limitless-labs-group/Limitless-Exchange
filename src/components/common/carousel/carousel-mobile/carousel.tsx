import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import React, { useCallback, useEffect, useState } from 'react'
import './carousel.css'
import { Market, MarketGroup } from '@/types'

type CarouselProps = {
  slides: JSX.Element[]
  markets: (Market | MarketGroup)[]
  options?: EmblaOptionsType
}

export default function Carousel({ slides, options }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options)
  const [activeSlide, setActiveSlide] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const activeSlide = emblaApi.selectedScrollSnap()
    setActiveSlide(activeSlide)
    // onOpenMarketPage(markets[activeSlide], 'Medium Banner')
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect) // Trigger on each slide change
    onSelect() // Set initial active slide
  }, [emblaApi, onSelect])

  return (
    <section className='embla_mobile'>
      <div className='embla__viewport_mobile' ref={emblaRef}>
        <div className='embla__container_mobile'>
          {slides.map((slide, index) => (
            <div
              className={`embla__slide_mobile ${
                index === activeSlide ? 'is-active' : 'is-inactive'
              }`}
              key={index}
            >
              <div className='embla__slide__number_mobile'>{slide}</div>
            </div>
          ))}
        </div>
      </div>
      <div className='embla__controls_mobile'></div>
    </section>
  )
}
