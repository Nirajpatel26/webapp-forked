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
        logger.info(`Database connected successfully`);
    } catch (error) {
        statsd.increment('db.connection.error');
        logger.error('Database connection error', error);
    }
};

// Initialize the database connection
connectToDb();

app.all("/healthz", setHeaders ,async (req, res) => {
    const startTime = new Date();
    try {

        statsd.increment('api.healthz');

        if (req.method !== 'GET') {
            
            logger.warn(`Health check failed: Method ${req.method} not allowed`);
            statsd.increment('api.healthz.method_not_allowed');
            return res.status(405).send();
        }


        if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0 || req.get("Content-Length")!== undefined || req.get("Authorization") ||
        req.get("authentication")  ) {
            
            logger.warn('Health check failed: Payload should be empty');
            statsd.increment('api.healthz.bad_request');
            return res.status(400).send();
        }
       
        const dbStartTime = new Date();
        await HealthCheck.create({
            datetime: new Date()
        });
        const dbDuration = new Date() - dbStartTime;
        statsd.timing('db.healthcheck.create.time', dbDuration);
        logger.info(`Health check record created`);
        
        logger.info(`GET API /v1/file: Created file record` );
        statsd.increment('api.healthz.success');

        res.status(200).send();
    
    } catch (error) {
        
        logger.error('Health check error',error);
        statsd.increment('api.healthz.error');
        res.status(503).send();
    }finally {
        const duration = new Date() - startTime;
        statsd.timing('api.healthz.time', duration);
    }
});

app.all("/cicd", setHeaders ,async (req, res) => {
    const startTime = new Date();
    try {

        statsd.increment('api.healthz');

        if (req.method !== 'GET') {
            
            logger.warn(`Health check failed: Method ${req.method} not allowed`);
            statsd.increment('api.healthz.method_not_allowed');
            return res.status(405).send();
        }


        if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0 || req.get("Content-Length")!== undefined || req.get("Authorization") ||
        req.get("authentication")  ) {
            
            logger.warn('Health check failed: Payload should be empty');
            statsd.increment('api.healthz.bad_request');
            return res.status(400).send();
        }
       
        const dbStartTime = new Date();
        await HealthCheck.create({
            datetime: new Date()
        });
        const dbDuration = new Date() - dbStartTime;
        statsd.timing('db.healthcheck.create.time', dbDuration);
        logger.info(`Health check record created`);
        
        logger.info(`GET API /v1/file: Created file record` );
        statsd.increment('api.healthz.success');

        res.status(200).send();
    
    } catch (error) {
        
        logger.error('Health check error',error);
        statsd.increment('api.healthz.error');
        res.status(503).send();
    }finally {
        const duration = new Date() - startTime;
        statsd.timing('api.healthz.time', duration);
    }
});
app.use(setHeaders);

app.use('/',file_route);

app.get('*', setHeaders, (req, res) => {
    statsd.increment('api.not_found');
    logger.error(`404 Not Found`);
    return res.status(404).send();
  });

// Start the server
const port = process.env.SERVER_PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    logger.info(`Server is running on port ${port}`);
});

module.exports={app,server};
