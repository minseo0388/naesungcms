import { redirect } from "next/navigation"
import { getUserBlogs } from "@/actions/blog"
import { auth } from "@/lib/auth"
import { BlogSwitcher } from "@/components/dashboard/blog-switcher"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { CommandMenu } from "@/components/command-menu"

import { MobileNav } from "@/components/dashboard/mobile-nav"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/api/auth/signin")
    }

    const blogs = await getUserBlogs()

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <aside className="w-full md:w-64 border-r bg-slate-50/40 min-h-screen hidden md:block">
                <div className="h-14 flex items-center px-4 border-b">
                    <BlogSwitcher blogs={blogs} />
                </div>
                <div className="p-4">
                    <DashboardSidebar />
                </div>
            </aside>
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="flex h-14 items-center gap-4 border-b bg-slate-50/40 px-6 md:hidden">
                    <MobileNav blogs={blogs} />
                    <span className="font-bold">NaesungCMS</span>
                </header>
                <main className="flex-1 p-6">
                    <CommandMenu />
                    {children}
                </main>
            </div>
        </div>
    )
}
