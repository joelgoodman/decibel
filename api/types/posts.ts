export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface PostMeta {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: Record<string, any>;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: any[];
  excerpt?: string;
  authorId: string;
  status: PostStatus;
  meta: PostMeta;
  scheduledAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  taxonomies?: any[];
  comments?: Comment[];
  likesCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}