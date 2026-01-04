# Introduction to NaesungCMS

**NaesungCMS** is a hybrid, multi-tenant Content Management System engineered for **Zero Trust Security** and **High Performance**.

It is designed to be the ultimate solution for developers who need:
-   **Multi-tenancy**: Host thousands of blogs on a single Next.js instance.
-   **Security**: Bank-grade security with Row-Level Security (Application Layer) and Strict CSP.
-   **Flexibility**: Run on AWS Serverless or your own Docker container with a single config change.

## 🚀 Why NaesungCMS?

### 1. Hybrid Infrastructure
Unlike other CMSs that lock you into Vercel or a specific cloud, NaesungCMS uses an **Adapter Pattern** to abstract infrastructure.
-   **Cloud Mode**: Uses AWS S3, Resend, and Vercel Edge Network.
-   **Self-Hosted Mode**: Uses Local Disk Storage, MinIO, and SMTP.

### 2. Zero Trust Data Model
We assume the application layer is hostile. Every database query is wrapped in a `withTenant` HOF (Higher-Order Function) that forcibly injects the current tenant ID, making it mathematically impossible for one tenant to access another's data.

### 3. Premium Writing Experience
The editor is not just a text area. It's a fully-featured **Block Editor** (Tiptap) supporting:
-   Slash Commands (`/`)
-   Markdown Shortcuts
-   Drag & Drop Image Uploads
-   Automatic Image Optimization (WebP)

## 📚 Documentation Structure

-   [Architecture Deep Dive](./architecture.md): Understand the hybrid core and security model.
-   [Deployment Guide](./deployment.md): How to deploy to Docker or AWS.
-   [Configuration Reference](./configuration.md): All environment variables explained.

---
*Created by Choi Minseo*
