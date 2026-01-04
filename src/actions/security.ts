"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { authenticator } from "otplib"
import { withTenant } from "@/lib/data-access" // Not needed for user settings but good practice if scoping

export async function generateTwoFactorSecret() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const secret = authenticator.generateSecret()
    const otpauth = authenticator.keyuri(
        session.user.email!,
        "NaesungCMS",
        secret
    )

    return { secret, otpauth }
}

export async function enableTwoFactor(token: string, secret: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const isValid = authenticator.verify({ token, secret })

    if (!isValid) {
        throw new Error("Invalid Token")
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            twoFactorEnabled: true,
            twoFactorSecret: secret // In real app, encrypt this!
        }
    })

    return { success: true }
}

export async function disableTwoFactor() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            twoFactorEnabled: false,
            twoFactorSecret: null
        }
    })

    return { success: true }
}
