const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION
});

// Create S3 service object
const s3 = new AWS.S3({
  apiVersion: '2006-03-01'
});

module.exports = s3;
