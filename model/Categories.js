const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Categories extends Model {}

Categories.init({
    catid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    adminid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Superadmin',
            key: 'id'
        }
    },
    catName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Categories',
    tableName: 'Categories',
    timestamps: false
});

module.exports = Categories;