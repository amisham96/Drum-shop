import dbConnect from '../../../../../lib/dbConnect';
import User from '../../../../../models/user';
import { AddAdminUserValidationSchema, EditAdminUserValidationSchema } from '../../../../../validation/admin';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

// TODO: this route should only be accessed by admin with privilege 'chief'

export async function GET() {
  try {
    await dbConnect();

    // fetch all the admin users
    const adminUsers = await User.find({isAdmin: true});

    return NextResponse.json(
      {
        message: 'Successfully retrieved admins',
        users: adminUsers,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const reqBody = (await req.json()).data;
    console.log(reqBody);

    // validate the data recieved
    const validationRes = AddAdminUserValidationSchema.safeParse(reqBody);
    
    if (validationRes.success === false) {
      let errorMessage = '';
      const errorObj: { [key:string]: string } = {};

      validationRes.error.errors.forEach((error) => {
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
    
    await dbConnect();

    // check if the admin user is already registered
    // TODO: remove this check, if not necessary
    const existingUser = await User.findOne({
      $or: [
        { phone: reqBody.phone }, 
        { email: reqBody.email }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Admin user already exists' }, 
        { status: 409 }
      );
    }

    const admin = new User(validationRes.data);
    admin.isAdmin = true;
    await admin.save();

    return NextResponse.json(
      { 
        message: 'Successfully added admin',
        admin,
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

export async function PUT(req: NextRequest) {
  try {
    const reqBody = (await req.json());
    console.log(reqBody);

    // validate the data recieved
    const validationRes = EditAdminUserValidationSchema.safeParse(reqBody);
    
    if (validationRes.success === false) {
      let errorMessage = '';
      const errorObj: { [key:string]: string } = {};

      validationRes.error.errors.forEach((error) => {
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
    
    await dbConnect();

    // get the existing admin user
    const existingUser = await User.findById(reqBody._id);

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Admin user doesn\'t exist' }, 
        { status: 409 }
      );
    }

    // check if the admin exists or not
    const updatedAdmin = await User.findByIdAndUpdate(
      existingUser._id,
      { ...validationRes.data },
      { new: true }
    );

    return NextResponse.json(
      { 
        message: 'Successfully added admin',
        admin: updatedAdmin,
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

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const adminUserId = searchParams.get('_id');

    if (!adminUserId || !(mongoose.isValidObjectId(adminUserId))) {
      return NextResponse.json(
        { message: 'Invalid admin id' },
        { status: 400 },
      );
    }

    await dbConnect();

    // delete the admin user
    await User.deleteOne({ _id: adminUserId });

    return NextResponse.json(
      { message: 'Successfully deleted admin' },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}