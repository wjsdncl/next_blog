import { type PublishStatus } from "./blogType";

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
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  techStacks: TechStack[];
  links: PortfolioLink[];
}

export type PortfolioListItem = Omit<Portfolio, "content" | "links" | "updated_at">;

export interface PortfolioRequest {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  start_date?: string;
  end_date?: string;
  status?: PublishStatus;
  order?: number;
  category_id?: string;
  tag_ids?: string[];
  tech_stack_ids?: string[];
  links?: Array<{
    type: string;
    url: string;
    label?: string;
    order?: number;
  }>;
}
