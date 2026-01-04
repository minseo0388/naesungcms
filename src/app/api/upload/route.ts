import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadFileToS3 } from "@/lib/storage"
import { rateLimit } from "@/lib/ratelimit"
import prisma from "@/lib/db"

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        const blogId = formData.get("blogId") as string

        // Validation
        if (!file || !blogId) {
            return new NextResponse("Missing file or blogId", { status: 400 })
        }

        // Verify Ownership (Tenant Isolation)
        const blog = await prisma.blog.findUnique({
            where: {
                id: blogId,
                ownerId: session.user.id
            }
        })

        if (!blog) {
            return new NextResponse("Unauthorized access to blog", { status: 403 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        // 1. Magic Number Check
        const head = buffer.subarray(0, 4).toString('hex').toUpperCase()
        let isValid = false

        switch (file.type) {
            case 'image/jpeg':
                isValid = head.startsWith('FFD8FF')
                break
            case 'image/png':
                isValid = head === '89504E47'
                break
            case 'image/gif':
                isValid = head === '47494638'
                break
            case 'image/webp':
                isValid = head.startsWith('52494646') && buffer.subarray(8, 12).toString('hex').toUpperCase() === '57454250' // RIFF...WEBP
                break
            case 'image/svg+xml':
                // SVG validation is text-based
                isValid = true // Handled below
                break
            default:
                isValid = false
        }

        if (!isValid) {
            return new NextResponse("File signature mismatch (Magic Number check failed)", { status: 400 })
        }

        // 2. SVG Sanitization
        let finalBuffer = buffer
        if (file.type === 'image/svg+xml') {
            // Basic text check for script tags if needed, or rely on isomorphic-dompurify on client?
            // Server-side DOMPurify requires JSDOM, which is heavy. 
            // We will do a simple string check for security scripts.
            const text = buffer.toString('utf-8')
            if (text.includes('<script') || text.includes('javascript:')) {
                return new NextResponse("SVG contains potentially malicious scripts", { status: 400 })
            }
        }

        // Limit size to 5MB
        if (file.size > 5 * 1024 * 1024) {
            return new NextResponse("File too large (Max 5MB)", { status: 400 })
        }

        // Rate Limiting
        if (session.user.id) {
            const { success } = await rateLimit(`upload-${session.user.id}`, 5, 60)
            if (!success) {
                return new NextResponse("Rate limit exceeded", { status: 429 })
            }
        }

        // Scope key to tenant
        const keyPrefix = `tenants/${blogId}`
        const { publicUrl } = await uploadFileToS3(finalBuffer, file.type, keyPrefix)

        return NextResponse.json({ publicUrl })
    } catch (error) {
        console.error("Upload error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
