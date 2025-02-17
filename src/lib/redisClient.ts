/*
  File: redisClient.ts
  Description: Create a redis client and export it
*/

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
})

export default redis;
