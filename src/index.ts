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
import { getDomain, getFirstMatch, getLinkType, getTimeTaken, getTotalResults, getUrlFromQuery } from './utils';

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
  const CONFIG = {
    currentPage: 'table#nav td.cur',
    hotels: '.zd2Jbb',
    keyword: 'input[aria-label="Search"]',
    resultText: '#resultStats',
    results: '.rc .r > a',
  };

  serp.keyword = $(CONFIG.keyword).val();
  const resultText = $(CONFIG.resultText).text();
  serp.totalResults = getTotalResults(resultText);
  serp.timeTaken = getTimeTaken(resultText);

  serp.currentPage = parseInt($(CONFIG.currentPage).text(), 10);
  getPagination(serp, $);
  getRelatedKeywords(serp, $, false);
  getVideos(serp, $);
  getThumbnails(serp, $);
  getAdwords(serp, $, false);
  getAvailableOn(serp, $);

  const hotels = $(CONFIG.hotels);
  if (hotels.length > 0) {
    getHotels(serp, $, hotels, false);
  }

  $(CONFIG.results).each((index, element) => {
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
  const CONFIG = {
    currentPage: 'table#nav td:not(.b) > b',
    hotels: '.ksBKIe',
    keyword: '#sbhost',
    resultText: '#resultStats',
    results: '#ires ol .g .r a:not(.sla)',
  };

  serp.keyword = $(CONFIG.keyword).val();
  serp.totalResults = getTotalResults($(CONFIG.resultText).text());

  serp.currentPage = parseInt($(CONFIG.currentPage).text(), 10);
  getPagination(serp, $);
  getRelatedKeywords(serp, $, true);
  getAdwords(serp, $, true);

  const hotels = $(CONFIG.hotels);
  if (hotels.length > 0) {
    getHotels(serp, $, hotels, true);
  }

  $(CONFIG.results).each((index, element) => {
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
  const CONFIG = {
    closest: 'div.g',
    find: '.sld',
    href: 'a',
    snippet: '.st',
    title: 'h3 a',
  };

  const cardSitelinks = $(element)
    .closest(CONFIG.closest)
    .find(CONFIG.find);
  cardSitelinks.each((i, el) => {
    const title = $(el)
      .find(CONFIG.title)
      .text();
    const href = $(el)
      .find(CONFIG.href)
      .attr('href');
    const snippet = $(el)
      .find(CONFIG.snippet)
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
  const CONFIG = {
    closest: nojs ? 'div.g' : '.rc',
    find: '.s .osl a',
  };

  const inlineSitelinks = $(element)
    .closest(CONFIG.closest)
    .find(CONFIG.find);
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
  const CONFIG = {
    closest: nojs ? '.g' : '.r',
    find: nojs ? 'cite + .Pj9hGd ul .mUpfKd > a' : 'span ol > li.action-menu-item > a',
  };

  const urls = $(element)
    .closest(CONFIG.closest)
    .find(CONFIG.find);
  urls.each((i, el) => {
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

const getPagination = (serp: Serp, $: CheerioStatic) => {
  const CONFIG = {
    pages: 'td:not(.b) a',
    pagination: 'table#nav',
  };

  const pagination = $(CONFIG.pagination);
  serp.pagination.push({
    page: serp.currentPage,
    path: '',
  });
  pagination.find(CONFIG.pages).each((index, element) => {
    serp.pagination.push({
      page: parseInt($(element).text(), 10),
      path: $(element).prop('href'),
    });
  });
};

const getVideos = (serp: Serp, $: CheerioStatic) => {
  const CONFIG = {
    channel: '.zECGdd.RgAZAc',
    date: '.zECGdd:not(.RgAZAc)',
    sitelink: 'a',
    source: '.zECGdd:not(.RgAZAc) .cJzOGc',
    title: 'div[role="heading"]',
    videoDuration: '.k8B8Pc',
    videosCards: 'g-scrolling-carousel .BFJZOc g-inner-card',
  };

  const videosCards = $(CONFIG.videosCards);
  if (videosCards.text()) {
    // maybe change this to videosCards.length > 0 ?
    serp.videos = [];
  }
  videosCards.each((index, element) => {
    const title = $(element)
      .find(CONFIG.title)
      .text();
    const sitelink = $(element)
      .find(CONFIG.sitelink)
      .attr('href');
    const source = $(element)
      .find(CONFIG.source)
      .text();
    const date = new Date(
      $(element)
        .find(CONFIG.date)
        .text(),
    );
    const channel = $(element)
      .find(CONFIG.channel)
      .text();
    const videoDuration = $(element)
      .find(CONFIG.videoDuration)
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
  const CONFIG = {
    bottom: nojs ? '#D7Sjmd' : '#tadsb',
    top: nojs ? '#KsHht' : '#tads',
  };

  const adwords: { adwordsTop?: Ad[]; adwordsBottom?: Ad[] } = {};
  if ($(CONFIG.top).length) {
    adwords.adwordsTop = [];
    getAds($, CONFIG.top, adwords.adwordsTop, nojs);
  }
  if ($(CONFIG.bottom).length) {
    adwords.adwordsBottom = [];
    getAds($, CONFIG.bottom, adwords.adwordsBottom, nojs);
  }
  serp.adwords = adwords.adwordsTop || adwords.adwordsBottom ? adwords : undefined;
};

const getAds = ($: CheerioStatic, search: string, adsList: Ad[], nojs: boolean) => {
  const CONFIG = {
    ads: '.ads-ad',
    snippet: '.ads-creative',
    title: nojs ? 'h3.ellip' : 'h3.sA5rQ',
    url: nojs ? 'h3.ellip a' : '.ad_cclk a.V0MxL',
  };

  $(search)
    .find(CONFIG.ads)
    .each((i, e) => {
      const title = $(e)
        .find(CONFIG.title)
        .text();
      const url = $(e)
        .find(CONFIG.url)
        .attr('href');
      const domain = getDomain(url);
      const linkType = getLinkType(url);
      const snippet = $(e)
        .find(CONFIG.snippet)
        .text();
      const sitelinks: Sitelink[] = getAdSitelinks($, e, nojs);
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

const getAdSitelinks = ($: CheerioStatic, ad: CheerioElement, nojs: boolean) => {
  const CONFIG = {
    card: nojs ? 'td' : 'li',
    cardHref: 'h3 a',
    cardSnippet: nojs ? 'h3 + div' : '.F95vTc',
    cardTitle: 'h3',
    inline: nojs ? 'a' : '.OkkX2d .V0MxL',
    sitelinks: nojs ? '.ads-creative + div' : '.ads-creative + ul',
    test: nojs ? 'DGdP9' : 'St0YAf',
  };

  const sitelinks: Sitelink[] = [];
  const adSitelinks = $(ad).find(CONFIG.sitelinks);
  adSitelinks.each((ind, el) => {
    if ($(el).hasClass(CONFIG.test)) {
      const cardSiteLinks = $(el).find(CONFIG.card);
      cardSiteLinks.each((i, e) => {
        const href = $(e)
          .find(CONFIG.cardHref)
          .attr('href');
        const title = $(e)
          .find(CONFIG.cardTitle)
          .text();
        const snippet = $(e)
          .find(CONFIG.cardSnippet)
          .text();
        const sitelink: Sitelink = {
          href,
          snippet,
          title,
          type: SitelinkType.card,
        };
        sitelinks.push(sitelink);
      });
    } else {
      const inlineSiteLinks = $(el).find(CONFIG.inline);
      inlineSiteLinks.each((i, e) => {
        const href = $(e).attr('href');
        const title = $(e).text();
        const sitelink: Sitelink = {
          href,
          title,
          type: SitelinkType.inline,
        };
        sitelinks.push(sitelink);
      });
    }
  });
  return sitelinks;
};

const getAvailableOn = (serp: Serp, $: CheerioStatic) => {
  const CONFIG = {
    price: '.V8xno span',
    query: 'a.JkUS4b',
    service: '.i3LlFf',
  };

  const list = $(CONFIG.query);
  const availableOn: AvailableOn[] = [];
  if (list.length) {
    list.each((i, e) => {
      const url = $(e).attr('href');
      const service = $(e)
        .find(CONFIG.service)
        .text();
      const price = $(e)
        .find(CONFIG.price)
        .text();
      availableOn.push({ url, service, price });
    });
    serp.availableOn = availableOn;
  }
};
