const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateUser } = require('../middleware/auth');

// Cart routes (protected)
router.post('/cart/add', authenticateUser, customerController.addToCart);
router.post('/cart/checkout', authenticateUser, customerController.checkout);
router.post('/cart/update-quantity', authenticateUser, customerController.updateCartQuantity);
router.post('/cart/increase-quantity', authenticateUser, customerController.increaseQuantity);
router.post('/cart/decrease-quantity', authenticateUser, customerController.decreaseQuantity);

// Product routes (public for browsing, protected for purchase)
router.get('/categories', customerController.getAllCategories);
router.post('/products', customerController.getAllProducts);

// Payment routes (protected)
router.post('/payment/process', authenticateUser, customerController.processMMPayment);
router.post('/payment/check-status', authenticateUser, customerController.checkPaymentStatus);
router.get('/payment/history', authenticateUser, customerController.getPaymentHistory);

// Customer management (protected)
router.post('/edit', authenticateUser, customerController.editCustomer);
router.post('/change-password', authenticateUser, customerController.changePassword);

module.exports = router;
