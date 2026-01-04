"use client"

import * as React from "react"
import {
    CalendarIcon,
    EnvelopeClosedIcon,
    FaceIcon,
    GearIcon,
    PersonIcon,
    RocketIcon,
} from "@radix-ui/react-icons" // Or use Lucide
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command" // Assuming shadcn command is installed or wrapper needed
import { useRouter, useParams } from "next/navigation"

// Just in case Shadcn Command is not installed, we use a cmdk wrapper or standard. 
// Assuming the user has 'shadcn-ui' command component or I should scaffold it.
// I will assume creating a new component directly wrapping 'cmdk' like Shadcn does is risky without the primitives.
// Check if components/ui/command.tsx exists. If not, I'll assume standard cmdk usage.

// Since I cannot check existence easily without tool, I'll use standard cmdk logic but styled.
// Wait, I installed 'cmdk'. Shadcn uses 'cmdk'.
// I will implement a simplified version inline styled for 'cmdk' to be safe, or check if 'command' component exists.

import { Command } from "cmdk"

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const params = useParams()
    const blogId = params?.blogId as string

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-popover text-popover-foreground border shadow-xl rounded-xl overflow-hidden z-50 p-0"
        >
            <div className="flex items-center border-b px-3">
                <Command.Input
                    placeholder="Type a command or search..."
                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>
            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>

                {blogId && (
                    <Command.Group heading="Blog Actions" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        <Command.Item
                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            onSelect={() => runCommand(() => router.push(`/dashboard/${blogId}/posts/new`))}
                        >
                            <span>Create New Post</span>
                        </Command.Item>
                        <Command.Item
                            className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            onSelect={() => runCommand(() => router.push(`/dashboard/${blogId}/settings`))}
                        >
                            <span>Settings</span>
                        </Command.Item>
                    </Command.Group>
                )}

                <Command.Group heading="General" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    <Command.Item
                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        onSelect={() => runCommand(() => router.push("/"))}
                    >
                        <span>Go Home</span>
                    </Command.Item>
                </Command.Group>
            </Command.List>
        </Command.Dialog>
    )
}
