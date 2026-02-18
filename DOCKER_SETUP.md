# FarmKonnect Docker & Docker Compose Setup Guide

This guide explains how to deploy FarmKonnect locally using Docker and Docker Compose.

## Prerequisites

Before you start, ensure you have installed:

1. **Docker** (version 20.10+)
   - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Verify: `docker --version`

2. **Docker Compose** (version 2.0+)
   - Usually included with Docker Desktop
   - Verify: `docker-compose --version`

3. **Git** (to clone the repository)

## Quick Start (5 minutes)

### 1. Clone the Repository

```bash
git clone https://github.com/nabekah/farmkonnect_app.git
cd farmkonnect_app
```

### 2. Set Up Environment Variables

Copy the Docker environment file:

```bash
cp .env.docker .env.local
```

Then edit `.env.local` with your configuration:

```bash
# Edit with your editor
nano .env.local
# or
code .env.local
```

**Important variables to update:**
- `VITE_APP_ID` - Your Manus OAuth app ID
- `OAUTH_SERVER_URL` - Manus OAuth server URL
- `JWT_SECRET` - Change this to a secure random string
- `OWNER_OPEN_ID` - Your Manus owner ID
- Other API keys as needed

### 3. Start Docker Compose

```bash
docker-compose up -d
```

This will:
- Build the Node.js application image
- Start the MySQL database
- Start the FarmKonnect application
- All services will be available in ~2-3 minutes

### 4. Initialize the Database

Once containers are running, initialize the database schema:

```bash
docker-compose exec app pnpm db:push
```

### 5. Access the Application

Open your browser and visit:

```
http://localhost:3000
```

You should see the FarmKonnect login page.

## Detailed Commands

### View Running Containers

```bash
docker-compose ps
```

Output should show:
```
NAME                  STATUS
farmkonnect-mysql     Up (healthy)
farmkonnect-app       Up (healthy)
```

### View Application Logs

```bash
# All services
docker-compose logs -f

# Only app service
docker-compose logs -f app

# Only database service
docker-compose logs -f mysql

# Last 100 lines
docker-compose logs --tail=100
```

### Access Application Shell

```bash
docker-compose exec app sh
```

### Access MySQL Database

```bash
docker-compose exec mysql mysql -u farmkonnect -p farmkonnect
# Password: farmkonnect123
```

Or use a GUI tool like MySQL Workbench:
- Host: `localhost`
- Port: `3306`
- Username: `farmkonnect`
- Password: `farmkonnect123`
- Database: `farmkonnect`

### Run Database Migrations

```bash
# Push schema changes
docker-compose exec app pnpm db:push

# Generate migrations
docker-compose exec app pnpm db:generate

# View migrations
docker-compose exec app pnpm db:studio
```

### Stop All Services

```bash
docker-compose down
```

### Stop and Remove All Data

```bash
# Stop containers and remove volumes (deletes database)
docker-compose down -v
```

### Rebuild Application Image

```bash
# Rebuild the image
docker-compose build --no-cache

# Then restart
docker-compose up -d
```

## Development Workflow

### Hot Reload Development

The Docker Compose setup includes volume mounts for development:

```yaml
volumes:
  - ./client:/app/client
  - ./server:/app/server
  - ./drizzle:/app/drizzle
```

This means:
- Changes to source code are reflected immediately
- No need to rebuild the Docker image
- Perfect for development

### Making Code Changes

1. Edit files in your IDE as usual
2. Changes are automatically synced to the container
3. The application will hot-reload (if configured)

### Building for Production

```bash
# Build optimized production image
docker build -t farmkonnect:latest .

# Test production image locally
docker run -p 3000:3000 --env-file .env.docker farmkonnect:latest
```

## Environment Variables

### Database Configuration

```env
MYSQL_ROOT_PASSWORD=root123
MYSQL_DATABASE=farmkonnect
MYSQL_USER=farmkonnect
MYSQL_PASSWORD=farmkonnect123
MYSQL_PORT=3306
DATABASE_URL=mysql://farmkonnect:farmkonnect123@mysql:3306/farmkonnect
```

### Application Configuration

```env
NODE_ENV=development
PORT=3000
VITE_APP_ID=your_manus_app_id
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=your_secret_key
```

### API Keys

Update these with your actual credentials:

```env
OPENWEATHER_API_KEY=your_key
SENDGRID_API_KEY=your_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
```

## Troubleshooting

### Port Already in Use

If port 3000 or 3306 is already in use:

```bash
# Change port in docker-compose.yml
# Find this line:
ports:
  - "3000:3000"

# Change to:
ports:
  - "3001:3000"  # Access at localhost:3001
```

### Database Connection Error

```bash
# Check if MySQL is running
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql

# Wait for MySQL to be healthy
docker-compose ps  # Check STATUS column
```

### Application Won't Start

```bash
# Check application logs
docker-compose logs app

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Out of Disk Space

```bash
# Clean up unused Docker resources
docker system prune -a

# Remove all volumes
docker volume prune
```

## Performance Tips

### Increase Docker Memory

If experiencing slowness, increase Docker's allocated memory:

**Docker Desktop Settings:**
1. Open Docker Desktop
2. Go to Settings → Resources
3. Increase Memory (recommend 4GB+)
4. Click "Apply & Restart"

### Database Optimization

```bash
# Optimize MySQL tables
docker-compose exec mysql mysql -u farmkonnect -p farmkonnect -e "OPTIMIZE TABLE *;"
```

## Deployment to Production

### Build Production Image

```bash
docker build -t farmkonnect:1.0.0 .
```

### Push to Docker Registry

```bash
# Tag image
docker tag farmkonnect:1.0.0 your-registry/farmkonnect:1.0.0

# Push to registry (Docker Hub, ECR, etc.)
docker push your-registry/farmkonnect:1.0.0
```

### Deploy with Docker Compose (Production)

Create `docker-compose.prod.yml`:

```yaml
version: '3.9'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    volumes:
      - mysql_data:/var/lib/mysql
    restart: always

  app:
    image: farmkonnect:1.0.0
    depends_on:
      - mysql
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NODE_ENV: production
    ports:
      - "3000:3000"
    restart: always

volumes:
  mysql_data:
```

Deploy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [MySQL Docker Documentation](https://hub.docker.com/_/mysql)

## Support

For issues or questions:

1. Check logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Check Docker installation: `docker --version && docker-compose --version`
4. Review this guide's Troubleshooting section

## Next Steps

After successful Docker setup:

1. ✅ Test the application locally
2. ✅ Verify database connectivity
3. ✅ Test OAuth login flow
4. ✅ Run application tests
5. ✅ Deploy to production platform (Railway, Render, etc.)

Happy farming! 🌾
