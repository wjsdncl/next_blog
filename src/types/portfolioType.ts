import { type PublishStatus, type Category, type Tag } from "./blogType";

export interface PortfolioLink {
  id: string;
  type: string;
  url: string;
  label: string | null;
  order: number;
}

export interface TechStack {
  id: string;
  name: string;
  category: string | null;
}

export interface Portfolio {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  start_date: string | null;
  end_date: string | null;
  status: PublishStatus;
  view_count: number;
  order: number;
  category_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags: Tag[];
  techStacks: TechStack[];
  links: PortfolioLink[];
}

export interface PortfolioRequest {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  start_date?: string;
  end_date?: string;
  status?: PublishStatus;
  tech_stack_ids?: string[];
  links?: Array<{
    type: string;
    url: string;
    label?: string;
  }>;
}
