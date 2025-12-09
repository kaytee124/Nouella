const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadminController');
const { authenticateUser, requireSuperAdmin } = require('../middleware/auth');

// Dashboard (protected)
router.get('/dashboard', authenticateUser, requireSuperAdmin, superadminController.getDashboard);

// Category management (protected)
router.post('/category/create', authenticateUser, requireSuperAdmin, superadminController.createCategory);
router.put('/category/update/:catid', authenticateUser, requireSuperAdmin, superadminController.updateCategory);
router.delete('/category/delete/:catid', authenticateUser, requireSuperAdmin, superadminController.deleteCategory);
router.get('/category/all', authenticateUser, requireSuperAdmin, superadminController.getAllCategories);

// Product management (protected)
const { uploadProductImage, handleUploadError } = require('../middleware/upload');
router.post('/product/add', authenticateUser, requireSuperAdmin, uploadProductImage, handleUploadError, superadminController.addProduct);
router.put('/product/update/:productid', authenticateUser, requireSuperAdmin, uploadProductImage, handleUploadError, superadminController.updateProduct);
router.delete('/product/delete/:productid', authenticateUser, requireSuperAdmin, superadminController.deleteProduct);
router.get('/product/all', authenticateUser, requireSuperAdmin, superadminController.getAllProducts);

// Order management (protected)
router.put('/order/update-status/:orderid', authenticateUser, requireSuperAdmin, superadminController.updateOrderStatus);
router.get('/order/all', authenticateUser, requireSuperAdmin, superadminController.getAllOrders);

// Superadmin management (protected)
router.post('/edit', authenticateUser, requireSuperAdmin, superadminController.editSuperAdmin);

module.exports = router;
