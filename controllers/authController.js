const AuthService = require('../services/AuthService.js');
const { sanitizeInput } = require('../middleware/auth.js');

class AuthController {

  async loginCustomer(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }

      const email = sanitizeInput(req.body.email);
      const password = sanitizeInput(req.body.password);

      if (!email || !password) {
        return res.status(400).json({
          error: true,
          message: 'Email and password are required.'
        });
      }
      
        const response = await AuthService.loginCustomer(email, password);
        if (response.error) {
          return res.status(401).json(response);
        }
        res.json(response);
    } catch (error) {
      console.error('Error in loginCustomer controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to login.' + error.message
      });
    }
  }

  async RegisterCustomer(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          error: true,
          message: 'Name, email and password are required.'
        });
      }
      const sanitized_name = sanitizeInput(name);
      const sanitized_email = sanitizeInput(email);
      const sanitized_password = sanitizeInput(password);
      const response = await AuthService.registerCustomer(sanitized_name, sanitized_email, sanitized_password);
      if (response.error) {
        return res.status(401).json(response);
      }
      res.json(response);
    }
    catch (error) {
      console.error('Error in Register Customer controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to register customer.' + error.message
      });
    }
  }
  async loginSuperAdmin(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const email = sanitizeInput(req.body.email);
      const password = sanitizeInput(req.body.password);
      if (!email || !password) {
        return res.status(400).json({
          error: true,
          message: 'Email and password are required.'
        });
      }
      const response = await AuthService.loginSuperAdmin(email, password);
      if (response.error) {
        return res.status(401).json(response);
      }
      res.json(response);
    } catch (error) {
      console.error('Error in loginSuperAdmin controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to login.' + error.message
      });
    }
  }

  async RegisterSuperAdmin(req, res) {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({
          error: true,
          message: 'Wrong request method. Please try again.'
        });
      }
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          error: true,
          message: 'Name, email and password are required.'
        });
      }
      const sanitized_name = sanitizeInput(name);
      const sanitized_email = sanitizeInput(email);
      const sanitized_password = sanitizeInput(password);
      const response = await AuthService.registerSuperAdmin(sanitized_name, sanitized_email, sanitized_password);
      if (response.error) {
        return res.status(401).json(response);
      }
      res.json(response);
    }
    catch (error) {
      console.error('Error in Register SuperAdmin controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to register super admin.' + error.message
      });
    }
  }

  async ChangeCustomerPassword(req, res) {
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
      const response = await AuthService.changeCustomerPassword(customerId, sanitized_oldPassword, sanitized_newPassword);
      if (response.error) {
        return res.status(401).json(response);
      }
      res.json(response);
    }
    catch (error) {
      console.error('Error in Change Customer Password controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to change password.' + error.message
      });
    }
  }

  async ChangeSuperAdminPassword(req, res) {
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

      const sanitized_oldPassword = sanitizeInput(oldPassword);
      const sanitized_newPassword = sanitizeInput(newPassword);
      const response = await AuthService.changeSuperAdminPassword(adminId, sanitized_oldPassword, sanitized_newPassword);
      if (response.error) {
        return res.status(401).json(response);
      }
      res.json(response);
    }
    catch (error) {
      console.error('Error in Change SuperAdmin Password controller:', error);
      res.status(500).json({
        error: true,
        message: 'Internal server error. Failed to change password.' + error.message
      });
    }
  }
}

module.exports = new AuthController();
