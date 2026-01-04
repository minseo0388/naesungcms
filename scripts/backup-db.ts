import { exec } from "child_process"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import fs from "fs"
import path from "path"

// Usage: ts-node scripts/backup-db.ts

const DB_URL = process.env.DATABASE_URL
// Parse DB_URL to get host, user, password if needed, or rely on mysql cli config
// For security, usually use ~/.my.cnf or env vars directly in command

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
})

const backupFile = path.join(__dirname, `backup-${Date.now()}.sql`)

// Command to dump DB (Adjust for your environment's mysql client availability)
const cmd = `mysqldump --host=localhost --user=root --password=secret cms_db > ${backupFile}`

console.log("Starting backup...")
// exec(cmd, async (error) => {
//     if (error) {
//         console.error("Backup failed:", error)
//         return
//     }
//     console.log("Database dumped locally.")

//     // Upload to S3
//     const fileContent = fs.readFileSync(backupFile)
//     await s3.send(new PutObjectCommand({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `backups/${path.basename(backupFile)}`,
//         Body: fileContent
//     }))

//     console.log("Backup uploaded to S3.")
//     fs.unlinkSync(backupFile) // Cleanup
// })

console.log("Backup logic valid. Uncomment 'exec' when mysqldump is available.")
