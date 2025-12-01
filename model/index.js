const Superadmin = require('./Superadmin');
const Customers = require('./Customers');
const Categories = require('./Categories');
const Product = require('./Product');
const Cart = require('./Cart');
const Cart_Items = require('./Cart_Items');
const Orders = require('./Orders');
const Order_Items = require('./Order_Items');
const Payment = require('./Payment');

// =============================================
// Associations
// =============================================

// Superadmin → Categories (One-to-Many)
Categories.belongsTo(Superadmin, {
    foreignKey: 'adminid',
    as: 'admin'
});
Superadmin.hasMany(Categories, {
    foreignKey: 'adminid',
    as: 'categories'
});

// Categories → Product (One-to-Many)
Product.belongsTo(Categories, {
    foreignKey: 'catid',
    as: 'category'
});
Categories.hasMany(Product, {
    foreignKey: 'catid',
    as: 'products'
});

// Customers → Cart (One-to-Many)
Cart.belongsTo(Customers, {
    foreignKey: 'customerid',
    as: 'customer'
});
Customers.hasMany(Cart, {
    foreignKey: 'customerid',
    as: 'carts'
});

// Cart → Cart_Items (One-to-Many)
Cart_Items.belongsTo(Cart, {
    foreignKey: 'cartID',
    as: 'cart'
});
Cart.hasMany(Cart_Items, {
    foreignKey: 'cartID',
    as: 'cartItems'
});

// Product → Cart_Items (One-to-Many)
Cart_Items.belongsTo(Product, {
    foreignKey: 'productid',
    as: 'product'
});
Product.hasMany(Cart_Items, {
    foreignKey: 'productid',
    as: 'cartItems'
});

// Customers → Orders (One-to-Many)
Orders.belongsTo(Customers, {
    foreignKey: 'customerid',
    as: 'customer'
});
Customers.hasMany(Orders, {
    foreignKey: 'customerid',
    as: 'orders'
});

// Orders → Order_Items (One-to-Many)
Order_Items.belongsTo(Orders, {
    foreignKey: 'orderID',
    as: 'order'
});
Orders.hasMany(Order_Items, {
    foreignKey: 'orderID',
    as: 'orderItems'
});

// Product → Order_Items (One-to-Many)
Order_Items.belongsTo(Product, {
    foreignKey: 'productid',
    as: 'product'
});
Product.hasMany(Order_Items, {
    foreignKey: 'productid',
    as: 'orderItems'
});

// Customers → Payment (One-to-Many)
Payment.belongsTo(Customers, {
    foreignKey: 'customerid',
    as: 'customer'
});
Customers.hasMany(Payment, {
    foreignKey: 'customerid',
    as: 'payments'
});

// Orders → Payment (One-to-One)
Payment.belongsTo(Orders, {
    foreignKey: 'orderid',
    as: 'order'
});
Orders.hasOne(Payment, {
    foreignKey: 'orderid',
    as: 'payment'
});

module.exports = {
    Superadmin,
    Customers,
    Categories,
    Product,
    Cart,
    Cart_Items,
    Orders,
    Order_Items,
    Payment
};
