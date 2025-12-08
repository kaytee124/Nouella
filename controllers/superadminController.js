const superadminService = require('../services/superadminService');
const { sanitizeInput } = require('../middleware/auth');

class SuperadminController {
  async registerSuperAdmin(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
    const {emailName, email} = req.body;
    if (!emailName || !email) {
      return res.status(400).json({
        error: true,
        message: 'Email name and email are required.'
      });
    }
    const sanitized_emailName = sanitizeInput(emailName);
    const sanitized_email = sanitizeInput(email);
    const response = await superadminService.registerSuperAdmin(sanitized_emailName, sanitized_email);
    res.json(response);
  } catch (error) {
    console.error('Error in registerSuperAdmin controller:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error. Failed to register super admin.'
    });
  }
}

async manager_status(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: true,
        message: 'Wrong request method. Please try again.'
      });
    }
  const {merchant_id, status} = req.body;
  if (!merchant_id || !status) {
    return res.status(400).json({
      error: true,
      message: 'Merchant ID and status are required.'
    });
  }
  const sanitized_merchant_id = sanitizeInput(merchant_id);
  const sanitized_status = sanitizeInput(status);
  const response = await superadminService.manager_status(sanitized_merchant_id, sanitized_status);
  res.json(response);
  } catch (error) {
    console.error('Error in manager_status controller:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error. Failed to update manager status.'
    });
  }
}

async add_manager(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: true,
        message: 'Wrong request method. Please try again.'
      });
    }
  const {merchant_id, merchant_name, email, appid, appkey} = req.body;
  if (!merchant_id) {
    return res.status(400).json({
      error: true,
      message: 'Merchant ID is required.'
    });
  }
  if (!merchant_name) {
    return res.status(400).json({
      error: true,
      message: 'Merchant name is required.'
    });
  }
  if (!email) {
    return res.status(400).json({
      error: true,
      message: 'Email is required.'
    });
  }
  if (!appid) {
    return res.status(400).json({
      error: true,
      message: 'App ID is required.'
    });
  }
  if (!appkey) {
    return res.status(400).json({
      error: true,
      message: 'App key is required.'
    });
  }
  const sanitized_merchant_id = sanitizeInput(merchant_id);
  const sanitized_merchant_name = sanitizeInput(merchant_name);
  const sanitized_email = sanitizeInput(email);
  const sanitized_appid = sanitizeInput(appid);
  const sanitized_appkey = sanitizeInput(appkey);
  const created_by = req.user.id;
  const response = await superadminService.add_manager(sanitized_merchant_id, sanitized_merchant_name, sanitized_email, sanitized_appid, sanitized_appkey, created_by);
  res.json(response);
  } catch (error) {
    console.error('Error in add_manager controller:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error. Failed to add manager.'
    });
  }
}
async update_manager(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: true,
        message: 'Wrong request method. Please try again.'
      });
    }
  const {merchant_id, merchant_name, email, appid, appkey} = req.body;
  if (!merchant_id) {
    return res.status(400).json({
      error: true,
      message: 'Merchant ID is required.'
    });
  }
  if (!merchant_name) {
    return res.status(400).json({
      error: true,
      message: 'Merchant name is required.'
    });
  }
  if (!email) {
    return res.status(400).json({
      error: true,
      message: 'Email is required.'
    });
  }
  if (!appid) {
    return res.status(400).json({
      error: true,
      message: 'App ID is required.'
    });
  }
  if (!appkey) {
    return res.status(400).json({
      error: true,
      message: 'App key is required.'
    });
  }
  const sanitized_merchant_id = sanitizeInput(merchant_id);
  const sanitized_merchant_name = sanitizeInput(merchant_name);
  const sanitized_email = sanitizeInput(email);
  const sanitized_appid = sanitizeInput(appid);
  const sanitized_appkey = sanitizeInput(appkey);
  const response = await superadminService.update_manager(sanitized_merchant_id, sanitized_merchant_name, sanitized_email, sanitized_appid, sanitized_appkey);
  res.json(response);
  } catch (error) {
    console.error('Error in update_manager controller:', error);
    res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to update manager.'
      });
    }
  }
  async all_managers(req, res) {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const response = await superadminService.all_managers();
      if (response.error) {
        return res.status(400).json(response);
      }
      res.json(response);
    } catch (error) {
      console.error('Error in all_managers controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to fetch managers.'
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

  async getContestReport(req, res) {
    try {
      if (req.method !== 'GET') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const response = await superadminService.getContestReport();
      res.json(response);
    } catch (error) {
      console.error('Error in getContestReport controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to fetch contest report.'
      });
    }
  }

  async add_product(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { productName, description, catid, price, stock, productPhoto } = req.body;
      const adminId = req.user.id;

      if (!productName || !catid || !price) {
        return res.status(400).json({
          error: true,
          message: 'Product name, category ID, and price are required.'
        });
      }

      const response = await superadminService.add_product(
        adminId,
        productName,
        description,
        productPhoto,
        catid,
        price,
        stock
      );
      res.json(response);
    } catch (error) {
      console.error('Error in add_product controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to add product.'
      });
    }
  }

  async update_product(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { productId, productName, description, catid, price, stock, productPhoto } = req.body;
      const adminId = req.user.id;

      if (!productId) {
        return res.status(400).json({
          error: true,
          message: 'Product ID is required.'
        });
      }

      const response = await superadminService.update_product(
        adminId,
        productId,
        productName,
        description,
        productPhoto,
        catid,
        price,
        stock
      );
      res.json(response);
    } catch (error) {
      console.error('Error in update_product controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to update product.'
      });
    }
  }

  async create_category(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { catName, description } = req.body;
      const adminId = req.user.id;

      if (!catName) {
        return res.status(400).json({
          error: true,
          message: 'Category name is required.'
        });
      }

      const response = await superadminService.create_category(adminId, catName, description);
      res.json(response);
    } catch (error) {
      console.error('Error in create_category controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to create category.'
      });
    }
  }

  async update_category(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { catid, catName, description } = req.body;
      const adminId = req.user.id;

      if (!catid) {
        return res.status(400).json({
          error: true,
          message: 'Category ID is required.'
        });
      }

      const response = await superadminService.update_category(adminId, catid, catName, description);
      res.json(response);
    } catch (error) {
      console.error('Error in update_category controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to update category.'
      });
    }
  }

  async update_order_status(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return res.status(400).json({
          error: true,
          message: 'Order ID and status are required.'
        });
      }

      const response = await superadminService.update_order_status(orderId, status);
      res.json(response);
    } catch (error) {
      console.error('Error in update_order_status controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to update order status.'
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
      const adminId = req.user.id;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          error: true,
          message: 'Old password and new password are required.'
        });
      }

      const response = await superadminService.change_password(adminId, oldPassword, newPassword);
      res.json(response);
    } catch (error) {
      console.error('Error in change_password controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to change password.'
      });
    }
  }

  async edit_superadmin(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { emailName, email } = req.body;
      const adminId = req.user.id;

      const response = await superadminService.edit_superadmin(adminId, emailName, email);
      res.json(response);
    } catch (error) {
      console.error('Error in edit_superadmin controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to update superadmin profile.'
      });
    }
  }
}

module.exports = new SuperadminController();