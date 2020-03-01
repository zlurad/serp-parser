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
  PopularProduct,
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

export class GoogleSERP {
  public serp: Serp = {
    currentPage: 1,
    keyword: '',
    organic: [],
    pagination: [],
    relatedKeywords: [],
  };

  private $: CheerioStatic;
  private CONFIG = {
    noResults: '.med.card-section p:contains(" - did not match any documents.")',
    noResultsNojs: 'span.r0bn4c.rQMQod:contains(" - did not match any documents.")',
  };

  constructor(html: string) {
    this.$ = cheerio.load(html, {
      normalizeWhitespace: true,
      xmlMode: true,
    });

    this.parse();
  }

  private parse() {
    const $ = this.$;
    const CONFIG = this.CONFIG;
    if ($(CONFIG.noResults).length === 1 || $(CONFIG.noResultsNojs).length === 1) {
      this.serp.error = 'No results page';
      // No need to parse anything for no results page
      return;
    }

    if ($('body').hasClass('srp')) {
      this.parseGoogle();
    } else if ($('body').hasClass('hsrp')) {
      this.parseGoogle(true);
    }
  }

  private parseGoogle(nojs?: boolean) {
    const serp = this.serp;
    const $ = this.$;
    const CONFIG = {
      currentPage: nojs ? 'table#nav td:not(.b) > b' : 'table#nav td.cur',
      keyword: nojs ? '#sbhost' : 'input[aria-label="Search"]',
      resultText: '#resultStats',
    };

    serp.keyword = $(CONFIG.keyword).val();
    serp.totalResults = utils.getTotalResults($(CONFIG.resultText).text());
    serp.currentPage = parseInt($(CONFIG.currentPage).text(), 10);

    this.getOrganic(nojs);
    this.getRelatedKeywords(nojs);
    this.getPagination();
    this.getAdwords(nojs);
    this.getHotels(nojs);

    if (!nojs) {
      serp.timeTaken = utils.getTimeTaken($(CONFIG.resultText).text());
      this.getVideos();
      this.getThumbnails();
      this.getAvailableOn();
      this.getShopResults();
      this.getTopStories();
      this.getPopularProducts();
    }
  }

  private getOrganic(nojs?: boolean) {
    const $ = this.$;
    const CONFIG = {
      results: nojs
        ? '#ires ol .g .r a:not(.sla)'
        : '.bkWMgd > .g > h2 + div .rc > .r > a,.bkWMgd > h2 + div .rc > .r > a',
    };

    $(CONFIG.results).each((index, element) => {
      const position = index + 1;
      const url = nojs ? utils.getUrlFromQuery($(element).prop('href')) : $(element).prop('href');
      const domain = utils.getDomain(url);
      const title = nojs ? $(element).text() : this.elementText(element, 'h3');
      const snippet = this.getSnippet(element, nojs);
      const linkType = utils.getLinkType(url);
      const result: Result = {
        domain,
        linkType,
        position,
        snippet,
        title,
        url,
      };
      this.parseSitelinks(element, result, nojs);
      this.parseCachedAndSimilarUrls(element, result, nojs);
      this.serp.organic.push(result);
    });
  }

  private getSnippet(element: CheerioElement, nojs?: boolean): string {
    const text = this.$(element)
      .parent('.r')
      .next()
      .find('.st')
      .text();
    return nojs ? text.replace(/(&nbsp;)/g, ' ').replace(/ +(?= )/g, '') : text;
  }

  private parseSitelinks(element: CheerioElement, result: Result, nojs?: boolean) {
    const $ = this.$;
    const CONFIG = {
      cards: '.sld',
      closestCards: 'div.g',
      closestInline: nojs ? 'div.g' : '.rc',
      href: 'a',
      inline: '.s .osl a',
      snippet: '.st',
      title: 'h3 a',
    };
    const sitelinks: Sitelink[] = [];
    let type: SitelinkType;

    if($(element).closest(CONFIG.closestCards).find(CONFIG.cards).length > 0) {
      type = SitelinkType.card;
    } else if($(element).closest(CONFIG.closestInline).find(CONFIG.inline).length > 0) {
      type = SitelinkType.inline;
    } else {
      return;
    }

    const links = $(element).closest(type === SitelinkType.card ? CONFIG.closestCards : CONFIG.closestInline)
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

  private getRelatedKeywords(nojs?: boolean) {
    const relatedKeywords: RelatedKeyword[] = [];
    const query = nojs ? 'p.aw5cc a' : 'p.nVcaUb a';
    this.$(query).each((i, elem) => {
      relatedKeywords.push({
        keyword: this.$(elem).text(),
        path: this.$(elem).prop('href'),
      });
    });
    this.serp.relatedKeywords = relatedKeywords;
  };

  private parseCachedAndSimilarUrls(element: CheerioElement, result: Result, nojs?: boolean) {
    const $ = this.$;
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
  }

  private getPagination() {
    const $ = this.$;
    const serp = this.serp;
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
      videosCards: 'g-scrolling-carousel .BFJZOc g-inner-card',
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
      const heading = this.elementText(element, CONFIG.heading);
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

  private getHotels(nojs?: boolean) {
    const $ = this.$;
    const hotelsFeature = $(nojs ? '.ksBKIe' : '.zd2Jbb');
    if (!hotelsFeature.length) {
      return;
    }
    // TODO: SPLIT TO getHotels and getHotelsNojs
    // TODO: SPLIT FURTHER TO getSearchFilters, getHotelOffers
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
        const name = this.elementText(elem, CONFIG.name);
        const rating = parseFloat(this.elementText(elem, CONFIG.rating));
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
        const amenities = this.elementText(elem, CONFIG.amenities);
        const featuredReview = this.elementText(elem, CONFIG.featuredReview)
          .trim()
          .slice(1, -1); // Getting rid of quotes with slice()
        // Make this better, maybe something instead of slice ?;
        const moreInfoLink = this.elementHref(elem, CONFIG.moreInfoLink);

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

      this.serp.hotels = {
        hotels,
        moreHotels: moreHotelsLink,
      };
    } else {
      const CONFIG = {
        moreHotelsRegex: /(\d+,?)+/,
        moreHotelsText: '.LPOxmb',
      };
      // FILTERS
      const searchFilters: HotelsSearchFilters = this.getHotelSearchFilters(hotelsFeature);

      // HOTELS (HOTEL CARDS)
      const hotels: Hotel[] = this.getHotelOffers(hotelsFeature);

      // MORE HOTELS

      const moreHotelsText = hotelsFeature.find(CONFIG.moreHotelsText).text();
      const moreHotels = parseInt(utils.getFirstMatch(moreHotelsText, CONFIG.moreHotelsRegex).replace(',', ''), 10);

      this.serp.hotels = {
        hotels,
        moreHotels,
        searchFilters,
      };
    }
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
      const hotelFilters: HotelFilters = {
        explanation: $(el)
          .next()
          .text(),
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
      rating: '.fTKmHE99XE4__star',
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
      const ratingString = $(el)
        .find(CONFIG.rating)
        .attr('aria-label');
      const rating = parseFloat(utils.getFirstMatch(ratingString, CONFIG.ratingRegex));
      const votes = parseInt(
        this.elementText(el, CONFIG.votes)
          .slice(1, -1)
          .replace(',', ''),
        10,
      ); // Getting rid of parentheses with slice()
      // Make this better, maybe something instead of slice ?

      const dealType = this.elementText(el, CONFIG.dealType);
      const dealDetails = this.elementText(el, CONFIG.dealDetails);
      const amenities = this.elementText(el, CONFIG.amenities);
      const featuredReview = this.elementText(el, CONFIG.featuredReview)
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
  }

  private getAdwords(nojs?: boolean) {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      bottom: nojs ? '#D7Sjmd' : '#tadsb',
      top: nojs ? '#KsHht' : '#tads',
    };

    const adwords: { adwordsTop?: Ad[]; adwordsBottom?: Ad[] } = {};
    // TODO: refactor this
    if ($(CONFIG.top).length) {
      adwords.adwordsTop = [];
      this.getAds(CONFIG.top, adwords.adwordsTop, nojs);
    }
    if ($(CONFIG.bottom).length) {
      adwords.adwordsBottom = [];
      this.getAds(CONFIG.bottom, adwords.adwordsBottom, nojs);
    }
    serp.adwords = adwords.adwordsTop || adwords.adwordsBottom ? adwords : undefined;
  }

  private getAds(search: string, adsList: Ad[], nojs?: boolean) {
    const $ = this.$;
    const CONFIG = {
      ads: '.ads-ad',
      snippet: '.ads-creative',
      title: nojs ? 'h3.ellip' : 'h3.sA5rQ',
      url: nojs ? 'h3.ellip a' : '.ad_cclk a.V0MxL',
    };

    $(search)
      .find(CONFIG.ads)
      .each((i, e) => {
        const title = this.elementText(e, CONFIG.title);
        const url = this.elementHref(e, CONFIG.url);
        const domain = utils.getDomain(url, 'https://www.googleadservices.com/pagead');
        const linkType = utils.getLinkType(url, 'https://www.googleadservices.com/pagead');
        const snippet = this.elementText(e, CONFIG.snippet);
        const sitelinks: Sitelink[] = this.getAdSitelinks(e, nojs);
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

  private getAdSitelinks(ad: CheerioElement, nojs?: boolean) {
    const $ = this.$;
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
          const sitelink: Sitelink = {
            href: this.elementHref(e, CONFIG.cardHref),
            snippet: this.elementText(e, CONFIG.cardSnippet),
            title: this.elementText(e, CONFIG.cardTitle),
            type: SitelinkType.card,
          };
          sitelinks.push(sitelink);
        });
      } else {
        const inlineSiteLinks = $(el).find(CONFIG.inline);
        inlineSiteLinks.each((i, e) => {
          const sitelink: Sitelink = {
            href: $(e).attr('href'),
            title: $(e).text(),
            type: SitelinkType.inline,
          };
          sitelinks.push(sitelink);
        });
      }
    });
    return sitelinks;
  }

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

  private getPopularProducts(){
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      title: '.RnJeZd',
      price: '.e10twf.T4OwTb', 
      seller: '.a.VZqTOd',
      popularProductsFeature: '.c.ptJHdc.commercial-unit-desktop-top',
      popularProduct: '.mnr-c.pla-unit',
    };

    const popularProductsFeature = $(CONFIG.popularProductsFeature);

    if (!popularProductsFeature.length) {
      return;
    }

    const popularProducts: PopularProduct[] = [];
    const popularProduct = popularProductsFeature.find(CONFIG.popularProduct);
    popularProduct.each((ind, el) => {
      const title = this.elementText(el, CONFIG.title);
      const price = this.elementText(el, CONFIG.price);
      const seller = this.elementText(el, CONFIG.seller);
      popularProducts.push({ title, price, seller });
    });
    serp.popularProducts = popularProducts;
  }

  private getTopStories() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      imgLink: 'g-inner-card.cv2VAd > a',
      published: '.GJhQm > span.f',
      publisher: '.YQPQv',
      title: '.mRnBbe',
      topStoriesFeature: 'g-section-with-header[data-hveid=CAEQAA]',
      topStory: '.So9e7d',
    };
    const topStoriesFeature = $(CONFIG.topStoriesFeature);

    if (!topStoriesFeature.length) {
      return;
    }

    const topStories: TopStory[] = [];
    const topStory = topStoriesFeature.find(CONFIG.topStory);
    topStory.each((ind, el) => {
      const imgLink = this.elementHref(el, CONFIG.imgLink);
      const title = this.elementText(el, CONFIG.title);
      const publisher = this.elementText(el, CONFIG.publisher);
      const published = this.elementText(el, CONFIG.published);
      topStories.push({ imgLink, title, publisher, published });
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
        const votes = this.elementText(el, CONFIG.votes)
          .trim()
          .slice(1, -1);
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
    return this.$(el)
      .find(query)
      .text();
  }

  private elementHref(el: CheerioElement, query: string) {
    return this.$(el)
      .find(query)
      .attr('href');
  }
}
