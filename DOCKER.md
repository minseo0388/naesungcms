# 🐳 Docker Deployment Guide

This guide will help you run NaesungCMS in Docker with MySQL.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (included with Docker Desktop)

## 🚀 Quick Start

### 1. Build and Start Services

```bash
docker-compose up -d
```

This command will:
- Start a MySQL 8.0 database container
- Build the Next.js application
- Run database migrations automatically
- Start the web server on port 3000

### 2. Check Service Status

```bash
docker-compose ps
```

You should see both `naesungcms-mysql` and `naesungcms-web` running.

### 3. View Logs

```bash
# View all logs
docker-compose logs -f

# View web app logs only
docker-compose logs -f web

# View database logs only
docker-compose logs -f db
```

### 4. Access the Application

Open your browser and navigate to:
- **Application**: http://localhost:3000 (or http://127.0.0.1:3000)
- **MySQL**: localhost:3307 (accessible from host machine)
  - User: `naesungcms`
  - Pass: `naesungcms`

> **Note:** If you use `127.0.0.1:3000`, the middleware has been configured to treat it as the main domain.


## 🔧 Configuration

### Environment Variables

The application uses the following environment variables (configured in `docker-compose.yml`):

- `DATABASE_URL`: MySQL connection string
- `AUTH_SECRET`: Secret key for authentication
- `NEXT_PUBLIC_APP_URL`: Public URL of the application
- `STORAGE_TYPE`: Storage type (LOCAL or S3)
- `EMAIL_PROVIDER`: Email provider (SMTP or RESEND)

### Customizing SMTP Settings

To use your own SMTP server, create a `.env` file in the project root:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

Then update `docker-compose.yml` to use these values.

## 🛠️ Common Commands

### Rebuild the Application

```bash
docker-compose up -d --build
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes (⚠️ This will delete all data!)

```bash
docker-compose down -v
```

### Run Prisma Commands

```bash
# Generate Prisma Client
docker-compose exec web npx prisma generate

# Push schema changes
docker-compose exec web npx prisma db push

# Open Prisma Studio
docker-compose exec web npx prisma studio
```

### Access MySQL Database

```bash
# Using docker exec
docker-compose exec db mysql -u naesungcms -pnaesungcms naesungcms

# Or from host machine
mysql -h 127.0.0.1 -P 3306 -u naesungcms -pnaesungcms naesungcms
```

## 🔍 Troubleshooting

### Database Connection Issues

If the web service can't connect to the database:

1. Check if the database is healthy:
   ```bash
   docker-compose ps
   ```

2. View database logs:
   ```bash
   docker-compose logs db
   ```

3. Restart services:
   ```bash
   docker-compose restart
   ```

### Build Failures

If the build fails:

1. Clear Docker cache and rebuild:
   ```bash
   docker-compose down
   docker system prune -a
   docker-compose up -d --build
   ```

2. Check for errors in build logs:
   ```bash
   docker-compose logs web
   ```

### Port Already in Use

If port 3000 or 3306 is already in use, modify the ports in `docker-compose.yml`:

```yaml
services:
  web:
    ports:
      - "3001:3000"  # Change host port to 3001
  
  db:
    ports:
      - "3307:3306"  # Change host port to 3307
```

## 📊 Database Management

### Backup Database

```bash
docker-compose exec db mysqldump -u naesungcms -pnaesungcms naesungcms > backup.sql
```

### Restore Database

```bash
docker-compose exec -T db mysql -u naesungcms -pnaesungcms naesungcms < backup.sql
```

## 🔒 Security Notes

⚠️ **Important**: Before deploying to production:

1. Change `AUTH_SECRET` to a strong, random value
2. Update MySQL passwords in `docker-compose.yml`
3. Configure proper SMTP credentials
4. Use environment variables for sensitive data
5. Enable HTTPS with a reverse proxy (nginx, Traefik, etc.)

## 🎯 Production Deployment

For production deployment, consider:

1. Using Docker secrets or external secret management
2. Setting up a reverse proxy with SSL/TLS
3. Implementing regular database backups
4. Using managed MySQL service (AWS RDS, Google Cloud SQL, etc.)
5. Configuring proper logging and monitoring
6. Setting resource limits in `docker-compose.yml`

## 📝 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
