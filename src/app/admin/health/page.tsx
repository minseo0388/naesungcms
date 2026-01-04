import { auth } from "@/lib/auth"
import prisma from "@/lib/db"
import { redis } from "@/lib/redis"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Users, Database, Server } from "lucide-react"

export const dynamic = "force-dynamic" // Real-time data

export default async function HealthDashboard() {
    const session = await auth()

    // Simple Admin Check (Replace with Role check if available)
    // For now, assuming any logged in user with specific email or Role=ADMIN
    // Since Role is in User model, we check session.user.role
    if (session?.user?.role !== "ADMIN") {
        // Fallback: check if it's the specific admin email
        if (session?.user?.email !== process.env.ADMIN_EMAIL) {
            redirect("/")
        }
    }

    // 1. Check DB
    let dbStatus = "Unknown"
    let dbLatency = 0
    let userCount = 0
    try {
        const start = Date.now()
        await prisma.$queryRaw`SELECT 1`
        dbLatency = Date.now() - start
        dbStatus = "Healthy"
        userCount = await prisma.user.count()
    } catch (e) {
        dbStatus = "Unhealthy"
    }

    // 2. Check Redis
    let redisStatus = "Unknown"
    let redisLatency = 0
    if (redis) {
        try {
            const start = Date.now()
            await redis.ping()
            redisLatency = Date.now() - start
            redisStatus = "Healthy"
        } catch (e) {
            redisStatus = "Unhealthy"
        }
    } else {
        redisStatus = "Disabled"
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <h1 className="text-3xl font-bold">Global System Health</h1>

            <div className="grid gap-4 md:grid-cols-3">
                {/* DB Config */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Database (MariaDB)</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            {dbStatus === "Healthy" ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                            <div className="text-2xl font-bold">{dbStatus}</div>
                        </div>
                        <p className="text-xs text-muted-foreground">Latency: {dbLatency}ms</p>
                    </CardContent>
                </Card>

                {/* Redis Config */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cache (Redis)</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            {redisStatus === "Healthy" ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                            <div className="text-2xl font-bold">{redisStatus}</div>
                        </div>
                        <p className="text-xs text-muted-foreground">Latency: {redisLatency}ms</p>
                    </CardContent>
                </Card>

                {/* User Stats */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
                        <p className="text-xs text-muted-foreground">Active Accounts</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
