export type ContentType = 'NEWSLETTER' | 'BLOG' | 'PODCAST' | 'PAGE';
export type StatusType = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type DeliveryStatus = 'PENDING' | 'SENDING' | 'SENT' | 'FAILED';
export type SubscriptionType = 'FREE' | 'PAID' | 'PREMIUM';

export type QueryFunction = (sql: string, params?: any[]) => Promise<any>;

export interface BaseModel {
  id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  metadata?: Record<string, any>;
}

export interface User extends BaseModel {
  email: string;
  name: string | null;
}

export interface Role extends BaseModel {
  name: string;
  permissions: string[];
}

export interface Publication extends BaseModel {
  title: string;
  slug: string;
  description: string | null;
  author_id: string;
}

export interface Content extends BaseModel {
  title: string;
  slug: string;
  type: ContentType;
  status: StatusType;
  blocks: any[];
  version: number;
  publication_id: string;
  published_at: Date | null;
  scheduled_at: Date | null;
  newsletter_status: DeliveryStatus | null;
  newsletter_sent_at: Date | null;
  newsletter_error?: string | null;
}

export interface ContentVersion extends BaseModel {
  content_id: string;
  version: number;
  title: string;
  blocks: any[];
  created_by: string;
}

export interface Taxonomy extends BaseModel {
  name: string;
  slug: string;
  type: string;
  publication_id: string;
  parent_id?: string | null;
}

export interface ContentTaxonomy extends BaseModel {
  content_id: string;
  taxonomy_id: string;
  order: number;
}