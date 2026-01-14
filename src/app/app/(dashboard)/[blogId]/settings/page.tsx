import { ExportData } from "@/components/dashboard/export-data"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SettingsPage({ params }: { params: { blogId: string } }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your blog settings and data.</p>
            </div>

            <Separator />

            <div className="flex space-x-4">
                <Link href={`/dashboard/${params.blogId}/settings`}>
                    <Button variant="secondary">General</Button>
                </Link>
                <Link href={`/dashboard/${params.blogId}/settings/appearance`}>
                    <Button variant="ghost">Appearance</Button>
                </Link>
            </div>

            <section className="space-y-4 pt-4">
                <h2 className="text-lg font-semibold">Data Portability</h2>
                <ExportData blogId={params.blogId} />
            </section>
        </div>
    )
}
