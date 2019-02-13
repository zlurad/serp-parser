export interface Serp {
  keyword: string;
  organic: Result[];
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

export interface Sitelink {
  title: string;
  snippet?: string;
  type: string;
}

export enum LinkType {
  landing = 'LANDING',
  home = 'HOME'
}
