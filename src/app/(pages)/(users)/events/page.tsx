import EventCarousel from '../../../components/carousel/events/eventCarousel/eventCarousel';
import { EventType } from '../../../../types/event';
import EventCategoryList from '../../../components/events/categoryList/categoryList';

type CategoryDataType = {
  _id: string,
  events: EventType[],
}

type ResponseType = {
  categoryData: CategoryDataType[],
}

async function fetchInitialEvents() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, 
      { next: { revalidate: 3600 * 24 } } // cache for a day, unless revalidated
    );
    return await res.json();
  } catch (error) {
    // if there is any error, return empty array as data
    return { data: { categoryData: [] }};
  }
}

async function EventsPage() {
  const res = await fetchInitialEvents();
  const data: ResponseType = res.data;

  // seperate the ongoing events and the highlights
  const ongoingEvents = data.categoryData.find((category: CategoryDataType) => category._id === 'ongoing');
  const eventHighlights = data.categoryData.find((category: CategoryDataType) => category._id === 'highlights');

  return (
    <main>
      {/* display a carousel of upcoming events */}
      {(ongoingEvents?.events) && <EventCarousel events={ongoingEvents.events} /> }

      {/* display all the events based on their status */}
      <section style={{
        padding: '2rem 3rem',
      }}>
        {ongoingEvents && <EventCategoryList categoryList={ongoingEvents} />}
        {eventHighlights && <EventCategoryList categoryList={eventHighlights} />}
      </section>
    </main>
  );
}

export default EventsPage