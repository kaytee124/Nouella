# Nouella E-Commerce Backend

Backend API for Nouella e-commerce platform built with Node.js, Express, and MySQL.

## Features

- 🛒 Shopping cart management
- 📦 Product and category management
- 💳 Payment processing integration
- 📊 Order management
- 🔐 Authentication and authorization
- 📤 Image upload for products
- 📈 Dashboard analytics

## Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js 5
- **ORM**: Sequelize
- **Database**: MySQL
- **File Upload**: Multer
- **Authentication**: JWT
- **Containerization**: Docker

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Docker & Docker Compose (for containerized deployment)

## Installation

### Local Development

```bash
# Clone repository
git clone https://github.com/kaytee124/Nouella.git
cd Nouella

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
mysql -u root -p < Nouella.sql

# Start development server
npm run dev
```

### Docker Deployment

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=nouella
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Payment Gateway
APP_ID=your-app-id
APP_KEY=your-app-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Endpoints

### Authentication
- `POST /api/auth/login-customer` - Customer login
- `POST /api/auth/login-superadmin` - Superadmin login
- `POST /api/auth/register-customer` - Register customer
- `POST /api/auth/register-superadmin` - Register superadmin
- `POST /api/auth/change-customer-password` - Change customer password
- `POST /api/auth/change-superadmin-password` - Change superadmin password

### Superadmin (Protected)
- `GET /api/superadmin/dashboard` - Get dashboard data
- `POST /api/superadmin/category/create` - Create category
- `PUT /api/superadmin/category/update/:catid` - Update category
- `DELETE /api/superadmin/category/delete/:catid` - Delete category
- `GET /api/superadmin/category/all` - Get all categories
- `POST /api/superadmin/product/add` - Add product (with image upload)
- `PUT /api/superadmin/product/update/:productid` - Update product (with image upload)
- `DELETE /api/superadmin/product/delete/:productid` - Delete product
- `GET /api/superadmin/product/all` - Get all products
- `PUT /api/superadmin/order/update-status/:orderid` - Update order status
- `GET /api/superadmin/order/all` - Get all orders
- `POST /api/superadmin/edit` - Edit superadmin profile

### Customer (Protected)
- `POST /api/user/cart/add` - Add item to cart
- `POST /api/user/cart/checkout` - Checkout cart
- `POST /api/user/cart/update-quantity` - Update cart item quantity
- `POST /api/user/cart/increase-quantity` - Increase quantity by 1
- `POST /api/user/cart/decrease-quantity` - Decrease quantity by 1
- `GET /api/user/categories` - Get all categories
- `POST /api/user/products` - Get products by category
- `POST /api/user/payment/process` - Process payment
- `POST /api/user/payment/check-status` - Check payment status
- `GET /api/user/payment/history` - Get payment history
- `POST /api/user/edit` - Edit customer profile
- `POST /api/user/change-password` - Change customer password

## Docker Optimization

The Dockerfile is optimized for a 2GB RAM server:
- Uses Node.js Alpine image (smaller footprint)
- Multi-stage build to reduce image size
- Node.js memory limit: 1.5GB
- Container memory limit: 1.5GB
- Database connection pool: 5 connections (reduced from 10)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions to Digital Ocean.

### Quick Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## Project Structure

```
Nouella/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── middleware/      # Custom middleware (auth, upload, validation)
├── model/           # Sequelize models
├── routes/          # API routes
├── services/        # Business logic
├── uploads/         # Uploaded files (products images)
├── app.js           # Application entry point
├── Dockerfile       # Docker configuration
└── docker-compose.prod.yml  # Production Docker Compose
```

## Health Check

The application includes a health check endpoint:

```bash
curl http://localhost:3000/health
```

## License

ISC
