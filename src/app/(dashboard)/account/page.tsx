import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { ProfileForm } from "@/components/dashboard/profile-form"

export default async function AccountPage() {
    const session = await auth()
    if (!session?.user) {
        redirect("/api/auth/signin")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    if (!user) redirect("/")

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
            </div>
            <div className="max-w-2xl">
                <ProfileForm user={user} />
            </div>
        </div>
    )
}
