import * as cheerio from 'cheerio';
import {
  Ad,
  Hotel,
  HotelDeal,
  HotelFilters,
  HotelsSearchFilters,
  RelatedKeyword,
  Result,
  Serp,
  Sitelink,
  SitelinkType,
} from './models';
import * as utils from './utils';

export class GoogleNojsSERP {
  public serp: Serp = {
    currentPage: 1,
    keyword: '',
    organic: [],
    pagination: [],
    relatedKeywords: [],
  };

  private $: CheerioStatic;
  private CONFIG = {
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
    if ($(CONFIG.noResultsNojs).length === 1) {
      this.serp.error = 'No results page';
      // No need to parse anything for no results page
      return;
    }

    if ($('body').hasClass('hsrp')) {
      this.parseGoogle();
    }
  }

  private parseGoogle() {
    const serp = this.serp;
    const $ = this.$;
    const CONFIG = {
      currentPage: 'table#nav td:not(.b) > b',
      keyword: '#sbhost',
      resultText: '#resultStats',
    };

    serp.keyword = $(CONFIG.keyword).val();
    serp.totalResults = utils.getTotalResults($(CONFIG.resultText).text());
    serp.currentPage = parseInt($(CONFIG.currentPage).text(), 10);

    this.getOrganic();
    this.getRelatedKeywords();
    this.getPagination();
    this.getAdwords();
    this.getHotels();
  }

  private getOrganic() {
    const $ = this.$;
    const CONFIG = {
      results: '#ires ol .g .r a:not(.sla)',
    };

    $(CONFIG.results).each((index, element) => {
      const position = index + 1;
      const url = utils.getUrlFromQuery($(element).prop('href'));
      const domain = utils.getDomain(url);
      const title = $(element).text();
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
    const text = this.$(element)
      .parent('.r')
      .next()
      .find('.st')
      .text();
    return text.replace(/(&nbsp;)/g, ' ').replace(/ +(?= )/g, '');
  }

  private parseSitelinks(element: CheerioElement, result: Result) {
    const $ = this.$;
    const CONFIG = {
      cards: '.sld',
      closestCards: 'div.g',
      closestInline: 'div.g',
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

  private getRelatedKeywords() {
    const relatedKeywords: RelatedKeyword[] = [];
    const query = 'p.aw5cc a';
    this.$(query).each((i, elem) => {
      relatedKeywords.push({
        keyword: this.$(elem).text(),
        path: this.$(elem).prop('href'),
      });
    });
    this.serp.relatedKeywords = relatedKeywords;
  };

  private parseCachedAndSimilarUrls(element: CheerioElement, result: Result) {
    const $ = this.$;
    const CONFIG = {
      closest: '.g',
      find: 'cite + .Pj9hGd ul .mUpfKd > a',
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

  private getHotels() {
    const $ = this.$;
    const hotelsFeature = $('.ksBKIe');
    if (!hotelsFeature.length) {
      return;
    }
    // TODO: SPLIT TO getHotels and getHotelsNojs
    // TODO: SPLIT FURTHER TO getSearchFilters, getHotelOffers
    
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

  }

  private getAdwords() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      bottom: '#D7Sjmd',
      top: '#KsHht',
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
      ads: '.ads-ad',
      snippet: '.ads-creative',
      title: 'h3.ellip',
      url: 'h3.ellip a',
    };

    $(search)
      .find(CONFIG.ads)
      .each((i, e) => {
        const title = this.elementText(e, CONFIG.title);
        const url = this.elementHref(e, CONFIG.url);
        const domain = utils.getDomain(url, 'https://www.googleadservices.com/pagead');
        const linkType = utils.getLinkType(url, 'https://www.googleadservices.com/pagead');
        const snippet = this.elementText(e, CONFIG.snippet);
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
      card: 'td',
      cardHref: 'h3 a',
      cardSnippet: 'h3 + div',
      cardTitle: 'h3',
      inline: 'a',
      sitelinks: '.ads-creative + div',
      test: 'DGdP9',
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
