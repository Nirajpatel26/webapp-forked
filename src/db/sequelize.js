
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');
const HealthCheckModel = require('../models/health_check');

dotenv.config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
});

const HealthCheck = HealthCheckModel(sequelize);


// Synchronize models with the database
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synchronized with models.');
    })
    .catch((err) => {
        console.log('Error synchronizing database:', err);
    });

module.exports={sequelize,HealthCheck};
