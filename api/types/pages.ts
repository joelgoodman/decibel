export type PageStatus = 'draft' | 'published' | 'archived';
export type PageTemplate = 'default' | 'full-width' | 'landing';

export interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: any[];
  authorId: string;
  authorName?: string;
  status: PageStatus;
  template: PageTemplate;
  meta: PageMeta;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  deletedAt?: Date;
}