const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const { hashPassword } = require('../middleware/auth');

class Customers extends Model {}

Customers.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    emailName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Password: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Customers',
    tableName: 'Customers',
    timestamps: false,
    hooks: {
        beforeCreate: async (customer) => {
            customer.Password = await hashPassword(customer.Password);
        },
        beforeUpdate: async (customer) => {
            if (customer.changed('Password')) {
                customer.Password = await hashPassword(customer.Password);
            }
        }
    }
});

module.exports = Customers;

