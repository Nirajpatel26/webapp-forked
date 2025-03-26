const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {logger,statsd} = require('./logger');

function singleFileMiddleware(req, res, next) {
  const startTime = new Date();
  // Check for query parameters
  if (Object.keys(req.query).length > 0) {

    logger.error({
      type: 'VALIDATION_ERROR',
      message: 'File upload failed: Query parameters are not allowed',
      method: req.method,
      path: req.path,
      queryParams: Object.keys(req.query)
    });
    statsd.increment('middleware.singleFile.query_error');
    return res.status(400).json({ message: 'Query parameters not allowed' });
  }

  // Check for authorization headers
  if (req.get("Authorization") || req.get("authentication")) {
    if (req.get("Authorization") || req.get("authentication")) {
      logger.error({
        type: 'VALIDATION_ERROR',
        message: 'File upload failed: Authorization headers are not allowed',
        method: req.method,
        path: req.path,
        hasAuthHeader: !!req.get("Authorization"),
        hasAuthenticationHeader: !!req.get("authentication")
      });
    statsd.increment('middleware.singleFile.auth_error');
    return res.status(400).json({ message: 'Authorization headers not allowed' });
  }

  upload.single("profilePic")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        logger.error({
          type: 'FILE_UPLOAD_ERROR',
          message: 'File upload failed: Unexpected field or multiple files detected',
          method: req.method,
          path: req.path,
          errorCode: err.code
        }); 
        statsd.increment('middleware.singleFile.unexpected_file');
        return res.status(400).json({ message: "Unexpected file field" });
      }
      logger.error({
        type: 'FILE_UPLOAD_ERROR',
        message: 'Multer error during file upload',
        method: req.method,
        path: req.path,
        error: err.message,
        stack: err.stack
      });
      statsd.increment('middleware.singleFile.upload_error');

      return res.status(500).json({ message: "File upload error" });
    }
    const duration = new Date() - startTime;
    statsd.timing('middleware.singleFile.time', duration);
    logger.info({
      type: 'MIDDLEWARE_EXECUTION',
      message: 'Single file middleware completed successfully',
      method: req.method,
      path: req.path,
      duration
    });
    next();
  });
}
}

module.exports = singleFileMiddleware;
