"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { authenticator } from "otplib"
import { z } from "zod"
import { createSafeAction } from "@/lib/safe-action"

// Setup 2FA
const setup2FASchema = z.object({
    enable: z.boolean()
})

export const setup2FA = createSafeAction(
    setup2FASchema,
    async (data, ctx) => {
        const { enable } = data

        if (enable) {
            // Generate a new secret
            const secret = authenticator.generateSecret()

            // Update user with 2FA secret
            await prisma.user.update({
                where: { id: ctx.userId },
                data: {
                    twoFactorSecret: secret,
                    twoFactorEnabled: false // Will be enabled after verification
                }
            })

            // Generate QR code data for authenticator apps
            const user = await prisma.user.findUnique({
                where: { id: ctx.userId },
                select: { email: true }
            })

            const otpauth = authenticator.keyuri(
                user?.email || ctx.userId,
                "NaesungCMS",
                secret
            )

            return {
                secret,
                otpauth,
                qrCode: otpauth // Frontend can generate QR from this
            }
        } else {
            // Disable 2FA
            await prisma.user.update({
                where: { id: ctx.userId },
                data: {
                    twoFactorEnabled: false,
                    twoFactorSecret: null
                }
            })

            return { success: true }
        }
    },
    { actionName: "setup2FA", limit: 5 }
)

// Verify 2FA token
const verify2FASchema = z.object({
    token: z.string().length(6)
})

export const verify2FA = createSafeAction(
    verify2FASchema,
    async (data, ctx) => {
        const { token } = data

        const user = await prisma.user.findUnique({
            where: { id: ctx.userId },
            select: { twoFactorSecret: true, twoFactorEnabled: true }
        })

        if (!user?.twoFactorSecret) {
            throw new Error("2FA not set up")
        }

        const isValid = authenticator.verify({
            token,
            secret: user.twoFactorSecret
        })

        if (!isValid) {
            throw new Error("Invalid 2FA token")
        }

        // Enable 2FA if this is the first verification
        if (!user.twoFactorEnabled) {
            await prisma.user.update({
                where: { id: ctx.userId },
                data: { twoFactorEnabled: true }
            })
        }

        return { success: true, verified: true }
    },
    { actionName: "verify2FA", limit: 10 }
)

// Check if user has 2FA enabled
export async function check2FAStatus() {
    const session = await auth()

    if (!session?.user?.id) {
        return { enabled: false }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { twoFactorEnabled: true }
    })

    return { enabled: user?.twoFactorEnabled || false }
}
