import { getBlogBySubdomain, getPostsByBlogId } from "@/lib/fetchers"

export async function GET(
    request: Request,
    { params }: { params: { domain: string } }
) {
    const blog = await getBlogBySubdomain(params.domain)

    if (!blog) {
        return new Response("Not found", { status: 404 })
    }

    const posts = await getPostsByBlogId(blog.id)
    const siteUrl = `https://${params.domain}` // In prod, handling http/https correctly is good

    const feedXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${blog.name}</title>
    <link>${siteUrl}</link>
    <description>${blog.description || "A blog powered by NaesungCMS"}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts
            .map((post: any) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/posts/${post.slug}</link>
      <guid>${siteUrl}/posts/${post.slug}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.content.slice(0, 300)}...]]></description>
    </item>
    `).join("")}
  </channel>
</rss>`

    return new Response(feedXml, {
        headers: {
            "Content-Type": "application/xml",
        },
    })
}
