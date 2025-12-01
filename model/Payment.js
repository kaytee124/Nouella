const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Payment extends Model {}

Payment.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  TransactionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  orderid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  amount_paid: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  date_paid: {
    type: DataTypes.DATE,
    allowNull: false
  },
  date_completed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  Status: {
    type: DataTypes.ENUM('Completed', 'Pending', 'Unsuccessful'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  customerid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Customers',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Payment',
  tableName: 'Payment',
  timestamps: false,
  indexes: [
    {
      fields: ['orderid']
    },
    {
      fields: ['customerid']
    }
  ]
});

module.exports = Payment;