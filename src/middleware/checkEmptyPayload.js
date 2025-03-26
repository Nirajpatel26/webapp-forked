const {logger,statsd} = require('./logger');

const checkEmptyPayload = (req, res, next) => {
  const startTime = new Date();
    if ((req.path === '/v1/file' && (req.method === 'GET' || req.method === 'DELETE')) || 
        (req.path.match(/^\/v1\/file\/[^\/]+$/) && req.method === 'GET' || req.method === 'DELETE')) {
      
      if (Object.keys(req.body).length > 0 || 
          Object.keys(req.query).length > 0 || 
          (req.get("Content-Length") !== undefined && req.get("Content-Length") !== "0") || 
          req.get("Authorization") || 
          req.get("authentication")) {
        
        logger.error({
        type: 'VALIDATION_ERROR',
        message: 'API request failed: Payload should be empty',
        method: req.method,
        path: req.path,
        hasBody: Object.keys(req.body).length > 0,
        hasQuery: Object.keys(req.query).length > 0,
        hasContentLength: req.get("Content-Length") !== undefined,
        hasAuth: !!(req.get("Authorization") || req.get("authentication"))
      });
        statsd.increment('middleware.checkEmptyPayload.error');
        return res.status(400).json({ message: 'Bad Request' });
      }
    }
    const duration = new Date() - startTime;
    statsd.timing('middleware.checkEmptyPayload.time', duration);

    logger.debug({
      type: 'MIDDLEWARE_EXECUTION',
      message: 'Empty payload check completed',
      method: req.method,
      path: req.path,
      duration
    });
    next();
  };
  
  module.exports = checkEmptyPayload;
  