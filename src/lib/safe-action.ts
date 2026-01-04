import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { rateLimit } from "@/lib/ratelimit"
import { z } from "zod"

type ActionContext = {
    userId: string
    userRole: string
}

export type SafeAction<T, R> = (data: T, context: ActionContext) => Promise<R>

/**
 * Creates a secure server action wrapper.
 * Enforces: Auth, RateLimit, and Logging.
 */
export function createSafeAction<T, R>(
    schema: z.Schema<T>,
    action: SafeAction<T, R>,
    options: {
        actionName: string
        limit?: number
    }
) {
    return async (data: T): Promise<{ success?: boolean; error?: string; data?: R }> => {
        const session = await auth()

        // 1. Auth Check
        if (!session?.user?.id) {
            return { error: "Unauthorized" }
        }

        // 2. Input Validation
        const parsed = schema.safeParse(data)
        if (!parsed.success) {
            return { error: "Invalid input: " + parsed.error.issues.map(i => i.message).join(", ") }
        }

        // 3. Rate Limiting
        const limitV = options.limit || 10
        const { success: limitSuccess } = await rateLimit(`${options.actionName}-${session.user.id}`, limitV, 60)
        if (!limitSuccess) {
            return { error: "Rate limit exceeded. Please try again later." }
        }

        try {
            // 4. Execution
            const result = await action(parsed.data, {
                userId: session.user.id,
                userRole: session.user.role || 'USER' // ensure role exists
            })

            return { success: true, data: result }
        } catch (error) {
            console.error(`Action ${options.actionName} failed:`, error)
            // 5. Audit Log (Failure) is optional, but we can log critical failures here
            return { error: "Internal Server Error" }
        }
    }
}
