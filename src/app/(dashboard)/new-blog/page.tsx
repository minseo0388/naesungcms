import { BlogCreateForm } from "@/components/dashboard/blog-create-form"

export default function CreateBlogPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50/20">
            <div className="w-full max-w-md p-8 bg-white rounded-lg border shadow-sm">
                <h1 className="text-2xl font-bold mb-2">Create a new blog</h1>
                <p className="text-muted-foreground mb-6">Enter a name and subdomain for your new blog.</p>
                <BlogCreateForm />
            </div>
        </div>
    )
}
