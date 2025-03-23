const {logger} = require('./logger');

const checkEmptyPayload = (req, res, next) => {

    if ((req.path === '/v1/file' && (req.method === 'GET' || req.method === 'DELETE')) || 
        (req.path.match(/^\/v1\/file\/[^\/]+$/) && req.method === 'GET' || req.method === 'DELETE')) {
      
      if (Object.keys(req.body).length > 0 || 
          Object.keys(req.query).length > 0 || 
          (req.get("Content-Length") !== undefined && req.get("Content-Length") !== "0") || 
          req.get("Authorization") || 
          req.get("authentication")) {
        
        logger.error("API request failed: Payload should be empty");
        return res.status(400).json({ message: 'Bad Request' });
      }
    }
    next();
  };
  
  module.exports = checkEmptyPayload;
  