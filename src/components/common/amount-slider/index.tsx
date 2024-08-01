import { isMobile } from 'react-device-detect'
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@chakra-ui/react'

interface AmountSliderProps {
  variant: 'base' | 'white'
  value: number
  disabled: boolean
  onSlide: (val: number) => void
}

export default function AmountSlider({ variant, value, disabled, onSlide }: AmountSliderProps) {
  const sliderTrackColor = variant === 'white' ? 'rgba(255, 255, 255, 0.2)' : 'grey.300'
  const sliderBgColor = variant === 'white' ? 'white' : 'grey.800'
  return (
    <Slider
      aria-label='slider-ex-6'
      value={value}
      onChange={onSlide}
      // onMouseEnter={() => setShowTooltip(true)}
      // onMouseLeave={() => setShowTooltip(false)}
      // onChangeEnd={() => setCollateralAmount(displayAmount)}
      isDisabled={disabled}
      focusThumbOnChange={false}
      h={isMobile ? '40px' : '8px'}
      py={isMobile ? '0px !important' : '4px'}
    >
      <SliderTrack bg={sliderTrackColor}>
        <SliderFilledTrack bg={sliderBgColor} />
      </SliderTrack>
      <SliderThumb bg={sliderBgColor} w='8px' h='8px' />
    </Slider>
  )
}
