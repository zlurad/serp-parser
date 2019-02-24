export interface Serp {
  keyword: string;
  organic: Result[];
  related?: Related[];
  pagination?: Pagination[];
  totalResults?: number;
  timeTaken?: number;
}

export interface Result {
  domain: string;
  cachedUrl?: string;
  similarUrl?: string;
  position: number;
  linkType: LinkType;
  sitelinks?: Sitelink[];
  snippet: string;
  title: string;
  url: string;
}
export interface  Pagination {
  currentPage: number;
  pages: PageLink[];
}

export interface Related {
  position?: number;
  keyword?: string;
  link?: string;
}

export interface PageLink {
  pageNo: number;
  pageLink: string;
}

export interface Sitelink {
  title: string;
  snippet?: string;
  type: string;
}

export enum LinkType {
  landing = 'LANDING',
  home = 'HOME'
}
