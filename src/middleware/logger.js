const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');
const StatsD =require('statsd-client')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: '/var/log/webapp.log' }),
  ]
});

logger.add(
  new WinstonCloudWatch({
    logGroupName:'/csye6225/webapp',
    logStreamName:'webappLogStream',
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    messageFormatter: ({ level, message, ...meta }) => {
      return JSON.stringify({
        level,
        message,
        timestamp: new Date().toISOString(),
        ...meta,
      });
    },
  })
);

const statsd = new StatsD({
  port: 8125,
  prefix: 'webapp.',
  errorHandler: (error) => {
    logger.error('StatsD Error:', error);
  }
});

module.exports = { logger , statsd };