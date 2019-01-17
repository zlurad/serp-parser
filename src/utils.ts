export const getDomain = (url: string): string => {
  const href = new URL(url);
  return href.hostname;
};

export const getUrlFromQuery = (query: string): string => {
  const searchParams = new URLSearchParams(query.replace('/url?', ''));
  // if there is no q parameter, url is related to google search and we will return it in full
  return searchParams.get('q') || 'https://google.com' + query;
};
