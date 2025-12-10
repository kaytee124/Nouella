const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Cart extends Model {}

Cart.init({
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
    carttotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    dateadded: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('Active', 'Processed', 'Canceled'),
        allowNull: false,
        defaultValue: 'Active'
    }
}, {
    sequelize,
    modelName: 'Cart',
    tableName: 'Cart',
    timestamps: false
});

module.exports = Cart;

