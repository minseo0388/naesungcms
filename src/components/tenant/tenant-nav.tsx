import Link from "next/link"

export function TenantNav({ name, domain }: { name: string; domain: string }) {
    return (
        <nav className="border-b bg-white">
            <div className="container mx-auto flex h-16 items-center px-4">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    {name}
                </Link>
                <div className="ml-auto flex gap-4">
                    <Link href="/" className="text-sm font-medium hover:underline">
                        Home
                    </Link>
                    {/* Placeholder links */}
                    <Link href="#" className="text-sm font-medium hover:underline text-muted-foreground">
                        About
                    </Link>
                </div>
            </div>
        </nav>
    )
}
