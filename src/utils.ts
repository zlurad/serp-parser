export const getDomain = (url: string): string => {
  const domains = url.match(/[a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/g);
  return domains ? domains[0].toLowerCase() : '';
};

export const getUrlFromQuery = (query: string): string => {
  const searchParams = new URLSearchParams(
    query.replace('/url?', ''),
  );
  // if there is no q parameter, url is related to google search and we will return it in full
  return searchParams.get('q') || 'https://google.com' + query;
}
