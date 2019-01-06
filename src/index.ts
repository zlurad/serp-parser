import * as cheerio from 'cheerio';

export interface Result {
  position: number;
  url: string;
}

export const GoogleSERP = (html: string) => {
  const $ = cheerio.load(html);
  const results: Result[] = [];

  if ($('body').hasClass('srp')) {
    $('.rc .r > a').each((index, element) => {
      const result: Result = {
        position: index + 1,
        url: $(element).prop('href'),
      };

      results.push(result);
    });
  } else if ($('body').hasClass('hsrp')) {
    // nojs google html
    $('#ires ol .g .r a:not(.sla)').each((index, element) => {
      const searchParams = new URLSearchParams(
        $(element)
          .prop('href')
          .replace('/url?', ''),
      );

      const result: Result = {
        position: index + 1,
        // if there is no q parameter, page is related to google search and we will return whole href for it
        url: searchParams.get('q') || $(element).prop('href'),
      };

      results.push(result);
    });
  }

  return results;
};
