const { Superadmin, Product, Categories, Orders } = require('../model');
const { Op, fn, col, literal, where } = require('sequelize');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const {comparePassword } = require('../middleware/auth');

class SuperadminService {
  async registerSuperAdmin(emailName, email) {
    try {
      const password = process.env.DEFAULT_SUPER_ADMIN_PASSWORD || 'SuperAdmin@2025';
      const superAdmin = await Superadmin.findOne({
        where: { Email: email }
      });
      if (superAdmin) {
        return {
          error: true,
          message: 'Super admin already registered.',
        };
      }
      const newSuperAdmin = await Superadmin.create({
        emailName: emailName,
        Email: email,
        Password: password
      });
      if (!newSuperAdmin) {
        return {
          error: true,
          message: 'Failed to register super admin.',
        };
      }
      return {
        success: true,
        message: 'Super admin registered successfully.',
      };
    } catch (error) {
      console.error('Error in registerSuperAdmin service:', error);
      throw new Error('Failed to register super admin');
    }
  }

  // Legacy functions - return deprecated message
  async manager_status(merchantID, status) {
    return { error: true, message: 'This function is deprecated. Manager system no longer exists.' };
  }

  async add_manager(merchantID, merchantName, email, appid, appkey, createdBy) {
    return { error: true, message: 'This function is deprecated. Manager system no longer exists.' };
  }

  async update_manager(merchantID, merchantName, email, appid, appkey) {
    return { error: true, message: 'This function is deprecated. Manager system no longer exists.' };
  }

  async all_managers() {
    return { error: true, message: 'This function is deprecated. Manager system no longer exists.' };
  }

  // New e-commerce dashboard
  async getDashboard() {
    try {
      // Get total products
      const totalProducts = await Product.count();
      
      // Get total categories
      const totalCategories = await Categories.count();
      
      // Get total orders
      const totalOrders = await Orders.count();
      
      // Get total customers
      const { Customers } = require('../model');
      const totalCustomers = await Customers.count();
      
      // Get total revenue from completed payments
      const totalRevenueResult = await Payment.findAll({
        attributes: [
          [fn('SUM', col('amount_paid')), 'total']
        ],
        where: {
          Status: 'Completed'
        },
        raw: true
      });
      const totalRevenue = parseFloat(totalRevenueResult[0]?.total || 0);

      // Get pending orders
      const pendingOrders = await Orders.count({
        where: { status: 'Pending' }
      });

      return {
        success: true,
        data: {
          summary: {
            totalProducts,
            totalCategories,
            totalOrders,
            totalCustomers,
            totalRevenue,
            pendingOrders
          }
        }
      };
    } catch (error) {
      console.error('Error in getDashboard service:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }

  async getContestReport() {
    // Legacy function - returns empty for now
    return {
      success: true,
      message: 'This function is deprecated for e-commerce system.',
      data: []
    };
    /*
    try {
      const PAYMENT_SUCCESS_STATUSES = ['SUCCESS', 'PAID BY CLIENT', 'PAID', '1'];

      // Get all contests with merchant info and revenue
      const contests = await Contest.findAll({
        attributes: [
          'id',
          'contestName',
          'Status',
          [col('manager.merchantName'), 'merchantName'],
          [col('manager.merchantID'), 'merchantID'],
          [
            fn('COALESCE', 
              fn('SUM', col('categories->contestants->payments.amount_paid')), 
              0
            ), 
            'adminRevenue'
          ]
        ],
        include: [
          {
            model: Contest_Manager,
            as: 'manager',
            attributes: [],
            required: true
          },
          {
            model: Categories,
            as: 'categories',
            attributes: [],
            required: false,
            include: [
              {
                model: Contestant,
                as: 'contestants',
                attributes: [],
                required: false,
                through: { attributes: [] },
                include: [
                  {
                    model: Payment,
                    as: 'payments',
                    attributes: [],
                    required: false,
                    where: {
                      status: { [Op.in]: PAYMENT_SUCCESS_STATUSES }
                    }
                  }
                ]
              }
            ]
          }
        ],
        group: [
          'Contest.id',
          'Contest.contestName',
          'Contest.Status',
          'manager.merchantName',
          'manager.merchantID'
        ],
        order: [
          ['Status', 'ASC'], // Active first, then others
          [fn('COALESCE', fn('SUM', col('categories->contestants->payments.amount_paid')), 0), 'DESC']
        ],
        subQuery: false,
        raw: false
      });

      const contestReportData = contests.map(contest => {
        const plain = contest.get({ plain: true });
        return {
          contestId: plain.id,
          merchant: plain.merchantName || 'Unknown',
          contestName: plain.contestName || 'Unknown Contest',
          adminRevenue: parseFloat(plain.adminRevenue || 0).toFixed(2),
          status: plain.Status || 'Unknown'
        };
      });

      return {
        success: true,
        message: contestReportData.length ? 'Contest report generated successfully.' : 'No contests found.',
        data: contestReportData
      };
    } catch (error) {
      console.error('Error in getContestReport service:', error);
      throw new Error('Failed to fetch contest report');
    }
    */
  }

  // Add product with image upload
  async add_product(adminId, productName, description, productPhoto, catid, price, stock) {
    try {
      // Verify category exists and belongs to admin
      const category = await Categories.findOne({
        where: { catid, adminid: adminId }
      });

      if (!category) {
        return {
          error: true,
          message: 'Category not found or you do not have permission to add products to this category.'
        };
      }

      // Handle image upload - save to backend/uploads/products folder
      let imagePath = null;
      if (productPhoto) {
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
        
        // Create directory if it doesn't exist
        await fs.mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        let fileExtension = '.jpg'; // default
        let imageBuffer = null;

        if (typeof productPhoto === 'string') {
          if (productPhoto.startsWith('data:')) {
            // Handle base64 image
            const matches = productPhoto.match(/^data:image\/(\w+);base64,/);
            if (matches) {
              fileExtension = '.' + matches[1];
            }
            const base64Data = productPhoto.replace(/^data:image\/\w+;base64,/, '');
            imageBuffer = Buffer.from(base64Data, 'base64');
          } else if (productPhoto.startsWith('http://') || productPhoto.startsWith('https://')) {
            // If it's a URL, store the URL
            imagePath = productPhoto;
          }
        } else if (productPhoto.buffer) {
          // Handle file buffer
          fileExtension = path.extname(productPhoto.originalname || '.jpg');
          imageBuffer = productPhoto.buffer;
        }

        if (imageBuffer && !imagePath) {
          const fileName = `product_${Date.now()}_${Math.floor(Math.random() * 10000)}${fileExtension}`;
          imagePath = path.join('uploads', 'products', fileName);
          await fs.writeFile(path.join(__dirname, '..', imagePath), imageBuffer);
        }
      }

      const product = await Product.create({
        ProductName: productName,
        Description: description,
        ProductPhoto: imagePath,
        catid: catid,
        Price: parseInt(price),
        Stock: parseInt(stock) || 0
      });

      return {
        success: true,
        message: 'Product added successfully.',
        data: product
      };
    } catch (error) {
      console.error('Error in add_product service:', error);
      throw new Error('Failed to add product: ' + error.message);
    }
  }

  // Update product
  async update_product(adminId, productId, productName, description, productPhoto, catid, price, stock) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        return {
          error: true,
          message: 'Product not found.'
        };
      }

      // Verify category exists and belongs to admin if catid is being changed
      if (catid && catid !== product.catid) {
        const category = await Categories.findOne({
          where: { catid, adminid: adminId }
        });
        if (!category) {
          return {
            error: true,
            message: 'Category not found or you do not have permission.'
          };
        }
      }

      // Handle image update
      if (productPhoto) {
        // Delete old image if exists (only if it's a local file, not a URL)
        if (product.ProductPhoto && !product.ProductPhoto.startsWith('http://') && !product.ProductPhoto.startsWith('https://')) {
          const oldImagePath = path.join(__dirname, '..', product.ProductPhoto);
          try {
            await fs.unlink(oldImagePath);
          } catch (err) {
            console.log('Old image not found or already deleted');
          }
        }

        let imagePath = null;
        let imageBuffer = null;
        let fileExtension = '.jpg';

        if (typeof productPhoto === 'string') {
          if (productPhoto.startsWith('data:')) {
            // Handle base64 image
            const matches = productPhoto.match(/^data:image\/(\w+);base64,/);
            if (matches) {
              fileExtension = '.' + matches[1];
            }
            const base64Data = productPhoto.replace(/^data:image\/\w+;base64,/, '');
            imageBuffer = Buffer.from(base64Data, 'base64');
          } else if (productPhoto.startsWith('http://') || productPhoto.startsWith('https://')) {
            // If it's a URL, store the URL
            imagePath = productPhoto;
          }
        } else if (productPhoto.buffer) {
          // Handle file buffer
          fileExtension = path.extname(productPhoto.originalname || '.jpg');
          imageBuffer = productPhoto.buffer;
        }

        if (imageBuffer && !imagePath) {
          // Save new image
          const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
          await fs.mkdir(uploadsDir, { recursive: true });
          const fileName = `product_${Date.now()}_${Math.floor(Math.random() * 10000)}${fileExtension}`;
          imagePath = path.join('uploads', 'products', fileName);
          await fs.writeFile(path.join(__dirname, '..', imagePath), imageBuffer);
        }

        if (imagePath) {
          product.ProductPhoto = imagePath;
        }
      }

      // Update other fields
      if (productName) product.ProductName = productName;
      if (description !== undefined) product.Description = description;
      if (catid) product.catid = catid;
      if (price) product.Price = parseInt(price);
      if (stock !== undefined) product.Stock = parseInt(stock);

      await product.save();

      return {
        success: true,
        message: 'Product updated successfully.',
        data: product
      };
    } catch (error) {
      console.error('Error in update_product service:', error);
      throw new Error('Failed to update product: ' + error.message);
    }
  }

  // Create category
  async create_category(adminId, catName, description) {
    try {
      const existingCategory = await Categories.findOne({
        where: { catName, adminid: adminId }
      });

      if (existingCategory) {
        return {
          error: true,
          message: 'Category with this name already exists.'
        };
      }

      const category = await Categories.create({
        adminid: adminId,
        catName: catName,
        Description: description
      });

      return {
        success: true,
        message: 'Category created successfully.',
        data: category
      };
    } catch (error) {
      console.error('Error in create_category service:', error);
      throw new Error('Failed to create category: ' + error.message);
    }
  }

  // Update category
  async update_category(adminId, catid, catName, description) {
    try {
      const category = await Categories.findOne({
        where: { catid, adminid: adminId }
      });

      if (!category) {
        return {
          error: true,
          message: 'Category not found or you do not have permission.'
        };
      }

      if (catName) category.catName = catName;
      if (description !== undefined) category.Description = description;

      await category.save();

      return {
        success: true,
        message: 'Category updated successfully.',
        data: category
      };
    } catch (error) {
      console.error('Error in update_category service:', error);
      throw new Error('Failed to update category: ' + error.message);
    }
  }

  // Update order status
  async update_order_status(orderId, status) {
    try {
      const validStatuses = ['Pending', 'paid', 'Delivered'];
      if (!validStatuses.includes(status)) {
        return {
          error: true,
          message: 'Invalid order status. Must be one of: Pending, paid, Delivered.'
        };
      }

      const order = await Orders.findByPk(orderId);
      if (!order) {
        return {
          error: true,
          message: 'Order not found.'
        };
      }

      order.status = status;
      await order.save();

      return {
        success: true,
        message: 'Order status updated successfully.',
        data: order
      };
    } catch (error) {
      console.error('Error in update_order_status service:', error);
      throw new Error('Failed to update order status: ' + error.message);
    }
  }

  // Change superadmin password
  async change_password(adminId, oldPassword, newPassword) {
    try {
      const admin = await Superadmin.findByPk(adminId);
      if (!admin) {
        return {
          error: true,
          message: 'Superadmin not found.'
        };
      }

      if (oldPassword === newPassword) {
        return {
          error: true,
          message: 'Old password and new password cannot be the same.'
        };
      }

      const isValidPassword = await comparePassword(oldPassword, admin.Password);
      if (!isValidPassword) {
        return {
          error: true,
          message: 'Incorrect old password.'
        };
      }

      admin.Password = newPassword;
      await admin.save();

      return {
        success: true,
        message: 'Password changed successfully.'
      };
    } catch (error) {
      console.error('Error in change_password service:', error);
      throw new Error('Failed to change password: ' + error.message);
    }
  }

  // Edit superadmin profile
  async edit_superadmin(adminId, emailName, email) {
    try {
      const admin = await Superadmin.findByPk(adminId);
      if (!admin) {
        return {
          error: true,
          message: 'Superadmin not found.'
        };
      }

      // Check if email is already taken by another admin
      if (email && email !== admin.Email) {
        const existingAdmin = await Superadmin.findOne({
          where: { Email: email }
        });
        if (existingAdmin) {
          return {
            error: true,
            message: 'Email already in use by another admin.'
          };
        }
      }

      if (emailName) admin.emailName = emailName;
      if (email) admin.Email = email;

      await admin.save();

      return {
        success: true,
        message: 'Superadmin profile updated successfully.',
        data: {
          id: admin.id,
          emailName: admin.emailName,
          Email: admin.Email
        }
      };
    } catch (error) {
      console.error('Error in edit_superadmin service:', error);
      throw new Error('Failed to update superadmin profile: ' + error.message);
    }
  }

  async iscontest_ended()
  {
    try {
      // This function is kept for backward compatibility but may not be needed
      console.log('Contest status check - not applicable for e-commerce system');
    }
    catch (error) {
      console.error('Error in iscontest_ended service:', error);
      throw new Error('Failed to check if contest is ended');
    }
  }
}

const superadminService = new SuperadminService();

// Schedule automated contest status check every week (Sunday at midnight)
// Cron format: '0 0 * * 0' = minute hour day month day-of-week
// Runs every Sunday at 00:00 (midnight)
cron.schedule('0 0 * * 0', async () => {
  console.log('⏰ Weekly Cron Job: Checking contest end dates...');
  try {
    await superadminService.iscontest_ended();
  } catch (error) {
    console.error('❌ Error in weekly contest status check:', error);
  }
});

module.exports = superadminService;