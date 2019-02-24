import * as cheerio from 'cheerio';
import { Result, Serp, Sitelink, Related, Pagination, PageLink } from './models';
import { getDomain, getFirstMatch, getLinkType, getUrlFromQuery } from './utils';

export const GoogleSERP = (html: string): Serp => {
  const $ = cheerio.load(html, {
    normalizeWhitespace: true,
    xmlMode: true,
  });
  const serp: Serp = {
    keyword: '',
    organic: [],
    related: [],
    pagination: []
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
  const resultText = $('#resultStats').text();
  getResults(serp, resultText);
  getTime(serp, resultText);

  $('.rc .r > a').each((index, element) => {
    const position = index + 1;
    const url = $(element).prop('href');
    const domain = getDomain(url);
    const title = $(element)
      .find('h3')
      .text();
    const snippet = getSnippet($, element);
    const linkType = getLinkType(url);
    const result: Result = {
      domain,
      linkType,
      position,
      snippet,
      title,
      url,
    };
    parseSitelinks($, element, result, false);
    parseCachedAndSimilarUrls($, element, result, false);
    serp.organic.push(result);
  });
  serp.related  = parseRelatedKeywords($, serp, false)
  serp.pagination = parsePagination($, serp, false)
};

const parseGoogleNojs = (serp: Serp, $: CheerioStatic) => {
  serp.keyword = $('#sbhost').val();
  getResults(serp, $('#resultStats').text());

  $('#ires ol .g .r a:not(.sla)').each((index, element) => {
    const position = index + 1;
    const url = getUrlFromQuery($(element).prop('href'));
    const domain = getDomain(url);
    const title = $(element).text(); // maybe use regex to eliminate whitespace instead of options param in cheerio.load
    const snippet = getSnippet($, element)
      .replace(/(&nbsp;)/g, ' ')
      .replace(/ +(?= )/g, '');
    const linkType = getLinkType(url);
    const result: Result = {
      domain,
      linkType,
      position,
      snippet,
      title,
      url,
    };
    parseSitelinks($, element, result, true);
    parseCachedAndSimilarUrls($, element, result, true);
    serp.organic.push(result);
  });
  serp.related  = parseRelatedKeywords($, serp, true)
  serp.pagination = parsePagination($, serp, true)

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

const  parsePagination = ($: CheerioStatic, serp: Serp, nojs: boolean) => {
  var pagination:any = {};
  var pageslinks:any = [];
  var paginationSitelinks;
  if(nojs){
    var currentPage = Number($('table#nav > tr > td:not(.b) > b').text());
    var nextPage    = $('table#nav  > tr > td').last().find('a').attr('href');
    paginationSitelinks = $('div#foot > table#nav > tr');
    paginationSitelinks.each(function (i, el) {
        var td = $(el).find('td:not(.b)');
        td.each(function (i, el) {
          let data: any = {};
          data.pageNo = Number($(el).text())
          data.pageLink   = $(el).find('a').attr('href') ? $(el).find('a').attr('href') : false;
          if(currentPage != data.pageNo){
            pageslinks.push(data)
          }
        });
    });
    pagination.currentPage = currentPage;
    pagination.nextPage   = nextPage;

  } else {
    var currentPage = Number($('table#nav > tr > td:not(.b) > b').text());
    var nextPage    = $('table#nav  > tr > td').last().find('a').attr('href');
    paginationSitelinks = $('table#nav > tr');
    paginationSitelinks.each(function (i, el) {
        var td = $(el).find('td:not(.cur)');
        td.each(function (i, el) {
          let data: any = {};
          data.pageNo = Number($(el).text())
          data.pageLink   = $(el).find('a').attr('href') ? $(el).find('a').attr('href') : false;
          if(currentPage != data.pageNo){
            pageslinks.push(data)
          }
        });
    });
    pagination.currentPage = currentPage;
    pagination.nextPage   = nextPage;
  }

  pagination.pages = pageslinks;

  return pagination;

};

const  parseRelatedKeywords = ($: CheerioStatic, serp: Serp, nojs: boolean) => {
  var index:number = 0;
  var relatedlinks:any = [];
  var relatedSitelinks;
  if(nojs){
    relatedSitelinks = $('#center_col > div > table > tr');
    relatedSitelinks.each(function (i, el) {
        var td = $(el).find('td');
        td.each(function (i, el) {
          let data: Related = {};
          index++
          data.position = index;
          data.keyword = $(el).find('p').text();
          data.link    = $(el).find('p').find('a').attr('href');
          relatedlinks.push(data)

        });
    });
  } else {
    relatedSitelinks = $('#brs > g-section-with-header > div.card-section');
    relatedSitelinks.each(function (i, el) {
        var p = $(el).find('p');
        p.each(function (i, el) {
          let data: Related = {};
          index++
          data.position = index;
          data.keyword = $(el).text();
          data.link    = $(el).find('a').attr('href');
          relatedlinks.push(data)
        });
    });
  }
  return relatedlinks
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
  $(element)
    .closest(nojs ? '.g' : '.r')
    .find(nojs ? 'cite + .Pj9hGd ul .mUpfKd > a' : 'span ol > li.action-menu-item > a')
    .each((i, el) => {
      switch ($(el).text()) {
        case 'Cached':
          result.cachedUrl = $(el).prop('href');
          break;
        case 'Similar':
          result.similarUrl = $(el).prop('href');
          break;
      }
    });
};

const getResults = (serp: Serp, text: string) => {
  const resultsRegex = /[\d,]+(?= results)/g;
  const resultsMatched: string = getFirstMatch(text, resultsRegex).replace(/,/g, '');
  if (resultsMatched !== '') {
    serp.totalResults = parseInt(resultsMatched, 10);
  }
};

const getTime = (serp: Serp, text: string) => {
  const timeRegex = /[\d.]+(?= seconds)/g;
  const timeMatched: string = getFirstMatch(text, timeRegex);
  if (timeMatched !== '') {
    serp.timeTaken = parseFloat(timeMatched);
  }
};
