import { getBlogPosts } from "./getBlogPosts"

export async function BlogPosts() {
  const posts = await getBlogPosts();

  return (
    <div className="space-y-2">
      {posts.map(({ title, slug, brief}) => (
        <div key={slug}>
          <a href={`https://blog.nahtnam.com/${slug}`} target="_blank" className="alert no-underline bg-gray-50 hover:bg-gray-100 flex-col items-start gap-0 font-normal" rel="noreferrer">
            <div className="font-bold underline">
              {title}
            </div>
            <div className="text-sm line-clamp-3">
              {brief}
            </div>
          </a>
        </div>
      ))}
    </div>
  )
}
