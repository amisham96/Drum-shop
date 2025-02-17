/*
  Description: This file contains the component that will be rendered
  at he home route.
*/

import Image from 'next/image';
import { EmblaOptionsType } from 'embla-carousel';
import styles from './page.module.css';
import MainCarousel from '../../components/carousel/home/main/mainCarousel';
import BrandCarousel from '../../components/carousel/home/brand/brandCarousel';

export default function Home() {
  // main carousel options and slide
  const mainCarouselOptions: EmblaOptionsType = { dragFree: true }
  const mainCarouselSlideCount = 4

  let mainCarouselSlides = [];
  for (let i = 1; i <= mainCarouselSlideCount; i += 1) {
    const eachSlide = (
      <div className={styles.custom_slide}>
        <Image
          src={`/images/home/carousel_image_${i}.jpg`}
          alt='carousel image'
          fill={true}
        />
      </div>
    );

    mainCarouselSlides.push(eachSlide);
  }

  // brand carousel options and slides
  const brandCarouselOptions: EmblaOptionsType = { loop: true }
  const brandCarouselSlideCount = 5;

  let brandCarouselSlides = [];
  for (let i = 1; i <= brandCarouselSlideCount; i += 1) {
    const eachSlide = (
      <div className={styles.custom_slide}>
        <Image
          src={`/images/home/brand_image_${i}.svg`}
          alt='available brand'
          fill={true}
        />
      </div>
    );

    brandCarouselSlides.push(eachSlide);
  }

  return (
    <main>
      {/* hero section of the home page */}
      <section className={styles.hero_section}>
        <span className={styles.hero_section_main_heading}>
          YOUR FINAL <br /> DRUMS DESTINATION
        </span>

        <span className={styles.hero_section_tagline}>
          Believe us, we have got all your percussion needs covered. 
        </span>

        <div className={styles.hero_section_cta_btns}>
          <button>Visit store</button>
          <button>Shop online</button>
        </div>
      </section>


      {/* carousel section */}
      <section className={`${styles.section} ${styles.carousel_section}`}>
        <h1>Immerse Yourself in Percussive Paradise</h1>

        <p>Explore the heartbeat of our shop as you navigate through an 
          array of world-class drum kits, handcrafted cymbals, and percussion 
          accessories. Each corner resonates with the spirit of drumming, 
          creating an ambiance that truly speaks to the soul of a drummer.
        </p>

        <div className={styles.main_carousel}>
          <MainCarousel slides={mainCarouselSlides} options={mainCarouselOptions} />
        </div>
      </section>

      {/* brands section */}
      <section className={`${styles.section} ${styles.brands_section}`}>
        <h1>Discover the Rhythm of <br />
          Excellence with Our Premium Brands</h1>

        <p>At the Bangalore Drums Shop, we take pride in curating a 
          selection of drumming gear from the most esteemed brands in the industry. 
          Each brand we carry represents a commitment to quality, innovation, and 
          a passion for the art of drumming
        </p>

        <div className={styles.custom_slide}>
          <BrandCarousel slides={brandCarouselSlides} options={brandCarouselOptions} />
        </div>
      </section>

      {/* testimonial section */}
      <section className={`${styles.section} ${styles.testimonial_section}`}>
        <div className={styles.testimonial_section_info}>
          <h1>hear from the drummers who have made their rhythm come alive with us</h1>

          <p>At the Bangalore Drums Shop, our commitment goes beyond providing 
            exceptional drumming gear - we're dedicated to creating an experience 
            that resonates with each and every drummer.</p>
        </div>

        <div className={styles.testimonial_container}>
          <div className={styles.testimonial_image}>
            <Image
              src={'/images/home/testimonial_1.png'}
              alt='testimonial image'
              fill={true}
            />
          </div>

          <div className={styles.testimonial_quote}>
            “The range of brands and the knowledgeable
            staff make it my go-to place for all things drumming”.
            <hr />
            <span>Manju Drums</span>
          </div>
        </div>
      </section>

      {/* cta section */}
      <section className={`${styles.section} ${styles.cta_section}`}>
        <div className={styles.cta_content}>
          <h1>Find Your Beat – Visit Us or Explore Online</h1>
          <p>Ready to take your drumming journey to the next level? Whether 
            you prefer the hands-on experience of testing our instruments in 
            person or the convenience of online browsing, we is here for you.
          </p>

          <div className={styles.cta_section_cta_btns}>
            <button>Visit store</button>
            <button>Shop online</button>
          </div>
        </div>
      </section>
    </main>
  );
}
