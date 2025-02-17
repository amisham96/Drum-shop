import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/dbConnect';
import Event from '../../../../../models/event';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { eventId: string }}
) {
  // get the eventId from dynamic url 
  const { eventId } = params;

  // if the eventId is invalid mongodb objectId, return error.
  if (mongoose.isValidObjectId(eventId) === false) {
    return NextResponse.json(
      { message: 'Invalid event id' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const event = await Event.findById(eventId)
                             .populate({
                               path: 'featuredProducts',
                               select: '-costPrice'
                             });

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: 'Successfully retrieved event',
        event: event,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}