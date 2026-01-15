"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verify2FA } from "@/actions/two-factor"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const verify2FASchema = z.object({
    code: z.string().min(6, "Code must be 6 digits").max(6),
})

type Verify2FAInput = z.infer<typeof verify2FASchema>

export default function Verify2FAPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit, formState: { errors } } = useForm<Verify2FAInput>({
        resolver: zodResolver(verify2FASchema),
    })

    const onSubmit = async (data: Verify2FAInput) => {
        setLoading(true)
        try {
            const result = await verify2FA({ token: data.code })
            if (result.success) {
                toast.success("Verified successfully")
                router.push("/dashboard")
                router.refresh()
            } else {
                toast.error(result.error || "Invalid code")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Enter the 6-digit code from your authenticator app.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                {...register("code")}
                                placeholder="000000"
                                maxLength={6}
                                className="text-center text-lg tracking-widest"
                            />
                            {errors.code && (
                                <p className="text-sm text-red-500">{errors.code.message}</p>
                            )}
                        </div>
                        <Button className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
