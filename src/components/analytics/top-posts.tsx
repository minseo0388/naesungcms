import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TopPostsProps {
    data: {
        title: string
        views: number
        slug: string
    }[]
}

export function TopPosts({ data }: TopPostsProps) {
    return (
        <div className="space-y-8">
            {data.map((post, index) => (
                <div key={post.slug} className="flex items-center">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted font-bold text-sm mr-4">
                        {index + 1}
                    </div>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none truncate max-w-[200px]">{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                            /{post.slug}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">+{post.views} Views</div>
                </div>
            ))}
        </div>
    )
}
