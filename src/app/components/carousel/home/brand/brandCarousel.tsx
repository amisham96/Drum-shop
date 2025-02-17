/* Description: This file contains the main carousel displayed in the brands section 
   of the home page
*/
'use client';

import React from 'react';
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import './brandCarousel.css';

type PropType = {
  slides: React.JSX.Element[]
  options?: EmblaOptionsType
}

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ playOnInit: true, delay: 400 })
  ])

  return (
    <section className="brand_carousel">
      <div className="brand_carousel__viewport" ref={emblaRef}>

        {/* carousel slides go here */}
        <div className="brand_carousel__container">
          {slides.map((element, index) => (
            <div className="brand_carousel__slide" key={index}>
              {element}
            </div>
          ))}
          {slides.map((element, index) => (
            <div className="brand_carousel__slide" key={index}>
              {element}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EmblaCarousel
