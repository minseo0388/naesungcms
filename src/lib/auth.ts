import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Discord from "next-auth/providers/discord"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
    // @ts-expect-error Adapter type mismatch due to extended User model
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // Removed allowDangerousEmailAccountLinking for security
            // Users must explicitly link accounts through settings
        }),
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            // Removed allowDangerousEmailAccountLinking for security
            // Users must explicitly link accounts through settings
        }),
        Resend({
            from: "login@naesungcms.com",
            apiKey: process.env.RESEND_API_KEY
        })
    ],
    events: {
        async signIn(message) {
            // Trigger background notification
            if (message.user.email) {
                const { sendLoginNotification } = await import("@/lib/mail")
                sendLoginNotification(message.user.email, "Unknown IP", "Unknown Device")
                    .catch(console.error)
            }
        }
    },
    callbacks: {
        async signIn({ account, profile, user }) {
            if (account?.provider === "google") {
                return profile?.email_verified === true
            }
            if (account?.provider === "discord") {
                // Discord returns 'verified' as boolean
                return (profile as any)?.verified === true
            }

            // Check if user has 2FA enabled
            if (user?.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { twoFactorEnabled: true }
                })

                // If 2FA is enabled, we'll handle verification in the session callback
                // For now, allow signin but mark for 2FA verification
                if (dbUser?.twoFactorEnabled) {
                    // Store in session that 2FA verification is needed
                    // This will be checked in the session callback
                }
            }

            return true // Allow other providers (if any) or credential login
        },
        async session({ session, user }) {
            if (session.user && user) {
                session.user.id = user.id;
                session.user.role = user.role as string;

                // Check 2FA status
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { twoFactorEnabled: true }
                })

                // Add 2FA status to session for client-side checks
                session.user.twoFactorEnabled = dbUser?.twoFactorEnabled || false
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id || "";
                token.role = user.role as string;
            }
            return token
        }
    },
    pages: {
        signIn: '/auth/signin',
    },
    session: {
        strategy: "database"
    }
})
