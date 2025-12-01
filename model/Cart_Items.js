const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Cart_Items extends Model {}

Cart_Items.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cartID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Cart',
            key: 'id'
        }
    },
    productid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Product',
            key: 'productid'
        }
    },
    Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    dateadded: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Cart_Items',
    tableName: 'Cart_Items',
    timestamps: false
});

module.exports = Cart_Items;

