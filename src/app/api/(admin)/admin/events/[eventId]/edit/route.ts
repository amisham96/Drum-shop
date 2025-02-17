import mongoose from 'mongoose';
import dbConnect from '../../../../../../../lib/dbConnect';
import Event from '../../../../../../../models/event';
import { EventType } from '../../../../../../../types/event';
import { AddEventValidationSchema } from '../../../../../../../validation/event';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'node:path';
import { writeFile, unlink } from 'node:fs/promises';
import { revalidatePath } from 'next/cache';

const ROOT_DIR = process.cwd();
const UPLOAD_DIR = join(ROOT_DIR, 'public', 'uploads');

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string }},
) {
  const { eventId } = params;

  try {
    // if the product id is invalid return error
    if (mongoose.isValidObjectId(eventId) === false) {
      return NextResponse.json(
        { message: 'Invalid event id' }, 
        { status: 400 }
      );
    }

    const formData = await req.formData();

    // get the data, poster and media
    const poster = formData.get('poster') as File;
    const media = formData.getAll('media') as File[];
    const deleteMedia: string[] = JSON.parse(formData.get('deleteMedia') as string);
    const eventData: (EventType | null) = JSON.parse(formData.get('eventData') as string);

    // if any of the data is missing return error
    if (!eventData) {
      return NextResponse.json(
        { message: 'Missing data.' },
        { status: 400 }
      );
    }

    // check if the event being edited is found
    const event: (EventType | null) = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found.' },
        { status: 404 }
      );
    }

    // if new poster is added, upload it and save the path
    // TODO: upload image to cloud storage
    if (poster) {
        // delete the old poster
        const PUBLIC_DIR = join(ROOT_DIR, 'public');
        await unlink(`${PUBLIC_DIR}/${event.poster}`);

        const posterExtension = poster.name.split('.').pop();
        const posterPath = `${UPLOAD_DIR}/${event._id}_poster.${posterExtension}`;
        const posterUrl = `/uploads/${event._id}_poster.${posterExtension}`;
    
        const bytes = await poster.arrayBuffer();
        const imgBuffer = Buffer.from(bytes);
        await writeFile(posterPath, imgBuffer);
  
        // add new poster path to the data
        eventData.poster = posterUrl;
    }

    // check the validity of the data
    const validateData = AddEventValidationSchema.safeParse(eventData);

    if (validateData.success === false) {
      let errorMessage = '';
      const errorObj: { [key: string]: string} = {};

      validateData.error.errors.forEach((error) => {
        errorMessage += `${error.message}\n`;
        errorObj[error.path[0]] = error.message;
      });

      return NextResponse.json(
        { 
          message: errorMessage,
          error: errorObj,
        }, 
        { status: 400 }
      );
    }

    const uploadedMediaPaths = [];

    // if additional media exists, add them to /uploads folder
    // TODO: upload images to cloud storage
    if (media) {
      for(let i = 0; i < media.length; i += 1) {
        const image = media[i];
  
        // get file extension
        const extension = image.name.split('.').pop();
        
        // TODO: here image will be overwritten since it's not unique
        const imagePath = `${UPLOAD_DIR}/${eventId}_${i}.${extension}`;
  
         // track all the image urls to store in db
        const imageUrl = `/uploads/${eventId}_${i}.${extension}`;
        uploadedMediaPaths.push(imageUrl);
  
        const bytes = await image.arrayBuffer();
        const imgBuffer = Buffer.from(bytes);
        await writeFile(imagePath, imgBuffer);
      };
    }

    // if some media files were marked to be deleted, remove them
    const filteredMedia: string[] = [];
    if (deleteMedia) {      
      const deleteMediaSet = new Set(deleteMedia);
      const currMedia = event.media;

      currMedia.forEach(async (mediaFileUrl) => {
        // if the file is marked to be deleted, delete them
        if (deleteMediaSet.has(mediaFileUrl)) {
          const PUBLIC_DIR = join(ROOT_DIR, 'public');
          await unlink(`${PUBLIC_DIR}/${mediaFileUrl}`);
        } else {
          filteredMedia.push(mediaFileUrl);
        }
      })
    }

    // save other event data to the db and retrieve the eventId
    await dbConnect();
    
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId, 
      {
        ...validateData.data,
        media: [...uploadedMediaPaths, ...filteredMedia],
      }, 
      {returnOriginal: false}
    );

    // revalidate cache
    revalidatePath('/events');
    revalidatePath(`/events/${eventId}`);

    return NextResponse.json(
      { message: 'Successfully edited event' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}