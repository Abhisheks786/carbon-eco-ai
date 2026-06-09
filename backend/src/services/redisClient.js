const Redis = require('ioredis');

let redisClient;
let isRedisAvailable = false;

try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      // If we fail to connect, give up so it doesn't hang the app
      if (times > 3) {
        console.warn('Redis connection failed, running without cache');
        return null;
      }
      return Math.min(times * 50, 2000);
    }
  });

  redisClient.on('ready', () => {
    isRedisAvailable = true;
    console.log('Connected to Redis');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
  });

} catch (e) {
  console.warn('Failed to initialize Redis');
}

const getCache = async (key) => {
  if (!isRedisAvailable) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 3600) => {
  if (!isRedisAvailable) return;
  try {
    await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (e) {
    console.warn('Cache set failed', e.message);
  }
};

module.exports = {
  redisClient,
  getCache,
  setCache,
  isRedisAvailable,
};
