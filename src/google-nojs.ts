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

  #DEF_OPTIONS = {
    organic: true,
    related: true,
    ads: true,
    hotels: true,
  };

  private $;

  constructor(html: string, options?: Record<string, boolean>) {
    this.$ = cheerio.load(html, {
      normalizeWhitespace: true,
      xmlMode: false,
    });

    this.parse(options);
  }

  private parse(opt?: Record<string, boolean>) {
    const $ = this.$;
    const CONFIG = {
      noResultsNojs: 'span.r0bn4c.rQMQod:contains(" - did not match any documents.")',
    };
    if ($(CONFIG.noResultsNojs).length === 1) {
      this.serp.error = 'No results page';
      // No need to parse anything for no results page
      return;
    }

    if ($('body').attr('jsmodel') === 'hspDDf') {
      this.parseGoogle(opt);
    } else {
      this.serp.error = 'Not Google nojs page';
      return;
    }
  }

  private parseGoogle(opt?: Record<string, boolean>) {
    const serp = this.serp;
    const options = opt ? opt : this.#DEF_OPTIONS;
    const $ = this.$;
    const CONFIG = {
      keyword: 'input[name="q"]',
    };

    serp.keyword = $(CONFIG.keyword).val() as string;

    if (options.organic) {
      this.getOrganic();
    }
    if (options.related) {
      this.getRelatedKeywords();
    }
    if (options.ads) {
      this.getAdwords();
    }
    if (options.hotels) {
      this.getHotels();
    }
  }

  private getOrganic() {
    const $ = this.$;
    const CONFIG = {
      results: '#main > div > div.Gx5Zad.fP1Qef.xpd.EtOod.pkphOe > div.egMi0.kCrYT > a',
    };

    $(CONFIG.results).each((index, element) => {
      const position = index + 1;
      const url = utils.getUrlFromQuery($(element).prop('href'));
      const domain = utils.getDomain(url);
      const title = $(element).find('.zBAuLc.l97dzf').text();
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
      this.serp.organic.push(result);
    });
  }

  private getSnippet(element: cheerio.Element | cheerio.Node): string {
    let text;
    text = this.$(element).closest('.Gx5Zad.fP1Qef.xpd.EtOod.pkphOe').find('.BNeawe.s3v9rd.AP7Wnd:not(:has(*))').text();
    return text.replace(/(&nbsp;)/g, ' ').replace(/ +(?= )/g, '').replace(/\s+/g, ' ');
  }

  private parseSitelinks(element: cheerio.Element | cheerio.Node, result: Result) {
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
        href: $(el).attr('href') as string,
        title: $(el).text(),
        type: SitelinkType.inline,
      };
      result.sitelinks?.push(sitelink);
    });
  }

  private getRelatedKeywords() {
    const relatedKeywords: RelatedKeyword[] = [];
    const query = '.gGQDvd.iIWm4b a';
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

    if (!$('#main > div:not(.xpd) h2.zBAuLc').text().startsWith('Places')) {
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
      rating: '.oqSTJd',
      votes: '.r0bn4c.rQMQod.tP9Zud > span:last-child',
      votesRegex: /\((\d+,?)+\)/,
    };
    const moreHotelsLink = hotelsFeature.children().last().find('a').attr('href') as string;
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
      const descriptionNode = $(elem).find(CONFIG.description).last().find('br').last()[0].nextSibling;
      const description = descriptionNode ? $(descriptionNode).text() : undefined;
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
      snippet: '.MUxGbd.yDYNvb.lyLwlc.aLF0Z.OSrXXb',
      title: 'div[role="heading"]',
      url: 'a.cz3goc.BmP5tf',
    };

    $(CONFIG.ads).each((i, e) => {
      const title = this.elementText(e, CONFIG.title);
      const url = this.elementHref(e, CONFIG.url) as string;
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
  private getAdSitelinks(ad: cheerio.Element | cheerio.Node) {
    const $ = this.$;
    const CONFIG = {
      sitelinks: '.sJxfee a',
    };
    const sitelinks: Sitelink[] = [];
    $(ad)
      .find(CONFIG.sitelinks)
      .each((i, el) => {
        const sitelink: Sitelink = {
          href: $(el).attr('href') as string,
          title: $(el).text(),
          type: SitelinkType.inline,
        };
        sitelinks.push(sitelink);
      });
    return sitelinks;
  }

  // Helper methods
  private elementText(el: cheerio.Element | cheerio.Node, query: string) {
    return this.$(el).find(query).text();
  }

  private elementHref(el: cheerio.Element | cheerio.Node, query: string) {
    return this.$(el).find(query).attr('href');
  }
}
