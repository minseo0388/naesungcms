# Configuration Reference

This reference lists all supported environment variables for NaesungCMS.

## Master Switch 🎛️

| Variable | Description | Options | Default |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_INFRA_PROVIDER` | Determines the overall infrastructure mode. | `AWS`, `SELF_HOSTED` | `AWS` |

## Core

| Variable | Description | Required |
| :--- | :--- | :--- |
| `DATABASE_URL` | MySQL/MariaDB connection string. | Yes |
| `AUTH_SECRET` | Secret key for NextAuth sessions. | Yes |
| `NEXT_PUBLIC_APP_URL` | The public URL of the application (e.g., `https://cms.com`). | Yes |

## Storage (AWS S3 / MinIO)

Required if `STORAGE_TYPE="S3"`.

| Variable | Description |
| :--- | :--- |
| `AWS_REGION` | AWS Region (e.g., `us-east-1`). |
| `AWS_ACCESS_KEY_ID` | IAM User Key. |
| `AWS_SECRET_ACCESS_KEY` | IAM User Secret. |
| `AWS_BUCKET_NAME` | Name of the bucket. |
| `S3_ENDPOINT` | (Optional) Override for MinIO/R2. |

## Email (Resend / SMTP)

| Variable | Description |
| :--- | :--- |
| `RESEND_API_KEY` | Required if `EMAIL_PROVIDER="RESEND"`. |
| `SMTP_HOST` | Hostname (e.g., `smtp.gmail.com`). |
| `SMTP_PORT` | Port (default `587`). |
| `SMTP_USER` | SMTP Username. |
| `SMTP_PASS` | SMTP Password. |
| `SMTP_SECURE` | `true` or `false` (TLS). |

## Performance

| Variable | Description |
| :--- | :--- |
| `UPSTASH_REDIS_REST_URL` | Redis URL for caching/rate-limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | Redis Token. |
