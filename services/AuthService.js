// xaiartifacts/AuthService.js
const { Contest_Manager, Superadmin } = require('../model');
const { comparePassword, generateToken, hashPassword } = require('../middleware/auth');

class AuthService {
  
  // Contest Manager login
  async loginCustomer(Email, Password) {
    try {
      const customer = await Customers.findOne({
        where: { Email}
      });

      if (!customer) {
        return {
          error: true,
          message: 'Customer not registered or incorrect email.',
        };
      }

      const isValidPassword = await comparePassword(Password, customer.Password);
      if (!isValidPassword) {
        return {
          error: true,
          message: 'Incorrect password.',
        };
      }

      const token = generateToken({
        id: customer.id,
        role: 'customer',
      });

      return {
        success: true,
        message: 'Login successful.',
        token
      };
    } catch (error) {
      console.error('Error in loginCustomer service:', error);
      throw new Error('Failed to login customer');
    }
  }

  async loginSuperAdmin(Email, password) {
    try {
      const superAdmin = await Superadmin.findOne({
        where: { Email}
      });

      if (!superAdmin) {
        return {
          error: true,
          message: 'Super admin not registered or incorrect email.',
        };
      }

      const isValidPassword = await comparePassword(password, superAdmin.Password);
      if (!isValidPassword) {
        return {
          error: true,
          message: 'Incorrect password.'
        };
      }

      const token = generateToken({
        id: superAdmin.id,  // Use lowercase 'id'
        role: 'superadmin',
      });

      return {
        success: true,
        message: 'Login successful.',
        token
      };
    } catch (error) {
      console.error('Error in loginSuperAdmin service:', error);
      throw new Error('Failed to login super admin' + error);
    }
  }

  async registerCustomer(Name, Email, Password) {
    try {
      const customer = await Customers.create({
        Name, Email, Password
      });
      if (!customer) {
        return {
          error: true,
          message: 'Failed to register customer.',
        };
      }
      return {
        success: true,
        message: 'Customer registered successfully.',
      };
    } catch (error) {
      console.error('Error in registerCustomer service:', error);
      throw new Error('Failed to register customer' + error);
    }
  }
  async registerSuperAdmin(Name, Email, Password) {
    try {
      const superAdmin = await Superadmin.create({
        Name, Email, Password
      });
      if (!superAdmin) {
        return {
          error: true,
          message: 'Failed to register super admin.',
        };
      }
      return {
        success: true,
        message: 'Super admin registered successfully.',
      };
    }
    catch (error) {
      console.error('Error in registerSuperAdmin service:', error);
      throw new Error('Failed to register super admin' + error);
    }
  }
}
module.exports = new AuthService();