export interface Serp {
  keyword: string;
  organic: Result[];
  totalResults?: number;
  timeTaken?: number;
  currentPage: number;
  pagination: Pagination[];
  videos?: VideoCard[];
  thumbnailGroups?: ThumbnailGroup[];
}

export interface Pagination {
  page: number;
  path: string;
}

export interface VideoCard {
  title: string;
  sitelink: string;
  date: Date;
  source: string;
  channel: string;
  videoDuration: string;
}

export interface ThumbnailGroup {
  heading: string;
  thumbnails: Thumbnail[];
}
export interface Thumbnail {
  title: string;
  sitelink: string;
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

export interface Sitelink {
  title: string;
  snippet?: string;
  type: string;
}

export enum LinkType {
  landing = 'LANDING',
  home = 'HOME',
}
