import { PostCreateForm } from "@/components/dashboard/post-create-form"

export default function CreatePostPage({ params }: { params: { blogId: string } }) {
    return (
        <div className="flex flex-col gap-6 p-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Create Post</h1>
                <p className="text-muted-foreground">Write a new post for your blog.</p>
            </div>
            <div className="rounded-md border p-6">
                <PostCreateForm blogId={params.blogId} />
            </div>
        </div>
    )
}
