import * as cheerio from 'cheerio';
import { Ad, Hotel, RelatedKeyword, Result, Serp, Sitelink, SitelinkType } from './models';
import * as utils from './utils';

export class BingNojsSERP {
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

  private parse(options?: Record<string, boolean>) {
    const $ = this.$;
    const CONFIG = {
      noResultsNojs: '#b_results li.b_no',
    };
    if ($(CONFIG.noResultsNojs).length === 1) {
      this.serp.error = 'No results page';
      // No need to parse anything for no results page
      return;
    }

    if ($('body').attr('onload')) {
      this.parseBing(options);
    } else {
      this.serp.error = 'Not Bing nojs page';
      return;
    }
  }

  private parseBing(opt?: Record<string, boolean>) {
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
      // results: '#b_results li.b_algo h2 > a',
      results: '#b_results li.b_algo',
    };

    $(CONFIG.results).each((index, element) => {
      const position = index + 1;
      const link = $(element).find('h2 > a');
      const url = link.prop('href');
      const domain = utils.getDomain(url);
      const title = link.text();
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

    text = this.$(element).find('.b_caption > p').text();
    if (!text) {
      text = this.$(element).find('.b_mText p').text();
    }

    return text.replace(/(&nbsp;)/g, ' ').replace(/ +(?= )/g, '');
  }

  private parseSitelinks(element: cheerio.Element | cheerio.Node, result: Result) {
    const $ = this.$;
    const CONFIG = {
      inline: '.b_vlist2col.b_deep li a',
    };

    const links = $(element).find(CONFIG.inline);

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

    if (!$('#b_results > li.b_ans.b_mop .b_ilhTitle').text().startsWith('Hotels')) {
      return;
    }

    const hotelsFeature = $('#b_results > li.b_ans.b_mop');
    // TODO: SPLIT FURTHER TO getSearchFilters, getHotelOffers

    const CONFIG = {
      hotelOffers: '.b_scard',
      hotelStars: '.b_factrow',
      hotelStarsRegex: /\d(?=-star)/,
      name: '.lc_content h2',
      rating: '.csrc.sc_rc1',
      ratingRegex: /\d*\.?,?\d/,
      votes: '.b_factrow > span[title]',
      votesRegex: /\((.*)\)/,
    };
    const hotels: Hotel[] = [];

    // HOTELS
    const hotelOffers = hotelsFeature.find(CONFIG.hotelOffers);
    hotelOffers.each((ind, elem) => {
      const name = this.elementText(elem, CONFIG.name);
      const ratingText = this.$(elem).find(CONFIG.rating).attr('aria-label') as string;
      const ratingMatch = (ratingText.match(CONFIG.ratingRegex) || ['0.0'])[0];
      const rating = parseFloat(ratingMatch.replace(',', '.'));
      // TODO regex replace all
      const votesText = this.$(elem).find(CONFIG.votes).first().attr('title') as string;
      const votesNumber = (votesText.match(CONFIG.votesRegex) || [0, 0])[1];
      const hotelStars = utils.getFirstMatch($($(elem).find(CONFIG.hotelStars)[1]).text(), CONFIG.hotelStarsRegex);
      const stars = parseInt(hotelStars, 10);
      // const desc html
      const description = '';
      const moreInfoLink = '';

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
      moreHotels: '',
    };
  }

  private getAdwords() {
    const $ = this.$;
    const serp = this.serp;
    const CONFIG = {
      top: 'li.b_ad',
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
      ads: 'li.b_ad > ul > li',
      snippet: '.b_caption p',
      title: 'h2 a',
      url: 'h2 a',
    };

    $(CONFIG.ads).each((i, e) => {
      const title = this.elementText(e, CONFIG.title);
      const url = this.elementHref(e, CONFIG.url) as string;
      const domain = utils.getDomain(url, 'https://www.bingadservices.com/pagead');
      const linkType = utils.getLinkType(url, 'https://www.bingadservices.com/pagead');
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
      sitelinks: '.ad_vsltitle a',
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
