import * as cheerio from 'cheerio';
import { URL } from 'url';
const tldParser = require('tld-extract');
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
} from './models';
import * as utils from './utils';

export class GoogleMobileSERP {
  public serp: Serp = {
    keyword: '',
    organic: [],
    pagination: [],
    relatedKeywords: [],
  };

  private $;

  #DEF_OPTIONS = {
    organic: true,
    related: true,
    ads: true,
    hotels: false,
    videos: false,
    thumbnails: false,
    shop: false,
    stories: false,
    locals: false,
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
      keyword: 'input[aria-label="Search"]',
      noResults: '#topstuff .card-section p:contains(" - did not match any documents.")',
    };
    if ($(CONFIG.noResults).length === 1) {
      this.serp.error = 'No results page';
      // No need to parse anything for no results page
      return;
    }

    if ($('body').hasClass('srp')) {
      serp.keyword = $(CONFIG.keyword).val() as string;
      if (options.organic) {
        this.getFeatured();
        this.getOrganic();
      }
      if (options.ads) {
        this.getAdwords();
      }
      if (options.related) {
        this.getRelatedKeywords();
      }
      // if (options.hotels) {
      //   this.getHotels();
      // }
      // if (options.videos) {
      //   this.getVideos();
      // }
      // if (options.thumbnails) {
      //   this.getThumbnails();
      // }
      // if (options.shop) {
      //   this.getShopResults();
      // }
      // if (options.stories) {
      //   this.getTopStories();
      // }
      // if (options.locals) {
      //   this.getLocals();
      // }

      // this.getAvailableOn();
    }
  }

  private getOrganic() {
    const $ = this.$;
    const CONFIG = {
      results: '.mnr-c.xpd a.C8nzq',
    };

    $(CONFIG.results).each((index, element) => {
      const position = this.serp.organic.length + 1;
      const url = $(element).prop('href');
      const domain = utils.getDomain(url);
      const domain_tld = tldParser(url).tld;
      const domain_root = tldParser(url).domain;
      const domain_sub = tldParser(url).sub;
      const title = this.elementText(element, 'div[role="heading"] div');
      const snippet = this.getSnippet(element);
      const linkType = utils.getLinkType(url);
		const uri = new URL(url);
      const url_clean = uri.hostname + uri.pathname;
      const url_displayed = $(element).children('div').text();
      const result: Result = {
        domain,
        linkType,
        position,
        snippet,
        title,
        url,
        domain_root,
        domain_sub,
		  domain_tld,
		  url_clean,
		  url_displayed,
      };
      this.parseSitelinks(element, result);
      this.serp.organic.push(result);
    });
  }

  private getFeatured() {
    const $ = this.$;
    const CONFIG = {
      results: '#rso .xpdopen .ifM9O .mnr-c a',
    };
    $(CONFIG.results).each((index, element) => {
      const position = this.serp.organic.length + 1;
      const url = $(element).prop('href');
      const domain = utils.getDomain(url);
      const title = $(element).text();
      const snippet = this.$(element).closest('.mnr-c').prev().text();
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
    const text = this.$(element).closest('.mnr-c').find('div.MUxGbd.yDYNvb').text().replace(/\s+/g, ' ').trim();
    return text;
  }

  private parseSitelinks(element: cheerio.Element | cheerio.Node, result: Result) {
    const $ = this.$;
    const CONFIG = {
      closestInline: '.mnr-c.xpd',
      inline: '[jsname="m7irxf"] a',
    };
    const sitelinks: Sitelink[] = [];

    const links = $(element).closest(CONFIG.closestInline).find(CONFIG.inline);
    const type = SitelinkType.inline;

    links.each((i, el) => {
      const sitelink: Sitelink = {
        href: $(el).attr('href') as string,
        title: $(el).text(),
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
    const query = 'a.F3dFTe';
    this.$(query).each((i, elem) => {
      relatedKeywords.push({
        keyword: this.$(elem).text().trim(),
        path: this.$(elem).prop('href'),
      });
    });
    this.serp.relatedKeywords = relatedKeywords;
  }

  // private getVideos() {
  //   const $ = this.$;
  //   const serp = this.serp;
  //   const CONFIG = {
  //     channel: '.GlPvmc.YnLDzf',
  //     date: '.rjmdhd',
  //     sitelink: 'a',
  //     source: '.hDeAhf',
  //     title: '.fJiQld.oz3cqf.p5AXld',
  //     videoDuration: '.J2i9Hd',
  //     videosCards: '.VibNM',
  //   };

  //   const videosCards = $(CONFIG.videosCards);
  //   if (videosCards.length === 0) {
  //     return;
  //   }
  //   const videos: VideoCard[] = [];
  //   videosCards.each((index, element) => {
  //     const videoCard = {
  //       channel: this.elementText(element, CONFIG.channel).substr(3),
  //       date: new Date(this.elementText(element, CONFIG.date)),
  //       sitelink: this.elementHref(element, CONFIG.sitelink),
  //       source: this.elementText(element, CONFIG.source),
  //       title: this.elementText(element, CONFIG.title),
  //       videoDuration: this.elementText(element, CONFIG.videoDuration),
  //     };
  //     videos.push(videoCard);
  //   });
  //   serp.videos = videos;
  // }

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

  // private getHotels() {
  //   const $ = this.$;
  //   const hotelsFeature = $('.zd2Jbb');
  //   if (!hotelsFeature.length) {
  //     return;
  //   }
  //   const CONFIG = {
  //     moreHotelsRegex: /(\d+,?)+/,
  //     moreHotelsText: '.wUrVib',
  //   };
  //   // FILTERS
  //   const searchFilters: HotelsSearchFilters = this.getHotelSearchFilters(hotelsFeature);

  //   // HOTELS (HOTEL CARDS)
  //   const hotels: Hotel[] = this.getHotelOffers(hotelsFeature);

  //   // MORE HOTELS

  //   // const moreHotelsText = hotelsFeature.find(CONFIG.moreHotelsText).text();
  //   const moreHotelsText = hotelsFeature.find(CONFIG.moreHotelsText).text();
  //   const moreHotels = parseInt(utils.getFirstMatch(moreHotelsText, CONFIG.moreHotelsRegex).replace(',', ''), 10);

  //   this.serp.hotels = {
  //     hotels,
  //     moreHotels,
  //     searchFilters,
  //   };
  // }

  // private getHotelSearchFilters(hotelsFeature: cheerio.Cheerio<cheerio.Element>): HotelsSearchFilters {
  //   const $ = this.$;
  //   const CONFIG = {
  //     activeFilter: '.CWGqFd',
  //     checkInString: '.vpggTd.ed5F6c span',
  //     checkOutString: '.vpggTd:not(.ed5F6c) span',
  //     filterGroupsTitles: '.d2IDkc',
  //     guests: '.viupMc',
  //     hotelFiltersSection: '.x3UtIe',
  //     searchTitle: '.gsmmde',
  //   };
  //   const hotelFiltersSection = hotelsFeature.find(CONFIG.hotelFiltersSection);
  //   const searchTitle = hotelFiltersSection.find(CONFIG.searchTitle).text();
  //   const checkInString = `${hotelFiltersSection.find(CONFIG.checkInString).text()} ${new Date().getFullYear()}`;
  //   const checkIn = new Date(checkInString);
  //   const checkOutString = `${hotelFiltersSection.find(CONFIG.checkOutString).text()} ${new Date().getFullYear()}`;
  //   const checkOut = new Date(checkOutString);
  //   const guests = parseInt(hotelFiltersSection.find(CONFIG.guests).text(), 10);

  //   const filters: HotelFilters[] = [];

  //   const filterGroupsTitles = hotelFiltersSection.find(CONFIG.filterGroupsTitles);
  //   filterGroupsTitles.each((ind, el) => {
  //     const hotelFilters: HotelFilters = {
  //       explanation: $(el).next().text(),
  //       title: $(el).text(),
  //     };
  //     if ($(el).closest(CONFIG.activeFilter).length) {
  //       hotelFilters.isActive = true;
  //     }
  //     filters.push(hotelFilters);
  //   });

  //   return {
  //     checkIn,
  //     checkOut,
  //     filters,
  //     guests,
  //     searchTitle,
  //   };
  // }

  // private getHotelOffers(hotelsFeature: cheerio.Cheerio<cheerio.Element>): Hotel[] {
  //   const $ = this.$;
  //   const CONFIG = {
  //     amenities: '.I9B2He',
  //     currency: '.dv1Q3e',
  //     currencyRegex: /\D+/,
  //     dealDetails: '.kOTJue.jj25pf',
  //     dealType: '.NNPnSe',
  //     featuredReview: '.DabgJ .gisIHb',
  //     hotelCards: '.ntKMYc .hmHBZd',
  //     name: '.BTPx6e',
  //     originalPrice: '.AfCRQd',
  //     originalPriceRegex: /\d+/,
  //     price: '.dv1Q3e',
  //     priceRegex: /\d+/,
  //     rating: 'g-review-stars span',
  //     ratingRegex: /\d\.\d/,
  //     votes: 'g-review-stars+span',
  //   };
  //   const hotels: Hotel[] = [];
  //   const hotelCards = hotelsFeature.find(CONFIG.hotelCards);
  //   hotelCards.each((ind, el) => {
  //     const name = this.elementText(el, CONFIG.name);
  //     const price = parseInt(utils.getFirstMatch(this.elementText(el, CONFIG.price), CONFIG.priceRegex), 10);
  //     const originalPrice = parseInt(
  //       utils.getFirstMatch(this.elementText(el, CONFIG.originalPrice), CONFIG.originalPriceRegex),
  //       10,
  //     );
  //     const currency = utils.getFirstMatch(this.elementText(el, CONFIG.currency), CONFIG.currencyRegex);
  //     const ratingString = $(el).find(CONFIG.rating).attr('aria-label') as string;
  //     const rating = parseFloat(utils.getFirstMatch(ratingString, CONFIG.ratingRegex));
  //     const votes = parseInt(this.elementText(el, CONFIG.votes).slice(1, -1).replace(',', ''), 10); // Getting rid of parentheses with slice()
  //     // Make this better, maybe something instead of slice ?

  //     const dealType = this.elementText(el, CONFIG.dealType);
  //     const dealDetails = this.elementText(el, CONFIG.dealDetails);
  //     const amenities = this.elementText(el, CONFIG.amenities);
  //     const featuredReview = this.elementText(el, CONFIG.featuredReview).trim().slice(1, -1); // Getting rid of quotes with slice()
  //     // Make this better, maybe something instead of slice ?

  //     const hotelDeal: HotelDeal = {
  //       dealType,
  //     };

  //     if (dealDetails) {
  //       hotelDeal.dealDetails = dealDetails;
  //     }
  //     if (originalPrice) {
  //       hotelDeal.originalPrice = originalPrice;
  //     }

  //     const hotel: Hotel = {
  //       currency,
  //       name,
  //       price,
  //       rating,
  //       votes,
  //     };

  //     if (dealType) {
  //       hotel.deal = hotelDeal;
  //     }

  //     if (amenities) {
  //       hotel.amenities = amenities;
  //     }
  //     if (featuredReview) {
  //       hotel.featuredReview = featuredReview;
  //     }

  //     hotels.push(hotel);
  //   });

  //   return hotels;
  // }

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
      snippet: '.MUxGbd.yDYNvb.lEBKkf',
      title: '[role="heading"]',
      url: 'a.C8nzq.d5oMvf.BmP5tf',
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
      inline: '.MUxGbd.v0nnCb.lyLwlc a,.Uq7H1 a',
    };
    const sitelinks: Sitelink[] = [];
    const inlineSiteLinks = $(ad).find(CONFIG.inline);
    inlineSiteLinks.each((i, e) => {
      const sitelink: Sitelink = {
        href: $(e).attr('href') as string,
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

  // private getLocals() {
  //   const $ = this.$;
  //   const serp = this.serp;
  //   const CONFIG = {
  //     name: '.dbg0pd',
  //     rating: '.BTtC6e',
  //     reviews: '.rllt__details.lqhpac div:nth-child(1) span:nth-child(3)',
  //     reviewsRegex: /[0-9]+/,
  //     expensiveness: '.rllt__details.lqhpac div:nth-child(1)',
  //     expensivenessRegex: /·([^]+)·/,
  //     type: '.rllt__details.lqhpac div:nth-child(1)',
  //     typeRegex: /\w+\s\w+/,
  //     distance: '.rllt__details.lqhpac div:nth-child(2) > span:nth-child(1)',
  //     address: '.rllt__details.lqhpac div:nth-child(2)',
  //     description: 'div.rllt__wrapped > span',
  //     localsFeature: '.AEprdc',
  //     local: '.C8TUKc',
  //   };

  //   const localsFeature = $(CONFIG.localsFeature);

  //   if (!localsFeature.length) {
  //     return;
  //   }

  //   const locals: Local[] = [];
  //   const local = localsFeature.find(CONFIG.local);
  //   local.each((ind, el) => {
  //     const name = this.elementText(el, CONFIG.name);
  //     const rating = this.elementText(el, CONFIG.rating);
  //     const reviews = utils.getFirstMatch($(el).find(CONFIG.reviews).text(), CONFIG.reviewsRegex);
  //     const expensiveness = utils
  //       .getFirstMatch($(el).find(CONFIG.expensiveness).text(), CONFIG.expensivenessRegex)
  //       .slice(1, -1)
  //       .trim().length;
  //     const type = utils.getFirstMatch($(el).find(CONFIG.type).text(), CONFIG.typeRegex);
  //     const distance = '';
  //     const address = this.elementText(el, CONFIG.address);
  //     const description = '';
  //     locals.push({ name, rating, reviews, expensiveness, type, distance, address, description });
  //   });
  //   serp.locals = locals;
  // }

  // private getTopStories() {
  //   const $ = this.$;
  //   const serp = this.serp;
  //   const CONFIG = {
  //     published: '.K4LhXb',
  //     publisher: '.wqg8ad',
  //     title: 'div[role="heading"]',
  //     topStoriesFeature: 'g-section-with-header [data-hveid=CA0QAQ]',
  //     topStory: 'a[data-jsarwt="1"]',
  //   };
  //   const topStoriesFeature = $(CONFIG.topStoriesFeature);

  //   if (!topStoriesFeature.length) {
  //     return;
  //   }

  //   const topStories: TopStory[] = [];
  //   const topStory = topStoriesFeature.find(CONFIG.topStory);
  //   topStory.each((ind, el) => {
  //     const url = $(el).attr('href') as string;
  //     const title = this.elementText(el, CONFIG.title);
  //     const publisher = this.elementText(el, CONFIG.publisher);
  //     const published = this.elementText(el, CONFIG.published);
  //     topStories.push({ url, title, publisher, published });
  //   });
  //   serp.topStories = topStories;
  // }

  // private getShopResults() {
  //   const $ = this.$;
  //   const serp = this.serp;
  //   const CONFIG = {
  //     commodity: '.cYBBsb',
  //     currency: '.e10twf',
  //     currencyRegex: /\D+/,
  //     imgLink: 'a.pla-unit-img-container-link',
  //     price: '.e10twf',
  //     priceRegex: /[\d,.]+/,
  //     ratingRegex: /\d\.\d/,
  //     ratingString: 'a > span > g-review-stars > span',
  //     shopFeature: '.top-pla-group-inner',
  //     shopOffer: '.pla-unit:not(.view-all-unit)',
  //     shoppingSite: '.LbUacb',
  //     specialOffer: '.gyXcee',
  //     title: 'a > .pymv4e',
  //     votes: '.nbd1Bd .QhqGkb.RnJeZd',
  //   };
  //   const shopFeature = $(CONFIG.shopFeature);
  //   if (shopFeature.length) {
  //     const shopResults: ShopResult[] = [];
  //     const shopOffer = shopFeature.find(CONFIG.shopOffer);
  //     shopOffer.each((ind, el) => {
  //       const imgLink = this.elementHref(el, CONFIG.imgLink);
  //       const title = this.elementText(el, CONFIG.title);
  //       const price = parseFloat(
  //         utils.getFirstMatch(this.elementText(el, CONFIG.price), CONFIG.priceRegex).replace(/,/g, ''),
  //       );
  //       const currency = utils.getFirstMatch(this.elementText(el, CONFIG.currency), CONFIG.currencyRegex);
  //       const shoppingSite = this.elementText(el, CONFIG.shoppingSite);

  //       const shopResult: ShopResult = {
  //         currency,
  //         imgLink,
  //         price,
  //         shoppingSite,
  //         title,
  //       };
  //       const specialOffer = $(el).find(CONFIG.specialOffer).first().text();
  //       if (specialOffer) {
  //         shopResult.specialOffer = specialOffer;
  //       }
  //       const ratingString = $(el).find(CONFIG.ratingString).attr('aria-label');
  //       if (ratingString) {
  //         const rating = parseFloat(utils.getFirstMatch(ratingString, CONFIG.ratingRegex));
  //         shopResult.rating = rating;
  //       }
  //       const votes = this.elementText(el, CONFIG.votes).trim().slice(1, -1);
  //       if (votes) {
  //         shopResult.votes = votes;
  //       }
  //       const commodity = this.elementText(el, CONFIG.commodity);
  //       if (commodity) {
  //         shopResult.commodity = commodity;
  //       }
  //       shopResults.push(shopResult);
  //     });
  //     serp.shopResults = shopResults;
  //   }
  // }

  // Helper methods
  private elementText(el: cheerio.Element | cheerio.Node, query: string) {
    return this.$(el).find(query).text() as string;
  }

  private elementHref(el: cheerio.Element | cheerio.Node, query: string) {
    return this.$(el).find(query).attr('href') as string;
  }
}
