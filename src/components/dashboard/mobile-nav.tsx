"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { BlogSwitcher } from "@/components/dashboard/blog-switcher"

export function MobileNav({ blogs }: { blogs: any[] }) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <div className="px-7">
                    <div className="flex items-center h-14 border-b mb-4">
                        <BlogSwitcher blogs={blogs} />
                    </div>
                    <DashboardSidebar />
                </div>
            </SheetContent>
        </Sheet>
    )
}
