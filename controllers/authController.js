const AuthService = require('../services/AuthService.js');
const { sanitizeInput } = require('../middleware/auth.js');

class AuthController {

async Login(req, res) {
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
    if(email.toLowerCase().includes('@emergentafrica.com'.toLowerCase())){
      const response = await AuthService.loginSuperAdmin(email, password);
      if (response.error) {
        return res.status(401).json(response);
      }
      res.json(response);
    }
    else{
      const response = await AuthService.loginContestManager(email, password);
      if (response.error) {
        return res.status(401).json(response);
      }
      res.json(response);
    }
  } catch (error) {
    console.error('Error in Super Admin Login controller:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error. Failed to login super admin.' + error.message
      });
    }
  }
}

module.exports = new AuthController();