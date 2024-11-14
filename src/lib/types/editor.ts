export type BlockType = 
  | 'text' 
  | 'image' 
  | 'gallery'
  | 'embed'
  | 'separator'
  | 'callout'
  | 'pullquote'
  | 'hidden'
  | 'code'
  | 'table';

export interface Block {
  id: string;
  type: BlockType;
  data: BlockData;
  meta?: {
    hidden?: boolean;
    roles?: string[];
    className?: string;
  };
}

export interface TextBlockData {
  text: string;
  format: 'paragraph' | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'heading-5' | 'heading-6';
  align?: 'left' | 'center' | 'right';
}

export interface ImageBlockData {
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface GalleryBlockData {
  images: Array<{
    url: string;
    alt: string;
    caption?: string;
  }>;
  layout: 'grid' | 'masonry';
  columns?: 2 | 3 | 4;
}

export interface EmbedBlockData {
  url: string;
  type: 'youtube' | 'wistia' | 'apple-podcast' | 'spotify' | 'oembed';
  title?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  autoplay?: boolean;
}

export interface SeparatorBlockData {
  style: 'line' | 'dots' | 'wave';
  spacing: 'small' | 'medium' | 'large';
  color?: string;
}

export interface CalloutBlockData {
  type: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  content: string;
  icon?: string;
  backgroundColor?: string;
}

export interface PullquoteBlockData {
  quote: string;
  citation?: string;
  style: 'default' | 'modern' | 'minimal';
}

export interface HiddenBlockData {
  content: string;
  roles: string[];
  previewEnabled?: boolean;
}

export interface CodeBlockData {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  highlightedLines?: number[];
}

export interface TableBlockData {
  rows: string[][];
  header?: boolean;
  striped?: boolean;
  bordered?: boolean;
}

export type BlockData = 
  | TextBlockData 
  | ImageBlockData 
  | GalleryBlockData
  | EmbedBlockData
  | SeparatorBlockData
  | CalloutBlockData
  | PullquoteBlockData
  | HiddenBlockData
  | CodeBlockData
  | TableBlockData;

export interface BlockTransformation {
  from: BlockType;
  to: BlockType;
  transform: (data: BlockData) => BlockData;
}

export interface BlockValidation {
  validate: (data: BlockData) => string | null;
}