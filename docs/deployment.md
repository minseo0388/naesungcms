# Deployment Guide

NaesungCMS supports two primary deployment modes: **Self-Hosted (Docker)** and **Cloud (Vercel/AWS)**.

## Option A: Self-Hosted (Docker) 🐳

Best for internal networks, privacy-focused deployments, or avoiding cloud costs.

### Prerequisites
-   Docker Engine installed.
-   A running MySQL/MariaDB database (or run one via Docker Compose).

### 1. Build the Image
The project includes an optimized multi-stage `Dockerfile` that produces a standalone generic Node.js build (under 600MB).

```bash
docker build -t naesungcms .
```

### 2. Prepare Environment (`.env`)
Create a production `.env` file:

```env
NEXT_PUBLIC_INFRA_PROVIDER="SELF_HOSTED"
STORAGE_TYPE="LOCAL"
EMAIL_PROVIDER="SMTP"
DATABASE_URL="mysql://user:pass@host:3306/db"
AUTH_SECRET="long_random_string"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 3. Run the Container
We mount a volume for `public/uploads` so uploaded files persist across restarts.

```bash
docker run -d \
  --name naesungcms \
  -p 3000:3000 \
  -v $(pwd)/public/uploads:/app/public/uploads \
  --env-file .env \
  naesungcms
```

---

## Option B: Cloud (Vercel / AWS) ☁️

Best for scalability, zero maintenance, and global performance.

### 1. Push to GitHub
Ensure your code is pushed to a private repository.

### 2. Import to Vercel
1.  Go to Vercel Dashboard -> Add NewProject.
2.  Import your repository.
3.  Framework Preset: Next.js.

### 3. Configure Environment Variables
Set the following in Vercel Project Settings:

-   `NEXT_PUBLIC_INFRA_PROVIDER`: `AWS`
-   `STORAGE_TYPE`: `S3`
-   `EMAIL_PROVIDER`: `RESEND`
-   `AWS_ACCESS_KEY_ID`: `...`
-   `AWS_SECRET_ACCESS_KEY`: `...`
-   `AWS_BUCKET_NAME`: `...`
-   `AWS_REGION`: `...`
-   `RESEND_API_KEY`: `...`
-   `DATABASE_URL`: `...` (PlanetScale or RDS)

### 4. Deploy
Click **Deploy**. Vercel will build and serve your site globally.
