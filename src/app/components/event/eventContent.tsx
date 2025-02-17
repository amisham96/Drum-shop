import { AiFillFacebook, AiFillYoutube } from 'react-icons/ai';
import { BsTwitterX, BsInstagram } from 'react-icons/bs';
import Link from 'next/link';
import { LuClock3 } from 'react-icons/lu';
import { FaLocationDot } from 'react-icons/fa6';
import { IoMdLink } from 'react-icons/io';

import Product from '../store/product/product';
import { UserType } from '../../../helpers/auth/getUser';
import { EventWithFeaturedProducts } from '../../../types/event';
import styles from './eventContent.module.css';
import EventActions from './eventActions/eventActions';

type EventContentProps = {
  event: EventWithFeaturedProducts,
  user: (UserType | null),
};

function EventContent({ event, user }: EventContentProps) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday'
  ];
  

  // function to get formatted date and time
  function getDateAndTime() {
    const eventDate = new Date(event.date);
    const time = event.time;

    // get the values of the date
    const day = daysOfWeek[eventDate.getDay()];
    const date = eventDate.getDate();
    const month = months[eventDate.getMonth()];
    const year = eventDate.getFullYear();
    const dateStr = `${day}, ${month} ${date}, ${year}`;

    // get formatted time
    const [hour, min] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    const timeStr = `${hour12}:${min} ${period}`;

    // {time} {day}, {month} {date} {year} 
    return `${timeStr}\n ${dateStr}`;
  }

  return (
    <div className={styles.outer_event_container}>
      {/* poster container */}
      <div className={styles.poster_container}>
        <img 
          src={event.poster}
          alt={`${event.name} poster`}
        />
      </div>

      {/* title container */}
      <div className={styles.float_title_container}>
        <div className={styles.left_container}>
          <h2>{event.name}</h2>

          <div>
            <span className={styles.title_label}>
              <LuClock3 /> Date and time
            </span>
            <span className={styles.title_value}>{getDateAndTime()}</span>
          </div>

          <div>
            <span className={styles.title_label}>
              <FaLocationDot /> Location
            </span>
            <span className={styles.title_value}>{event.location || '-'}</span>
          </div>
        </div>

        <div className={styles.horizontal_line}></div>

        <div className={styles.right_container}>
          <p>Learn more about the event through our social links</p>
          
          {/* TODO: update the fallback social links */}
          <div className={styles.socials_container}>
            <Link href={event.socialLinks?.x || ''} target='blank'><BsTwitterX /></Link>
            <Link href={event.socialLinks?.instagram || ''} target='blank'><BsInstagram /></Link>
            <Link href={event.socialLinks?.facebook || ''} target='blank'><AiFillFacebook /></Link>
            <Link href={event.socialLinks?.youtube || ''} target='blank'><AiFillYoutube /></Link>
          </div>

          <EventActions socialLinks={event.socialLinks} />
        </div>
      </div>

      {/* main container with details, featured products and artists  */}
      <section className={styles.main_container}>
        <div className={styles.event_details}>
          <h2>EVENT DETAILS</h2>
          <p>{event.details}</p>
        </div>

        <div className={styles.featured_products}>
          <h2>FEATURED PRODUCTS</h2>

          <div className={styles.products_container}>
            {event.featuredProducts.map((product, idx) => {
              return (
                <Product 
                  product={product} 
                  user={user}
                  ref={null}
                  key={idx}
                />
              )
            })}
          </div>
        </div>

        <div className={styles.featured_artists}>
          <h2>SPECIAL GUESTS</h2>

          <div className={styles.artists_container}>
            {(event.featuredArtists.map((artist, idx) => {
              return (
                <div key={idx} className={styles.artist}>
                  <p>
                    {artist.name}
                    {artist.title && <span>({artist.title})</span>}
                  </p>
                  {artist.link &&
                    <Link href={artist.link} target='blank'>
                      <IoMdLink className={styles.artist_link_icon} />
                    </Link>
                  }
                </div>
              )
            }))}
          </div>
        </div>
      </section>

      {/* section containing highlights media */}
      {event.status === 'highlights' &&
        <section className={styles.highlights_container}>
          <h2>EVENT HIGHLIGHTS</h2>

          <div className={styles.highlights_inner_container}>
            {event.media.map((url, idx) => {
              return (
                <img src={url} key={idx} />
              )
            })}
          </div>
        </section>
      }
    </div>
  )
}

export default EventContent;
