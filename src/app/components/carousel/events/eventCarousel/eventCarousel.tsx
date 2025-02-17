import { EventType } from '../../../../../types/event';
import styles from './eventCarousel.module.css';
import MainCarousel from '../../home/main/mainCarousel';
import Link from 'next/link';

function EventCarousel(
  { events }: { events: EventType[] }
) {
  const carouselSlides = [];
  for (let i = 0; i < Math.min(5, events.length); i += 1) {
    const event = events[i];

    const slide = (
      <div className={styles.event_carousel_slide}>
        <Link href={`/events/${event._id}`} target='blank'>
          <img
            src={event.poster}
            alt={`${event.name} poster`}
          />

          {/* <div className={styles.title_name}>
            {event.name}
          </div> */}
        </Link>
      </div>
    );

    carouselSlides.push(slide);
  }

  return (
    <section className={styles.events_carousel_container}>
      <MainCarousel 
        slides={carouselSlides}
      />
    </section>
  )
}

export default EventCarousel;
