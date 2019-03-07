import { LinkType } from './models';

export const getDomain = (url: string): string => {
  const href = new URL(url);
  return href.hostname;
};

export const getUrlFromQuery = (query: string): string => {
  const searchParams = new URLSearchParams(query.replace('/url?', ''));
  // if there is no q parameter, url is related to google search and we will return it in full
  return searchParams.get('q') || 'https://google.com' + query;
};

export const getFirstMatch = (str: string, reg: RegExp) => {
  const matches = str.match(reg);
  return matches ? matches[0] : '';
};

export const getLinkType = (url: string) => {
  const href = new URL(url);
  return href.pathname !== '/' ? LinkType.landing : LinkType.home;
};
