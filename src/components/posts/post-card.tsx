import Link from 'next/link'
import { format } from 'date-fns'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  coverImage?: string
  publishedAt?: string
  author: {
    name: string
    image?: string
  }
  categories: {
    id: string
    name: string
  }[]
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {post.coverImage && (
        <div className="relative h-48 w-full">
          <OptimizedImage
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center space-x-4">
          {post.author.image && (
            <OptimizedImage
              src={post.author.image}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <CardTitle className="text-lg">
              <Link href={`/posts/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </CardTitle>
            <p className="text-sm text-gray-500">
              By {post.author.name} ·{' '}
              {post.publishedAt && format(new Date(post.publishedAt), 'PP')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {post.categories.map((category) => (
            <Badge key={category.id} variant="secondary">
              {category.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}