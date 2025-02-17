'use client';
import { useEffect, useRef, useState } from 'react';
import Event from '../event/event';
import styles from './categoryList.module.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ClockLoader } from 'react-spinners';
import { EventType } from '../../../../types/event';

type CategoryListPropType = {
  _id: string,
  events: EventType[],
}

function EventCategoryList(
  { categoryList }: { categoryList: CategoryListPropType }
) {
  const [status, setStatus] = useState(categoryList._id);
  
  const titeNameReference: { [key: string]: string } = {
    'ongoing': 'upcoming events',
    'highlights': 'previous events highlights'
  }

  const eventContainerRef = useRef<HTMLDivElement | null>(null);
  
  // store all the fetched events
  const [events, setEvents] = useState([...categoryList.events]);

  // next page number, start with 0
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5); // 5 events per page

  // state to switch pagination
  const [disablePagination, setDisablePagination] = useState(categoryList.events.length < 5);

  const [isLoading, setIsLoading] = useState(false);

  // refs required to implement intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastEventRef = useRef<HTMLAnchorElement | null>(null);

  // function to fetch data when the last event is visible
  async function onLastEventVisible() {
    if (disablePagination === true) return;

    setIsLoading(true);

    try {
      const res = await axios.get('/api/events', {
        params: { 
          page, 
          limit, 
          status,
          pagination: true,
        }
      });

      const { data } = res.data;

      if (data.events.length > 0) {
        setEvents((prevData) => [...prevData, ...data.events]);
        setPage((prevPage) => prevPage + 1);
      } 
      
      if (data.events.length < 5) {
        setDisablePagination(true);
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // set the event listeners for the horizontal slider
    const slider = eventContainerRef.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const mouseDownListener = (e: MouseEvent) => {
      e.preventDefault();
      isDown = true;
      slider.classList.add(`${styles.event_list_container_active}`);
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    }

    const mouseLeaveListener = () => {
      isDown = false;
      slider.classList.remove(`${styles.event_list_container_active}`);
    }

    const mouseUpListener = () => {
      isDown = false;
      slider.classList.remove(`${styles.event_list_container_active}`);
    }

    const mouseMoveListener = (e: MouseEvent) => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 3;
      slider.scrollLeft = scrollLeft - walk;
    }

    slider.addEventListener('mousedown', mouseDownListener as EventListener);
    slider.addEventListener('mouseleave', mouseLeaveListener as EventListener);
    slider.addEventListener('mouseup', mouseUpListener as EventListener);
    slider.addEventListener('mousemove', mouseMoveListener as EventListener);


    return () => {
      slider.removeEventListener('mousedown', mouseDownListener);
      slider.removeEventListener('mouseleave', mouseLeaveListener);
      slider.removeEventListener('mouseup', mouseUpListener);
      slider.removeEventListener('mousemove', mouseMoveListener);
    }
  }, [eventContainerRef]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // create the intersection observer with a callback and options
    observerRef.current = new IntersectionObserver(
      async (entries) => {
        if ((entries[0].isIntersecting) && (!isLoading)) {
          await onLastEventVisible();
        }
      },
      { threshold: 0.4 }
    );

    // observe the last event element
    if (lastEventRef.current) {
      observerRef.current.observe(lastEventRef.current);
    }

    // Cleanup observer on component unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [page]);

  return (
    <div className={styles.category_list_container}>
      {/* main heading for the list */}
      <h2>{titeNameReference[status].toUpperCase()}</h2>

      {/* display the list of the events for this category */}
      <div 
        ref={eventContainerRef} 
        className={styles.event_list_container}
      >
        {events.map((event, idx) => {
          const isLastEvent = (events.length - 1 === idx);
          return (
            <Event 
              event={event}
              key={event._id + idx} 
              ref={isLastEvent ? lastEventRef : null}
            />
          );
        })}

        <div className={styles.loading_screen}>
          {isLoading ?
            <ClockLoader />:
            null
          }
        </div>
      </div>
    </div>
  );
}

export default EventCategoryList;
