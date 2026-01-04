"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { LayoutDashboard, FileText, Settings, Globe } from "lucide-react"

import { cn } from "@/lib/utils"

export function DashboardSidebar() {
    const pathname = usePathname()
    const params = useParams()
    const blogId = params.blogId as string

    if (!blogId) return null

    const routes = [
        {
            href: `/dashboard/${blogId}`,
            label: "Overview",
            icon: LayoutDashboard,
            active: pathname === `/dashboard/${blogId}`,
        },
        {
            href: `/dashboard/${blogId}/posts`,
            label: "Posts",
            icon: FileText,
            active: pathname.includes(`/posts`),
        },
        {
            href: `/dashboard/${blogId}/settings`,
            label: "Settings",
            icon: Settings,
            active: pathname.includes(`/settings`),
        },
    ]

    return (
        <nav className="flex flex-col space-y-1">
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 hover:text-slate-900",
                        route.active ? "bg-slate-100 text-slate-900" : "text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-700 text-slate-600"
                    )}
                >
                    <route.icon className={cn("mr-2 h-4 w-4", route.active ? "text-slate-900" : "text-slate-500")} />
                    <span className={cn(route.active ? "text-slate-900" : "text-slate-600")}>{route.label}</span>
                </Link>
            ))}
            <div className="my-4 border-t" />
            <Link
                href="#" // TODO: resolve actual public URL
                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
                <Globe className="mr-2 h-4 w-4 text-slate-500" />
                View Blog
            </Link>
        </nav>
    )
}
