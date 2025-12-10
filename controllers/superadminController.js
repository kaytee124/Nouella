const superadminService = require('../services/superadminService');
const { sanitizeInput } = require('../middleware/auth');

class SuperadminController {
  // Category Controllers
  async createCategory(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { catName, description } = req.body;
      const adminid = req.user.id;

      if (!catName) {
        return res.status(400).json({
          error: true,
          message: 'Category name is required.'
        });
      }

      const sanitized_catName = sanitizeInput(catName);
      const sanitized_description = description ? sanitizeInput(description) : null;
      const response = await superadminService.createCategory(adminid, sanitized_catName, sanitized_description);
      res.json(response);
    } catch (error) {
      console.error('Error in createCategory controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to create category.'
      });
    }
  }

  async updateCategory(req, res) {
    try {
      if (req.method !== 'PUT') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const {catName, description } = req.body;
      const catid = req.params.catid;
      if (!catid || !catName) {
        return res.status(400).json({
          error: true,
          message: 'Category ID and name are required.'
        });
      }

      const sanitized_catid = sanitizeInput(catid);
      const sanitized_catName = sanitizeInput(catName);
      const sanitized_description = description ? sanitizeInput(description) : null;
      const response = await superadminService.updateCategory(sanitized_catid, sanitized_catName, sanitized_description);
      res.json(response);
    } catch (error) {
      console.error('Error in updateCategory controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to update category.'
      });
    }
  }

  async deleteCategory(req, res) {
    try {
      if (req.method !== 'DELETE') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const catid = req.params.catid;
      if (!catid) {
        return res.status(400).json({
          error: true,
          message: 'Category ID is required.'
        });
      }
      const sanitized_catid = sanitizeInput(catid);
      const response = await superadminService.deleteCategory(sanitized_catid);
      res.json(response);
    } catch (error) {
      console.error('Error in deleteCategory controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to delete category.'
      });
    }
  }

  async getAllCategories(req, res) {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const response = await superadminService.getAllCategories();
      res.json(response);
    } catch (error) {
      console.error('Error in getAllCategories controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to fetch categories.'
      });
    }
  }

  // Product Controllers
  async addProduct(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }

      const { productName, description, catid, price, stock } = req.body;
      // Convert absolute path to relative path for database storage
      let productPhoto = null;
      if (req.file) {
        const path = require('path');
        // Get relative path from project root
        const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
        productPhoto = relativePath.replace(/\\/g, '/'); // Normalize path separators for cross-platform
      }

      if (!productName || !catid || price === undefined) {
        // If file was uploaded but validation failed, delete it
        if (req.file) {
          const fs = require('fs');
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error('Error deleting uploaded file:', unlinkError);
          }
        }
        return res.status(400).json({
          error: true,
          message: 'Product name, category ID, and price are required.'
        });
      }

      const sanitized_productName = sanitizeInput(productName);
      const sanitized_description = description ? sanitizeInput(description) : null;
      const sanitized_catid = sanitizeInput(catid);
      const sanitized_price = parseInt(price);
      const sanitized_stock = stock ? parseInt(stock) : 0;

      const response = await superadminService.addProduct(
        sanitized_productName,
        sanitized_description,
        productPhoto,
        sanitized_catid,
        sanitized_price,
        sanitized_stock
      );
      res.json(response);
    } catch (error) {
      console.error('Error in addProduct controller:', error);
      // Delete uploaded file if error occurred
      if (req.file) {
        const fs = require('fs');
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to add product.'
      });
    }
  }

  async updateProduct(req, res) {
    try {
      if (req.method !== 'PUT') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const productid = req.params.productid;
      const { productName, description, catid, price, stock } = req.body;
      // Convert absolute path to relative path for database storage
      let productPhoto = null;
      if (req.file) {
        const path = require('path');
        // Get relative path from project root
        const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
        productPhoto = relativePath.replace(/\\/g, '/'); // Normalize path separators for cross-platform
      }

      if (!productid) {
        // If file was uploaded but validation failed, delete it
        if (req.file) {
          const fs = require('fs');
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error('Error deleting uploaded file:', unlinkError);
          }
        }
        return res.status(400).json({
          error: true,
          message: 'Product ID is required.'
        });
      }

      const sanitized_productid = sanitizeInput(productid);
      const sanitized_productName = productName ? sanitizeInput(productName) : null;
      const sanitized_description = description !== undefined ? sanitizeInput(description) : undefined;
      const sanitized_catid = catid ? sanitizeInput(catid) : null;
      const sanitized_price = price !== undefined ? parseInt(price) : undefined;
      const sanitized_stock = stock !== undefined ? parseInt(stock) : undefined;

      const response = await superadminService.updateProduct(
        sanitized_productid,
        sanitized_productName,
        sanitized_description,
        productPhoto, // null if no new image, or file path if new image uploaded
        sanitized_catid,
        sanitized_price,
        sanitized_stock
      );
      res.json(response);
    } catch (error) {
      console.error('Error in updateProduct controller:', error);
      // Delete uploaded file if error occurred
      if (req.file) {
        const fs = require('fs');
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to update product.'
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      if (req.method !== 'DELETE') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const productid = req.params.productid;

      if (!productid) {
        return res.status(400).json({
          error: true,
          message: 'Product ID is required.'
        });
      }

      const sanitized_productid = sanitizeInput(productid);
      const response = await superadminService.deleteProduct(sanitized_productid);
      res.json(response);
    } catch (error) {
      console.error('Error in deleteProduct controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to delete product.'
      });
    }
  }

  async getAllProducts(req, res) {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const response = await superadminService.getAllProducts();
      res.json(response);
    } catch (error) {
      console.error('Error in getAllProducts controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to fetch products.'
      });
    }
  }

  // Order Controllers
  async updateOrderStatus(req, res) {
    try {
      if (req.method !== 'PUT') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const orderId = req.params.orderid;
      const { status } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({
          error: true,
          message: 'Order ID and status are required.'
        });
      }

      const sanitized_orderId = sanitizeInput(orderId);
      const sanitized_status = sanitizeInput(status);
      const response = await superadminService.updateOrderStatus(sanitized_orderId, sanitized_status);
      res.json(response);
    } catch (error) {
      console.error('Error in updateOrderStatus controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to update order status.'
      });
    }
  }

  async getAllOrders(req, res) {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const response = await superadminService.getAllOrders();
      res.json(response);
    } catch (error) {
      console.error('Error in getAllOrders controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to fetch orders.'
      });
    }
  }

  // Superadmin Management
  async editSuperAdmin(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { name, email } = req.body;
      const adminId = req.user.id;

      if (!name && !email) {
        return res.status(400).json({
          error: true,
          message: 'Name or email is required.'
        });
      }

      const sanitized_name = name ? sanitizeInput(name) : null;
      const sanitized_email = email ? sanitizeInput(email) : null;
      const response = await superadminService.editSuperAdmin(adminId, sanitized_name, sanitized_email);
      res.json(response);
    } catch (error) {
      console.error('Error in editSuperAdmin controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to edit super admin.'
      });
    }
  }

  async getDashboard(req, res) {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const response = await superadminService.getDashboard();
      res.json(response);
    } catch (error) {
      console.error('Error in getDashboard controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to fetch dashboard data.'
      });
    }
  }
}

module.exports = new SuperadminController();
