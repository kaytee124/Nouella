const customerService = require('../services/customerService');
const { sanitizeInput } = require('../middleware/auth');

class CustomerController {
  async checkout(req, res) {
    try{
        if(req.method !== 'POST'){
            return res.status(405).json({
                error: true,
                message: 'Wrong request method. Please try again.'
            });
        }
        const { cartId, customerId } = req.body;
        if (!cartId || !customerId) {
            return res.status(400).json({
                error: true,
                message: 'Cart ID and Customer ID are required.'
            });
        }
        const result = await customerService.checkout(cartId, customerId);
        res.json(result);
    } catch (error) {
        console.error('❌ Checkout error:', error);
        return res.status(500).json({
            error: true,
            message: 'An error occurred during checkout. Please try again.'
        });
    }
  }

  async all_categories(req, res) {
    try{
        if(req.method !== 'GET'){
            return res.status(405).json({
                error: true,
                message: 'Wrong request method. Please try again.'
            });
        }
        const categories = await customerService.all_categories();
        res.json(categories);
    }
    catch (error) {
        console.error('❌ All categories error:', error);
        return res.status(500).json({
            error: true,
            message: 'An error occurred while fetching all categories. Please try again.'
        });
    }
  }

  async all_products(req, res) {
    try{
        if(req.method !== 'POST'){
            return res.status(405).json({
                error: true,
                message: 'Wrong request method. Please try again.'
            });
        }
        const { categoryId } = req.body;
        if (!categoryId) {
            return res.status(400).json({
                error: true,
                message: 'Category ID is required.'
            });
        }
        const sanitized_categoryId = sanitizeInput(categoryId);
        const products = await customerService.all_products(sanitized_categoryId);
        res.json(products);
    }
    catch (error) {
        console.error('❌ All products error:', error);
        return res.status(500).json({
            error: true,
            message: 'An error occurred while fetching all products. Please try again.'
        });
    }
  }

async checkPaymentStatus(req, res) {
    try{
        if(req.method !== 'POST'){
            return res.status(405).json({
                error: true,
                message: 'Wrong request method. Please try again.'
            });
        }
        const { transactionId } = req.body;
        if (!transactionId) {
            return res.status(400).json({
                error: true,
                message: 'Transaction ID is required.'
            });
        }
        const sanitized_transactionId = sanitizeInput(transactionId);
        const paymentStatus = await customerService.checkPaymentStatus(sanitized_transactionId);
        res.json(paymentStatus);
    }
    catch (error) {
        console.error('❌ Check payment status error:', error);
        return res.status(500).json({
            error: true,
            message: 'An error occurred while checking payment status. Please try again.'
        });
    }
}

  async getPaymentHistory(req, res) {
    try{
        if(req.method !== 'POST'){
            return res.status(405).json({
                error: true,
                message: 'Wrong request method. Please try again.'
            });
        }
        const { customerId } = req.body;
        if (!customerId) {
            return res.status(400).json({
                error: true,
                message: 'Customer ID is required.'
            });
        }
        const sanitized_customerId = sanitizeInput(customerId);
        const paymentHistory = await customerService.getPaymentHistory(sanitized_customerId);
        res.json(paymentHistory);
    }
    catch (error) {
        console.error('❌ Get payment history error:', error);
        return res.status(500).json({
            error: true,
            message: 'An error occurred while getting payment history. Please try again.'
        });
    }
  }

  async change_password(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { oldPassword, newPassword } = req.body;
      const customerId = req.user.id;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          error: true,
          message: 'Old password and new password are required.'
        });
      }

      const response = await customerService.change_password(customerId, oldPassword, newPassword);
      res.json(response);
    } catch (error) {
      console.error('❌ Change password error:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to change password.'
      });
    }
  }

  async edit_customer(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { name, email } = req.body;
      const customerId = req.user.id;

      const response = await customerService.edit_customer(customerId, name, email);
      res.json(response);
    } catch (error) {
      console.error('❌ Edit customer error:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to update customer profile.'
      });
    }
  }
}

module.exports = new CustomerController();