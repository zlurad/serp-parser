import { LinkType } from './models';

export const getDomain = (url: string, base?: string): string => {
  const href = new URL(url, base);
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

export const getLinkType = (url: string, base?: string) => {
  const href = new URL(url, base);
  return href.pathname !== '/' ? LinkType.landing : LinkType.home;
};

export const getTotalResults = (text: string) => {
  const resultsRegex = /[\d,]+(?= results)/g;
  const resultsMatched: string = getFirstMatch(text, resultsRegex).replace(/,/g, '');
  return resultsMatched !== '' ? parseInt(resultsMatched, 10) : undefined;
};

export const getTimeTaken = (text: string) => {
  const timeRegex = /[\d.]+(?= seconds)/g;
  const timeMatched: string = getFirstMatch(text, timeRegex);
  return timeMatched !== '' ? parseFloat(timeMatched) : undefined;
};
