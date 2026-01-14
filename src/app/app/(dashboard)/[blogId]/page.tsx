import { OverviewChart } from "@/components/analytics/overview-chart"
import { TopPosts } from "@/components/analytics/top-posts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAnalytics } from "@/actions/analytics"

export default async function DashboardPage({ params }: { params: { blogId: string } }) {
    const { dailyStats, topPosts, totalViews } = await getAnalytics(params.blogId)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalViews}</div>
                        <p className="text-xs text-muted-foreground">+lifetime</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Daily views for the past 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={dailyStats} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Posts</CardTitle>
                        <CardDescription>Most viewed articles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TopPosts data={topPosts} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
