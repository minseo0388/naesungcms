import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6 p-4">
            <h1 className="text-6xl font-black text-primary">404</h1>
            <h2 className="text-2xl font-bold">Page Not Found</h2>
            <p className="text-muted-foreground max-w-md">
                Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
            </p>
            <Button asChild>
                <Link href="/">Return Home</Link>
            </Button>
        </div>
    )
}
