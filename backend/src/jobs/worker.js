const { Queue, Worker } = require('bullmq');
const { redisClient, isRedisAvailable } = require('../services/redisClient');

const JOB_QUEUE_NAME = 'background-jobs';

// Setup Queue
let jobQueue;
if (redisClient) {
  jobQueue = new Queue(JOB_QUEUE_NAME, { connection: redisClient });
  jobQueue.on('error', (err) => {
    // Silence connection errors since we fall back gracefully
  });
}

// Setup Worker
let worker;
if (redisClient) {
  worker = new Worker(JOB_QUEUE_NAME, async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    if (job.name === 'refreshLeaderboard') {
      // Simulate heavy leaderboard computation
      console.log('Refreshing leaderboard...');
      // Logic would go here to pre-calculate and cache leaderboard
    }
  }, { connection: redisClient });

  worker.on('error', (err) => {
    // Silence connection errors since we fall back gracefully
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error ${err.message}`);
  });
}

const addJob = async (name, data, opts = {}) => {
  if (jobQueue && isRedisAvailable) {
    await jobQueue.add(name, data, opts);
  } else {
    console.warn(`Cannot add job ${name}: Redis is not available`);
  }
};

module.exports = {
  addJob,
  worker,
};
