import dbConnect from '../../../../../../lib/dbConnect';
import Event from '../../../../../../models/event';
import { EventType } from '../../../../../../types/event';
import { AddEventValidationSchema } from '../../../../../../validation/event';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { revalidatePath } from 'next/cache';

const ROOT_DIR = process.cwd();
const UPLOAD_DIR = join(ROOT_DIR, 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // get the data, poster and media
    const poster = formData.get('poster') as File;
    const media = formData.getAll('media') as File[];
    const eventData: (EventType | null) = JSON.parse(formData.get('eventData') as string);

    console.log(eventData);

    // if any of the data is missing return error
    if (!eventData || !poster) {
      return NextResponse.json(
        { message: 'Missing data.' },
        { status: 400 }
      );
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

    // save other event data to the db and retrieve the eventId
    await dbConnect();
    const newEvent = new Event(validateData.data);

    // write poster to the /uploads folder
    // TODO: upload images to cloud storage
    if (poster) {
      const posterExtension = poster.name.split('.').pop();
      const posterPath = `${UPLOAD_DIR}/${newEvent._id}_poster.${posterExtension}`;
      const posterUrl = `/uploads/${newEvent._id}_poster.${posterExtension}`;
      
      const bytes = await poster.arrayBuffer();
      const imgBuffer = Buffer.from(bytes);
      await writeFile(posterPath, imgBuffer);

      newEvent.poster = posterUrl;
    }

    // if additional media exists, add them to /uploads folder
    if (media) {
      const mediaPaths = [];
      for(let i = 0; i < media.length; i += 1) {
        const image = media[i];
  
        // get file extension
        const extension = image.name.split('.').pop();
  
        const imagePath = `${UPLOAD_DIR}/${newEvent._id}_${i}.${extension}`;
  
         // track all the image urls to store in db
        const imageUrl = `/uploads/${newEvent._id}_${i}.${extension}`;
        mediaPaths.push(imageUrl);
  
        const bytes = await image.arrayBuffer();
        const imgBuffer = Buffer.from(bytes);
        await writeFile(imagePath, imgBuffer);
      };

      newEvent.media = mediaPaths;
    }

    await newEvent.save();

    // revalidate cache
    revalidatePath('/events');

    return NextResponse.json(
      { message: 'Successfully saved event' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}