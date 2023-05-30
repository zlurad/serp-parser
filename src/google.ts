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
  ThumbnailGroup,
  TopStory,
  VideoCard,
  Local,
  TrailersAndClipsItem,
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

  private $;

  #DEF_OPTIONS = {
    organic: true,
    related: true,
    pagination: true,
    ads: true,
    hotels: true,
    videos: true,
    trailersAndClips: true,
    thumbnails: true,
    shop: true,
    stories: true,
    locals: true,
  };

  constructor(html: string, options?: Record<string, boolean>) {
    this.$ = cheerio.load(html, {
      normalizeWhitespace: true,
      xmlMode: false,
    });

    this.parse(options);
  }

  private parse(opt?: Record<string, boolean>) {
    const $ = this.$;
    const serp = this.serp;
    const options = opt ? opt : this.#DEF_OPTIONS;
    const CONFIG = {
      currentPage: 'table.AaVjTc td.YyVfkd',
      keyword: 'textarea[aria-label="Search"]',
      noResults: "#topstuff .card-section p:contains(' - did not match any documents.')",
      resultText: '#result-stats',
    };
    if ($(CONFIG.noResults).length === 1) {
      this.serp.error = 'No results page';
      // No need to parse anything for no results page
      return;
    }

    if ($('body').hasClass('srp')) {
      serp.keyword = $(CONFIG.keyword).val() as string;
      serp.totalResults = utils.getTotalResults($(CONFIG.resultText).text());
      serp.timeTaken = utils.getTimeTaken($(CONFIG.resultText).text());
      serp.currentPage = parseInt($(CONFIG.currentPage).text(), 10);

      if (options.organic) {
        this.getFeatured();
        this.getOrganic();
      }
      if (options.related) {
        this.getRelatedKeywords();
      }
      if (options.pagination) {
        this.getPagination();
      }
      if (options.ads) {
        this.getAdwords();
      }
      if (options.hotels) {
        this.getHotels();
      }
      if (options.videos) {
        this.getVideos();
      }
      if (options.trailersAndClips) {
        this.getTrailersAndClips();
      }
      // if (options.thumbnails) {
      //   this.getThumbnails();
      // }
      if (options.shop) {
        this.getShopResults();
      }
      if (options.stories) {
        this.getTopStories();
      }
      if (options.locals) {
        this.getLocals();
      }

      // this.getAvailableOn();
    }
  }

  private getOrganic() {
    const $ = this.$;
    const CONFIG = {
      results:
        `#search #rso > .g div .yuRUbf > a,
         #search #rso > .g.tF2Cxc .yuRUbf > a,
         #search #rso > .hlcw0c div .yuRUbf > a,
         #search #rso .kp-wholepage .g div .yuRUbf > a,
         #search #rso > div .g.jNVrwc.Y4pkMc div .yuRUbf > a,
         .yuRUbf > a`,
    };

    $(CONFIG.results).each((index, element) => {
      const featuredResultId = '#Odp5De';
      const featuredResultElement = $(element).closest(featuredResultId);
      // only get organic results that are not featured
      if (featuredResultElement.length === 0) {
        const position = this.serp.organic.length + 1;
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
      }
    });
  }

  private getFeatured() {
    const $ = this.$;
    const CONFIG = {
      results: '#Odp5De block-component div.yuRUbf > a',
    };
    $(CONFIG.results).each((index, element) => {
      const position = this.serp.organic.length + 1;
      const url = $(element).prop('href');
      const domain = utils.getDomain(url);
      const title = this.elementText(element, 'h3');
      const snippet = this.$(element).closest('.g').prev().text();
      const linkType = utils.getLinkType(url);
      const featured = true;

      const result: Result = {
        domain,
        linkType,
        position,
        snippet,
        title,
        url,
        featured,
      };
      this.serp.organic.push(result);
    });
  }

  private getSnippet(element: cheerio.Element | cheerio.Node): string {
    const text = this.$(element).parent().parent().next().text();
    return text;
  }

  private parseSitelinks(element: cheerio.Element | cheerio.Node, result: Result) {
    const $ = this.$;
    const CONFIG = {
      cards: '.usJj9c',
      closestCards: 'div.g',
      closestInline: '.tF2Cxc',
      href: 'a',
      inline: '.HiHjCd a',
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
        href: type === SitelinkType.card ? this.elementHref(el, CONFIG.href) : ($(el).attr('href') as string),
        snippet: type === SitelinkType.card ? this.elementText(el, CONFIG.snippet) : undefined,
        title:
          type === SitelinkType.card ? this.elementText(el, CONFIG.title) : $(el).text().replace(/\s+/g, ' ').trim(),
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
    const query = '.k8XOCe';
    this.$(query).each((i, elem) => {
      relatedKeywords.push({
        keyword: this.$(elem).text(),
        path: this.$(elem).prop('href'),
      });
    });
    this.serp.relatedKeywords = relatedKeywords;
  }

  private parseCachedAndSimilarUrls(element: cheerio.Element | cheerio.Node, result: Result) {
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
    if (pagination.length !== 0) {
      serp.pagination.push({
        page: serp.currentPage || 1,
        path: '',
      });
      pagination.find(CONFIG.pages).each((index, element) => {
        serp.pagination.push({
          page: parseInt($(element).text(), 10),
          path: $(element).prop('href'),
        });
      });
    }
  }

  private getTrailersAndClips() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      channel: '.pcJO7e span:not([aria-hidden="true"])',
      date: '.hMJ0yc span',
      sitelink: 'a',
      source: '.pcJO7e cite',
      title: '.cHaqb',
      videoDuration: '.J1mWY',
      trailersAndClipsItem: '.RzdJxc',
    };

    const trailersAndClipsItems = $(CONFIG.trailersAndClipsItem);
    if (trailersAndClipsItems.length === 0) {
      return;
    }
    const trailersAndClips: TrailersAndClipsItem[] = [];
    trailersAndClipsItems.each((index, element) => {
      const trailersAndClipsItem = {
        channel: this.elementText(element, CONFIG.channel).substr(3),
        date: new Date(this.elementText(element, CONFIG.date)),
        sitelink: this.elementHref(element, CONFIG.sitelink),
        source: this.elementText(element, CONFIG.source),
        title: this.elementText(element, CONFIG.title),
        videoDuration: this.elementText(element, CONFIG.videoDuration),
      };
      trailersAndClips.push(trailersAndClipsItem);
    });
    serp.trailersAndClips = trailersAndClips;
  }

  private getVideos() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      channel: '.pcJO7e span',
      date: '.hMJ0yc span',
      sitelink: 'a',
      source: '.pcJO7e cite',
      title: '.fc9yUc.oz3cqf.p5AXld',
      videoDuration: '.J1mWY',
      videosCards: '.RzdJxc',
    };

    const videosCards = $(CONFIG.videosCards);
    if (videosCards.length === 0) {
      return;
    }
    const videos: VideoCard[] = [];
    videosCards.each((index, element) => {
      const videoCard = {
        channel: this.elementText(element, CONFIG.channel).substr(3),
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

  // private getThumbnails() {
  //   const $ = this.$;
  //   const serp = this.serp;
  //   const CONFIG = {
  //     heading: '.sV2QOc.Ss2Faf.zbA8Me.mfMhoc[role="heading"]',
  //     headingMore: '.sV2QOc.Ss2Faf.zbA8Me.mfMhoc[role="heading"] .VLkRKc',
  //     relatedGroup: '#bres .xpdopen',
  //     relatedThumbnail: '.zVvuGd > div',
  //     sitelink: 'a',
  //     title: '.fl',
  //   };
  //   const relatedGroup = $(CONFIG.relatedGroup);
  //   if (relatedGroup.length === 0) {
  //     return;
  //   }
  //   const thumbnailGroups: ThumbnailGroup[] = [];
  //   relatedGroup.each((index, element) => {
  //     let heading = '';
  //     if ($(element).find(CONFIG.headingMore).length === 1) {
  //       heading = $(element).find(CONFIG.headingMore).text();
  //     } else {
  //       heading = $(element).find(CONFIG.heading).text();
  //     }
  //     // const heading = this.elementText(element, CONFIG.heading);
  //     const thumbnailGroup: ThumbnailGroup = {
  //       heading,
  //       thumbnails: [],
  //     };
  //     const relatedThumbnail = $(element).find(CONFIG.relatedThumbnail);
  //     relatedThumbnail.each((ind, el) => {
  //       thumbnailGroup.thumbnails.push({
  //         sitelink: this.elementHref(el, CONFIG.sitelink),
  //         title: this.elementText(el, CONFIG.title),
  //       });
  //     });
  //     thumbnailGroups.push(thumbnailGroup);
  //   });
  //   serp.thumbnailGroups = thumbnailGroups;
  // }

  private getHotels() {
    const $ = this.$;
    const hotelsFeature = $('.MaKSie');
    if (!hotelsFeature.length) {
      return;
    }
    const CONFIG = {
      moreHotelsRegex: /(\d+,?)+/,
      moreHotelsText: '.Z4Cazf.OSrXXb',
    };
    // FILTERS
    const searchFilters: HotelsSearchFilters = this.getHotelSearchFilters(hotelsFeature);

    // SEARCH TITLE
    const searchTitle: string = this.getSearchTitle(hotelsFeature);

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
      searchTitle
    };
  }

  private getSearchTitle(hotelsFeature: cheerio.Cheerio<cheerio.Element>): string {
    const $ = this.$;
    const searchTitleSelector = '.CKe2Rd';
    const searchTitleText = hotelsFeature.find(searchTitleSelector).text();
    return searchTitleText;
  }

  private getHotelSearchFilters(hotelsFeature: cheerio.Cheerio<cheerio.Element>): HotelsSearchFilters {
    const $ = this.$;
    const CONFIG = {
      activeFilter: '[aria-pressed="true"]',
      checkInString: '.vpggTd.ed5F6c span',
      checkOutString: '.vpggTd:not(.ed5F6c) span',
      filterGroupsTitles: '.niO4u.VDgVie.SlP8xc.IeFz4e',
      guests: '.viupMc',
      hotelFiltersSection: '.uR9mR',
    };
    const hotelFiltersSection = hotelsFeature.find(CONFIG.hotelFiltersSection);
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
    };
  }

  private getHotelOffers(hotelsFeature: cheerio.Cheerio<cheerio.Element>): Hotel[] {
    const $ = this.$;
    const CONFIG = {
      amenities: '.I9B2He',
      currency: '.YwF3uc.gwcnTb',
      currencyRegex: /\D+/,
      dealDetails: '.dLtZ8b.YqpfKf',
      dealType: '.ZIFkhf.ApHyTb',
      hotelCards: '.NANqI.czz9sc',
      name: '.BTPx6e',
      originalPrice: '.AfCRQd',
      originalPriceRegex: /\d+/,
      price: '.YwF3uc.gwcnTb',
      priceRegex: /\d+/,
      rating: '.yi40Hd.YrbPuc',
      ratingRegex: /\d\.\d/,
      votes: '.RDApEe.YrbPuc',
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
      const ratingString = $(el).find(CONFIG.rating).text();
      const rating = parseFloat(utils.getFirstMatch(ratingString, CONFIG.ratingRegex));
      const votes = utils.convertToNumberFormat(this.elementText(el, CONFIG.votes));
      const dealType = this.elementText(el, CONFIG.dealType);
      const dealDetails = this.elementText(el, CONFIG.dealDetails);
      const amenities = this.elementText(el, CONFIG.amenities);

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
      snippet: '.MUxGbd.yDYNvb.lyLwlc:not(.fCBnFe .MUxGbd.yDYNvb.lyLwlc):not(.qjtaSd.MUxGbd.yDYNvb.lyLwlc):not(.aLF0Z.OSrXXb)',
      title: '[role="heading"]',
      url: 'a.sVXRqc',
    };

    $(search)
      .find(CONFIG.ads)
      .each((i, e) => {
        const title = this.elementText(e, CONFIG.title);
        const url = this.elementHref(e, CONFIG.url);
        const domain = utils.getDomain(url);
        const linkType = utils.getLinkType(url);
        const snippet = $(e).find(CONFIG.snippet).text();
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

  private getAdSitelinks(ad: cheerio.Element) {
    const $ = this.$;
    const CONFIG = {
      card: '.fCBnFe,.MhgNwc',
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
        href: this.elementHref(e),
        title: $(e).text(),
        type: SitelinkType.inline,
      };
      sitelinks.push(sitelink);
    });
    return sitelinks;
  }

  // Moved to knowledge graph
  // private getAvailableOn() {
  //   const $ = this.$;
  //   const serp = this.serp;
  //   const CONFIG = {
  //     price: '.V8xno span',
  //     query: 'a.JkUS4b',
  //     service: '.i3LlFf',
  //   };

  //   const list = $(CONFIG.query);
  //   const availableOn: AvailableOn[] = [];
  //   if (list.length) {
  //     list.each((i, e) => {
  //       const url = $(e).attr('href') as string;
  //       const service = this.elementText(e, CONFIG.service);
  //       const price = this.elementText(e, CONFIG.price);
  //       availableOn.push({ url, service, price });
  //     });
  //     serp.availableOn = availableOn;
  //   }
  // }

  private getLocals() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      name: '.dbg0pd',
      rating: '.yi40Hd.YrbPuc',
      reviews: '.RDApEe.YrbPuc',
      reviewsRegex: /[0-9]+/,
      expensiveness: '[role="img"]:not(.z3HNkc)',
      expensivenessRegex: /·([^]+)·/,
      type: '.rllt__details div:nth-child(2)',
      typeRegex: /\w+\s\w+/,
      address: '.rllt__details div:nth-child(3)',
      addressRegex: /[^·]*$/,
      localsFeature: '.vwVdIc.wzN8Ac',
      local: '.C8TUKc',
      distance: '.rllt__details div:nth-child(2)',
      distanceRegex: /^([^·])+/,
      description: 'div.rllt__wrapped > span',
    };

    const localsFeatureList = $(CONFIG.localsFeature);

    if (!localsFeatureList.length) {
      return;
    }

    const locals: Local[] = [];
    localsFeatureList.each((ind, el) => {
      const name = this.elementText(el, CONFIG.name);
      const rating = this.elementText(el, CONFIG.rating);
      const reviews = utils.getFirstMatch($(el).find(CONFIG.reviews).text(), CONFIG.reviewsRegex);
      const expensiveness = this.elementText(el, CONFIG.expensiveness).trim().length;
      const type = utils.getFirstMatch($(el).find(CONFIG.type).text(), CONFIG.typeRegex);
      const distance = utils.getFirstMatch($(el).find(CONFIG.distance).text(), CONFIG.distanceRegex).trim();
      const address = utils.getFirstMatch($(el).find(CONFIG.address).text(), CONFIG.addressRegex).trim();
      const description = this.elementText(el, CONFIG.description);
      locals.push({ name, rating, reviews, expensiveness, type, address, distance, description });
    });
    serp.locals = locals;
  }

  private getTopStories() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      published: '.OSrXXb',
      publisher: '.CEMjEf span',
      title: '[role="heading"]',
      topStoriesFeature: '.yG4QQe.TBC9ub',
      topStory: '.WlydOe',
    };
    const topStoriesFeature = $(CONFIG.topStoriesFeature);

    if (!topStoriesFeature.length) {
      return;
    }

    const topStories: TopStory[] = [];
    const topStory = topStoriesFeature.find(CONFIG.topStory);
    topStory.each((ind, el) => {
      const url = $(el).attr('href') as string;
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
      commodity: '.pla-extensions-container .shq1Oc',
      currency: '.e10twf',
      currencyRegex: /\D+/,
      imgLink: 'a.pla-unit-img-container-link',
      price: '.e10twf',
      priceRegex: /[\d,.]+/,
      ratingRegex: /\d\.\d/,
      ratingString: '.pla-extensions-container .z3HNkc',
      shopFeature: '.pla-crsl.YEJkkb.pla-carousel',
      shopOffer: '.mnr-c.pla-unit',
      shoppingSite: '.LbUacb',
      // specialOffer: '.gyXcee',
      title: 'a > .pymv4e',
      votes: '.pla-extensions-container .fl.pbAs0b',
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
        // const specialOffer = $(el).find(CONFIG.specialOffer).first().text();
        // if (specialOffer) {
        //   shopResult.specialOffer = specialOffer;
        // }
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
  private elementText(el: cheerio.Element | cheerio.Node, query: string) {
    return this.$(el).find(query).text() as string;
  }

  private elementHref(el: cheerio.Element | cheerio.Node, query?: string) {
    if (query) {
      return this.$(el).find(query).attr('href') as string;
    }
    return this.$(el).attr('href') as string;
  }
}
