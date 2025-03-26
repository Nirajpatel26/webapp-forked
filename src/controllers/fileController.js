const File = require('../models/file');
const s3 = require('../utils/s3');
const { v4: uuidv4 } = require('uuid');
const {logger,statsd} = require('../middleware/logger')


exports.addFile = async (req, res) => {
  const apiStartTime = new Date();
  statsd.increment('api.post.file');
  try {
    const file = req.file;
    if (!file) {
      logger.warn('No file provided', { type: 'FILE_UPLOAD_ERROR' });
      return res.status(400).json({ message: 'No file provided' });
    }

    // Generate a unique ID for the file
    const fileId = uuidv4();
    
    // Create a unique key for S3 using the file ID and original name
    const key = `${fileId}/${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        'Content-Type': file.mimetype,
        'Original-Name': file.originalname
      }
    };

    const s3StartTime = new Date();
    const data = await s3.upload(params).promise();
    const s3Duration = new Date() - s3StartTime;
    statsd.timing('s3.upload.time', s3Duration);
    
    logger.info('File uploaded to S3', { 
      type: 'S3_UPLOAD',
      fileId,
      duration: s3Duration,
      bucket: params.Bucket,
      key: params.Key
    });

    const dbStartTime = new Date();   // Start timer for database operation
    const newFile = await File.create({
      id: fileId,
      file_name: file.originalname,
      url: `${process.env.AWS_S3_BUCKET_NAME}/${key}`,
      upload_date: new Date().toISOString().split('T')[0]
    });

    const dbDuration = new Date() - dbStartTime;
    statsd.timing('db.create.time', dbDuration);

    logger.info('File record created in database', {
      type: 'DB_CREATE',
      fileId,
      duration: dbDuration
    });

    res.status(201).json({
      file_name: newFile.file_name,
      id: newFile.id,
      url: newFile.url,
      upload_date: newFile.upload_date
    });

    const apiDuration = new Date() - apiStartTime;
    statsd.timing('api.post.file.time', apiDuration);

    logger.info('File added successfully', {
      type: 'API_RESPONSE',
      method: 'POST',
      path: '/file',
      duration: apiDuration,
      status: 201
    });
  } catch (error) {
    logger.error({
      type: 'API_ERROR',
      message: 'Error adding file',
      method: 'POST',
      path: '/v1/file',
      error: error.message,
      stack: error.stack
    });
    statsd.increment('api.post.file.error');
    res.status(400).json({ message: 'Bad Request' });
  }
};

exports.getFile = async (req, res) => {
  const apiStartTime = new Date();
  statsd.increment('api.get.file');
  try {
    const fileId = req.params.id;

    logger.info({
      type: 'API_REQUEST',
      message: 'Get file request received',
      method: 'GET',
      path: `/v1/file/${fileId}`
    });

    const dbStartTime = new Date()
    const file = await File.findOne({ where: { id: fileId } });
    const dbDuration = new Date() - dbStartTime;
    statsd.timing('db.findOne.time', dbDuration);

    logger.info({
      type: 'DB_QUERY',
      message: 'Database query executed',
      operation: 'findOne',
      fileId,
      duration: dbDuration
    });


    if (!file) {
      logger.warn({
        type: 'NOT_FOUND',
        message: 'File not found',
        fileId,
        method: 'GET',
        path: `/v1/file/${fileId}`
      });
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({
      file_name: file.file_name,
      id: file.id,
      url: file.url,
      upload_date: file.upload_date
    });

    const apiDuration = new Date() - apiStartTime;
    statsd.timing('api.get.file.time', apiDuration);
    logger.info({
      type: 'API_RESPONSE',
      message: 'File retrieved successfully',
      method: 'GET',
      path: `/v1/file/${fileId}`,
      duration: apiDuration,
      status: 200
    });
  } catch (error) {
    logger.error({
      type: 'API_ERROR',
      message: 'Error fetching file',
      method: 'GET',
      path: `/v1/file/${req.params.id}`,
      error: error.message,
      stack: error.stack
    });
    statsd.increment('api.get.file.error');
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteFile = async (req, res) => {
  const apiStartTime = new Date();
  statsd.increment('api.delete.file');
  try {
    const fileId = req.params.id;
    logger.info({
      type: 'API_REQUEST',
      message: 'Delete file request received',
      method: 'DELETE',
      path: `/v1/file/${fileId}`
    });
    const dbFindStartTime = new Date();
    const file = await File.findOne({ where: { id: fileId } });
    const dbFindDuration = new Date() - dbFindStartTime;
    statsd.timing('db.findOne.time', dbFindDuration);

    logger.info({
      type: 'DB_QUERY',
      message: 'Database query executed',
      operation: 'findOne',
      fileId,
      duration: dbFindDuration
    });

    if (!file) {
      logger.warn({
        type: 'NOT_FOUND',
        message: 'File not found for deletion',
        fileId,
        method: 'DELETE',
        path: `/v1/file/${fileId}`
      });
      return res.status(404).json({ message: 'File not found' });
    }

    // Extract the key from the URL
    const key = file.url.replace(`${process.env.AWS_S3_BUCKET_NAME}/`, '');

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    };
    try {
      const s3StartTime = new Date();
      // Delete from S3
      await s3.deleteObject(params).promise();
      const s3Duration = new Date() - s3StartTime;
      statsd.timing('s3.deleteObject.time', s3Duration);

      logger.info({
        type: 'S3_DELETE',
        message: 'File deleted from S3',
        fileId,
        duration: s3Duration,
        bucket: params.Bucket,
        key: params.Key
      });
      
      const dbDeleteStartTime = new Date();
      await File.destroy({ where: { id: fileId } });
      const dbDeleteDuration = new Date() - dbDeleteStartTime;
      statsd.timing('db.destroy.time', dbDeleteDuration);

      logger.info({
        type: 'DB_DELETE',
        message: 'File record deleted from database',
        fileId,
        duration: dbDeleteDuration
      });

      const apiDuration = new Date() - apiStartTime;
      statsd.timing('api.delete.file.time', apiDuration);
      
      logger.info({
        type: 'API_RESPONSE',
        message: 'File deleted successfully',
        method: 'DELETE',
        path: `/v1/file/${fileId}`,
        duration: apiDuration,
        status: 204
      });
      
      return res.status(204).send();
    } catch (s3Error) {
      logger.error({
        type: 'S3_ERROR',
        message: 'S3 deletion error',
        fileId,
        error: s3Error.message,
        code: s3Error.code,
        stack: s3Error.stack
      });
      statsd.increment('s3.deleteObject.error');
      
      
      if (s3Error.code === 'AccessDenied') {
        logger.warn({
          type: 'UNAUTHORIZED',
          message: 'Unauthorized for S3 deletion',
          fileId,
          method: 'DELETE',
          path: `/v1/file/${fileId}`
        });
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      logger.error({
        type: 'SERVER_ERROR',
        message: 'Internal Server Error on DELETE request',
        fileId,
        method: 'DELETE',
        path: `/v1/file/${fileId}`
      });
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } catch (error) {
    logger.error({
      type: 'API_ERROR',
      message: 'Error deleting file',
      method: 'DELETE',
      path: `/v1/file/${req.params.id}`,
      error: error.message,
      stack: error.stack
    });
    statsd.increment('api.delete.file.error');
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.badRequest = (req, res) => {
  statsd.increment('api.badRequest');
  logger.warn({
    type: 'BAD_REQUEST',
    message: 'Bad request',
    method: req.method,
    path: req.path
  });
  res.status(400).json({ message: 'Bad Request' });
};
