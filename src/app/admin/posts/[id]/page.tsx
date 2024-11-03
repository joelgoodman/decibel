import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PostEditor } from "@/components/admin/posts/post-editor"

interface PostPageProps {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = params.id === "new" ? null : await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      categories: true,
      tags: true,
      seo: true,
    },
  })

  if (params.id !== "new" && !post) {
    notFound()
  }

  const categories = await prisma.category.findMany()
  const tags = await prisma.tag.findMany()

  return <PostEditor post={post} categories={categories} tags={tags} />
}