import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <main className="max-w-4xl space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome to NaesungCMS
        </h1>
        <p className="text-xl text-muted-foreground">
          The Ultimate Multi-Tenant CMS created by Choi Minseo
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="https://github.com/minseo0388/naesungcms">
              View on GitHub
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
