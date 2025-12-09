const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

router.post('/login-customer', authController.loginCustomer);
router.post('/login-superadmin', authController.loginSuperAdmin);
router.post('/register-customer', authController.RegisterCustomer);
router.post('/register-superadmin', authController.RegisterSuperAdmin);
router.post('/change-customer-password', authenticateUser, authController.ChangeCustomerPassword);
router.post('/change-superadmin-password', authenticateUser, authController.ChangeSuperAdminPassword);

module.exports = router;
