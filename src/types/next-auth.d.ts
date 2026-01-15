import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            twoFactorEnabled?: boolean
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }

    interface User extends DefaultUser {
        role: string
        twoFactorEnabled?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: string
    }
}
