export interface MenuItem {
  id: string;
  label: string;
  url: string;
  type: 'custom' | 'page' | 'category';
  parentId?: string | null;
  order: number;
  target?: '_blank' | '_self';
  icon?: string;
  children?: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  location: string;
  items: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}