const express = require('express');
const dotenv = require('dotenv');
const {sequelize,HealthCheck} = require('./src/db/sequelize');
const setHeaders = require('./src/middleware/setHeaders');




dotenv.config();
const app = express();
app.use(express.json());


// Connect to the database
const connectToDb = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully.");
    } catch (error) {
        console.log(`Database connection error: ${error.message}`);
    }
};

// Initialize the database connection
connectToDb();

app.all("/healthz", setHeaders ,async (req, res) => {
    try {

        if (Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0 || req.get("Content-Length")>0) {
            
            console.log("Health check failed: Payload should be empty");
            return res.status(400).send();
        }
        if (req.method !== 'GET') {
            
            console.log(`Health check failed: Method ${req.method} not allowed`);
            return res.status(405).send();
        }
        await HealthCheck.create({
            datetime: new Date()
        });
        console.log('Health check successful');

        res.status(200).send();
    
    } catch (error) {
        
        console.log(`Health check error: ${error.message}`);
        res.status(503).send();
    }
});

app.all('/', setHeaders ,async (req, res) => {
    console.log("Health check unsuccessful");
    res.status(405).send();
})

// Start the server
const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports={app};
