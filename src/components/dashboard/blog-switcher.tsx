"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter, useParams } from "next/navigation"

type Blog = {
    id: string
    name: string
    subdomain: string
}

interface BlogSwitcherProps {
    blogs: Blog[]
}

export function BlogSwitcher({ blogs }: BlogSwitcherProps) {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const params = useParams()
    const activeBlog = blogs.find(b => b.id === params.blogId) || blogs[0]

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {activeBlog ? activeBlog.name : "Select blog..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search blog..." />
                    <CommandList>
                        <CommandEmpty>No blog found.</CommandEmpty>
                        <CommandGroup heading="Blogs">
                            {blogs.map((blog) => (
                                <CommandItem
                                    key={blog.id}
                                    onSelect={() => {
                                        setOpen(false)
                                        router.push(`/dashboard/${blog.id}`)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            activeBlog?.id === blog.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {blog.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                            <CommandItem onSelect={() => {
                                setOpen(false)
                                router.push("/dashboard/new-blog")
                            }}>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Create Blog
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
