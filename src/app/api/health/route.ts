import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const start = Date.now()
        // Check Database
        await prisma.$queryRaw`SELECT 1`
        const dbLatency = Date.now() - start

        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            services: {
                database: { status: "up", latency: `${dbLatency}ms` },
                // Add Redis/S3 checks here if needed
            }
        })
    } catch (error) {
        console.error("Health Check Failed:", error)
        return NextResponse.json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            error: "Database connection failed"
        }, { status: 503 })
    }
}
