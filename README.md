# NaesungCMS

<img src="https://img.shields.io/badge/standard--readme-OK-green.svg?style=for-the-badge"/>

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-blue) ![Prisma](https://img.shields.io/badge/Prisma-ORM-teal) ![License](https://img.shields.io/badge/License-Apache%202.0-blue)

**NaesungCMS** (Hybrid Edition) is a production-ready, high-performance content management system designed for **Zero Trust Security** and **Massive Multi-tenancy**. 

It features a unique **Hybrid Infrastructure Architecture**, allowing you to deploy it on **AWS (Serverless)** or **Self-Hosted (Docker)** environments by simply changing a single environment variable.

## Table of Contents

- [Security](#security)
- [Background](#background)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Install](#install)
- [Usage](#usage)
- [Roadmap & Future Improvements](#roadmap--future-improvements)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Security

NaesungCMS follows strict enterprise security practices:
-   **Zero Trust Access**: Every DB query is scoped to the authenticated tenant.
-   **Dynamic CSP**: Content Security Policy adapts to Cloud/Local environments automatically.
-   **2FA (Two-Factor Auth)**: Built-in TOTP support for enhanced account security.
-   **Resilience**: **Redis Fallback System** automatically switches to DB if cache fails.
-   **Rate Limiting** on all public endpoints.
-   **Audit Logging** for administrative actions.
-   **Dependency Scanning** regularly via `npm audit`.
-   **Secure Media Pipeline**:
    -   **Magic Number Validation**: Binary signature verification prevents extension spoofing.
    -   **SVG Sanitization**: Blocks malicious scripts.
    -   **Proxy Uploads**: Server-side proxy protects storage credentials.

## Background

NaesungCMS was created to solve the "Cloud vs. On-Premise" dilemma in multi-tenant systems. By providing a **Hybrid Infrastructure Adapter Layer**, it allows developers to switch between AWS-native services and open-source alternatives without changing application logic.

### Hybrid Infrastructure Architecture

```mermaid
graph TD
    User[User / Browser] -->|request| CDN[Edge Middleware]
    
    subgraph Core System
        CDN -->|routing| App[Next.js App Server]
        App -->|auth| DB[(MariaDB)]
        App -->|cache| Redis[(Redis)]
    end

    subgraph Infrastructure Adapter Layer
        App -->|Storage Adapter| Switch{Infra Provider}
        
        Switch -- AWS Mode --> S3[AWS S3]
        Switch -- AWS Mode --> SES[Resend / AWS SES]
        
        Switch -- Self-Hosted Mode --> Local[Local Disk / MinIO]
        Switch -- Self-Hosted Mode --> SMTP[SMTP Server]
    end
```

-   **Universal Storage Adapter**:
    -   **Cloud Mode**: Native AWS S3 support.
    -   **Local Mode**: Files stored in local disk (`public/uploads`) or MinIO.
-   **Flexible Email Service**:
    -   **Cloud Mode**: Uses Resend or AWS SES via API.
    -   **Local Mode**: Uses standard SMTP (Nodemailer) for internal networks.

## Key Features

### 🏢 Multi-Tenancy Architecture
-   **Wildcard & Custom Domains**: Unlimited white-label support via Edge Middleware and `[domain]` dynamic routing.
-   **Data Isolation**: Application-level **Row-Level Security (RLS)** ensures tenants never access each other's data.
-   **Performance**: **Upstash Redis** caching layer ensures sub-millisecond response times for tenant configuration.

### ✍️ Premium Content Experience
-   **Notion-Style Editor**: Tiptap-based block editor with slash commands (`/`), markdown shortcuts, and drag-and-drop.
-   **Time Machine**: Automatic revision history for every edit with easy rollback.
-   **Global Command Palette**: Instant navigation and action search via `Ctrl + K` (Command Menu).

### 📊 Tactical Insights
-   **Integrated Analytics**: Built-in dashboards tracking visitors, top posts, and conversion metrics per tenant.
-   **Service Monitoring**: Real-time status tracking of external infrastructure (S3, Redis, SES).

### 🛡️ Enterprise-Grade Infrastructure
-   **Zero Trust Access Control**: Every server action is scoped and validated using **Zod** and **Safe-Actions**.
-   **Modern UI Stack**: Built with **Radix UI**, **Shadcn**, and **Tailwind CSS** for a pixel-perfect, accessible experience.
-   **Type-Safe Persistence**: Prisma ORM with automated migrations and complex relational mapping.

## Project Structure

```bash
├── apps
│   └── web
│       ├── src
│       │   ├── actions       # Server Actions (Safe & Typed)
│       │   ├── app           # Next.js App Router (Pages & Layouts)
│       │   ├── components    # React Components (Shadcn UI)
│       │   ├── lib           # Utilities (Auth, DB, Redis, Storage Adapter)
│       │   ├── types         # TypeScript Definitions
│       │   └── middleware.ts # Edge Middleware (Routing & CSP)
├── prisma
│   └── schema.prisma         # Database Schema
├── public                    # Static Assets & Local Uploads
└── Dockerfile                # Multi-stage production build
```

## Install

### Prerequisites
-   **Node.js 18+**
-   **MySQL or MariaDB** (Local or Cloud)
-   **Redis** (Optional)

### Installation
1.  **Clone & Install**
    ```bash
    git clone https://github.com/minseo0388/naesungcms.git
    cd naesungcms
    npm install
    ```

2.  **Database Setup**
    Ensure your MariaDB/MySQL is running, then populate the schema:
    ```bash
    npx prisma db push
    ```

## Usage

### Local Development
1.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000`.

### Deployment Guide

#### Option A: Self-Hosted (Docker)
Ideal for internal networks, home labs, or private VPS.

1.  **Configure `.env`**:
    ```env
    # Required for Hybrid Mode
    NEXT_PUBLIC_INFRA_PROVIDER="SELF_HOSTED"
    STORAGE_TYPE="LOCAL"
    EMAIL_PROVIDER="SMTP"
    
    # DB Connection
    DATABASE_URL="mysql://root:root@host.docker.internal:3306/naesungcms"
    ```
2.  **Build Image**:
    ```bash
    docker build -t naesungcms .
    ```
3.  **Run Container**:
    ```bash
    # Run with volume mapping for persistence
    docker run -d \
      -p 3000:3000 \
      -v $(pwd)/public/uploads:/app/public/uploads \
      --env-file .env \
      --name cms \
      naesungcms
    ```

#### Option B: Cloud (AWS / Vercel)
Ideal for scaling to millions of users.

1.  **Configure `.env`**:
    ```env
    NEXT_PUBLIC_INFRA_PROVIDER="AWS"
    STORAGE_TYPE="S3"
    EMAIL_PROVIDER="RESEND"
    ```
2.  **Deploy**:
    Push to Vercel/AWS Amplify. The system automatically utilizes S3 and Resend APIs.

## Roadmap & Future Improvements

To take NaesungCMS to the next level, consider implementing:

-   **CI/CD Pipeline**: 
    -   Add GitHub Actions workflow (`.github/workflows/ci.yml`) to run `npm run lint` and `npx tsc` on every Pull Request.
    -   Automate container registry publishing (GHCR/Docker Hub).
-   **Advanced Testing**:
    -   **Jest/Vitest**: Unit tests for `src/lib/` utilities.
    -   **Playwright**: End-to-End (E2E) tests for the Dashboard flow.
-   **CDN Integration**:
    -   Configure **AWS CloudFront** in front of S3 for faster global asset delivery.
-   **Monitoring**:
    -   Integrate **Sentry** for real-time error tracking and performance monitoring.

## Maintainers

[@choiminseo](https://github.com/choiminseo)

## Contributing

Contributions are welcome! Please ensure all PRs pass `npm run lint` and `npx tsc` before submitting.

## License

[Apache License 2.0](LICENSE) © Choi Minseo
