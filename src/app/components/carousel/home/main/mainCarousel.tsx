/* Description: This file contains the main carousel displayed in the carousel section 
   of the home page
*/
'use client';

import { EmblaOptionsType, EmblaPluginType } from 'embla-carousel'
import { DotButton, useDotButton } from './carouselDotButton'
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from './carouselArrowButton'
import useEmblaCarousel from 'embla-carousel-react'
import styles from './carousel.module.css'

type PropType = {
  slides: React.JSX.Element[]
  options?: EmblaOptionsType,
  plugins?: EmblaPluginType[],
  classNames?: string[],
}

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options, plugins } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins)

  const { selectedIndex, scrollSnaps, onDotButtonClick } =
    useDotButton(emblaApi)

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi)

  return (
    <section className={`${styles.embla} ${(props.classNames) ? props.classNames.join(' '): ''}`}>
      <div className={styles.embla__viewport} ref={emblaRef}>
        {/* carousel slides go here */}
        <div className={styles.embla__container}>
          {slides.map((element, index) => (
            <div className={styles.embla__slide} key={index}>
              {element}
            </div>
          ))}
        </div>
      </div>

      <div>
        <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
        <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
      </div>

      {/* carousle dots in the bottom */}
      <div className={styles.embla__dots}>
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            className={`${styles.embla__dot} ${(index === selectedIndex) ? styles['embla__dot--selected'] : ''}`}
          />
        ))}
      </div>
    </section>
  )
}

export default EmblaCarousel
