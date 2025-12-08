const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadminController');
const {authenticateUser, requireSuperAdmin} = require('../middleware/auth');

// Public routes
router.post('/register', superadminController.registerSuperAdmin);

// Authenticated superadmin routes
router.post('/add-product', authenticateUser, requireSuperAdmin, superadminController.add_product);
router.post('/update-product', authenticateUser, requireSuperAdmin, superadminController.update_product);
router.post('/create-category', authenticateUser, requireSuperAdmin, superadminController.create_category);
router.post('/update-category', authenticateUser, requireSuperAdmin, superadminController.update_category);
router.post('/update-order-status', authenticateUser, requireSuperAdmin, superadminController.update_order_status);
router.post('/change-password', authenticateUser, requireSuperAdmin, superadminController.change_password);
router.post('/edit-profile', authenticateUser, requireSuperAdmin, superadminController.edit_superadmin);

// Legacy routes (keeping for backward compatibility, can be removed later)
router.post('/manager_status', authenticateUser, requireSuperAdmin, superadminController.manager_status);
router.post('/add_manager', authenticateUser, requireSuperAdmin, superadminController.add_manager);
router.post('/update_manager', authenticateUser, requireSuperAdmin, superadminController.update_manager);
router.get('/all_managers', authenticateUser, requireSuperAdmin, superadminController.all_managers);
router.get('/dashboard', authenticateUser, requireSuperAdmin, superadminController.getDashboard);
router.get('/contest-report', authenticateUser, requireSuperAdmin, superadminController.getContestReport);

module.exports = router;