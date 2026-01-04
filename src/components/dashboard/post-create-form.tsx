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
import { Checkbox } from "@/components/ui/checkbox"
import { Editor } from "@/components/editor/editor"
import { createPostSchema, CreatePostInput } from "@/lib/validations/schemas"
import { createPost } from "@/actions/post"

interface PostCreateFormProps {
    blogId: string
}

export function PostCreateForm({ blogId }: PostCreateFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = React.useTransition()

    const form = useForm<CreatePostInput>({
        resolver: zodResolver(createPostSchema) as any,
        defaultValues: {
            title: "",
            content: "",
            published: false,
        },
    })

    function onSubmit(data: CreatePostInput) {
        startTransition(async () => {
            // Safe Action expects single object
            const result = await createPost({ ...data, blogId })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Post created!")
                router.push(`/dashboard/${blogId}/posts`)
                router.refresh()
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter post title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                                <Editor
                                    value={field.value}
                                    onChange={field.onChange}
                                    blogId={blogId}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Publish immediately
                                </FormLabel>
                                <FormDescription>
                                    This post will be visible to everyone.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending ? "Creating..." : "Create Post"}
                </Button>
            </form>
        </Form>
    )
}
