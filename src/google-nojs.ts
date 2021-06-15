import * as cheerio from 'cheerio';
import { Ad, Hotel, RelatedKeyword, Result, Serp, Sitelink, SitelinkType } from './models';
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
      xmlMode: false,
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

    if ($('body').attr('jsmodel') === 'TvHxbe') {
      this.parseGoogle();
    } else {
      this.serp.error = 'Not Google nojs page';
      return;
    }
  }

  private parseGoogle() {
    const serp = this.serp;
    const $ = this.$;
    const CONFIG = {
      keyword: 'input[name="q"]',
    };

    serp.keyword = $(CONFIG.keyword).val();

    this.getOrganic();
    this.getRelatedKeywords();
    this.getAdwords();
    this.getHotels();
  }

  private getOrganic() {
    const $ = this.$;
    const CONFIG = {
      results: '#main > div > div.ZINbbc.xpd.O9g5cc.uUPGi > div.kCrYT:first-child > a',
    };

    $(CONFIG.results).each((index, element) => {
      const position = index + 1;
      const url = utils.getUrlFromQuery($(element).prop('href'));
      const domain = utils.getDomain(url);
      const title = $(element).children('h3').text();
      const snippet = this.getSnippet(element);
      const linkType = utils.getLinkType(url);
		const displayedUrl = $(element).children('div').text();
      const result: Result = {
        domain,
        linkType,
        position,
        snippet,
        title,
        url,
		  displayedUrl,
      };
      this.parseSitelinks(element, result);
      this.serp.organic.push(result);
    });
  }

  private getSnippet(element: CheerioElement): string {
    let text;

    if (this.$(element).parent('.kCrYT').nextAll('.kCrYT').find('.Ap5OSd').length === 0) {
      text = this.$(element).parent('.kCrYT').nextAll('.kCrYT').text();
    } else text = this.$(element).parent('.kCrYT').nextAll('.kCrYT').find('.Ap5OSd').text();
    return text.replace(/(&nbsp;)/g, ' ').replace(/ +(?= )/g, '');
  }

  private parseSitelinks(element: CheerioElement, result: Result) {
    const $ = this.$;
    const CONFIG = {
      next: '.kCrYT',
      inline: 'span a',
    };

    const links = $(element).parent().nextAll(CONFIG.next).find(CONFIG.inline);

    if (links.length === 0) {
      return;
    }

    result.sitelinks = [];

    links.each((i, el) => {
      const sitelink: Sitelink = {
        href: $(el).attr('href'),
        title: $(el).text(),
        type: SitelinkType.inline,
      };
      result.sitelinks?.push(sitelink);
    });
  }

  private getRelatedKeywords() {
    const relatedKeywords: RelatedKeyword[] = [];
    const query = '.Sljvkf.iIWm4b a';
    this.$(query).each((i, elem) => {
      relatedKeywords.push({
        keyword: this.$(elem).text(),
        path: this.$(elem).prop('href'),
      });
    });
    this.serp.relatedKeywords = relatedKeywords;
  }

  private getHotels() {
    const $ = this.$;

    if (!$('#main > div:not(.xpd) h2.zBAuLc').text().startsWith('Hotels')) {
      return;
    }

    const hotelsFeature = $('#main > div:not(.xpd) h2.zBAuLc').closest('.xpd');
    // TODO: SPLIT FURTHER TO getSearchFilters, getHotelOffers

    const CONFIG = {
      description: 'div.BNeawe',
      hotelOffers: '.X7NTVe',
      hotelStars: 'div.BNeawe',
      hotelStarsRegex: /\d(?=-star)/,
      moreInfoLink: 'a.tHmfQe',
      name: 'h3',
      rating: '.Eq0J8:first-child',
      votes: '.Eq0J8:last-child',
      votesRegex: /\((\d+,?)+\)/,
    };
    const moreHotelsLink = hotelsFeature.children().last().find('a').attr('href');
    const hotels: Hotel[] = [];

    // HOTELS
    const hotelOffers = hotelsFeature.find(CONFIG.hotelOffers);
    hotelOffers.each((ind, elem) => {
      const name = this.elementText(elem, CONFIG.name);
      const rating = parseFloat(this.elementText(elem, CONFIG.rating));
      // TODO regex replace all
      const votes = this.elementText(elem, CONFIG.votes).slice(1, -1).replace(',', '');
      const votesNumber = parseInt(votes, 10);
      const hotelStars = utils.getFirstMatch($(elem).find(CONFIG.hotelStars).text(), CONFIG.hotelStarsRegex);
      const stars = parseInt(hotelStars, 10);
      // const desc html
      const description = $(elem).find(CONFIG.description).last().find('br').last()[0].nextSibling?.nodeValue;
      const moreInfoLink = this.elementHref(elem, CONFIG.moreInfoLink);

      const hotel: Hotel = {
        description,
        moreInfoLink,
        name,
        rating,
        stars,
        votes: votesNumber,
      };

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
      top: '.uEierd',
    };

    const adwords: { adwordsTop?: Ad[]; adwordsBottom?: Ad[] } = {};
    // TODO: refactor this
    if ($(CONFIG.top).length) {
      adwords.adwordsTop = [];
      this.getAds(adwords.adwordsTop);
    }
    serp.adwords = adwords.adwordsTop ? adwords : undefined;
  }

  private getAds(adsList: Ad[]) {
    const $ = this.$;
    const CONFIG = {
      ads: '.uEierd',
      snippet: 'div.BmP5tf span',
      title: 'div[role="heading"]',
      url: 'a.C8nzq',
    };

    $(CONFIG.ads).each((i, e) => {
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

  // TODO Figure out new BLOCK sitelinks at Hotels page
  private getAdSitelinks(ad: CheerioElement) {
    const $ = this.$;
    const CONFIG = {
      sitelinks: '.sJxfee a',
    };
    const sitelinks: Sitelink[] = [];
    $(ad)
      .find(CONFIG.sitelinks)
      .each((i, el) => {
        const sitelink: Sitelink = {
          href: $(el).attr('href'),
          title: $(el).text(),
          type: SitelinkType.inline,
        };
        sitelinks.push(sitelink);
      });
    return sitelinks;
  }

  // Helper methods
  private elementText(el: CheerioElement, query: string) {
    return this.$(el).find(query).text();
  }

  private elementHref(el: CheerioElement, query: string) {
    return this.$(el).find(query).attr('href');
  }
}
