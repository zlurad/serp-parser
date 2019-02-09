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
  linkType: string;
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
