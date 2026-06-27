interface Post {
  id: number
  title: string
  excerpt: string
  author: string
  tag: string
  date: string
}

export default function PostGrid({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="empty-state">No posts yet.</p>
  }

  return (
    <div className="post-grid">
      {posts.map((post) => (
        <article key={post.id} className="post-card">
          <span className="post-tag">{post.tag}</span>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <div className="post-meta">
            <span>{post.author}</span>
            <span>{new Date(post.date).toLocaleDateString()}</span>
          </div>
        </article>
      ))}
    </div>
  )
}
