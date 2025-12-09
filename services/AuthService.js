// xaiartifacts/AuthService.js
const { Customers, Superadmin } = require('../model');
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
      // Check if customer already exists
      const existingCustomer = await Customers.findOne({
        where: { Email: Email }
      });
      if (existingCustomer) {
        return {
          error: true,
          message: 'Customer already registered with this email.',
        };
      }

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
      // Check if super admin already exists
      const existingAdmin = await Superadmin.findOne({
        where: { Email: Email }
      });
      if (existingAdmin) {
        return {
          error: true,
          message: 'Super admin already registered with this email.',
        };
      }

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

  // Change customer password
  async changeCustomerPassword(customerId, oldPassword, newPassword) {
    try {
      const customer = await Customers.findByPk(customerId);
      if (!customer) {
        return {
          error: true,
          message: 'Customer not found.',
        };
      }

      const isValidPassword = await comparePassword(oldPassword, customer.Password);
      if (!isValidPassword) {
        return {
          error: true,
          message: 'Incorrect old password.',
        };
      }

      customer.Password = newPassword;
      await customer.save();

      return {
        success: true,
        message: 'Password changed successfully.',
      };
    } catch (error) {
      console.error('Error in changeCustomerPassword service:', error);
      throw new Error('Failed to change customer password');
    }
  }

  // Change superadmin password
  async changeSuperAdminPassword(adminId, oldPassword, newPassword) {
    try {
      const admin = await Superadmin.findByPk(adminId);
      if (!admin) {
        return {
          error: true,
          message: 'Super admin not found.',
        };
      }

      const isValidPassword = await comparePassword(oldPassword, admin.Password);
      if (!isValidPassword) {
        return {
          error: true,
          message: 'Incorrect old password.',
        };
      }

      admin.Password = newPassword;
      await admin.save();

      return {
        success: true,
        message: 'Password changed successfully.',
      };
    } catch (error) {
      console.error('Error in changeSuperAdminPassword service:', error);
      throw new Error('Failed to change super admin password');
    }
  }
}
module.exports = new AuthService();