import { notFound } from "next/navigation"
import { getBlogBySubdomain } from "@/lib/fetchers"
import { TenantNav } from "@/components/tenant/tenant-nav"
import { TenantFooter } from "@/components/tenant/tenant-footer"
import { Metadata } from "next"

export async function generateMetadata({
    params,
}: {
    params: { domain: string }
}): Promise<Metadata> {
    const subdomain = params.domain
    const blog = await getBlogBySubdomain(subdomain)

    if (!blog) {
        return {}
    }

    return {
        title: {
            default: blog.name,
            template: `%s | ${blog.name}`,
        },
        description: `Welcome to ${blog.name}`,
    }
}

export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: { domain: string }
}) {
    const subdomain = params.domain
    // 1. Resolve Tenant
    const blog = await getBlogBySubdomain(subdomain)

    if (!blog) {
        notFound()
    }

    // Parse Theme Config
    let themeConfig = { primaryColor: "blue" }
    try {
        if (blog.themeConfig) themeConfig = JSON.parse(blog.themeConfig)
    } catch (e) { }

    // Simple HSL map for demo
    const colorMap: Record<string, string> = {
        blue: "221.2 83.2% 53.3%",
        red: "0 84.2% 60.2%",
        green: "142.1 76.2% 36.3%",
        violet: "262.1 83.3% 57.8%",
        orange: "24.6 95% 53.1%",
    }

    const primaryHSL = colorMap[themeConfig.primaryColor] || colorMap.blue

    return (
        <div className="flex min-h-screen flex-col font-sans" style={{
            "--primary": primaryHSL,
            "--ring": primaryHSL
        } as React.CSSProperties}>
            <TenantNav name={blog.name} domain={subdomain} />
            <main className="flex-1 container mx-auto px-4 py-8">
                {children}
            </main>
            <TenantFooter />
        </div>
    )
}
