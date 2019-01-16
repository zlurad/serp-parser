import * as cheerio from 'cheerio';

export interface Sitelink {
  title: string;
  snippet?: string;
  type: string;
}

export interface Result {
  domain: string;
  position: number;
  sitelinks?: Sitelink[];
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
        const sitelinkSnippet = $(el)
          .find('.s .st')
          .text();
        const sitelink: Sitelink = {
          snippet: sitelinkSnippet,
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
      const domains = url.match(/[a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/g);
      const domain = domains[0];
      const title = $(element)
        .find('h3')
        .text();
      const snippet = $(element)
        .parent('.r')
        .next()
        .find('.st')
        .text();
      const result: Result = {
        domain,
        position,
        snippet,
        title,
        url,
      };
      if (sitelinks.length > 0) {
        result.sitelinks = sitelinks;
      }
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
      const inlineSitelinks = $(element)
        .closest('div.g')
        .find('.s .osl a');

      cardSitelinks.each((i, el) => {
        const sitelinkTitle = $(el)
          .find('h3 a.sla')
          .text();
        const sitelinkSnippet = $(el)
          .find('.s.st')
          .text();
        const sitelink: Sitelink = {
          snippet: sitelinkSnippet,
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

      const searchParams = new URLSearchParams(
        $(element)
          .prop('href')
          .replace('/url?', ''),
      );
       // if there is no q parameter, page is related to google search and we will return whole href for it
      const url = searchParams.get('q') || "https://google.com" + $(element).prop('href');
      const domains = url.match(/[a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/g) || [''];
      const domain = domains[0];
      const snippet = $(element)
        .parent('.r')
        .next()
        .find('.st')
        .text()
        .replace(/(&nbsp;)/g, ' ')
        .replace(/ +(?= )/g, '');


      const result: Result = {
        domain,
        position: index + 1,
        snippet,
        title,
        url,
      };
      if (sitelinks.length > 0) {
        result.sitelinks = sitelinks;
      }
      serp.organic.push(result);
    });
  }

  return serp;
};
