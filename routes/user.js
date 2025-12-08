const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateUser } = require('../middleware/auth');

// Public routes
router.get('/all_categories', customerController.all_categories);
router.post('/all_products', customerController.all_products);
router.post('/checkout', customerController.checkout);
router.post('/check-payment-status', customerController.checkPaymentStatus);

// Authenticated routes
router.post('/get-payment-history', authenticateUser, customerController.getPaymentHistory);
router.post('/change-password', authenticateUser, customerController.change_password);
router.post('/edit-profile', authenticateUser, customerController.edit_customer);

module.exports = router;
