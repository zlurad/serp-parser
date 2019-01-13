import * as cheerio from 'cheerio';

export interface Sitelink {
  title: string;
  snippet?: string;
  type: string;
}

export interface Result {
  position: number;
  sitelinks: Sitelink[];
  url: string;
  title: string;
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
      const sitelinks: Sitelink[] = [];

      const cardSitelinks = $(element)
        .closest('div.g')
        .find('.sld.vsc');

      const inlineSitelinks = $(element)
        .closest('.rc')
        .find('.s .osl a.fl');

      cardSitelinks.each((i, el) => {
        const sitelinkTitle = $(el)
          .find('h3 a.l')
          .text();
        const snippet = $(el)
          .find('.s .st')
          .text();
        const sitelink: Sitelink = {
          snippet,
          title: sitelinkTitle,
          type: 'card',
        };
        sitelinks.push(sitelink);
      });

      inlineSitelinks.each((i, el) => {
        const sitelinkTitle = $(el).text();
        const sitelink: Sitelink = {
          title: sitelinkTitle,
          type: 'inline',
        };
        sitelinks.push(sitelink);
      });

      const url = $(element).prop('href');
      const title = $(element)
        .find('h3')
        .text();
      const result: Result = {
        position,
        sitelinks,
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
      const sitelinks: Sitelink[] = [];

      const cardSitelinks = $(element)
        .closest('div.g')
        .find('.sld');
      cardSitelinks.each((i, el) => {
        const sitelinkTitle = $(el)
          .find('h3 a.sla')
          .text();
        const snippet = $(el)
          .find('.s.st')
          .text();
        const sitelink: Sitelink = {
          snippet,
          title: sitelinkTitle,
          type: 'card',
        };
        sitelinks.push(sitelink);
      });

      const searchParams = new URLSearchParams(
        $(element)
          .prop('href')
          .replace('/url?', ''),
      );

      const result: Result = {
        position: index + 1,
        // if there is no q parameter, page is related to google search and we will return whole href for it
        sitelinks,
        title,
        url: searchParams.get('q') || $(element).prop('href'),
      };

      serp.organic.push(result);
    });
  }

  return serp;
};
