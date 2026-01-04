"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createBlogSchema, CreateBlogInput } from "@/lib/validations/schemas"
import { createBlog } from "@/actions/blog"

export function BlogCreateForm() {
    const router = useRouter()
    const [isPending, startTransition] = React.useTransition()

    const form = useForm<CreateBlogInput>({
        resolver: zodResolver(createBlogSchema),
        defaultValues: {
            name: "",
            subdomain: "",
        },
    })

    function onSubmit(data: CreateBlogInput) {
        startTransition(async () => {
            const result = await createBlog(data)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Blog created!")
                const blogId = result.blog?.id
                if (blogId) {
                    router.push(`/dashboard/${blogId}`)
                } else {
                    router.push("/dashboard")
                }
                router.refresh()
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Blog Name</FormLabel>
                            <FormControl>
                                <Input placeholder="My Awesome Blog" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="subdomain"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subdomain</FormLabel>
                            <FormControl>
                                <div className="flex items-center">
                                    <Input placeholder="myblogs" {...field} className="rounded-r-none" />
                                    <div className="bg-slate-100 border border-l-0 px-3 py-2 text-sm text-slate-500 rounded-r-md">
                                        .localhost
                                    </div>
                                </div>
                            </FormControl>
                            <FormDescription>
                                Your blog will be accessible at {field.value || "subdomain"}.localhost
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Blog"}
                </Button>
            </form>
        </Form>
    )
}
