import * as cheerio from 'cheerio';

export interface Result {
  position: number;
  snippet: string;
  title: string;
  url: string;
}

export interface Serp {
  keyword: string;
  organic: Result[];
}

export const GoogleSERP = (html: string): Serp => {
  const $ = cheerio.load(html, {
    normalizeWhitespace: true, // all whitespace should be replaced with single spaces
    xmlMode: true, // normalizeWhitespace seems to only work with this prop set to true
  });
  const serp: Serp = {
    keyword: '',
    organic: [],
  };

  // normal serp page have .srp class on body
  if ($('body').hasClass('srp')) {
    serp.keyword = $('input[aria-label="Search"]').val();
    $('.rc .r > a').each((index, element) => {
      const position = index + 1;
      const url = $(element).prop('href');
      const title = $(element)
        .find('h3')
        .text();
      const snippet = $(element)
        .parent('.r')
        .next()
        .find('.st')
        .text();
      const result: Result = {
        position,
        snippet,
        title,
        url,
      };
      serp.organic.push(result);
    });
  } else if ($('body').hasClass('hsrp')) {
    // nojs google html
    serp.keyword = $('#sbhost').val();
    $('#ires ol .g .r a:not(.sla)').each((index, element) => {
      const title = $(element).text(); // maybe use regex to eliminate whitespace instead of options param in cheerio.load
      const searchParams = new URLSearchParams(
        $(element)
          .prop('href')
          .replace('/url?', ''),
      );
      const snippet = $(element)
        .parent('.r')
        .next()
        .find('.st')
        .text()
        .replace(/(&nbsp;)/g, ' ')
        .replace(/ +(?= )/g, '');

      const result: Result = {
        position: index + 1,
        snippet,
        title,
        // if there is no q parameter, page is related to google search and we will return whole href for it
        url: searchParams.get('q') || $(element).prop('href'),
      };

      serp.organic.push(result);
    });
  }

  return serp;
};
