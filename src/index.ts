import * as cheerio from 'cheerio';
import { Result, Serp, Sitelink, Thumbnail, ThumbnailGroup } from './models';
import { getDomain, getFirstMatch, getLinkType, getUrlFromQuery } from './utils';

export const GoogleSERP = (html: string): Serp => {
  const $ = cheerio.load(html, {
    normalizeWhitespace: true,
    xmlMode: true,
  });
  const serp: Serp = {
    currentPage: 1,
    keyword: '',
    organic: [],
    pagination: [],
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

  serp.currentPage = parseInt($('table#nav td.cur').text(), 10);
  getPagination(serp, $);
  getVideos(serp, $);
  getThumbnails(serp, $);

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
};

const parseGoogleNojs = (serp: Serp, $: CheerioStatic) => {
  serp.keyword = $('#sbhost').val();
  getResults(serp, $('#resultStats').text());

  serp.currentPage = parseInt($('table#nav td:not(.b) > b').text(), 10);
  getPagination(serp, $);

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

const getPagination = (serp: Serp, $: CheerioStatic) => {
  const pagination = $('table#nav');
  serp.pagination.push({
    page: serp.currentPage,
    path: '',
  });
  pagination.find('td:not(.b) a').each((index, element) => {
    serp.pagination.push({
      page: parseInt($(element).text(), 10),
      path: $(element).prop('href'),
    });
  });
};

const getVideos = (serp: Serp, $: CheerioStatic) => {
  const videosCards = $('g-scrolling-carousel .BFJZOc g-inner-card');
  if (videosCards.text()) {
    // maybe change this to videosCards.length > 0 ?
    serp.videos = [];
  }
  videosCards.each((index, element) => {
    const title = $(element)
      .find('div[role="heading"]')
      .text();
    const sitelink = $(element)
      .find('a')
      .attr('href');
    const source = $(element)
      .find('.zECGdd:not(.RgAZAc) .cJzOGc')
      .text();
    const date = new Date(
      $(element)
        .find('.zECGdd:not(.RgAZAc)')
        .text(),
    );
    const channel = $(element)
      .find('.zECGdd.RgAZAc')
      .text();
    const videoDuration = $(element)
      .find('.k8B8Pc')
      .text();
    const videoCard = {
      channel,
      date,
      sitelink,
      source,
      title,
      videoDuration,
    };
    if (serp.videos) {
      serp.videos.push(videoCard);
    }
  });
};

const getThumbnails = (serp: Serp, $: CheerioStatic) => {
  const relatedGroup = $('#bres .xpdopen');
  if (relatedGroup.length > 0) {
    serp.thumbnailGroups = [];
  }
  relatedGroup.each((index, element) => {
    const heading = $(element)
      .find('[role="heading"]')
      .text();
    const thumbnailGroup: ThumbnailGroup = {
      heading,
      thumbnails: [],
    };
    const relatedThumbnail = $(element).find('.zVvuGd > div');
    relatedThumbnail.each((ind, el) => {
      const title = $(el)
        .find('.fl')
        .text();
      const sitelink = $(el)
        .find('a')
        .attr('href');
      const thumbnail: Thumbnail = {
        sitelink,
        title,
      };
      thumbnailGroup.thumbnails.push(thumbnail);
    });
    if (serp.thumbnailGroups) {
      serp.thumbnailGroups.push(thumbnailGroup);
    }
  });
};
