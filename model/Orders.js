const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Orders extends Model {}

Orders.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customerid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Customers',
            key: 'id'
        }
    },
    dateadded: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('Pending', 'paid', 'Delivered'),
        allowNull: false,
        defaultValue: 'Pending'
    },
    address: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    ordertotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'Orders',
    tableName: 'Orders',
    timestamps: false
});

module.exports = Orders;

