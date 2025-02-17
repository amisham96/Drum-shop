'use client';

import { forwardRef } from 'react';
import Link from 'next/link';

import styles from './event.module.css';
import { EventType } from '../../../../types/event';

interface EventProps {
  event: EventType,
}

const  Event = forwardRef<HTMLAnchorElement, EventProps>(({ event }, ref) => {

  // function to get the month name based on the date string
  function getMonthFromDateStr(dateStr: (string | undefined | null)) {
    if (!dateStr) return '-';

    const months = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY',
      'JUN', 'JUL', 'AUG', 'SEP', 'OCT',
      'NOV', 'DEC'
    ];

    const date = new Date(dateStr);
    const monthIdx = date.getMonth();
    return months[monthIdx];
  }

  return (
    <Link 
      className={styles.event_container}
      href={`/events/${event._id}`} 
      target='_blank'
      ref={ref}
    >
      <div className={styles.poster_container}>
        <img
          src={event.poster}
          alt={`${event.name} poster`}
        />
      </div>

      <div className={styles.info_container}>
        <div className={styles.date_container}>
          <span className={styles.display_month}>
            {getMonthFromDateStr(event.date)}
          </span>
          <span className={styles.display_date}>
            {new Date(event.date).getDate()}
          </span>
        </div>

        <div className={styles.description_container}>
          <h3>
            {(event.name.length > 50) ?
             event.name.substring(0, 50) + '...' :
             event.name
            }
          </h3>
          <p>
            {(event.details.length > 75) ?
             event.details.substring(0, 75) + '...' :
             event.details
            }
          </p>
        </div>
      </div>
    </Link>
  );
});

Event.displayName = 'Event';

export default Event;
