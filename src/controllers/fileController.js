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
    

    const dbStartTime = new Date();   // Start timer for database operation
    const newFile = await File.create({
      id: fileId,
      file_name: file.originalname,
      url: `${process.env.AWS_S3_BUCKET_NAME}/${key}`,
      upload_date: new Date().toISOString().split('T')[0]
    });

    const dbDuration = new Date() - dbStartTime;
    statsd.timing('db.create.time', dbDuration);

    res.status(201).json({
      file_name: newFile.file_name,
      id: newFile.id,
      url: newFile.url,
      upload_date: newFile.upload_date
    });

    const apiDuration = new Date() - apiStartTime;
    statsd.timing('api.post.file.time', apiDuration);
  } catch (error) {
    logger.error(`Error adding file: ${error.message}`);
    statsd.increment('api.post.file.error');
    res.status(400).json({ message: 'Bad Request' });
  }
};

exports.getFile = async (req, res) => {
  const apiStartTime = new Date();
  statsd.increment('api.get.file');
  try {
    const fileId = req.params.id;
    const dbStartTime = new Date()
    const file = await File.findOne({ where: { id: fileId } });
    const dbDuration = new Date() - dbStartTime;
    statsd.timing('db.findOne.time', dbDuration);

    if (!file) {
      logger.Info(`file not found which you were trying to get`);
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
  } catch (error) {
    logger.error(`Error fetching file: ${error.message}`);
    statsd.increment('api.get.file.error');
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteFile = async (req, res) => {
  const apiStartTime = new Date();
  statsd.increment('api.delete.file');
  try {
    const fileId = req.params.id;
    const dbFindStartTime = new Date();
    const file = await File.findOne({ where: { id: fileId } });
    const dbFindDuration = new Date() - dbFindStartTime;
    statsd.timing('db.findOne.time', dbFindDuration);

    if (!file) {
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
      
      const dbDeleteStartTime = new Date();
      await File.destroy({ where: { id: fileId } });
      const dbDeleteDuration = new Date() - dbDeleteStartTime;
      statsd.timing('db.destroy.time', dbDeleteDuration);

      const apiDuration = new Date() - apiStartTime;
      statsd.timing('api.delete.file.time', apiDuration);
      
      
      return res.status(204).send();
    } catch (s3Error) {
      logger.error(`S3 deletion error: ${s3Error.message}`);
      statsd.increment('s3.deleteObject.error');
      
      
      if (s3Error.code === 'AccessDenied') {
        logger.warn('You are Unauthorized for GET request')
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      logger.debug('Internal Server Error On GET request')
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } catch (error) {
    logger.error(`Error deleting file: ${error.message}`);
    statsd.increment('api.delete.file.error');
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.badRequest = (req, res) => {
  statsd.increment('api.badRequest');
  res.status(400).json({ message: 'Bad Request' });
};
