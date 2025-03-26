const express = require('express');
const dotenv = require('dotenv');
const {sequelize,HealthCheck} = require('./src/db/sequelize');
const setHeaders = require('./src/middleware/setHeaders');
const file_route = require('./src/routes/file_route');
const {logger,statsd} = require('./src/middleware/logger');



dotenv.config();
const app = express();
app.use(express.json());


// Connect to the database
const connectToDb = async () => {
    const startTime = new Date();
    try {
        await sequelize.authenticate();
        const duration = new Date() - startTime;
        statsd.timing('db.connection.time', duration);
        statsd.increment('db.connection.success');
        logger.info({
            type: 'DB_CONNECTION',
            message: 'Database connected successfully',
            duration
        });
    } catch (error) {
        statsd.increment('db.connection.error');
        logger.error({
            type: 'DB_CONNECTION_ERROR',
            message: 'Database connection error',
            error: error.message,
            stack: error.stack
        });
    }
};

// Initialize the database connection
connectToDb();

app.all("/healthz", setHeaders ,async (req, res) => {
    const startTime = new Date();
    statsd.increment('api.healthz');
    try {

        if (req.method !== 'GET') {
            
            logger.warn({
                type: 'METHOD_NOT_ALLOWED',
                message: `Health check failed: Method ${req.method} not allowed`,
                method: req.method,
                path: '/healthz'
            });
            statsd.increment('api.healthz.method_not_allowed');
            return res.status(405).send();
        }


        if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0 || req.get("Content-Length")!== undefined || req.get("Authorization") ||
        req.get("authentication")  ) {
            
            logger.warn({
                type: 'BAD_REQUEST',
                message: 'Health check failed: Payload should be empty',
                method: req.method,
                path: '/healthz',
                hasBody: Object.keys(req.body).length > 0,
                hasQuery: Object.keys(req.query).length > 0,
                hasContentLength: req.get("Content-Length") !== undefined
            });
            statsd.increment('api.healthz.bad_request');
            return res.status(400).send();
        }
       
        const dbStartTime = new Date();
        await HealthCheck.create({
            datetime: new Date()
        });
        const dbDuration = new Date() - dbStartTime;
        statsd.timing('db.healthcheck.create.time', dbDuration);
        logger.info({
            type: 'DB_CREATE',
            message: 'Health check record created',
            operation: 'create',
            duration: dbDuration
        });
        
        logger.info({
            type: 'API_RESPONSE',
            message: 'Health check successful',
            method: 'GET',
            path: '/healthz',
            status: 200
        });
        statsd.increment('api.healthz.success');

        res.status(200).send();
    
    } catch (error) {
        
        logger.error({
            type: 'API_ERROR',
            message: 'Health check error',
            method: req.method,
            path: '/healthz',
            error: error.message,
            stack: error.stack
        });
        statsd.increment('api.healthz.error');
        res.status(503).send();
    }finally {
        const duration = new Date() - startTime;
        statsd.timing('api.healthz.time', duration);
    }
});

app.all('/', setHeaders ,async (req, res) => {
    statsd.increment('api.root');
    logger.error({
        type: 'METHOD_NOT_ALLOWED',
        message: 'Health check unsuccessful',
        method: req.method,
        path: '/'
    });
    res.status(405).send();
})

app.use(setHeaders);

app.use('/',file_route);

app.get('*', setHeaders, (req, res) => {
    statsd.increment('api.not_found');
    logger.error({
        type: 'NOT_FOUND',
        message: '404 Not Found',
        method: req.method,
        path: req.path
    });
    return res.status(404).send();
  });

// Start the server
const port = process.env.SERVER_PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    logger.info({
        type: 'SERVER_START',
        message: `Server is running on port ${port}`,
        port
    });
});

module.exports={app,server};
