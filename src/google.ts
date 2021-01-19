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
  Local,
} from './models';
import * as utils from './utils';

export class GoogleSERP {
  public serp: Serp = {
    currentPage: 1,
    keyword: '',
    organic: [],
    pagination: [],
    relatedKeywords: [],
  };

  private $: CheerioStatic;

  constructor(html: string) {
    this.$ = cheerio.load(html, {
      normalizeWhitespace: true,
      xmlMode: true,
    });

    this.parse();
  }

  private parse() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      currentPage: 'table.AaVjTc td.YyVfkd',
      keyword: 'input[aria-label="Search"]',
      noResults: '.med.card-section p:contains(" - did not match any documents.")',
      resultText: '#result-stats',
    };
    if ($(CONFIG.noResults).length === 1) {
      this.serp.error = 'No results page';
      // No need to parse anything for no results page
      return;
    }

    if ($('body').hasClass('srp')) {
      serp.keyword = $(CONFIG.keyword).val();
      serp.totalResults = utils.getTotalResults($(CONFIG.resultText).text());
      serp.currentPage = parseInt($(CONFIG.currentPage).text(), 10);

      this.getOrganic();
      this.getRelatedKeywords();
      this.getPagination();
      this.getAdwords();
      this.getHotels();
      serp.timeTaken = utils.getTimeTaken($(CONFIG.resultText).text());
      this.getVideos();
      this.getThumbnails();
      // this.getAvailableOn();
      this.getShopResults();
      this.getTopStories();
      this.getLocals();
    }
  }

  private getOrganic() {
    const $ = this.$;
    const CONFIG = {
      results: '#search .g div .yuRUbf > a',
    };

    $(CONFIG.results).each((index, element) => {
      const position = index + 1;
      const url = $(element).prop('href');
      const domain = utils.getDomain(url);
      const title = this.elementText(element, 'h3');
      const snippet = this.getSnippet(element);
      const linkType = utils.getLinkType(url);
      const result: Result = {
        domain,
        linkType,
        position,
        snippet,
        title,
        url,
      };
      this.parseSitelinks(element, result);
      this.parseCachedAndSimilarUrls(element, result);
      this.serp.organic.push(result);
    });
  }

  private getSnippet(element: CheerioElement): string {
    const text = this.$(element).parent().next().text();
    return text;
  }

  private parseSitelinks(element: CheerioElement, result: Result) {
    const $ = this.$;
    const CONFIG = {
      cards: '.sld',
      closestCards: 'div.g',
      closestInline: '.rc',
      href: 'a',
      inline: '.St3GK a',
      snippet: '.st',
      title: 'h3 a',
    };
    const sitelinks: Sitelink[] = [];
    let type: SitelinkType;

    if ($(element).closest(CONFIG.closestCards).find(CONFIG.cards).length > 0) {
      type = SitelinkType.card;
    } else if ($(element).closest(CONFIG.closestInline).find(CONFIG.inline).length > 0) {
      type = SitelinkType.inline;
    } else {
      return;
    }

    const links = $(element)
      .closest(type === SitelinkType.card ? CONFIG.closestCards : CONFIG.closestInline)
      .find(type === SitelinkType.card ? CONFIG.cards : CONFIG.inline);
    links.each((i, el) => {
      const sitelink: Sitelink = {
        href: type === SitelinkType.card ? this.elementHref(el, CONFIG.href) : $(el).attr('href'),
        snippet: type === SitelinkType.card ? this.elementText(el, CONFIG.snippet) : undefined,
        title: type === SitelinkType.card ? this.elementText(el, CONFIG.title) : $(el).text(),
        type,
      };
      sitelinks.push(sitelink);
    });
    if (sitelinks.length > 0) {
      result.sitelinks = sitelinks;
    }
  }

  private getRelatedKeywords() {
    const relatedKeywords: RelatedKeyword[] = [];
    const query = 'p.nVcaUb a';
    this.$(query).each((i, elem) => {
      relatedKeywords.push({
        keyword: this.$(elem).text(),
        path: this.$(elem).prop('href'),
      });
    });
    this.serp.relatedKeywords = relatedKeywords;
  }

  private parseCachedAndSimilarUrls(element: CheerioElement, result: Result) {
    const $ = this.$;
    const CONFIG = {
      closest: '.yuRUbf',
      find: 'span ol > li.action-menu-item > a',
    };

    const urls = $(element).closest(CONFIG.closest).find(CONFIG.find);
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
  }

  private getPagination() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      pages: 'td:not(.b) a.fl',
      pagination: 'table.AaVjTc',
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
  }

  private getVideos() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      channel: '.zECGdd.RgAZAc',
      date: '.zECGdd:not(.RgAZAc)',
      sitelink: 'a',
      source: '.zECGdd:not(.RgAZAc) .cJzOGc',
      title: 'div[role="heading"]',
      videoDuration: '.Woharf.LQFTgb',
      videosCards: '.gT5me',
    };

    const videosCards = $(CONFIG.videosCards);
    if (videosCards.length === 0) {
      return;
    }
    const videos: VideoCard[] = [];
    videosCards.each((index, element) => {
      const videoCard = {
        channel: this.elementText(element, CONFIG.channel),
        date: new Date(this.elementText(element, CONFIG.date)),
        sitelink: this.elementHref(element, CONFIG.sitelink),
        source: this.elementText(element, CONFIG.source),
        title: this.elementText(element, CONFIG.title),
        videoDuration: this.elementText(element, CONFIG.videoDuration),
      };
      videos.push(videoCard);
    });
    serp.videos = videos;
  }

  private getThumbnails() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      heading: '.sV2QOc.Ss2Faf.zbA8Me.mfMhoc[role="heading"]',
      headingMore: '.sV2QOc.Ss2Faf.zbA8Me.mfMhoc[role="heading"] .VLkRKc',
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
      let heading = '';
      if ($(element).find(CONFIG.headingMore).length === 1) {
        heading = $(element).find(CONFIG.headingMore).text();
      } else {
        heading = $(element).find(CONFIG.heading).text();
      }
      // const heading = this.elementText(element, CONFIG.heading);
      const thumbnailGroup: ThumbnailGroup = {
        heading,
        thumbnails: [],
      };
      const relatedThumbnail = $(element).find(CONFIG.relatedThumbnail);
      relatedThumbnail.each((ind, el) => {
        thumbnailGroup.thumbnails.push({
          sitelink: this.elementHref(el, CONFIG.sitelink),
          title: this.elementText(el, CONFIG.title),
        });
      });
      thumbnailGroups.push(thumbnailGroup);
    });
    serp.thumbnailGroups = thumbnailGroups;
  }

  private getHotels() {
    const $ = this.$;
    const hotelsFeature = $('.zd2Jbb');
    if (!hotelsFeature.length) {
      return;
    }
    const CONFIG = {
      moreHotelsRegex: /(\d+,?)+/,
      moreHotelsText: '.wUrVib',
    };
    // FILTERS
    const searchFilters: HotelsSearchFilters = this.getHotelSearchFilters(hotelsFeature);

    // HOTELS (HOTEL CARDS)
    const hotels: Hotel[] = this.getHotelOffers(hotelsFeature);

    // MORE HOTELS

    // const moreHotelsText = hotelsFeature.find(CONFIG.moreHotelsText).text();
    const moreHotelsText = hotelsFeature.find(CONFIG.moreHotelsText).text();
    const moreHotels = parseInt(utils.getFirstMatch(moreHotelsText, CONFIG.moreHotelsRegex).replace(',', ''), 10);

    this.serp.hotels = {
      hotels,
      moreHotels,
      searchFilters,
    };
  }

  private getHotelSearchFilters(hotelsFeature: Cheerio): HotelsSearchFilters {
    const $ = this.$;
    const CONFIG = {
      activeFilter: '.CWGqFd',
      checkInString: '.vpggTd.ed5F6c span',
      checkOutString: '.vpggTd:not(.ed5F6c) span',
      filterGroupsTitles: '.d2IDkc',
      guests: '.viupMc',
      hotelFiltersSection: '.x3UtIe',
      searchTitle: '.gsmmde',
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
      const hotelFilters: HotelFilters = {
        explanation: $(el).next().text(),
        title: $(el).text(),
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
  }

  private getHotelOffers(hotelsFeature: Cheerio): Hotel[] {
    const $ = this.$;
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
      rating: 'g-review-stars span',
      ratingRegex: /\d\.\d/,
      votes: 'g-review-stars+span',
    };
    const hotels: Hotel[] = [];
    const hotelCards = hotelsFeature.find(CONFIG.hotelCards);
    hotelCards.each((ind, el) => {
      const name = this.elementText(el, CONFIG.name);
      const price = parseInt(utils.getFirstMatch(this.elementText(el, CONFIG.price), CONFIG.priceRegex), 10);
      const originalPrice = parseInt(
        utils.getFirstMatch(this.elementText(el, CONFIG.originalPrice), CONFIG.originalPriceRegex),
        10,
      );
      const currency = utils.getFirstMatch(this.elementText(el, CONFIG.currency), CONFIG.currencyRegex);
      const ratingString = $(el).find(CONFIG.rating).attr('aria-label');
      const rating = parseFloat(utils.getFirstMatch(ratingString, CONFIG.ratingRegex));
      const votes = parseInt(this.elementText(el, CONFIG.votes).slice(1, -1).replace(',', ''), 10); // Getting rid of parentheses with slice()
      // Make this better, maybe something instead of slice ?

      const dealType = this.elementText(el, CONFIG.dealType);
      const dealDetails = this.elementText(el, CONFIG.dealDetails);
      const amenities = this.elementText(el, CONFIG.amenities);
      const featuredReview = this.elementText(el, CONFIG.featuredReview).trim().slice(1, -1); // Getting rid of quotes with slice()
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
  }

  private getAdwords() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      bottom: '#tadsb',
      top: '#tads',
    };

    const adwords: { adwordsTop?: Ad[]; adwordsBottom?: Ad[] } = {};
    // TODO: refactor this
    if ($(CONFIG.top).length) {
      adwords.adwordsTop = [];
      this.getAds(CONFIG.top, adwords.adwordsTop);
    }
    if ($(CONFIG.bottom).length) {
      adwords.adwordsBottom = [];
      this.getAds(CONFIG.bottom, adwords.adwordsBottom);
    }
    serp.adwords = adwords.adwordsTop || adwords.adwordsBottom ? adwords : undefined;
  }

  private getAds(search: string, adsList: Ad[]) {
    const $ = this.$;
    const CONFIG = {
      ads: '.uEierd',
      snippet: '.d5oMvf',
      title: '[role="heading"]',
      url: 'a.Krnil',
    };

    $(search)
      .find(CONFIG.ads)
      .each((i, e) => {
        const title = this.elementText(e, CONFIG.title);
        const url = this.elementHref(e, CONFIG.url);
        const domain = utils.getDomain(url);
        const linkType = utils.getLinkType(url);
        const snippet = $(e).find(CONFIG.snippet).next().text();
        const sitelinks: Sitelink[] = this.getAdSitelinks(e);
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
  }

  private getAdSitelinks(ad: CheerioElement) {
    const $ = this.$;
    const CONFIG = {
      card: '.fCBnFe',
      cardHref: 'h3 a',
      cardSnippet: ':not(h3)',
      cardTitle: 'h3',
      inline: '.bOeY0b a',
      test: 'St0YAf',
    };

    const sitelinks: Sitelink[] = [];
    const cardSitelinks = $(ad).find(CONFIG.card);
    cardSitelinks.each((ind, e) => {
      const sitelink: Sitelink = {
        href: this.elementHref(e, CONFIG.cardHref),
        snippet: $(e).children(CONFIG.cardSnippet).text(),
        title: this.elementText(e, CONFIG.cardTitle),
        type: SitelinkType.card,
      };
      sitelinks.push(sitelink);
    });
    const inlineSiteLinks = $(ad).find(CONFIG.inline);
    inlineSiteLinks.each((i, e) => {
      const sitelink: Sitelink = {
        href: $(e).attr('href'),
        title: $(e).text(),
        type: SitelinkType.inline,
      };
      sitelinks.push(sitelink);
    });
    return sitelinks;
  }

  // Moved to knowledge graph
  private getAvailableOn() {
    const $ = this.$;
    const serp = this.serp;
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
        const service = this.elementText(e, CONFIG.service);
        const price = this.elementText(e, CONFIG.price);
        availableOn.push({ url, service, price });
      });
      serp.availableOn = availableOn;
    }
  }

  private getLocals() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      name: '.dbg0pd',
      rating: '.BTtC6e',
      reviews: '.rllt__details.lqhpac div:nth-child(1) span:nth-child(3)',
      reviewsRegex: /[0-9]+/,
      expensiveness: '.rllt__details.lqhpac div:nth-child(1) span:nth-child(4)',
      type: '.rllt__details.lqhpac div:nth-child(1)',
      typeRegex: /\w+\s\w+/,
      distance: '.rllt__details.lqhpac div:nth-child(2) > span:nth-child(1)',
      address: '.rllt__details.lqhpac div:nth-child(2) > span:nth-child(1)',
      description: 'div.rllt__wrapped > span',
      localsFeature: '.AEprdc.vk_c',
      local: '.C8TUKc',
    };

    const localsFeature = $(CONFIG.localsFeature);

    if (!localsFeature.length) {
      return;
    }

    const locals: Local[] = [];
    const local = localsFeature.find(CONFIG.local);
    local.each((ind, el) => {
      const name = this.elementText(el, CONFIG.name);
      const rating = this.elementText(el, CONFIG.rating);
      const reviews = utils.getFirstMatch($(el).find(CONFIG.reviews).text(), CONFIG.reviewsRegex);
      const expensiveness = this.elementText(el, CONFIG.expensiveness).length;
      const type = utils.getFirstMatch($(el).find(CONFIG.type).text(), CONFIG.typeRegex);
      const distance = '';
      const address = this.elementText(el, CONFIG.address);
      const description = '';
      locals.push({ name, rating, reviews, expensiveness, type, distance, address, description });
    });
    serp.locals = locals;
  }

  private getTopStories() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      published: '.K4LhXb',
      publisher: '.wqg8ad',
      title: 'div[role="heading"]',
      topStoriesFeature: 'g-section-with-header [data-hveid=CA0QAQ]',
      topStory: 'a[data-jsarwt="1"]',
    };
    const topStoriesFeature = $(CONFIG.topStoriesFeature);

    if (!topStoriesFeature.length) {
      return;
    }

    const topStories: TopStory[] = [];
    const topStory = topStoriesFeature.find(CONFIG.topStory);
    topStory.each((ind, el) => {
      const url = $(el).attr('href');
      const title = this.elementText(el, CONFIG.title);
      const publisher = this.elementText(el, CONFIG.publisher);
      const published = this.elementText(el, CONFIG.published);
      topStories.push({ url, title, publisher, published });
    });
    serp.topStories = topStories;
  }

  private getShopResults() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      commodity: '.cYBBsb',
      currency: '.e10twf',
      currencyRegex: /\D+/,
      imgLink: 'a.pla-unit-img-container-link',
      price: '.e10twf',
      priceRegex: /[\d,.]+/,
      ratingRegex: /\d\.\d/,
      ratingString: 'a > span > g-review-stars > span',
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
        const imgLink = this.elementHref(el, CONFIG.imgLink);
        const title = this.elementText(el, CONFIG.title);
        const price = parseFloat(
          utils.getFirstMatch(this.elementText(el, CONFIG.price), CONFIG.priceRegex).replace(/,/g, ''),
        );
        const currency = utils.getFirstMatch(this.elementText(el, CONFIG.currency), CONFIG.currencyRegex);
        const shoppingSite = this.elementText(el, CONFIG.shoppingSite);

        const shopResult: ShopResult = {
          currency,
          imgLink,
          price,
          shoppingSite,
          title,
        };
        const specialOffer = $(el).find(CONFIG.specialOffer).first().text();
        if (specialOffer) {
          shopResult.specialOffer = specialOffer;
        }
        const ratingString = $(el).find(CONFIG.ratingString).attr('aria-label');
        if (ratingString) {
          const rating = parseFloat(utils.getFirstMatch(ratingString, CONFIG.ratingRegex));
          shopResult.rating = rating;
        }
        const votes = this.elementText(el, CONFIG.votes).trim().slice(1, -1);
        if (votes) {
          shopResult.votes = votes;
        }
        const commodity = this.elementText(el, CONFIG.commodity);
        if (commodity) {
          shopResult.commodity = commodity;
        }
        shopResults.push(shopResult);
      });
      serp.shopResults = shopResults;
    }
  }

  // Helper methods
  private elementText(el: CheerioElement, query: string) {
    return this.$(el).find(query).text();
  }

  private elementHref(el: CheerioElement, query: string) {
    return this.$(el).find(query).attr('href');
  }
}
