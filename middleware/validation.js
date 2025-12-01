const { body, param, validationResult } = require('express-validator');

// Validation middleware to check for validation errors
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User login validation
const validateUserLogin = [
  body('phone_number')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Invalid phone number format'),
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6 })
    .withMessage('OTP must be at least 6 characters'),
  checkValidation
];

// User Registration validation
const validateUserRegister = [
  body('phone_number')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Invalid phone number format'),
  body('fullname')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Full name must be 50 characters or less'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  checkValidation
];

// Admin login validation
const validateAdminLogin = [
  body('admin_id')
    .notEmpty()
    .withMessage('Admin ID is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  checkValidation
];

// Property validation
const validateProperty = [
  body('propertyCode')
    .notEmpty()
    .withMessage('Property code is required')
    .isLength({ max: 8 })
    .withMessage('Property code must be 8 characters or less'),
  body('OwnerName')
    .notEmpty()
    .withMessage('Owner name is required')
    .isLength({ max: 50 })
    .withMessage('Owner name must be 50 characters or less'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Invalid phone number format'),
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 50 })
    .withMessage('Address must be 50 characters or less'),
  body('propertyType')
    .notEmpty()
    .withMessage('Property type is required'),
  body('category')
    .isIn(['Single Unit', 'Multi-Unit', 'Apartment', 'Land'])
    .withMessage('Invalid property category'),
  body('assetValue')
    .isFloat({ min: 0 })
    .withMessage('Asset value must be a positive number'),
  body('rate')
    .isFloat({ min: 0 })
    .withMessage('Rate must be a positive number'),
  body('billingCycle')
    .isIn(['Annual', 'Quarterly'])
    .withMessage('Billing cycle must be Annual or Quarterly'),
  checkValidation
];

// Payment validation
const validatePayment = [
  body('property_code')
    .notEmpty()
    .withMessage('Property code is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('payment_method')
    .isIn(['Mobile Money', 'Visa / MasterCard'])
    .withMessage('Invalid payment method'),
  checkValidation
];

// Admin validation
const validateAdmin = [
  body('admin_id')
    .notEmpty()
    .withMessage('Admin ID is required')
    .isLength({ max: 50 })
    .withMessage('Admin ID must be 50 characters or less'),
  body('fullname')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 50 })
    .withMessage('Full name must be 50 characters or less'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('district_id')
    .notEmpty()
    .withMessage('District ID is required'),
  body('status')
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  checkValidation
];

// District validation
const validateDistrict = [
  body('district_id')
    .notEmpty()
    .withMessage('District ID is required')
    .isLength({ max: 50 })
    .withMessage('District ID must be 50 characters or less'),
  body('district_name')
    .notEmpty()
    .withMessage('District name is required')
    .isLength({ max: 50 })
    .withMessage('District name must be 50 characters or less'),
  checkValidation
];

// Change password validation
const validateChangePassword = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required')
    .isLength({ min: 8 })
    .withMessage('Old password must be at least 8 characters'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
  checkValidation
];

// Admin ID parameter validation
const validateAdminId = [
  param('admin_id')
    .notEmpty()
    .withMessage('Admin ID is required')
    .isLength({ max: 50 })
    .withMessage('Admin ID must be 50 characters or less'),
  checkValidation
];

module.exports = {
  validateUserLogin,
  validateAdminLogin,
  validateProperty,
  validatePayment,
  validateAdmin,
  validateDistrict,
  validateUserRegister,
  validateChangePassword,
  validateAdminId,
  checkValidation
};