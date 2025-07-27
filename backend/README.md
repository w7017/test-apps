# GMAO SaaS Backend

Backend API for the GMAO (Gestion de Maintenance Assistée par Ordinateur) SaaS application.

## Features

- **RESTful API** with Express.js
- **PostgreSQL** database with connection pooling
- **JWT Authentication** with role-based access control
- **File Upload** support for audit photos and OCR
- **OCR Simulation** for equipment nameplate recognition
- **Activity Logging** for audit trails
- **Rate Limiting** and security middleware
- **Docker** containerization
- **Scaleway** deployment ready

## Quick Start

### Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up PostgreSQL database:**
```bash
# Create database
createdb gmao_db

# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

4. **Start development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Docker Development

1. **Start with Docker Compose:**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API on port 3001
- Nginx reverse proxy on port 80

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token

### Equipment Management
- `GET /api/equipment` - List equipment with filters
- `POST /api/equipment` - Create new equipment
- `GET /api/equipment/:id` - Get equipment details
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment
- `POST /api/equipment/:id/duplicate` - Duplicate equipment

### Audits
- `GET /api/audits` - List audits with filters
- `POST /api/audits` - Create new audit
- `GET /api/audits/:id` - Get audit details
- `POST /api/audits/:id/photos` - Upload audit photos
- `POST /api/audits/ocr` - OCR nameplate recognition
- `GET /api/audits/stats/overview` - Audit statistics

### Sites & Buildings
- `GET /api/sites` - List sites
- `POST /api/sites` - Create new site
- `GET /api/sites/:id/buildings` - Get site buildings

### Users & Settings
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update settings (admin only)

## Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - User accounts and authentication
- `clients` - Client companies
- `sites` - Client sites
- `buildings` - Buildings within sites
- `technical_domains` - Equipment domains (CVC, Electrical, etc.)
- `equipment` - Equipment inventory
- `audits` - Audit records
- `audit_items` - Audit checklist items
- `audit_photos` - Audit photos
- `deliverables` - Generated reports
- `activity_log` - System activity tracking

## Deployment to Scaleway

### Prerequisites

1. **Install Scaleway CLI:**
```bash
# macOS
brew install scw

# Linux
curl -s https://raw.githubusercontent.com/scaleway/scaleway-cli/master/scripts/get.sh | sh
```

2. **Set up Scaleway credentials:**
```bash
export SCW_ACCESS_KEY="your-access-key"
export SCW_SECRET_KEY="your-secret-key"
```

### Deploy

1. **Make the deployment script executable:**
```bash
chmod +x scaleway-deploy.sh
```

2. **Run the deployment:**
```bash
./scaleway-deploy.sh deploy
```

The script will:
- Create a Container Registry namespace
- Build and push the Docker image
- Create a PostgreSQL database
- Deploy the container with auto-scaling
- Set up environment variables
- Provide the application URL

### Custom Domain (Optional)

To use a custom domain:
```bash
export CUSTOM_DOMAIN="api.yourdomain.com"
./scaleway-deploy.sh deploy
```

### Monitoring

After deployment, monitor your application:
- **Scaleway Console:** https://console.scaleway.com
- **Container Logs:** `scw container container logs gmao-backend`
- **Database Metrics:** Available in RDB section
- **Health Check:** `https://your-app-url/health`

### Scaling

The container is configured with auto-scaling:
- **Min instances:** 1
- **Max instances:** 5
- **CPU limit:** 1000m (1 CPU)
- **Memory limit:** 1024MB

Adjust these values in the deployment script as needed.

## Security Features

- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **JWT authentication** with secure tokens
- **Input validation** with Joi
- **SQL injection** protection with parameterized queries
- **File upload** restrictions and validation
- **CORS** configuration
- **Activity logging** for audit trails

## Environment Variables

Key environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gmao_db
DB_USER=username
DB_PASSWORD=password

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development

### Adding New Features

1. **Create route file** in `src/routes/`
2. **Add middleware** if needed in `src/middleware/`
3. **Update database schema** in `src/database/schema.sql`
4. **Add tests** in `tests/`
5. **Update API documentation**

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Logging

Logs are written to:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs
- Console output in development

## Support

For issues and questions:
1. Check the logs: `docker-compose logs backend`
2. Verify database connection: `npm run migrate`
3. Test API endpoints: `curl http://localhost:3001/health`

## License

This project is proprietary software for GMAO SaaS application.