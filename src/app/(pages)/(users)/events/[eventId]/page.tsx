import EventContent from '../../../../components/event/eventContent';
import { getUser } from '../../../../../helpers/auth/getUser';

async function fetchEvent(eventId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}`,
    { next: { revalidate: 3600 } } 
  );
  const data = await res.json();
  return data;
}

async function EventPage({ params }: { params: {eventId: string} }) {
  const { eventId } = params;

  const { message, event } = await fetchEvent(eventId);
  const user = await getUser();

  // TODO: handle error in main component instead
  if (!event) {
    return (<main>{message}</main>)
  }

  return (
    <main>
      <EventContent 
        event={event} 
        user={user}
      />
    </main>
  );
}

export default EventPage;
