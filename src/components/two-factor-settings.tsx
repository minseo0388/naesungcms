"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { setup2FA, verify2FA, check2FAStatus } from "@/actions/two-factor"
import { toast } from "sonner"
import { useEffect } from "react"
import QRCode from "qrcode"

// @ts-ignore - qrcode types may not be available
type QRCodeType = typeof QRCode

export function TwoFactorSettings() {
    const [enabled, setEnabled] = useState(false)
    const [loading, setLoading] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
    const [secret, setSecret] = useState<string | null>(null)
    const [verificationCode, setVerificationCode] = useState("")
    const [showSetup, setShowSetup] = useState(false)

    useEffect(() => {
        check2FAStatus().then(result => {
            setEnabled(result.enabled)
        })
    }, [])

    const handleEnable2FA = async () => {
        setLoading(true)
        try {
            const result = await setup2FA({ enable: true })

            if (result.error) {
                toast.error(result.error)
                return
            }

            if (result.data) {
                setSecret(result.data.secret || null)

                // Generate QR code
                const qrUrl = await QRCode.toDataURL(result.data.otpauth)
                setQrCodeUrl(qrUrl)
                setShowSetup(true)

                toast.success("Scan the QR code with your authenticator app")
            }
        } catch (error) {
            toast.error("Failed to setup 2FA")
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async () => {
        setLoading(true)
        try {
            const result = await verify2FA({ token: verificationCode })

            if (result.error) {
                toast.error(result.error)
                return
            }

            if (result.data?.verified) {
                toast.success("2FA enabled successfully!")
                setEnabled(true)
                setShowSetup(false)
                setQrCodeUrl(null)
                setSecret(null)
                setVerificationCode("")
            }
        } catch (error) {
            toast.error("Invalid verification code")
        } finally {
            setLoading(false)
        }
    }

    const handleDisable2FA = async () => {
        setLoading(true)
        try {
            const result = await setup2FA({ enable: false })

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("2FA disabled")
            setEnabled(false)
        } catch (error) {
            toast.error("Failed to disable 2FA")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                <CardDescription>
                    Add an extra layer of security to your account
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!enabled && !showSetup && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Two-factor authentication adds an additional layer of security to your account.
                            You'll need to enter a code from your authenticator app when signing in.
                        </p>
                        <Button onClick={handleEnable2FA} disabled={loading}>
                            Enable 2FA
                        </Button>
                    </div>
                )}

                {showSetup && qrCodeUrl && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>1. Scan this QR code with your authenticator app</Label>
                            <div className="flex justify-center p-4 bg-white rounded-lg">
                                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>2. Or enter this secret key manually</Label>
                            <code className="block p-2 bg-muted rounded text-sm">
                                {secret}
                            </code>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="verification-code">3. Enter the 6-digit code from your app</Label>
                            <Input
                                id="verification-code"
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleVerify} disabled={loading || verificationCode.length !== 6}>
                                Verify & Enable
                            </Button>
                            <Button variant="outline" onClick={() => setShowSetup(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {enabled && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                            <span className="text-sm font-medium">2FA is enabled</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Your account is protected with two-factor authentication.
                        </p>
                        <Button variant="destructive" onClick={handleDisable2FA} disabled={loading}>
                            Disable 2FA
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
