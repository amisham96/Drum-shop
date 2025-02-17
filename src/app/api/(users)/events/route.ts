import dbConnect from '../../../../lib/dbConnect';
import Event from '../../../../models/event';
import { EventType } from '../../../../types/event';
import { NextRequest, NextResponse } from 'next/server';

type CategoryDataType = {
  _id: string,
  events: EventType[],
}

type ResponseType = 
  { categoryData: CategoryDataType[] } |
  { events: EventType[] }

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  try {
    const pagination = searchParams.get('pagination') || '';
    const status = searchParams.get('status') || 'ongoing';
    const pageNumber = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '5');

    await dbConnect();

    let data: ResponseType;

    if (pagination === true.toString()) {
      const docsToSkip = pageNumber * limit;

      // TODO: optimise pagination
      const events = await Event.find({ status })
                                .sort({ date: 1 })
                                .skip(docsToSkip)
                                .limit(limit);

      data = { events };
    } else {
      const categoryData: CategoryDataType[] = await Event.aggregate([
        {
          '$group': {
            _id: '$status', // group the documents based on the 'status'
            events: { 
              '$topN': {
                n: 5, // get 5 events from each category
                sortBy: { date: 1 },
                output: '$$ROOT'
              }
            },
          }
        }
      ]);

      data = { categoryData };                              
    }

    return NextResponse.json(
      { 
        data,
        message: 'Successfully fetched products',
      },
      { status: 200 },
    );    
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}