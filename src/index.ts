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
  ShopResult,
  Sitelink,
  SitelinkType,
  Thumbnail,
  ThumbnailGroup,
  TopStory,
  VideoCard,
} from './models';
import * as utils from './utils';

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
    results: '.bkWMgd > .g > h2 + div .rc > .r > a,.bkWMgd > h2 + div .rc > .r > a',
  };

  serp.keyword = $(CONFIG.keyword).val();
  const resultText = $(CONFIG.resultText).text();
  serp.totalResults = utils.getTotalResults(resultText);
  serp.timeTaken = utils.getTimeTaken(resultText);

  serp.currentPage = parseInt($(CONFIG.currentPage).text(), 10);
  getPagination(serp, $);
  getRelatedKeywords(serp, $, false);
  getVideos(serp, $);
  getThumbnails(serp, $);
  getAdwords(serp, $, false);
  getAvailableOn(serp, $);
  getShopResults(serp, $);

  const topStoriesFeature = $('g-section-with-header[data-hveid=CAEQAA]');
  if (topStoriesFeature.length) {
    getTopStories(serp, $, topStoriesFeature);
  }

  const hotels = $(CONFIG.hotels);
  if (hotels.length > 0) {
    getHotels(serp, $, hotels, false);
  }

  $(CONFIG.results).each((index, element) => {
    const position = index + 1;
    const url = $(element).prop('href');
    const domain = utils.getDomain(url);
    const title = $(element)
      .find('h3')
      .text();
    const snippet = getSnippet($, element);
    const linkType = utils.getLinkType(url);
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
  serp.totalResults = utils.getTotalResults($(CONFIG.resultText).text());

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
    const url = utils.getUrlFromQuery($(element).prop('href'));
    const domain = utils.getDomain(url);
    const title = $(element).text(); // maybe use regex to eliminate whitespace instead of options param in cheerio.load
    const snippet = getSnippet($, element)
      .replace(/(&nbsp;)/g, ' ')
      .replace(/ +(?= )/g, '');
    const linkType = utils.getLinkType(url);
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
    videoDuration: '.Woharf.LQFTgb',
    videosCards: 'g-scrolling-carousel .BFJZOc g-inner-card',
  };

  const videosCards = $(CONFIG.videosCards);
  if (videosCards.length === 0) {
    return;
  }
  const videos: VideoCard[] = [];
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
    videos.push(videoCard);
  });
  serp.videos = videos;
};

const getThumbnails = (serp: Serp, $: CheerioStatic) => {
  const CONFIG = {
    heading: '[role="heading"] .VLkRKc',
    relatedGroup: '#bres .xpdopen',
    relatedThumbnail: '.zVvuGd > div',
    sitelink: 'a',
    title: '.fl',
  };
  const relatedGroup = $(CONFIG.relatedGroup);
  if (relatedGroup.length === 0) {
    return;
  }
  const thumbnailGroups: ThumbnailGroup[] = [];
  relatedGroup.each((index, element) => {
    const heading = $(element)
      .find(CONFIG.heading)
      .text();
    const thumbnailGroup: ThumbnailGroup = {
      heading,
      thumbnails: [],
    };
    const relatedThumbnail = $(element).find(CONFIG.relatedThumbnail);
    relatedThumbnail.each((ind, el) => {
      const title = $(el)
        .find(CONFIG.title)
        .text();
      const sitelink = $(el)
        .find(CONFIG.sitelink)
        .attr('href');
      const thumbnail: Thumbnail = {
        sitelink,
        title,
      };
      thumbnailGroup.thumbnails.push(thumbnail);
    });
    thumbnailGroups.push(thumbnailGroup);
  });
  serp.thumbnailGroups = thumbnailGroups;
};

const getHotels = (serp: Serp, $: CheerioStatic, hotelsFeature: Cheerio, nojs: boolean) => {
  // SPLIT TO getHotels and getHotelsNojs
  // SPLIT FURTHER TO getSearchFilters, getHotelOffers

  if (nojs) {
    const CONFIG = {
      amenities: '.LPMtqb > div:last-child:not(.RHsRSe)',
      description: '.kR1eme',
      featuredReview: '.X0w5lc',
      hotelOffers: '.IvtMPc',
      hotelStars: '.kR1eme',
      hotelStarsRegex: /\d(?=-star)/,
      moreHotelsLink: 'a.elzrQ',
      moreInfoLink: '.hc8x7b a',
      name: '.kR1eme',
      rating: '.BTtC6e',
      votes: '.kR1eme',
      votesRegex: /\((\d+,?)+\)/,
    };
    const moreHotelsLink = hotelsFeature.find(CONFIG.moreHotelsLink).attr('href');
    const hotels: Hotel[] = [];

    // HOTELS
    const hotelOffers = hotelsFeature.find(CONFIG.hotelOffers);
    hotelOffers.each((ind, elem) => {
      const name = $(elem)
        .find(CONFIG.name)
        .text();
      const rating = parseFloat(
        $(elem)
          .find(CONFIG.rating)
          .text(),
      );
      const votes = utils
        .getFirstMatch(
          $(elem)
            .find(CONFIG.votes)
            .next()
            .text(),
          CONFIG.votesRegex,
        )
        .slice(1, -1)
        .replace(',', '');
      const votesNumber = parseInt(votes, 10);
      const hotelStars = utils.getFirstMatch(
        $(elem)
          .find(CONFIG.hotelStars)
          .next()
          .text(),
        CONFIG.hotelStarsRegex,
      );
      const stars = parseInt(hotelStars, 10);
      const description = $(elem)
        .find(CONFIG.description)
        .next()
        .next()
        .text();
      const amenities = $(elem)
        .find(CONFIG.amenities)
        .text();
      const featuredReview = $(elem)
        .find(CONFIG.featuredReview)
        .text()
        .trim()
        .slice(1, -1); // Getting rid of quotes with slice()
      // Make this better, maybe something instead of slice ?;
      const moreInfoLink = $(elem)
        .find(CONFIG.moreInfoLink)
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
    const CONFIG = {
      moreHotelsRegex: /(\d+,?)+/,
      moreHotelsText: '.LPOxmb',
    };
    // FILTERS
    const searchFilters: HotelsSearchFilters = getHotelSearchFilters($, hotelsFeature);

    // HOTELS (HOTEL CARDS)
    const hotels: Hotel[] = getHotelOffers($, hotelsFeature);

    // MORE HOTELS

    const moreHotelsText = hotelsFeature.find(CONFIG.moreHotelsText).text();
    const moreHotels = parseInt(utils.getFirstMatch(moreHotelsText, CONFIG.moreHotelsRegex).replace(',', ''), 10);

    serp.hotels = {
      hotels,
      moreHotels,
      searchFilters,
    };
  }
};

const getHotelSearchFilters = ($: CheerioStatic, hotelsFeature: Cheerio): HotelsSearchFilters => {
  const CONFIG = {
    activeFilter: '.CWGqFd',
    checkInString: '.vpggTd.ed5F6c span',
    checkOutString: '.vpggTd:not(.ed5F6c) span',
    filterGroupsTitles: '.d2IDkc',
    guests: '.viupMc',
    hotelFiltersSection: '.x3UtIe',
    searchTitle: '.BQ5Rcc',
  };
  const hotelFiltersSection = hotelsFeature.find(CONFIG.hotelFiltersSection);
  const searchTitle = hotelFiltersSection.find(CONFIG.searchTitle).text();
  const checkInString = `${hotelFiltersSection.find(CONFIG.checkInString).text()} ${new Date().getFullYear()}`;
  const checkIn = new Date(checkInString);
  const checkOutString = `${hotelFiltersSection.find(CONFIG.checkOutString).text()} ${new Date().getFullYear()}`;
  const checkOut = new Date(checkOutString);
  const guests = parseInt(hotelFiltersSection.find(CONFIG.guests).text(), 10);

  const filters: HotelFilters[] = [];

  const filterGroupsTitles = hotelFiltersSection.find(CONFIG.filterGroupsTitles);
  filterGroupsTitles.each((ind, el) => {
    const title = $(el).text();
    const explanation = $(el)
      .next()
      .text();
    const hotelFilters: HotelFilters = {
      explanation,
      title,
    };
    if ($(el).closest(CONFIG.activeFilter).length) {
      hotelFilters.isActive = true;
    }
    filters.push(hotelFilters);
  });

  return {
    checkIn,
    checkOut,
    filters,
    guests,
    searchTitle,
  };
};

const getHotelOffers = ($: CheerioStatic, hotelsFeature: Cheerio): Hotel[] => {
  const CONFIG = {
    amenities: '.I9B2He',
    currency: '.dv1Q3e',
    currencyRegex: /\D+/,
    dealDetails: '.kOTJue.jj25pf',
    dealType: '.NNPnSe',
    featuredReview: '.DabgJ .gisIHb',
    hotelCards: '.ntKMYc .hmHBZd',
    name: '.BTPx6e',
    originalPrice: '.AfCRQd',
    originalPriceRegex: /\d+/,
    price: '.dv1Q3e',
    priceRegex: /\d+/,
    rating: '.fTKmHE99XE4__star',
    ratingRegex: /\d\.\d/,
    votes: 'g-review-stars+span',
  };
  const hotels: Hotel[] = [];
  const hotelCards = hotelsFeature.find(CONFIG.hotelCards);
  hotelCards.each((ind, el) => {
    const name = $(el)
      .find(CONFIG.name)
      .text();
    const price = parseInt(
      utils.getFirstMatch(
        $(el)
          .find(CONFIG.price)
          .text(),
        CONFIG.priceRegex,
      ),
      10,
    );
    const originalPrice = parseInt(
      utils.getFirstMatch(
        $(el)
          .find(CONFIG.originalPrice)
          .text(),
        CONFIG.originalPriceRegex,
      ),
      10,
    );
    const currency = utils.getFirstMatch(
      $(el)
        .find(CONFIG.currency)
        .text(),
      CONFIG.currencyRegex,
    );
    const ratingString = $(el)
      .find(CONFIG.rating)
      .attr('aria-label');
    const rating = parseFloat(utils.getFirstMatch(ratingString, CONFIG.ratingRegex));
    const votes = parseInt(
      $(el)
        .find(CONFIG.votes)
        .text()
        .slice(1, -1)
        .replace(',', ''),
      10,
    ); // Getting rid of parentheses with slice()
    // Make this better, maybe something instead of slice ?

    const dealType = $(el)
      .find(CONFIG.dealType)
      .text();
    const dealDetails = $(el)
      .find(CONFIG.dealDetails)
      .text();
    const amenities = $(el)
      .find(CONFIG.amenities)
      .text();
    const featuredReview = $(el)
      .find(CONFIG.featuredReview)
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

  return hotels;
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
      const domain = utils.getDomain(url, 'https://www.googleadservices.com/pagead');
      const linkType = utils.getLinkType(url, 'https://www.googleadservices.com/pagead');
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

const getTopStories = (serp: Serp, $: CheerioStatic, topStoriesFeature: Cheerio) => {
  const CONFIG = {
    imgLink: 'g-inner-card.cv2VAd > a',
    published: '.GJhQm > span.f',
    publisher: '.YQPQv',
    title: '.mRnBbe',
    topStory: '.So9e7d',
  };

  const topStories: TopStory[] = [];
  const topStory = topStoriesFeature.find(CONFIG.topStory);
  topStory.each((ind, el) => {
    const imgLink = $(el)
      .find(CONFIG.imgLink)
      .attr('href');
    const title = $(el)
      .find(CONFIG.title)
      .text();
    const publisher = $(el)
      .find(CONFIG.publisher)
      .text();
    const published = $(el)
      .find(CONFIG.published)
      .text();
    topStories.push({ imgLink, title, publisher, published });
  });
  serp.topStories = topStories;
};

const getShopResults = (serp: Serp, $: CheerioStatic) => {
  const CONFIG = {
    commodity: '.cYBBsb',
    currency: '.e10twf',
    currencyRegex: /\D+/,
    imgLink: 'a.pla-unit-img-container-link',
    price: '.e10twf',
    priceRegex: /[\d,.]+/,
    ratingRegex: /\d\.\d/,
    ratingString: 'a > g-review-stars > span',
    shopFeature: '.top-pla-group-inner',
    shopOffer: '.pla-unit:not(.view-all-unit)',
    shoppingSite: '.LbUacb',
    specialOffer: '.gyXcee',
    title: 'a > .pymv4e',
    votes: '.nbd1Bd .QhqGkb.RnJeZd',
  };
  const shopFeature = $(CONFIG.shopFeature);
  if (shopFeature.length) {
    const shopResults: ShopResult[] = [];
    const shopOffer = shopFeature.find(CONFIG.shopOffer);
    shopOffer.each((ind, el) => {
      const imgLink = $(el)
        .find(CONFIG.imgLink)
        .attr('href');
      const title = $(el)
        .find(CONFIG.title)
        .text();
      const price = parseFloat(
        utils
          .getFirstMatch(
            $(el)
              .find(CONFIG.price)
              .text(),
            CONFIG.priceRegex,
          )
          .replace(/,/g, ''),
      );
      const currency = utils.getFirstMatch(
        $(el)
          .find(CONFIG.currency)
          .text(),
        CONFIG.currencyRegex,
      );
      const shoppingSite = $(el)
        .find(CONFIG.shoppingSite)
        .text();

      const shopResult: ShopResult = {
        currency,
        imgLink,
        price,
        shoppingSite,
        title,
      };
      const specialOffer = $(el)
        .find(CONFIG.specialOffer)
        .first()
        .text();
      if (specialOffer) {
        shopResult.specialOffer = specialOffer;
      }
      const ratingString = $(el)
        .find(CONFIG.ratingString)
        .attr('aria-label');
      if (ratingString) {
        const rating = parseFloat(utils.getFirstMatch(ratingString, CONFIG.ratingRegex));
        shopResult.rating = rating;
      }
      const votes = $(el)
        .find(CONFIG.votes)
        .text()
        .trim()
        .slice(1, -1);
      if (votes) {
        shopResult.votes = votes;
      }
      const commodity = $(el)
        .find(CONFIG.commodity)
        .text();
      if (commodity) {
        shopResult.commodity = commodity;
      }
      shopResults.push(shopResult);
    });
    serp.shopResults = shopResults;
  }
};
