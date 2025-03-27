const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');
const StatsD =require('statsd-client')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      return JSON.stringify({
        level,
        message,
        timestamp,
        ...meta
      });
    })
  ),
  transports: [
    new winston.transports.File({ 
      filename: '/var/log/webapp.log'
    })
  ]
});


const statsd = new StatsD({
  port: 8125,
  prefix: 'webapp.',
  errorHandler: (error) => {
    logger.error('StatsD Error:', error);
  }
});

module.exports = { logger , statsd };