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
            allowDangerousEmailAccountLinking: true,
        }),
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
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
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                return profile?.email_verified === true
            }
            if (account?.provider === "discord") {
                // Discord returns 'verified' as boolean
                return (profile as any)?.verified === true
            }
            return true // Allow other providers (if any) or credential login
        },
        async session({ session, user }) {
            if (session.user && user) {
                session.user.id = user.id;
                session.user.role = user.role as string;
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
