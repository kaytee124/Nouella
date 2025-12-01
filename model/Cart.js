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
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    dateadded: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Cart',
    tableName: 'Cart',
    timestamps: false
});

module.exports = Cart;

