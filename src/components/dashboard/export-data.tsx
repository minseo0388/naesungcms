"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { exportBlogData } from "@/actions/export"
import { toast } from "sonner"
import { DownloadIcon } from "@radix-ui/react-icons"

export function ExportData({ blogId }: { blogId: string }) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        setLoading(true)
        try {
            const json = await exportBlogData(blogId)

            // Trigger Download
            const blob = new Blob([json], { type: "application/json" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `naesung-cms-export-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success("Export successful!")
        } catch (e) {
            toast.error("Failed to export data")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="border rounded-lg p-4 bg-slate-50 flex items-center justify-between">
            <div>
                <h3 className="font-medium text-slate-900">Export Your Data</h3>
                <p className="text-sm text-muted-foreground">Download all your posts and settings as JSON.</p>
            </div>
            <Button onClick={handleExport} disabled={loading} variant="outline">
                <DownloadIcon className="mr-2 h-4 w-4" />
                {loading ? "Exporting..." : "Export JSON"}
            </Button>
        </div>
    )
}
