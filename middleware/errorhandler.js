// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    // Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(error => error.message);
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        details: errors
      });
    }
  
    // Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: true,
        message: 'Duplicate entry detected',
        details: err.message
      });
    }
  
    // Sequelize foreign key constraint errors
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: true,
        message: 'Reference constraint violation',
        details: 'Related record does not exist'
      });
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'Invalid token'
      });
    }
  
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token expired'
      });
    }
  
    // Multer errors (file upload)
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: true,
        message: 'File too large'
      });
    }
  
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: true,
        message: 'Unexpected file upload'
      });
    }
  
    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    res.status(statusCode).json({
      error: true,
      message: statusCode === 500 ? 'Internal Server Error' : message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  // 404 handler
  const notFoundHandler = (req, res) => {
    res.status(404).json({
      error: true,
      message: 'Endpoint not found',
      path: req.originalUrl
    });
  };
  
  module.exports = {
    errorHandler,
    notFoundHandler
  };