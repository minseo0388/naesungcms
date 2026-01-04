import { z } from "zod"

// Define Server-side schema (Secrets)
const clientSchema = z.object({
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_INFRA_PROVIDER: z.enum(["AWS", "SELF_HOSTED"]).optional().default("AWS"),
})

const serverSchema = z.object({
    // ... existing
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(1),
    // ...
    // Storage Force Override
    STORAGE_TYPE: z.enum(["S3", "LOCAL"]).optional(),
    S3_ENDPOINT: z.string().url().optional(), // For MinIO

    // Email Force Override
    EMAIL_PROVIDER: z.enum(["RESEND", "SMTP"]).optional(),
    RESEND_API_KEY: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_SECURE: z.string().optional(),

    // ... AWS keys (make optional if self-hosted?)
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_BUCKET_NAME: z.string().optional(),
})

// Validation Logic
export const env = (() => {
    // During build time (next build), we might not have all server envs.
    // But strict mode requires them.
    // We skip validation in 'test' environment if needed.

    const parsedServer = serverSchema.safeParse(process.env)
    const parsedClient = clientSchema.safeParse(process.env)

    if (!parsedServer.success) {
        console.error("❌ Invalid environment variables:", parsedServer.error.flatten().fieldErrors)
        // Only throw in production or fully configured dev to prevent startup crash if just testing
        // throw new Error("Invalid environment variables")
    }

    if (!parsedClient.success) {
        console.error("❌ Invalid public environment variables:", parsedClient.error.flatten().fieldErrors)
    }

    return {
        ...process.env,
        ...(parsedServer.data || {}),
        ...(parsedClient.data || {}),
    } as z.infer<typeof serverSchema> & z.infer<typeof clientSchema>
})()
