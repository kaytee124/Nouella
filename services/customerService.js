const {Cart, Cart_Items, Orders, Order_Items, Payment, Product, Categories, Customers} = require('../model');
const sequelize = require('../config/db');
const cron = require('node-cron');
const axiosInstance = require('./axiosretry');
const { Op, Sequelize, col } = require('sequelize');

// Helper function to normalize phone numbers
function normalizePhoneNumber(phone) {
  if (!phone) return null;
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  // If starts with 0, replace with country code
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.substring(1);
  }
  // If doesn't start with country code, add it
  if (!cleaned.startsWith('233')) {
    cleaned = '233' + cleaned;
  }
  return cleaned;
}

class CustomerService {

  async add_to_cart(customerId, productId) {
    let transaction;
    try {
      console.log('🛒 Adding to cart:', { customerId, productId });

      // Validate inputs
      if (!customerId || !productId) {
        return { 
          success: false, 
          message: 'Customer ID and Product ID are required.' 
        };
      }

      transaction = await sequelize.transaction();

      // Fetch product to get current price
      const product = await Product.findByPk(productId, { transaction });
      if (!product) {
        await transaction.rollback();
        return { success: false, message: 'Product not found' };
      }

      // Check stock availability
      if (product.Stock < 1) {
        await transaction.rollback();
        return { 
          success: false, 
          message: 'Product is out of stock.' 
        };
      }

      // Find or create active cart for customer
      let cart = await Cart.findOne({
        where: {
          customerid: customerId,
          status: 'Active'
        },
        transaction
      });

      if (!cart) {
        cart = await Cart.create({
          customerid: customerId,
          carttotal: 0,
          dateadded: new Date(),
          status: 'Active'
        }, { transaction });
        console.log('✅ New cart created:', cart.id);
      }

      // Check if product already exists in cart
      const existingCartItem = await Cart_Items.findOne({
        where: {
          cartID: cart.id,
          productid: productId
        },
        transaction
      });

      const productPrice = parseFloat(product.Price);

      if (existingCartItem) {
        // Increase quantity by 1
        const newQuantity = existingCartItem.Quantity + 1;
        
        // Check stock for new total quantity
        if (product.Stock < newQuantity) {
          await transaction.rollback();
          return { 
            success: false, 
            message: `Insufficient stock. Cannot add more. Only ${product.Stock} items available.` 
          };
        }

        // Update existing cart item quantity
        await Cart_Items.update(
          {
            Quantity: newQuantity,
            price: productPrice
          },
          {
            where: { id: existingCartItem.id },
            transaction
          }
        );

        // Update cart total (add one item price)
        cart.carttotal = parseFloat(cart.carttotal) + productPrice;
        await cart.save({ transaction });

        console.log('✅ Cart item quantity increased by 1');
      } else {
        // Create new cart item with quantity 1
        await Cart_Items.create({
          cartID: cart.id,
          productid: productId,
          Quantity: 1,
          price: productPrice,
          dateadded: new Date()
        }, { transaction });

        // Update cart total
        cart.carttotal = parseFloat(cart.carttotal) + productPrice;
        await cart.save({ transaction });

        console.log('✅ New item added to cart with quantity 1');
      }

      await transaction.commit();
      console.log('✅ Item added to cart successfully');

      return { 
        success: true, 
        message: 'Item added to cart successfully',
        cartId: cart.id,
        cartTotal: cart.carttotal
      };
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('❌ Rollback error:', rollbackError);
        }
      }
      
      return { 
        success: false, 
        message: 'Failed to add to cart: ' + error.message 
      };
    }
  }
  // Checkout: Transfer cart items to order
  async checkout(cartId, customerId) {
    let transaction;
    try {
      console.log('🛒 Starting checkout process:', { cartId, customerId });

      transaction = await sequelize.transaction();

      // Verify cart exists and belongs to customer
      const cart = await Cart.findOne({
        where: {
          id: cartId,
          customerid: customerId,
          status: 'Active'
        },
        include: [{
          model: Cart_Items,
          as: 'cartItems',
          required: true
        }],
        transaction
      });

      if (!cart) {
        await transaction.rollback();
        return { 
          success: false, 
          message: 'Cart not found or already processed' 
        };
      }

      if (!cart.cartItems || cart.cartItems.length === 0) {
        await transaction.rollback();
        return { 
          success: false, 
          message: 'Cart is empty' 
        };
      }

      // Calculate order total from cart items
      const orderTotal = cart.cartItems.reduce((total, item) => {
        return total + (parseFloat(item.price) * item.Quantity);
      }, 0);

      // Create order (without address - will be added during payment)
      const order = await Orders.create({
        customerid: customerId,
        dateadded: new Date(),
        status: 'Pending',
        ordertotal: orderTotal
      }, { transaction });

      console.log('✅ Order created:', order.id);

      // Transfer cart items to order items
      const orderItemsData = cart.cartItems.map(item => ({
        orderID: order.id,
        productid: item.productid,
        Quantity: item.Quantity,
        price: item.price
      }));

      await Order_Items.bulkCreate(orderItemsData, { transaction });
      console.log('✅ Order items created:', orderItemsData.length);

      // Update cart status to 'Processed'
      await Cart.update(
        { status: 'Processed' },
        { 
          where: { id: cartId },
          transaction 
        }
      );
      console.log('✅ Cart status updated to Processed');

      // Commit transaction
      await transaction.commit();
      console.log('✅ Checkout completed successfully');

      return { 
        success: true, 
        message: 'Order created successfully',
        orderId: order.id,
        orderTotal: orderTotal
      };
    } catch (error) {
      console.error('❌ Checkout error:', error);
      
      if (transaction) {
        try {
          await transaction.rollback();
          console.log('🔙 Transaction rolled back');
        } catch (rollbackError) {
          console.error('❌ Rollback error:', rollbackError);
        }
      }
      
      return { 
        success: false, 
        message: 'Failed to process checkout: ' + error.message 
      };
    }
  }

  // Update product quantity in cart (sets quantity to specific value)
  async update_cart_quantity(cartId, cartItemId, quantity) {
    let transaction;
    try {
      console.log('🔄 Updating cart quantity:', { cartId, cartItemId, quantity });

      // Validate inputs
      if (!cartId || !cartItemId || quantity === undefined || quantity === null) {
        return { 
          success: false, 
          message: 'Cart ID, Cart Item ID, and quantity are required.' 
        };
      }

      if (quantity <= 0) {
        return { 
          success: false, 
          message: 'Quantity must be greater than 0. Use remove item function to remove items.' 
        };
      }

      transaction = await sequelize.transaction();

      // Find cart item with product info
      const cartItem = await Cart_Items.findOne({
        where: {
          id: cartItemId,
          cartID: cartId
        },
        include: [{
          model: Product,
          as: 'product',
          required: true
        }],
        transaction
      });

      if (!cartItem) {
        await transaction.rollback();
        return { success: false, message: 'Cart item not found' };
      }

      // Verify cart is active
      const cart = await Cart.findByPk(cartId, { transaction });
      if (!cart || cart.status !== 'Active') {
        await transaction.rollback();
        return { success: false, message: 'Cart not found or not active' };
      }

      // Check stock availability
      if (cartItem.product.Stock < quantity) {
        await transaction.rollback();
        return { 
          success: false, 
          message: `Insufficient stock. Only ${cartItem.product.Stock} items available.` 
        };
      }

      // Calculate price difference
      const oldItemTotal = parseFloat(cartItem.price) * cartItem.Quantity;
      const newItemTotal = parseFloat(cartItem.price) * parseInt(quantity);
      const priceDifference = newItemTotal - oldItemTotal;

      // Update cart item quantity
      await Cart_Items.update(
        { Quantity: parseInt(quantity) },
        {
          where: { id: cartItemId },
          transaction
        }
      );

      // Update cart total
      cart.carttotal = parseFloat(cart.carttotal) + priceDifference;
      await cart.save({ transaction });

      await transaction.commit();
      console.log('✅ Cart quantity updated successfully');

      return { 
        success: true, 
        message: 'Cart quantity updated successfully',
        cartTotal: cart.carttotal,
        newQuantity: parseInt(quantity)
      };
    } catch (error) {
      console.error('❌ Error updating cart quantity:', error);
      
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('❌ Rollback error:', rollbackError);
        }
      }
      
      return { 
        success: false, 
        message: 'Failed to update cart quantity: ' + error.message 
      };
    }
  }

  // Increase quantity by 1 (button click)
  async increase_quantity(cartId, cartItemId) {
    let transaction;
    try {
      console.log('➕ Increasing quantity:', { cartId, cartItemId });

      transaction = await sequelize.transaction();

      // Find cart item with product info
      const cartItem = await Cart_Items.findOne({
        where: {
          id: cartItemId,
          cartID: cartId
        },
        include: [{
          model: Product,
          as: 'product',
          required: true
        }],
        transaction
      });

      if (!cartItem) {
        await transaction.rollback();
        return { success: false, message: 'Cart item not found' };
      }

      // Verify cart is active
      const cart = await Cart.findByPk(cartId, { transaction });
      if (cart.status !== 'Active') {
        await transaction.rollback();
        return { success: false, message: 'Cart not active' };
      }


      const newQuantity = cartItem.Quantity + 1;

      // Check stock availability
      if (cartItem.product.Stock < newQuantity) {
        await transaction.rollback();
        return { 
          success: false, 
          message: `Insufficient stock. Only ${cartItem.product.Stock} items available.` 
        };
      }

      const itemPrice = parseFloat(cartItem.price);

      // Update cart item quantity
      await Cart_Items.update(
        { Quantity: newQuantity },
        {
          where: { id: cartItemId },
          transaction
        }
      );

      // Update cart total (add one item price)
      cart.carttotal = parseFloat(cart.carttotal) + itemPrice;
      await cart.save({ transaction });

      await transaction.commit();
      console.log('✅ Quantity increased by 1');

      return { 
        success: true, 
        message: 'Quantity increased successfully',
        cartTotal: cart.carttotal,
        newQuantity: newQuantity
      };
    } catch (error) {
      console.error('❌ Error increasing quantity:', error);
      
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('❌ Rollback error:', rollbackError);
        }
      }
      
      return { 
        success: false, 
        message: 'Failed to increase quantity: ' + error.message 
      };
    }
  }

  // Decrease quantity by 1 (button click)
  async decrease_quantity(cartId, cartItemId) {
    let transaction;
    try {
      console.log('➖ Decreasing quantity:', { cartId, cartItemId });

      transaction = await sequelize.transaction();

      // Find cart item
      const cartItem = await Cart_Items.findOne({
        where: {
          id: cartItemId,
          cartID: cartId
        },
        transaction
      });

      if (!cartItem) {
        await transaction.rollback();
        return { success: false, message: 'Cart item not found' };
      }

      // Verify cart is active
      const cart = await Cart.findByPk(cartId, { transaction });
      if (!cart || cart.status !== 'Active') {
        await transaction.rollback();
        return { success: false, message: 'Cart not found or not active' };
      }

      // Check if quantity is already 1 or less
      if (cartItem.Quantity <= 1) {
        await transaction.rollback();
        return { 
          success: false, 
          message: 'Quantity cannot be less than 1. Use remove item function to remove items.' 
        };
      }

      const newQuantity = cartItem.Quantity - 1;
      const itemPrice = parseFloat(cartItem.price);

      // Update cart item quantity
      await Cart_Items.update(
        { Quantity: newQuantity },
        {
          where: { id: cartItemId },
          transaction
        }
      );

      // Update cart total (subtract one item price)
      cart.carttotal = parseFloat(cart.carttotal) - itemPrice;
      await cart.save({ transaction });

      await transaction.commit();
      console.log('✅ Quantity decreased by 1');

      return { 
        success: true, 
        message: 'Quantity decreased successfully',
        cartTotal: cart.carttotal,
        newQuantity: newQuantity
      };
    } catch (error) {
      console.error('❌ Error decreasing quantity:', error);
      
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('❌ Rollback error:', rollbackError);
        }
      }
      
      return { 
        success: false, 
        message: 'Failed to decrease quantity: ' + error.message 
      };
    }
  }

  // Update product price and recalculate all active carts containing this product
  async update_product_price(productId, newPrice) {
    let transaction;
    try {
      console.log('💰 Updating product price:', { productId, newPrice });

      // Validate inputs
      if (!productId || newPrice === undefined || newPrice === null) {
        return { 
          success: false, 
          message: 'Product ID and new price are required.' 
        };
      }

      if (newPrice <= 0) {
        return { 
          success: false, 
          message: 'Price must be greater than 0.' 
        };
      }

      transaction = await sequelize.transaction();

      // Find product
      const product = await Product.findByPk(productId, { transaction });
      if (!product) {
        await transaction.rollback();
        return { success: false, message: 'Product not found' };
      }

      const oldPrice = parseFloat(product.Price);
      const updatedPrice = parseFloat(newPrice);

      // Update product price
      await Product.update(
        { Price: updatedPrice },
        {
          where: { productid: productId },
          transaction
        }
      );
      console.log('✅ Product price updated');

      // Find all active carts containing this product
      const cartItems = await Cart_Items.findAll({
        where: { productid: productId },
        include: [{
          model: Cart,
          as: 'cart',
          where: { status: 'Active' },
          required: true
        }],
        transaction
      });

      console.log(`📊 Found ${cartItems.length} active cart items with this product`);

      // Update each cart item price and recalculate cart totals
      for (const cartItem of cartItems) {
        const quantity = cartItem.Quantity;
        const oldItemTotal = parseFloat(cartItem.price) * quantity;
        const newItemTotal = updatedPrice * quantity;
        const priceDifference = newItemTotal - oldItemTotal;

        // Get the cart ID
        const cartId = cartItem.cartID;

        // Update cart item price
        await Cart_Items.update(
          { price: updatedPrice },
          {
            where: { id: cartItem.id },
            transaction
          }
        );

        // Get and update cart total
        const cart = await Cart.findByPk(cartId, { transaction });
        if (cart) {
          cart.carttotal = parseFloat(cart.carttotal) - oldItemTotal + newItemTotal;
          await cart.save({ transaction });
          console.log(`✅ Updated cart ${cart.id} - Price difference: ${priceDifference}`);
        }
      }

      await transaction.commit();
      console.log('✅ Product price and all cart totals updated successfully');

      return { 
        success: true, 
        message: `Product price updated. ${cartItems.length} active cart(s) updated.`,
        cartsUpdated: cartItems.length,
        oldPrice: oldPrice,
        newPrice: updatedPrice
      };
    } catch (error) {
      console.error('❌ Error updating product price:', error);
      
      if (transaction) {
        try {
          await transaction.rollback();
        } catch (rollbackError) {
          console.error('❌ Rollback error:', rollbackError);
        }
      }
      
      return { 
        success: false, 
        message: 'Failed to update product price: ' + error.message 
      };
    }
  }

  // Get payment chart data for the current year, grouped by month
  async getPaymentChartData() {
    try {
      const currentYear = new Date().getFullYear();

      const payments = await Payment.findAll({
        attributes: [
          [Sequelize.fn('MONTH', Sequelize.col('date_paid')), 'month'],
          [Sequelize.fn('SUM', Sequelize.col('amount_paid')), 'total_amount_paid'],
        ],
        where: Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date_paid')), currentYear),
        group: [Sequelize.fn('MONTH', Sequelize.col('date_paid'))],
        order: [[Sequelize.fn('MONTH', Sequelize.col('date_paid')), 'ASC']],
      });

      // Initialize an array for all 12 months with zero amounts
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: this.getMonthName(i + 1),
        total_amount_paid: 0,
      }));

      // Update amounts for months with payments
      payments.forEach((payment) => {
        const monthIndex = payment.dataValues.month - 1;
        monthlyData[monthIndex].total_amount_paid = parseFloat(
          payment.dataValues.total_amount_paid
        );
      });

      return monthlyData;
    } catch (error) {
      throw new Error('Failed to fetch payment chart data: ' + error.message);
    }
  }

  // Filter payment history by year, month, or both
  async filterPaymentHistory({ year, month } = {}) {
    try {
      const whereClause = [];

      if (year) {
        whereClause.push(
          Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date_paid')), parseInt(year))
        );
      }

      if (month) {
        whereClause.push(
          Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('date_paid')), parseInt(month))
        );
      }

      const payments = await Payment.findAll({
        where: whereClause.length > 0 ? { [Op.and]: whereClause } : undefined,
        order: [['date_paid', 'DESC']],
      });

      return payments.map((payment) => payment.toJSON());
    } catch (error) {
      throw new Error('Failed to filter payment history: ' + error.message);
    }
  }

  // Helper method to get month name by month number
  getMonthName(monthNumber) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return months[monthNumber - 1];
  }

  // Get payment history by customer ID
  async getPaymentHistory(customerId) {
    try {
      if (!customerId) throw new Error('Invalid customer ID');
      
      const result = await Payment.findAll({
        where: { customerid: customerId },
        include: [
          {
            model: Orders,
            as: 'order',
            attributes: ['id', 'status', 'ordertotal', 'dateadded'],
            required: false,
            include: [
              {
                model: Order_Items,
                as: 'orderItems',
                attributes: ['id', 'productid', 'Quantity', 'price'],
                required: false,
                include: [
                  {
                    model: Product,
                    as: 'product',
                    attributes: ['productid', 'ProductName', 'ProductPhoto', 'catid', 'category_id'],
                    required: false
                  }
                ]
              }
            ]
          }
        ],
        order: [['date_completed', 'DESC']],
      });
      
      // Transform the data to include order and product information
      const paymentHistory = result.map(payment => {
        const plain = payment.get({ plain: true });
        const order = plain.order;
        const orderItems = order?.orderItems || [];
        
        return {
          id: plain.id,
          TransactionId: plain.TransactionId,
          orderid: plain.orderid,
          quantity: plain.quantity,
          amount_paid: plain.amount_paid,
          date_paid: plain.date_paid,
          date_completed: plain.date_completed,
          paymentMethod: plain.paymentMethod,
          Status: plain.Status,
          // Include related information
          orderStatus: order?.status || null,
          orderTotal: order?.ordertotal || null,
          orderDate: order?.dateadded || null,
          products: orderItems.map(item => ({
            productid: item.productid,
            productName: item.product?.ProductName || null,
            productPhoto: item.product?.ProductPhoto || null,
            quantity: item.Quantity,
            price: item.price
          }))
        };
      });
      
      return paymentHistory;
    } catch (error) {
      throw new Error('Failed to fetch payment history: ' + error.message);
    }
  }

  async sendPaymentSMS(mobile, message) {
    try {
      console.log('📱 SMS Placeholder - Would send SMS to:', mobile);
      console.log('📱 SMS Message:', message);
      
      const response = await axiosInstance.post('https://emergentsms.com/api/sms/send-sms', {
        destination: mobile,
        message: message,
        name: 'Emergent Payment',
        source: 'Emergent Payment',
      });
      console.log('📡 SMS Response status:', response.status);
      console.log('📡 SMS Response data:', response.data);
      
      return { success: true, message: 'SMS sent successfully'};
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, message: 'Failed to send SMS', error: error.message };
    }
  }

  // Process Mobile Money payment for order
  async processMMPayment(orderId, customerId, amount, paymentMethod, momoNumber, address) {
    let transaction;
    try {
      console.log('🚀 Starting payment process for order:', {
        orderId,
        customerId,
        amount,
        paymentMethod,
        momoNumber,
      });
      
      transaction = await sequelize.transaction();
      console.log('✅ Database transaction started');

      // Verify order exists and belongs to customer
      const order = await Orders.findOne({
        where: {
          id: orderId,
          customerid: customerId,
          status: 'Pending'
        },
        transaction
      });

      if (!order) {
        await transaction.rollback();
        return { success: false, message: 'Order not found or already processed' };
      }

      // Update order address if provided
      if (address) {
        await Orders.update(
          { address: address },
          { where: { id: orderId }, transaction }
        );
      }

      const transactionId = parseInt(Date.now().toString() + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
      const datePaid = new Date();
      const normalizedMomoNumber = normalizePhoneNumber(momoNumber);
      
      if (!normalizedMomoNumber) {
        await transaction.rollback();
        throw new Error('Invalid mobile money number');
      }

      console.log('📝 Generated transaction ID:', transactionId);
      console.log('💾 Creating payment record with pending status...');

      // Get order items count for quantity
      const orderItems = await Order_Items.findAll({
        where: { orderID: orderId },
        transaction
      });
      const totalQuantity = orderItems.reduce((sum, item) => sum + item.Quantity, 0);

      // Create payment record with pending status
      await Payment.create(
        {
          TransactionId: transactionId,
          orderid: orderId,
          customerid: customerId,
          quantity: totalQuantity,
          amount_paid: parseFloat(amount),
          paymentMethod: paymentMethod,
          date_paid: datePaid,
          Status: 'Pending',
        },
        { transaction }
      );

      console.log('✅ Payment record created with status: pending');

      // Prepare payment data for API
      const payment_data = {
        app_id: process.env.APP_ID,
        app_key: process.env.APP_KEY,
        mobile_network: 'MTN',
        mobile: momoNumber,
        name: 'Emergent Payment',
        email: `customer-${customerId}`,
        feetypecode: 'GENERALPAYMENT',
        currency: 'GHS',
        amount,
        order_id: transactionId,
        order_description: `Payment for ${totalQuantity} items`,
      };

      console.log('📦 Payment data prepared:', payment_data);
      console.log('🌐 Calling external payment API...');
      
      const response = await axiosInstance.post(
        'https://api.interpayafrica.com/v3/interapi.svc/CreateMMPayment',
        payment_data
      );

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response data:', response.data);

      if (response.status !== 200) {
        console.log('❌ API returned non-200 status, rolling back transaction...');
        await transaction.rollback();
        console.log('🔙 Transaction rolled back - payment record removed from database');
        return { success: false, message: 'Payment gateway error.' };
      }

      const data = response.data;
      console.log('🔍 API response data parsed:', data);

      if (data.status_code !== 1) {
        console.log(
          '❌ API returned error status code:',
          data.status_code,
          'rolling back transaction...'
        );
        await transaction.rollback();
        console.log('🔙 Transaction rolled back - payment record removed from database');
        return { success: false, message: `Payment request failed. ${data.status_message}` };
      }

      console.log('✅ External API call successful, committing transaction...');
      await transaction.commit();
      console.log('✅ Transaction committed - payment record permanently stored with pending status');

      return {
        success: true,
        message: 'Payment request initialized successfully. Please complete payment on your phone.',
        TransactionId: transactionId,
        api_response: data,
      };
    } catch (error) {
      console.log('💥 CATCH BLOCK - Error occurred:', error.message);
      console.log('💥 Error stack:', error.stack);
      
      if (transaction) {
        console.log('🔄 Rolling back transaction due to error...');
        try {
          await transaction.rollback();
          console.log('🔙 Transaction rolled back successfully');
        } catch (rollbackError) {
          console.log('❌ Failed to rollback transaction:', rollbackError.message);
        }
      }
      
      return {
        success: false,
        message: 'Failed to process payment.',
        error: error.message,
      };
    }
  }


  // Finalize payment (called by payment gateway callback)
  async finalisePayment(callback_data) {
    const { order_id, status_code, status_message, amount, reason, telco_transaction_date, mobile } =
      callback_data;

    console.log('📞 Callback received:', callback_data);

    // Check if payment was successful
    const isPaymentSuccessful = reason === 'SUCCESS';

    try {
      await sequelize.transaction(async (transaction) => {
        const normalizedMobile = normalizePhoneNumber(mobile);
        if (!normalizedMobile) throw new Error('Invalid mobile number');

        // Find the payment record using TransactionId (order_id from callback)
        const payment = await Payment.findOne({
          where: { TransactionId: order_id },
          transaction,
        });

        if (!payment) throw new Error('Payment not found');

        console.log(`📝 Updating payment status to: ${reason}`);

        // Map reason to Payment Status enum
        let paymentStatus = 'Pending';
        if (reason === 'SUCCESS') {
          paymentStatus = 'Completed';
        } else {
          paymentStatus = 'Unsuccessful';
        }

        // Update payment status
        await Payment.update(
          {
            amount_paid: amount,
            date_completed: telco_transaction_date ? new Date(telco_transaction_date) : new Date(),
            Status: paymentStatus,
          },
          {
            where: { TransactionId: order_id },
            transaction,
          }
        );

        console.log('✅ Payment status updated');

        // Update order status if payment was successful
        if (isPaymentSuccessful) {
          console.log('✅ Payment successful - updating order status to paid');
          await Orders.update(
            { status: 'paid' },
            {
              where: { id: payment.orderid },
              transaction,
            }
          );
          
          const order = await Orders.findByPk(payment.orderid, { transaction });
          await this.sendPaymentSMS(normalizedMobile, `Your payment of GHS ${amount} for order #${payment.orderid} was successful. Transaction ID ${order_id}. Thank you!`);
          console.log('✅ SMS sent successfully');
        } else {
          console.log(`⚠️ Payment failed with reason: ${reason} - order status not updated`);
          await this.sendPaymentSMS(normalizedMobile, `Your payment of GHS ${amount} for order #${payment.orderid} failed. Transaction ID ${order_id}. Please try again. Thank you!`);
          console.log('✅ SMS sent successfully');
        }
      });

      return { 
        success: isPaymentSuccessful, 
        message: isPaymentSuccessful 
          ? 'Payment successful! Your order has been confirmed.' 
          : `Payment failed: ${reason}. Please try again.`,
        reason: reason,
        orderUpdated: isPaymentSuccessful
      };
    } catch (error) {
      console.log('💥 Error finalizing payment:', error.message);
      return { success: false, message: 'Failed to finalize payment: ' + error.message };
    }
  }

  // Check single payment status (called by user manually)
  async checkPaymentStatus(transactionId) {
    try {
      console.log(`🔍 Checking payment status for transaction: ${transactionId}`);

      // Find the payment record
      const payment = await Payment.findOne({
        where: { TransactionId: transactionId }
      });

      if (!payment) {
        return { 
          success: false, 
          message: 'Payment not found.'
        };
      }

      // Call payment API
      const status_data = {
        app_id: process.env.APP_ID,
        app_key: process.env.APP_KEY,
        order_id: transactionId,
      };

      const update = await axiosInstance.post(
        'https://api.interpayafrica.com/v3/interapi.svc/GetInvoiceStatus',
        status_data
      );

      const statusCode = update.data.status_code;
      const transStatus = update.data.trans_status;
      const statusMessage = update.data.status_message;

      console.log(`📡 API Status response:`, { statusCode, transStatus, statusMessage });

      // Determine if payment is successful
      const isPaymentSuccessful = transStatus === 1 || transStatus === 'PAID BY CLIENT';

      // Map transStatus to Payment Status enum
      let paymentStatus = 'Pending';
      if (isPaymentSuccessful) {
        paymentStatus = 'Completed';
      } else if (transStatus === 'FAILED' || transStatus === 'CANCELLED') {
        paymentStatus = 'Unsuccessful';
      }

      // Update payment and order status in a transaction
      await sequelize.transaction(async (transaction) => {
        console.log(`📝 Updating payment status to: ${paymentStatus}`);

        // Update payment status
        await Payment.update(
          {
            Status: paymentStatus,
            date_completed: new Date(),
          },
          {
            where: { TransactionId: transactionId },
            transaction,
          }
        );

        // Update order status if payment was successful
        if (isPaymentSuccessful) {
          console.log('✅ Payment successful - updating order status to paid');
          await Orders.update(
            { status: 'paid' },
            {
              where: { id: payment.orderid },
              transaction,
            }
          );
        } else {
          console.log(`⚠️ Payment status: ${transStatus} - order status not updated`);
        }
      });

      return {
        success: true,
        message: isPaymentSuccessful 
          ? 'Payment confirmed! Your order has been confirmed.' 
          : `Payment status: ${transStatus}. Order not confirmed.`,
        status_code: statusCode,
        trans_status: transStatus,
        status_message: statusMessage,
        orderUpdated: isPaymentSuccessful
      };
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      return {
        success: false,
        message: 'Failed to check payment status: ' + error.message
      };
    }
  }

  // Check payment status for all pending payments (automated cron job)
  async get_status() {
    console.log('🔄 Running automated payment status check...');
    
    const response = await Payment.findAll({
      where: {
        Status: 'Pending',
      }
    });

    console.log(`📊 Found ${response.length} pending payments to check`);

    for (const payment of response) {
      try {
        console.log(`🔍 Checking status for transaction: ${payment.TransactionId}`);

        const status_data = {
          app_id: process.env.APP_ID,
          app_key: process.env.APP_KEY,
          order_id: payment.TransactionId,
        };

        const update = await axiosInstance.post(
          'https://api.interpayafrica.com/v3/interapi.svc/GetInvoiceStatus',
          status_data
        );

        const transStatus = update.data.trans_status;
        console.log(`📡 Status for ${payment.TransactionId}: ${transStatus}`);

        // Determine if payment is successful
        const isPaymentSuccessful = transStatus === 1 || transStatus === 'PAID BY CLIENT';

        // Map transStatus to Payment Status enum
        let paymentStatus = 'Pending';
        if (isPaymentSuccessful) {
          paymentStatus = 'Completed';
        } else if (transStatus === 'FAILED' || transStatus === 'CANCELLED') {
          paymentStatus = 'Unsuccessful';
        }

        // Update payment and order status in a transaction
        await sequelize.transaction(async (transaction) => {
          // Update payment status
          await Payment.update(
            {
              Status: paymentStatus,
              date_completed: new Date(),
            },
            {
              where: { TransactionId: payment.TransactionId },
              transaction,
            }
          );

          console.log(`✅ Payment status updated to: ${paymentStatus}`);

          // Update order status if payment was successful
          if (isPaymentSuccessful) {
            console.log('✅ Payment successful - updating order status to paid');
            await Orders.update(
              { status: 'paid' },
              {
                where: { id: payment.orderid },
                transaction,
              }
            );
          } else {
            console.log(`⚠️ Payment status: ${transStatus} - order status not updated`);
          }
        });
      } catch (error) {
        console.error(`❌ Error processing payment ${payment.TransactionId}:`, error.message);
      }
    }

    console.log('✅ Automated payment status check completed');
  }

  // Get all categories in the database
  async all_categories() {
    try {
      const categories = await Categories.findAll({
        attributes: ['catid', 'catName', 'Description', 'adminid'],
        include: [
          {
            model: Product,
            as: 'products',
            attributes: ['productid', 'ProductName', 'ProductPhoto', 'Price', 'Stock', 'catid', 'category_id'],
            required: false
          }
        ],
        order: [['catName', 'ASC']]
      });
      
      const categoriesData = categories.map(category => {
        const plain = category.get({ plain: true });
        return {
          catid: plain.catid,
          catName: plain.catName,
          Description: plain.Description,
          adminid: plain.adminid,
          products: plain.products || []
        };
      });
      
      return categoriesData;
    } catch (error) {
      console.error('❌ Error fetching all categories:', error);
      throw new Error('Failed to fetch all categories: ' + error.message);
    }
  }

  // Get all products in a category
  async all_products(categoryId) {
    try {
      const products = await Product.findAll({
        attributes: [
          'productid',
          'ProductName',
          'Description',
          'ProductPhoto',
          'Price',
          'Stock',
          'catid',
          'category_id'
        ],
        where: { catid: categoryId },
        include: [
          {
            model: Categories,
            as: 'category',
            attributes: ['catid', 'catName'],
            required: false
          }
        ],
        order: [['ProductName', 'ASC']]
      });
      
      const productsData = products.map(product => {
        const plain = product.get({ plain: true });
        return {
          productid: plain.productid,
          ProductName: plain.ProductName,
          Description: plain.Description,
          ProductPhoto: plain.ProductPhoto,
          Price: plain.Price,
          Stock: plain.Stock,
          catid: plain.catid,
          category_id: plain.category_id,
          categoryName: plain.category?.catName || null
        };
      });
      
      return productsData;
    } catch (error) {
      console.error('❌ Error fetching all products:', error);
      throw new Error('Failed to fetch all products: ' + error.message);
    }
  }

  // Edit customer
  async editCustomer(customerId, Name, Email) {
    try {
      const customer = await Customers.findByPk(customerId);
      if (!customer) {
        return {
          success: false,
          message: 'Customer not found.',
        };
      }

      // Check if email is already taken by another customer
      if (Email && Email !== customer.Email) {
        const existingCustomer = await Customers.findOne({
          where: { Email: Email }
        });
        if (existingCustomer) {
          return {
            success: false,
            message: 'Email already in use by another customer.',
          };
        }
      }

      if (Name) customer.Name = Name;
      if (Email) customer.Email = Email;

      await customer.save();

      return {
        success: true,
        message: 'Customer updated successfully.',
        data: {
          id: customer.id,
          Name: customer.Name,
          Email: customer.Email
        }
      };
    } catch (error) {
      console.error('❌ Error in editCustomer service:', error);
      throw new Error('Failed to edit customer');
    }
  }

  // Change customer password
  async changeCustomerPassword(customerId, oldPassword, newPassword) {
    try {
      const { comparePassword, hashPassword } = require('../middleware/auth');
      const customer = await Customers.findByPk(customerId);
      if (!customer) {
        return {
          success: false,
          message: 'Customer not found.',
        };
      }

      // Verify old password
      const isValidPassword = await comparePassword(oldPassword, customer.Password);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Incorrect old password.',
        };
      }

      // Update password (will be hashed by model hook)
      customer.Password = newPassword;
      await customer.save();

      return {
        success: true,
        message: 'Password changed successfully.',
      };
    } catch (error) {
      console.error('❌ Error in changeCustomerPassword service:', error);
      throw new Error('Failed to change password');
    }
  }
}

const customerService = new CustomerService();

// Schedule automated status check every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('⏰ Cron job triggered: Checking pending payments...');
  await customerService.get_status();
});

module.exports = customerService;
