export interface Serp {
  keyword: string;
  organic: Result[];
  totalResults?: number;
  timeTaken?: number;
  currentPage: number;
  pagination: Pagination[];
  thumbnailGroups?: ThumbnailGroup[];
  relatedKeywords: RelatedKeyword[];
  videos?: VideoCard[],
  hotels?: Hotels
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

export interface RelatedKeyword {
  keyword: string;
  path: string;
}

export interface ThumbnailGroup {
  heading: string;
  thumbnails: Thumbnail[];
}
export interface Thumbnail {
  title: string;
  sitelink: string;
}

export interface Hotels {
  searchFilters: HotelsSearchFilters;
  hotels: Hotel[];
  moreHotels: number;
}
export interface HotelsSearchFilters {
  searchTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  filters: HotelFilters[];
}

export interface HotelFilters {
  title: string;
  explanation: string;
  isActive?: boolean;
}

export interface Hotel {
  name: string;
  currency: string;
  price: number;
  rating: number;
  votes: number;
  deal?: HotelDeal;
  amenities?: string;
  featuredReview?: string;
}

export interface HotelDeal {
  dealType: string;
  dealDetails?: string;
  originalPrice?: number;
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
