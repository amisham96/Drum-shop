/*
  File: dbConnect.ts
  Description: This file contains a method to connect to 
  mongodb using mongoose
  Reference: https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/lib/dbConnect.ts
*/

import mongoose from 'mongoose';

declare global {
  var mongoose: any;
}

// get the database url from .env file
const MONGODB_URL = process.env.DATABASE_URL!;

if (!MONGODB_URL) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local',
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// function to connect to the mongodb database
async function dbConnect() {
  // if the connection is cached, return the cached connection
  if (cached.conn) {
    return cached.conn;
  }

  /* if the connection attempt is in progress do not attempt to connect
     multiple times */
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    
    cached.promise = mongoose.connect(MONGODB_URL, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn  = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;