const customerService = require('../services/customerService');
const { sanitizeInput } = require('../middleware/auth');

class CustomerController {
  // Cart functions
  async addToCart(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { productId } = req.body;
      const customerId = req.user.id;

      if (!productId) {
        return res.status(400).json({
          error: true,
          message: 'Product ID is required.'
        });
      }

      const sanitized_productId = sanitizeInput(productId);
      const result = await customerService.add_to_cart(customerId, sanitized_productId);
      res.json(result);
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred while adding to cart. Please try again.'
      });
    }
  }

  async checkout(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { cartId } = req.body;
      const customerId = req.user.id;

      if (!cartId) {
        return res.status(400).json({
          error: true,
          message: 'Cart ID is required.'
        });
      }

      const sanitized_cartId = sanitizeInput(cartId);
      const result = await customerService.checkout(sanitized_cartId, customerId);
      res.json(result);
    } catch (error) {
      console.error('❌ Checkout error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred during checkout. Please try again.'
      });
    }
  }

  async updateCartQuantity(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { cartId, cartItemId, quantity } = req.body;

      if (!cartId || !cartItemId || quantity === undefined) {
        return res.status(400).json({
          error: true,
          message: 'Cart ID, Cart Item ID, and quantity are required.'
        });
      }

      const sanitized_cartId = sanitizeInput(cartId);
      const sanitized_cartItemId = sanitizeInput(cartItemId);
      const sanitized_quantity = parseInt(quantity);
      const result = await customerService.update_cart_quantity(sanitized_cartId, sanitized_cartItemId, sanitized_quantity);
      res.json(result);
    } catch (error) {
      console.error('❌ Update cart quantity error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred while updating cart quantity. Please try again.'
      });
    }
  }

  async increaseQuantity(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { cartId, cartItemId } = req.body;

      if (!cartId || !cartItemId) {
        return res.status(400).json({
          error: true,
          message: 'Cart ID and Cart Item ID are required.'
        });
      }

      const sanitized_cartId = sanitizeInput(cartId);
      const sanitized_cartItemId = sanitizeInput(cartItemId);
      const result = await customerService.increase_quantity(sanitized_cartId, sanitized_cartItemId);
      res.json(result);
    } catch (error) {
      console.error('❌ Increase quantity error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred while increasing quantity. Please try again.'
      });
    }
  }

  async decreaseQuantity(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { cartId, cartItemId } = req.body;

      if (!cartId || !cartItemId) {
        return res.status(400).json({
          error: true,
          message: 'Cart ID and Cart Item ID are required.'
        });
      }

      const sanitized_cartId = sanitizeInput(cartId);
      const sanitized_cartItemId = sanitizeInput(cartItemId);
      const result = await customerService.decrease_quantity(sanitized_cartId, sanitized_cartItemId);
      res.json(result);
    } catch (error) {
      console.error('❌ Decrease quantity error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred while decreasing quantity. Please try again.'
      });
    }
  }

  // Product functions
  async getAllCategories(req, res) {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const categories = await customerService.all_categories();
      res.json(categories);
    } catch (error) {
      console.error('❌ All categories error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred while fetching all categories. Please try again.'
      });
    }
  }

  async getAllProducts(req, res) {
    try {
      if (req.method !== 'POST') {
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
    } catch (error) {
      console.error('❌ All products error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred while fetching all products. Please try again.'
      });
    }
  }

  // Payment functions
  async processMMPayment(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { orderId, amount, paymentMethod, momoNumber, address } = req.body;
      const customerId = req.user.id;

      if (!orderId || !amount || !paymentMethod || !momoNumber || !address) {
        return res.status(400).json({
          error: true,
          message: 'Order ID, amount, payment method, mobile money number, and address are required.'
        });
      }

      const sanitized_orderId = sanitizeInput(orderId);
      const sanitized_amount = parseFloat(amount);
      const sanitized_paymentMethod = sanitizeInput(paymentMethod);
      const sanitized_momoNumber = sanitizeInput(momoNumber);
      const sanitized_address = sanitizeInput(address);

      // Get order to calculate quantity
      const { Orders } = require('../model');
      const order = await Orders.findByPk(sanitized_orderId);
      if (!order) {
        return res.status(404).json({
          error: true,
          message: 'Order not found.'
        });
      }

      const result = await customerService.processMMPayment(
        sanitized_orderId,
        customerId,
        sanitized_amount,
        sanitized_paymentMethod,
        sanitized_momoNumber,
        sanitized_address
      );
      res.json(result);
    } catch (error) {
      console.error('❌ Process payment error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred while processing payment. Please try again.'
      });
    }
  }

  async checkPaymentStatus(req, res) {
    try {
      if (req.method !== 'POST') {
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
    } catch (error) {
      console.error('❌ Check payment status error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred while checking payment status. Please try again.'
      });
    }
  }

  async getPaymentHistory(req, res) {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const customerId = req.user.id;
      const paymentHistory = await customerService.getPaymentHistory(customerId);
      res.json(paymentHistory);
    } catch (error) {
      console.error('❌ Get payment history error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred while getting payment history. Please try again.'
      });
    }
  }

  // Customer management
  async editCustomer(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { name, email } = req.body;
      const customerId = req.user.id;

      if (!name && !email) {
        return res.status(400).json({
          error: true,
          message: 'Name or email is required.'
        });
      }

      const sanitized_name = name ? sanitizeInput(name) : null;
      const sanitized_email = email ? sanitizeInput(email) : null;
      const result = await customerService.editCustomer(customerId, sanitized_name, sanitized_email);
      res.json(result);
    } catch (error) {
      console.error('❌ Edit customer error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred while editing customer. Please try again.'
      });
    }
  }

  async changePassword(req, res) {
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

      const sanitized_oldPassword = sanitizeInput(oldPassword);
      const sanitized_newPassword = sanitizeInput(newPassword);
      const result = await customerService.changeCustomerPassword(customerId, sanitized_oldPassword, sanitized_newPassword);
      res.json(result);
    } catch (error) {
      console.error('❌ Change password error:', error);
      res.status(500).json({
        error: true,
        message: 'An error occurred while changing password. Please try again.'
      });
    }
  }
}

module.exports = new CustomerController();
