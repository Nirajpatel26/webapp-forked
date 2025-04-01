const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {logger,statsd} = require('./logger');

function singleFileMiddleware(req, res, next) {
  const startTime = new Date();
  // Check for query parameters
  if (Object.keys(req.query).length > 0) {

    logger.error(`File upload failed: Query parameters are not allowed`);
    statsd.increment('middleware.singleFile.query_error');
    return res.status(400).json({ message: 'Query parameters not allowed' });
  }

  // Check for authorization headers
 
    if (req.get("Authorization") || req.get("authentication")) {
      logger.error(`File upload failed: Authorization headers are not allowed`);
    statsd.increment('middleware.singleFile.auth_error');
    return res.status(400).json({ message: 'Authorization headers not allowed' });
  }

  upload.single("profilePic")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        logger.error(`File upload failed: Unexpected field or multiple files detected`,error); 
        statsd.increment('middleware.singleFile.unexpected_file');
        return res.status(400).json({ message: "Unexpected file field" });
      }
      logger.error('Multer error during file upload');
      statsd.increment('middleware.singleFile.upload_error');

      return res.status(500).json({ message: "File upload error" });
    }
    const duration = new Date() - startTime;
    statsd.timing('middleware.singleFile.time', duration);
    logger.info('Single file middleware completed successfully');
    next();
  });
}

module.exports = singleFileMiddleware;
