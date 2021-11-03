
export type Post = {
  slug: string
  title: string
  excerpt: string
  updatedAt: string
}

export type PostProps = {
  posts: Post[]
}

export type PostContentProps = {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt : string;
  }
}