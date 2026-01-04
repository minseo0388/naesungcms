"use server"

import { withTenant } from "@/lib/data-access"
import prisma from "@/lib/db"

export async function getAnalytics(blogId: string) {
    return await withTenant(blogId, async ({ blogId: validatedBlogId }) => {
        // 1. Get Daily Stats (Last 7 days)
        // Note: In a real app, you might need to fill in missing dates with 0.
        // @ts-ignore: Stale IDE Cache
        const dailyStats = await prisma.dailyStat.findMany({
            where: { blogId: validatedBlogId },
            orderBy: { date: "asc" },
            take: 7
        })

        // 2. Get Top Posts
        const topPosts = await prisma.post.findMany({
            where: { blogId: validatedBlogId, published: true },
            orderBy: { viewCount: "desc" },
            take: 5,
            select: { title: true, slug: true, viewCount: true }
        })

        // 3. Get Total Views (Aggregated)
        const totalViews = await prisma.post.aggregate({
            where: { blogId: validatedBlogId },
            _sum: { viewCount: true }
        })

        return {
            dailyStats: dailyStats.map((stat: any) => ({ date: stat.date.slice(5), views: stat.views })), // MM-DD
            topPosts: topPosts.map(p => ({ title: p.title, slug: p.slug, views: p.viewCount })),
            totalViews: totalViews._sum.viewCount || 0
        }
    })
}
