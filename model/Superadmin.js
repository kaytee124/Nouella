const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const { hashPassword } = require('../middleware/auth');

class Superadmin extends Model {}

Superadmin.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
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
    modelName: 'Superadmin',
    tableName: 'Superadmin',
    timestamps: false,
    hooks: {
        beforeCreate: async (admin) => {
            admin.Password = await hashPassword(admin.Password);
        },
        beforeUpdate: async (admin) => {
            if (admin.changed('Password')) {
                admin.Password = await hashPassword(admin.Password);
            }
        }
    }
});

module.exports = Superadmin;