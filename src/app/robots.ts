import { MetadataRoute } from "next"
import { headers } from "next/headers"

export default async function robots(): Promise<MetadataRoute.Robots> {
    const headersList = await headers()
    const host = headersList.get("host") || "naesung.kr"
    const protocol = host.includes("localhost") ? "http" : "https"
    const domain = `${protocol}://${host}`

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/dashboard/"],
        },
        sitemap: `${domain}/sitemap.xml`,
    }
}
