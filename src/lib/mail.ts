import { Resend } from "resend"
import nodemailer from "nodemailer"

// ==========================================
// MAIL ADAPTER PATTERN
// ==========================================

interface MailAdapter {
    send(to: string, subject: string, html: string): Promise<void>;
}

class ResendAdapter implements MailAdapter {
    private client: Resend;
    private from: string;

    constructor(apiKey: string, from: string) {
        this.client = new Resend(apiKey)
        this.from = from
    }

    async send(to: string, subject: string, html: string) {
        await this.client.emails.send({
            from: this.from,
            to,
            subject,
            html
        })
    }
}

class SmtpAdapter implements MailAdapter {
    private transporter;
    private from: string;

    constructor(from: string) {
        this.from = from
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })

        // Very basic verification to avoid silent failures?
        // this.transporter.verify().catch(console.error)
    }

    async send(to: string, subject: string, html: string) {
        await this.transporter.sendMail({
            from: this.from,
            to,
            subject,
            html
        })
    }
}

// Factory
const INFRA = process.env.NEXT_PUBLIC_INFRA_PROVIDER || "AWS"
const PROVIDER = process.env.EMAIL_PROVIDER || (INFRA === "AWS" ? "RESEND" : "SMTP")
const FROM = process.env.EMAIL_FROM || "security@naesungcms.com"

let mailAdapter: MailAdapter | null = null

if (PROVIDER === "RESEND" && process.env.RESEND_API_KEY) {
    mailAdapter = new ResendAdapter(process.env.RESEND_API_KEY, FROM)
} else if (PROVIDER === "SMTP" && process.env.SMTP_HOST) {
    mailAdapter = new SmtpAdapter(FROM)
}

export async function sendLoginNotification(email: string, ip: string, userAgent: string) {
    if (!mailAdapter) {
        console.warn("[Mail] No adapter configured. Skipping notification.")
        return
    }

    try {
        await mailAdapter.send(
            email,
            "[NaesungCMS] New Login Detected",
            `
                <h1>New Login Detected</h1>
                <p>We detected a new login to your account.</p>
                <ul>
                    <li><strong>IP Address:</strong> ${ip}</li>
                    <li><strong>Device:</strong> ${userAgent}</li>
                    <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                </ul>
            `
        )
        console.log(`[Mail] Sent login alert to ${email}`)
    } catch (e) {
        console.error(`[Mail] Failed to send login alert:`, e)
    }
}
