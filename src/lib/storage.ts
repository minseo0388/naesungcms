import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import path from "path"

// ==========================================
// INFRASTRUCTURE ADAPTER PATTERN
// ==========================================

// 1. Define Interface
interface StorageAdapter {
    upload(buffer: Buffer, fileType: string, prefix?: string): Promise<{ publicUrl: string }>;
    delete(key: string): Promise<void>;
    getPresignedUrl?(fileType: string, fileSize: number, prefix?: string): Promise<{ uploadUrl: string, publicUrl: string, fileName: string }>;
}

// 2. Concrete Implementation: LocalStorage
class LocalStorageAdapter implements StorageAdapter {
    private uploadDir: string;
    private appUrl: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), "public", "uploads")
        this.appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true })
        }
    }

    async upload(buffer: Buffer, fileType: string, keyPrefix: string = "") {
        const fileExtension = fileType.split("/")[1] || "bin"
        const prefix = keyPrefix ? (keyPrefix.endsWith("/") ? keyPrefix : `${keyPrefix}/`) : ""
        const fileName = `${prefix}${uuidv4()}.${fileExtension}`

        // Ensure subdir
        const targetDir = path.join(this.uploadDir, path.dirname(fileName))
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true })
        }

        const filePath = path.join(this.uploadDir, fileName)
        fs.writeFileSync(filePath, buffer)

        return { publicUrl: `${this.appUrl}/uploads/${fileName}` }
    }

    async delete(fileKey: string) {
        if (!fileKey.includes("tenants/")) return // safe guard

        let relativeKey = fileKey
        if (fileKey.startsWith("http")) {
            const url = new URL(fileKey)
            relativeKey = url.pathname.replace(/^\/uploads\//, "")
        }
        if (relativeKey.includes("..")) return

        const filePath = path.join(this.uploadDir, relativeKey)
        if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath) } catch (e) { console.error(e) }
        }
    }
}

// 3. Concrete Implementation: S3Adapter (Universal for AWS & MinIO)
class S3StorageAdapter implements StorageAdapter {
    private client: S3Client;
    private bucket: string;

    constructor() {
        this.bucket = process.env.AWS_BUCKET_NAME!;
        this.client = new S3Client({
            region: process.env.AWS_REGION!,
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
            forcePathStyle: !!process.env.S3_ENDPOINT,
        })
    }

    async upload(buffer: Buffer, fileType: string, keyPrefix: string = "") {
        const fileExtension = fileType.split("/")[1] || "bin"
        const prefix = keyPrefix ? (keyPrefix.endsWith("/") ? keyPrefix : `${keyPrefix}/`) : ""
        const fileName = `${prefix}${uuidv4()}.${fileExtension}`

        await this.client.send(new PutObjectCommand({
            Bucket: this.bucket,
            Key: fileName,
            ContentType: fileType,
            Body: buffer
        }))

        // Verify URL construction for MinIO vs AWS
        let publicUrl = ""
        if (process.env.S3_ENDPOINT) {
            publicUrl = `${process.env.S3_ENDPOINT}/${this.bucket}/${fileName}`
        } else {
            publicUrl = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
        }

        return { publicUrl }
    }

    async delete(fileKey: string) {
        if (!fileKey.includes("tenants/")) return
        await this.client.send(new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: fileKey
        }))
    }

    async getPresignedUrl(fileType: string, fileSize: number, keyPrefix: string = "") {
        const fileExtension = fileType.split("/")[1] || "bin"
        const prefix = keyPrefix ? (keyPrefix.endsWith("/") ? keyPrefix : `${keyPrefix}/`) : ""
        const fileName = `${prefix}${uuidv4()}.${fileExtension}`

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: fileName,
            ContentType: fileType,
            ContentLength: fileSize
        })

        const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 300 })
        const publicUrl = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`

        return { uploadUrl, publicUrl, fileName }
    }
}

// 4. Factory Logic
const INFRA = process.env.NEXT_PUBLIC_INFRA_PROVIDER || "AWS"
const TYPE = process.env.STORAGE_TYPE || (INFRA === "SELF_HOSTED" ? "LOCAL" : "S3")

let adapter: StorageAdapter

if (TYPE === "LOCAL") {
    adapter = new LocalStorageAdapter()
} else {
    // S3 Mode (Valid for AWS or SELF_HOSTED MinIO)
    // Avoid crash if envs missing during build
    if (process.env.AWS_BUCKET_NAME) {
        adapter = new S3StorageAdapter()
    } else {
        // Fallback or Mock
        adapter = new LocalStorageAdapter()
    }
}

// 5. Exports
// Standardized exports that map to the adapter
export async function uploadFileToS3(buffer: Buffer, fileType: string, prefix: string = "") {
    return adapter.upload(buffer, fileType, prefix)
}
export const uploadFileToStorage = uploadFileToS3

export async function deleteFile(key: string) {
    return adapter.delete(key)
}

export async function getPresignedUrl(t: string, s: number, p: string = "") {
    if (adapter.getPresignedUrl) return adapter.getPresignedUrl(t, s, p)
    throw new Error("Presigned URL not supported in this adapter")
}
