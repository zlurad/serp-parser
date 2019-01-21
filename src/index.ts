import * as cheerio from 'cheerio';
import { Result, Serp, Sitelink } from './models';
import { getDomain, getUrlFromQuery } from './utils';

export const GoogleSERP = (html: string): Serp => {
  const $ = cheerio.load(html, {
    normalizeWhitespace: true,
    xmlMode: true,
  });
  const serp: Serp = {
    keyword: '',
    organic: [],
  };

  if ($('body').hasClass('srp')) {
    parseGoogle(serp, $);
  } else if ($('body').hasClass('hsrp')) {
    parseGoogleNojs(serp, $);
  }

  return serp;
};

const parseGoogle = (serp: Serp, $: CheerioStatic) => {
  serp.keyword = $('input[aria-label="Search"]').val();

  $('.rc .r > a').each((index, element) => {
    const position = index + 1;
    const url = $(element).prop('href');
    const domain = getDomain(url);
    const title = $(element)
      .find('h3')
      .text();
    const snippet = getSnippet($, element);
    const result: Result = {
      domain,
      position,
      snippet,
      title,
      url,
    };
    parseSitelinks($, element, result, false);
    parseCachedAndSimilarUrls($, element, result, false);
    serp.organic.push(result);
  });
};

const parseGoogleNojs = (serp: Serp, $: CheerioStatic) => {
  serp.keyword = $('#sbhost').val();

  $('#ires ol .g .r a:not(.sla)').each((index, element) => {
    const position = index + 1;
    const url = getUrlFromQuery($(element).prop('href'));
    const domain = getDomain(url);
    const title = $(element).text(); // maybe use regex to eliminate whitespace instead of options param in cheerio.load
    const snippet = getSnippet($, element)
      .replace(/(&nbsp;)/g, ' ')
      .replace(/ +(?= )/g, '');
    const result: Result = {
      domain,
      position,
      snippet,
      title,
      url,
    };
    parseSitelinks($, element, result, true);
    parseCachedAndSimilarUrls($, element, result, true);
    serp.organic.push(result);
  });
};

const getSnippet = ($: CheerioStatic, element: CheerioElement): string => {
  return $(element)
    .parent('.r')
    .next()
    .find('.st')
    .text();
};

const parseSitelinks = ($: CheerioStatic, element: CheerioElement, result: Result, nojs: boolean) => {
  const sitelinks: Sitelink[] = [];
  parseGoogleCardSitelinks($, element, sitelinks);
  parseGoogleInlineSitelinks($, element, sitelinks, nojs);
  if (sitelinks.length > 0) {
    result.sitelinks = sitelinks;
  }
};

const parseGoogleCardSitelinks = ($: CheerioStatic, element: CheerioElement, sitelinks: Sitelink[]) => {
  const cardSitelinks = $(element)
    .closest('div.g')
    .find('.sld');
  cardSitelinks.each((i, el) => {
    const title = $(el)
      .find('h3 a')
      .text();
    const snippet = $(el)
      .find('.st')
      .text();
    const sitelink: Sitelink = {
      snippet,
      title,
      type: 'card',
    };
    sitelinks.push(sitelink);
  });
};

const parseGoogleInlineSitelinks = (
  $: CheerioStatic,
  element: CheerioElement,
  sitelinks: Sitelink[],
  nojs: boolean,
) => {
  const inlineSitelinks = $(element)
    .closest(nojs ? 'div.g' : '.rc')
    .find('.s .osl a');
  inlineSitelinks.each((i, el) => {
    const title = $(el).text();
    const sitelink: Sitelink = {
      title,
      type: 'inline',
    };
    sitelinks.push(sitelink);
  });
};

const parseCachedAndSimilarUrls = ($: CheerioStatic, element: CheerioElement, result: Result, nojs: boolean) => {
  let cachedUrl = '';
  let similarUrl = '';
  $(element)
    .closest(nojs ? '.g' : '.r')
    .find(nojs ? 'cite + .Pj9hGd ul .mUpfKd > a' : 'span ol > li.action-menu-item > a')
    .each((i, el) => {
      if ($(el).text() === 'Cached') {
        cachedUrl = $(el).prop('href');
      } else if ($(el).text() === 'Similar') {
        similarUrl = $(el).prop('href');
      }
    });
  if (cachedUrl !== '') {
    result.cachedUrl = cachedUrl;
  }
  if (similarUrl !== '') {
    result.similarUrl = similarUrl;
  }
};
