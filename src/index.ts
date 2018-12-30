import * as cheerio from 'cheerio';

export interface Result {
  position: number;
  url: string;
}

export const GoogleSERP = (html: string) => {
  const $ = cheerio.load(html);
  const results: Result[] = [];

  $('.rc .r > a').each((index, element) => {
    const result: Result = {
      position: index + 1,
      url: $(element).prop('href'),
    };

    results.push(result);
  });

  return results;
};
