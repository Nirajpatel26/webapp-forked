const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const HealthCheck = sequelize.define('HealthCheck', {
        check_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        datetime: {
            type: DataTypes.DATE,
            allowNull: false
        }
        
    }, {
        tableName: 'health_check',
        timestamps: false
    });

    return HealthCheck;
};