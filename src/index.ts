import * as cheerio from 'cheerio';
import {
  Ad,
  AvailableOn,
  Hotel,
  HotelDeal,
  HotelFilters,
  HotelsSearchFilters,
  RelatedKeyword,
  Result,
  Serp,
  Sitelink,
  SitelinkType,
  Thumbnail,
  ThumbnailGroup,
} from './models';
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
    relatedKeywords: [],
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
  getRelatedKeywords(serp, $, false);
  getVideos(serp, $);
  getThumbnails(serp, $);
  getAdwords(serp, $, false);
  getAvailableOn(serp, $);

  const hotels = $('.zd2Jbb');
  if (hotels.length > 0) {
    getHotels(serp, $, hotels, false);
  }

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
  getRelatedKeywords(serp, $, true);
  getAdwords(serp, $, true);

  const hotels = $('.ksBKIe');
  if (hotels.length > 0) {
    getHotels(serp, $, hotels, true);
  }

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

const getRelatedKeywords = (serp: Serp, $: CheerioStatic, nojs: boolean) => {
  const relatedKeywords: RelatedKeyword[] = [];
  const query = nojs ? 'p.aw5cc a' : 'p.nVcaUb a';
  $(query).each((i, elem) => {
    relatedKeywords.push({
      keyword: $(elem).text(),
      path: $(elem).prop('href'),
    });
  });

  serp.relatedKeywords = relatedKeywords;
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
    const href = $(el).find('a').attr('href');
    const snippet = $(el)
      .find('.st')
      .text();
    const sitelink: Sitelink = {
      href,
      snippet,
      title,
      type: SitelinkType.card,
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
    const href = $(el).attr('href');
    const sitelink: Sitelink = {
      href,
      title,
      type: SitelinkType.inline,
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

const getHotels = (serp: Serp, $: CheerioStatic, hotelsFeature: Cheerio, nojs: boolean) => {
  if (nojs) {
    const moreHotelsLink = hotelsFeature.find('a.elzrQ').attr('href');
    const hotels: Hotel[] = [];

    // HOTELS
    const hotelOffers = hotelsFeature.find('.IvtMPc');
    hotelOffers.each((ind, elem) => {
      const name = $(elem)
        .find('.kR1eme')
        .text();
      const rating = parseFloat(
        $(elem)
          .find('.BTtC6e')
          .text(),
      );
      const votes = getFirstMatch(
        $(elem)
          .find('.BTtC6e')
          .closest('div')
          .text(),
        /\((\d+,?)+\)/,
      )
        .slice(1, -1)
        .replace(',', '');
      const votesNumber = parseInt(votes, 10);
      const hotelStars = getFirstMatch(
        $(elem)
          .find('.BTtC6e')
          .closest('div')
          .text(),
        /\d(?=-star)/,
      );
      const stars = parseInt(hotelStars, 10);
      const description = $(elem)
        .find('.BTtC6e')
        .closest('div')
        .next()
        .text();
      const amenities = $(elem)
        .find('.BTtC6e')
        .closest('div')
        .next()
        .next(':not(.RHsRSe)')
        .text();
      const featuredReview = $(elem)
        .find('.X0w5lc')
        .text()
        .trim()
        .slice(1, -1); // Getting rid of quotes with slice()
      // Make this better, maybe something instead of slice ?;
      const moreInfoLink = $(elem)
        .find('.hc8x7b a')
        .attr('href');

      const hotel: Hotel = {
        description,
        moreInfoLink,
        name,
        rating,
        stars,
        votes: votesNumber,
      };

      if (amenities) {
        hotel.amenities = amenities;
      }
      if (featuredReview) {
        hotel.featuredReview = featuredReview;
      }

      hotels.push(hotel);
    });

    serp.hotels = {
      hotels,
      moreHotels: moreHotelsLink,
    };
  } else {
    // FILTERS

    const hotelFiltersSection = hotelsFeature.find('.x3UtIe');
    const searchTitle = hotelFiltersSection.find('.BQ5Rcc').text();
    const checkInString = `${hotelFiltersSection.find('.vpggTd.ed5F6c span').text()} ${new Date().getFullYear()}`;
    const checkIn = new Date(checkInString);
    const checkOutString = `${hotelFiltersSection
      .find('.vpggTd:not(.ed5F6c) span')
      .text()} ${new Date().getFullYear()}`;
    const checkOut = new Date(checkOutString);
    const guests = parseInt(hotelFiltersSection.find('.viupMc').text(), 10);

    const filters: HotelFilters[] = [];

    const filterGroupsTitles = hotelFiltersSection.find('g-scrolling-carousel .bcgA2 .nu5Zhf .rD7YBd');
    filterGroupsTitles.each((ind, el) => {
      const title = $(el).text();
      const explanation = $(el)
        .next()
        .text();
      const hotelFilters: HotelFilters = {
        explanation,
        title,
      };
      if (
        $(el)
          .closest('.nu5Zhf')
          .hasClass('XlJ6Xb')
      ) {
        hotelFilters.isActive = true;
      }
      filters.push(hotelFilters);
    });

    const searchFilters: HotelsSearchFilters = {
      checkIn,
      checkOut,
      filters,
      guests,
      searchTitle,
    };

    // HOTELS (HOTEL CARDS)

    const hotelCards = hotelsFeature.find('.ntKMYc .hmHBZd');
    const hotels: Hotel[] = [];

    hotelCards.each((ind, el) => {
      const name = $(el)
        .find('.BTPx6e')
        .text();
      const price = parseInt(
        getFirstMatch(
          $(el)
            .find('.dv1Q3e')
            .text(),
          /\d+/,
        ),
        10,
      );
      const originalPrice = parseInt(
        getFirstMatch(
          $(el)
            .find('.AfCRQd')
            .text(),
          /\d+/,
        ),
        10,
      );
      const currency = getFirstMatch(
        $(el)
          .find('.dv1Q3e')
          .text(),
        /[^0-9]+/,
      );
      const ratingString = $(el)
        .find('.fTKmHE99XE4__star')
        .attr('aria-label');
      const rating = parseFloat(getFirstMatch(ratingString, /\d\.\d/));
      const votes = parseInt(
        $(el)
          .find('g-review-stars+span')
          .text()
          .slice(1, -1)
          .replace(',', ''),
        10,
      ); // Getting rid of parentheses with slice()
      // Make this better, maybe something instead of slice ?

      const additionalInfo = $(el).find('.DabgJ');
      const dealType = additionalInfo.find('.NNPnSe').text();
      const dealDetails = additionalInfo.find('.kOTJue').text();
      const amenities = additionalInfo.find('.AaNHwc').text();
      const featuredReview = additionalInfo
        .find('.gisIHb')
        .text()
        .trim()
        .slice(1, -1); // Getting rid of quotes with slice()
      // Make this better, maybe something instead of slice ?

      const hotelDeal: HotelDeal = {
        dealType,
      };

      if (dealDetails) {
        hotelDeal.dealDetails = dealDetails;
      }
      if (originalPrice) {
        hotelDeal.originalPrice = originalPrice;
      }

      const hotel: Hotel = {
        currency,
        name,
        price,
        rating,
        votes,
      };

      if (dealType) {
        hotel.deal = hotelDeal;
      }

      if (amenities) {
        hotel.amenities = amenities;
      }
      if (featuredReview) {
        hotel.featuredReview = featuredReview;
      }

      hotels.push(hotel);
    });

    // MORE HOTELS

    const moreHotelsText = hotelsFeature.find('.MWjNvc').text();
    const moreHotels = parseInt(getFirstMatch(moreHotelsText, /(\d+,?)+/).replace(',', ''), 10);

    serp.hotels = {
      hotels,
      moreHotels,
      searchFilters,
    };
  }
};

const getAdwords = (serp: Serp, $: CheerioStatic, nojs: boolean) => {
  const adwordsTop = $('#tads');
  const adwordsBottom = $('#tadsb');
  const adwordsNojsTop = $('#KsHht');
  const adwordsNojsBottom = $('#D7Sjmd');
  const getAds = (ads: Cheerio, adsList: Ad[]) => {
    ads.each((i, e) => {
      const title = $(e)
        .find(nojs ? 'h3.ellip' : 'h3.sA5rQ')
        .text();
      const url = $(e)
        .find(nojs ? 'h3.ellip a' : '.ad_cclk a.V0MxL')
        .attr('href');
      const domain = getDomain(url);
      const linkType = getLinkType(url);
      const snippet = $(e)
        .find('.ads-creative')
        .text();
      const sitelinks: Sitelink[] = [];
      const adSitelinks = $(e).find(nojs ? '.ads-creative + div' : '.ads-creative + ul');
      adSitelinks.each((ind, el) => {
        if ($(el).hasClass(nojs ? 'DGdP9' : 'St0YAf')) {
          const cardSiteLinks = $(el).find(nojs ? 'td' : 'li');
          cardSiteLinks.each((index, element) => {
            const sitelinkTitle = $(element)
              .find('h3')
              .text();
            const sitelinkSnippet = $(element)
              .find(nojs ? 'h3 + div' : '.F95vTc')
              .text();
            const sitelink: Sitelink = {
              snippet: sitelinkSnippet,
              title: sitelinkTitle,
              type: SitelinkType.card,
            };
            sitelinks.push(sitelink);
          });
        } else {
          const inlineSiteLinks = $(el).find(nojs ? 'a' : '.OkkX2d .V0MxL');
          inlineSiteLinks.each((index, element) => {
            const sitelinkTitle = $(element).text();
            const sitelink: Sitelink = {
              title: sitelinkTitle,
              type: SitelinkType.inline,
            };
            sitelinks.push(sitelink);
          });
        }
      });
      const position = i + 1;
      const ad: Ad = {
        domain,
        linkType,
        position,
        sitelinks,
        snippet,
        title,
        url,
      };
      adsList.push(ad);
    });
  };
  if (adwordsTop.length || adwordsBottom.length || adwordsNojsTop.length || adwordsNojsBottom.length) {
    serp.adwords = {};
    if (adwordsTop.length || adwordsNojsTop.length) {
      serp.adwords.adwordsTop = [];
      const adsTop = nojs ? adwordsNojsTop.find('.ads-ad') : adwordsTop.find('.ads-ad');
      getAds(adsTop, serp.adwords.adwordsTop);
    }
    if (adwordsBottom.length || adwordsNojsBottom.length) {
      serp.adwords.adwordsBottom = [];
      const adsBottom = nojs ? adwordsNojsBottom.find('.ads-ad') : adwordsBottom.find('.ads-ad');
      getAds(adsBottom, serp.adwords.adwordsBottom);
    }
  }
};

const getAvailableOn = (serp: Serp, $: CheerioStatic) => {
  const list = $('a.JkUS4b');
  const availableOn: AvailableOn[] = [];
  if(list.length){
    list.each((i, e) => {
      const url = $(e).attr('href');
      const service = $(e).find('.i3LlFf').text();
      const price = $(e).find('.V8xno span').text();
      availableOn.push({url, service, price});
    });
    serp.availableOn = availableOn;
  }
};
