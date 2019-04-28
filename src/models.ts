export interface Serp {
  keyword: string;
  organic: Result[];
  totalResults?: number;
  timeTaken?: number;
  currentPage: number;
  pagination: Pagination[];
  thumbnailGroups?: ThumbnailGroup[];
  relatedKeywords: RelatedKeyword[];
  videos?: VideoCard[];
  hotels?: Hotels;
  adwords?: { adwordsTop?: Ad[]; adwordsBottom?: Ad[] };
  availableOn?: AvailableOn[];
  shop?: ShopCard[];
}

export interface ShopCard {
  imgLink: string;
  title: string;
  price: number;
  currency: string;
  shoppingSite: string;
  description: ShopDescription;
}

export interface ShopDescription {
  specialOffer?: string;
  rating?: number;
  votes?: string;
  commodity?: string;
}

export interface Ad {
  title: string;
  url: string;
  domain: string;
  snippet: string;
  sitelinks: Sitelink[];
  position: number;
  linkType: LinkType;
}

export interface AvailableOn {
  service: string; 
  price: string; 
  url: string
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
  searchFilters?: HotelsSearchFilters;
  hotels: Hotel[];
  moreHotels: number | string;
}
export interface HotelsSearchFilters {
  searchTitle: string;
  checkIn: Date;
  checkOut: Date;
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
  currency?: string;
  price?: number;
  rating: number;
  votes: number;
  deal?: HotelDeal;
  amenities?: string;
  featuredReview?: string;
  // nojs features
  stars?: number;
  description?: string;
  moreInfoLink?: string;
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
  href: string;
  snippet?: string;
  type: SitelinkType;
}

export enum LinkType {
  landing = 'LANDING',
  home = 'HOME',
}

export enum SitelinkType {
  card = 'CARD',
  inline = 'INLINE',
}
