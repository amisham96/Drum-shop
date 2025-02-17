import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { unlink } from 'node:fs/promises'
import { join } from 'node:path';

import dbConnect from '../../../../../../../lib/dbConnect';
import { NextRequest, NextResponse } from 'next/server';
import Event from '../../../../../../../models/event';
import { EventType } from '../../../../../../../types/event';

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { eventId: string }}
) {
  try {
    const { eventId } = params;

    // if the eventId is invalid return error
    if ((!eventId) || (!mongoose.isValidObjectId(eventId))) {
      return NextResponse.json(
        { message: 'Invalid event id' },
        { status: 400 }
      );
    }

    await dbConnect();

    const event: (EventType | null) = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 400 }
      );  
    }

    // // delete the images
    const eventMedia = [event.poster, ...event.media];
    eventMedia.forEach(async (img: string) => {
      // delete each image
      const ROOT_DIR = process.cwd();
      const PUBLIC_DIR = join(ROOT_DIR, 'public');
      await unlink(`${PUBLIC_DIR}/${img}`);
    });

    await Event.findByIdAndDelete(eventId);

    // revalidate the cache of the eventId and the store
    revalidatePath('/events');
    revalidatePath(`/events/${eventId}`);

    return NextResponse.json(
      { message: 'Successfully deleted event' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}