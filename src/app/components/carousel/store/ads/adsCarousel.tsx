'use client';

import styles from './adsCarousel.module.css';
import MainCarousel from '../../home/main/mainCarousel';
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image';

function AdsCarousel() {
  const carouselSlides = [];
  const carouselOptions = { loop: true };
  const carouselPlugins = [
    Autoplay({ 
      playOnInit: true,
      delay: 3000,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
    })
  ];

  const slideContent = [
    { content: '30% off on vic firth drumsticks' },
    { content: 'Planet Z series here' },
    { content: 'Yamaha stage custom' },
  ]

  for (let i = 1; i <= 3; i += 1) {
    const slide = (
      <div className={styles.ads_carousel_slide}>
        <Image
          src={`/images/store/ads_carousel_image_${i}.jpg`}
          alt='carousel slide'
          fill={true}
        />
        
        <div className={`${styles.slide_content} ${styles.slide_content}_${i}`}>
          <p>{slideContent[i-1].content}</p>
          <button>Check out</button>
        </div>
      </div>
    );
    carouselSlides.push(slide);
  }

  return (
    <div className={styles.ads_carousel_container}>
      <MainCarousel
        slides={carouselSlides} 
        options={carouselOptions}
        plugins={carouselPlugins}
        classNames={[styles.ads_embla_carousel]}
      />
    </div>
  )
}

export default AdsCarousel;
