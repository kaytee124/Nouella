const { Superadmin, Product, Categories, Orders, Customers } = require('../model');
const { Op, fn, col } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { hashPassword, comparePassword } = require('../middleware/auth');

class SuperadminService {
  // Create category
  async createCategory(adminid, catName, description) {
    try {
      const existingCategory = await Categories.findOne({
        where: { catName: catName }
      });
      if (existingCategory) {
        return {
          error: true,
          message: 'Category already exists.',
        };
      }
      await Categories.create({
        adminid: adminid,
        catName: catName,
        description: description || null
      });
      return {
        success: true,
        message: 'Category created successfully.',
      };
    } catch (error) {
      console.error('Error in createCategory service:', error);
      throw new Error('Failed to create category' + error.message);
    }
  }

  // Update category
  async updateCategory(catid, catName, Description) {
    try {
      const category = await Categories.findByPk(catid);
      if (!category) {
        return {
          error: true,
          message: 'Category not found.',
        };
      }
      if(catName === category.catName && Description === category.Description) {
        return {
          error: true,
          message: 'No changes made to the category.',
        };
      }
      category.catName = catName;
      if (Description !== undefined) {
        category.Description = Description;
      }
      await category.save();
      return {
        success: true,
        message: 'Category updated successfully.',
        data: category
      };
    } catch (error) {
      console.error('Error in updateCategory service:', error);
      throw new Error('Failed to update category' + error.message);
    }
  }

  // Delete category
  async deleteCategory(catid) {
    try {
      const category = await Categories.findByPk(catid);
      if (!category) {
        return {
          error: true,
          message: 'Category not found.',
        };
      }
      await category.destroy();
      return {
        success: true,
        message: 'Category deleted successfully.',
      };
    } catch (error) {
      console.error('Error in deleteCategory service:', error);
      throw new Error('Failed to delete category' + error.message);
    }
  }

  // Get all categories
  async getAllCategories() {
    try {
      const categories = await Categories.findAll({
        attributes: ['catid', 'catName', 'Description']
      });
      return {
        success: true,
        message: 'Categories fetched successfully.',
        data: categories
      };
    } catch (error) {
      console.error('Error in getAllCategories service:', error);
      throw new Error('Failed to fetch categories' + error.message);
    }
  }

  // Add product with image upload
  async addProduct(ProductName, Description, ProductPhoto, catid, Price, Stock) {
    try {
      // ProductPhoto should be the file path from multer (e.g., 'uploads/products/product_1234567890_filename.jpg')
      // or null if no image was uploaded
      let photoPath = null;
      if (ProductPhoto) {
        // If it's already a relative path from multer, use it as is
        // Multer saves to uploads/products/ and we store the relative path
        photoPath = ProductPhoto;
      }
      const existingProduct = await Product.findOne({
        where: { ProductName: ProductName }
      });
      if (existingProduct) {
        return {
          error: true,
          message: 'Product already exists.',
        };
      }

      await Product.create({
        ProductName: ProductName,
        Description: Description || null,
        ProductPhoto: photoPath,
        catid: catid,
        Price: Price,
        Stock: Stock || 0
      });

      return {
        success: true,
        message: 'Product created successfully.',
      };
    } catch (error) {
      console.error('Error in addProduct service:', error);
      throw new Error('Failed to add product' + error.message);
    }
  }

  // Update product
  async updateProduct(productid, ProductName, Description, ProductPhoto, catid, Price, Stock) {
    try {
      const product = await Product.findByPk(productid);
      if (!product) {
        return {
          error: true,
          message: 'Product not found.',
        };
      }

      // Handle image update - ProductPhoto is the new file path from multer (or null/undefined if no new image)
      if (ProductPhoto && ProductPhoto !== product.ProductPhoto) {
        // Delete old image if exists
        if (product.ProductPhoto) {
          const oldImagePath = path.join(__dirname, '../', product.ProductPhoto);
          if (fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath);
            } catch (unlinkError) {
              console.error('Error deleting old image:', unlinkError);
              // Continue even if old image deletion fails
            }
          }
        }
        // Use the new image path from multer
        product.ProductPhoto = ProductPhoto;
      }

      // Update product fields
      if (ProductName) product.ProductName = ProductName;
      if (Description !== undefined) product.Description = Description;
      if (catid) product.catid = catid;
      if (Price !== undefined) product.Price = Price;
      if (Stock !== undefined) product.Stock = Stock;

      await product.save();

      return {
        success: true,
        message: 'Product updated successfully.',
        data: product
      };
    } catch (error) {
      console.error('Error in updateProduct service:', error);
      throw new Error('Failed to update product' + error.message);
    }
  }

  // Delete product
  async deleteProduct(productid) {
    try {
      const product = await Product.findByPk(productid);
      if (!product) {
        return {
          error: true,
          message: 'Product not found.',
        };
      }

      // Delete associated image
      if (product.ProductPhoto) {
        const imagePath = path.join(__dirname, '../', product.ProductPhoto);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await product.destroy();
      return {
        success: true,
        message: 'Product deleted successfully.',
      };
    } catch (error) {
      console.error('Error in deleteProduct service:', error);
      throw new Error('Failed to delete product' + error.message);
    }
  }

  // Get all products
  async getAllProducts() {
    try {
      const products = await Product.findAll({
        attributes: ['productid', 'ProductName', 'Description', 'ProductPhoto', 'Price', 'Stock'],
        order: [['ProductName', 'ASC']]
      });
      return {
        success: true,
        message: 'Products fetched successfully.',
        data: products
      };
    } catch (error) {
      console.error('Error in getAllProducts service:', error);
      throw new Error('Failed to fetch products' + error.message);
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const validStatuses = ['Pending', 'paid', 'Delivered'];
      if (!validStatuses.includes(status)) {
        return {
          error: true,
          message: 'Invalid order status. Must be one of: Pending, paid, Delivered',
        };
      }

      const order = await Orders.findByPk(orderId);
      if (!order) {
        return {
          error: true,
          message: 'Order not found.',
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
      console.error('Error in updateOrderStatus service:', error);
      throw new Error('Failed to update order status' + error.message);
    }
  }

  // Get all orders
  async getAllOrders() {
    try {
      const orders = await Orders.findAll({
        attributes: ['id', 'customerid', 'dateadded', 'status', 'address', 'ordertotal'],
        include: [{
          model: Customers,
          as: 'customer',
          attributes: ['id', 'Name', 'Email'],
          required: false
        }],
        order: [['dateadded', 'DESC']]
      });
      if (orders.length === 0) {
        return {
          error: true,
          message: 'No orders found.',
        };
      }
      else{
        return {
          success: true,
          message: 'Orders fetched successfully.',
          data: orders
        };
      }
    } catch (error) {
      console.error('Error in getAllOrders service:', error);
      throw new Error('Failed to fetch orders' + error.message);
    }
  }

  // Edit superadmin
  async editSuperAdmin(adminId, Name, Email) {
    try {
      const admin = await Superadmin.findByPk(adminId);
      if (!admin) {
        return {
          error: true,
          message: 'Super admin not found.',
        };
      }

      // Check if email is already taken by another admin
      if (Email && Email !== admin.Email) {
        const existingAdmin = await Superadmin.findOne({
          where: { Email: Email }
        });
        if (existingAdmin) {
          return {
            error: true,
            message: 'Email already in use by another admin.',
          };
        }
      }

      if (Name) admin.Name = Name;
      if (Email) admin.Email = Email;

      await admin.save();

      return {
        success: true,
        message: 'Super admin updated successfully.',
        data: {
          id: admin.id,
          Name: admin.Name,
          Email: admin.Email
        }
      };
    } catch (error) {
      console.error('Error in editSuperAdmin service:', error);
      throw new Error('Failed to edit super admin' + error.message);
    }
  }

  // Get dashboard data (simplified for e-commerce)
  async getDashboard() {
    try {
      // Total Products
      const totalProducts = await Product.count();

      // Total Categories
      const totalCategories = await Categories.count();

      // Total Orders
      const totalOrders = await Orders.count();

      // Total Revenue (sum of paid orders)
      const totalRevenueResult = await Orders.findAll({
        attributes: [
          [fn('SUM', col('ordertotal')), 'total']
        ],
        where: {
          status: 'paid'
        },
        raw: true
      });
      const totalRevenue = parseFloat(totalRevenueResult[0]?.total || 0);

      // Pending Orders
      const pendingOrders = await Orders.count({
        where: { status: 'Pending' }
      });

      // Delivered Orders
      const deliveredOrders = await Orders.count({
        where: { status: 'Delivered' }
      });

      return {
        success: true,
        data: {
          summary: {
            totalProducts,
            totalCategories,
            totalOrders,
            totalRevenue,
            pendingOrders,
            deliveredOrders
          }
        }
      };
    } catch (error) {
      console.error('Error in getDashboard service:', error);
      throw new Error('Failed to fetch dashboard data' + error.message);
    }
  }
}

const superadminService = new SuperadminService();

module.exports = superadminService;
