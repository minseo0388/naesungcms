# Architecture Deep Dive

NaesungCMS is built on a modern **Next.js 14 App Router** foundation, enhanced with custom architectural patterns for security and flexibility.

## 1. Hybrid Infrastructure (Adapter Pattern)

The core innovation of NaesungCMS is its ability to switch underlying infrastructure providers without code changes. This is achieved through the **Adapter Pattern**.

### Storage Adapter
Standardizes file operations (`upload`, `delete`) across different providers.

-   **Interface**: `StorageAdapter`
-   **Implementation A (S3)**: Uses `@aws-sdk/client-s3`. Supports AWS S3, Cloudflare R2, and MinIO.
-   **Implementation B (Local)**: Uses Node.js `fs`. Stores files in `public/uploads`.

### Mail Adapter
Standardizes email delivery (`send`).

-   **Interface**: `MailAdapter`
-   **Implementation A (Resend)**: Uses Resend API (HTTP).
-   **Implementation B (SMTP)**: Uses `nodemailer`. Compatible with Gmail, Outlook, and self-hosted Postfix.

---

## 2. Zero Trust Security Model

We do not rely on API route separation for security. Instead, we enforce security at the **Data Access Layer**.

### The `withTenant` Wrapper
Every database function is wrapped in `withTenant`:

```typescript
export const getPosts = withTenant(async (db, blogId) => {
  return db.post.findMany({ where: { blogId } })
})
```

1.  **Context Injection**: The wrapper automatically retrieves the `blogId` from the request context (headers/domain).
2.  **Scope Enforcement**: The inner function *cannot* execute without a valid `blogId`.
3.  **Isolation**: Even if an attacker manipulates the API input, the DB query is structurally bound to the tenant ID.

---

## 3. Multi-Tenant Routing (Edge Middleware)

Next.js Middleware (`src/middleware.ts`) intercepts every request to handle subdomain routing.

1.  **Hostname Resolution**: Extracts `blog.naesungcms.com` -> `blog`.
2.  **Rewrite**: Rewrites the URL to `/_tenants/blog/...`.
3.  **App Directory**: The file system router at `src/app/[domain]` handles the request.

This allows us to serve thousands of distinct sites from a single Next.js deployment.
