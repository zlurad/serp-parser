import * as fs from 'fs-extra';
import { GoogleNojsSERP } from './google-nojs';
import { Ad, Serp } from './models';

test('GoogleNojsSERP should return empty organic array on empty html string', () => {
  expect(new GoogleNojsSERP('').serp.organic).toEqual([]);
});

describe('Parsing nojs Google page with 10 resuts', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/google-nojs.html', { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html).serp;
  });

  test('Page should have 16,370,000,000 results', () => {
    expect(serp.totalResults).toBe(16370000000);
  });

  test('serp should have 7 results', () => {
    expect(serp.organic).toHaveLength(7);
  });

  test('Current page should be 1', () => {
    expect(serp.currentPage).toBe(1);
  });

  test('Page should have 8 related keywords', () => {
    expect(serp.relatedKeywords).toHaveLength(8);
  });
  test('1st related keyword should be "google search"', () => {
    expect(serp.relatedKeywords[0].keyword).toBe('google search');
  });
  test('1st related keyword should have path', () => {
    expect(serp.relatedKeywords[0].path).toBe(
      '/search?safe=off&gl=US&pws=0&nfpr=1&ie=UTF-8&oe=UTF-8&q=google+search&sa=X&ved=0ahUKEwjvz7ySg9XfAhVTBWMBHZxaCVUQ1QIIUCgA',
    );
  });

  test(`Link to 2nd page should have path 
  "/search?q=google&safe=off&gl=US&pws=0&nfpr=1&ie=UTF-8&oe=UTF-8&prmd=ivnsa&ei=48kvXK_SDNOKjLsPnLWlqAU&start=10&sa=N"`, () => {
    expect(serp.pagination[1].path).toBe(
      '/search?q=google&safe=off&gl=US&pws=0&nfpr=1&ie=UTF-8&oe=UTF-8&prmd=ivnsa&ei=48kvXK_SDNOKjLsPnLWlqAU&start=10&sa=N',
    );
  });

  test('5th result should have domain domains.google', () => {
    expect(serp.organic[4].domain).toBe('domains.google');
  });

  test('5th result should have url https://domains.google/', () => {
    expect(serp.organic[4].url).toBe('https://domains.google/');
  });
  test(`1st result should have cachedUrl
   "/url?q=http://webcache.googleusercontent.com/search%3Fq%3Dcache:y14FcUQOGl4J:https://www.google.com/%252Bgoogle%26safe%3Doff%26gl%3DUS%26pws%3D0%26nfpr%3D1%26oe%3DUTF-8%26hl%3Den%26ct%3Dclnk&sa=U&ved=0ahUKEwjvz7ySg9XfAhVTBWMBHZxaCVUQIAgYMAA&usg=AOvVaw1kaR7fW2s73jKiXE6GOjo-"`, () => {
    expect(serp.organic[0].cachedUrl).toBe(
      '/url?q=http://webcache.googleusercontent.com/search%3Fq%3Dcache:y14FcUQOGl4J:https://www.google.com/%252Bgoogle%26safe%3Doff%26gl%3DUS%26pws%3D0%26nfpr%3D1%26oe%3DUTF-8%26hl%3Den%26ct%3Dclnk&sa=U&ved=0ahUKEwjvz7ySg9XfAhVTBWMBHZxaCVUQIAgYMAA&usg=AOvVaw1kaR7fW2s73jKiXE6GOjo-',
    );
  });
  test(`1st result should have similarUrl
   "/search?safe=off&gl=US&pws=0&nfpr=1&ie=UTF-8&oe=UTF-8&q=related:https://www.google.com/+google&tbo=1&sa=X&ved=0ahUKEwjvz7ySg9XfAhVTBWMBHZxaCVUQHwgZMAA"`, () => {
    expect(serp.organic[0].similarUrl).toBe(
      '/search?safe=off&gl=US&pws=0&nfpr=1&ie=UTF-8&oe=UTF-8&q=related:https://www.google.com/+google&tbo=1&sa=X&ved=0ahUKEwjvz7ySg9XfAhVTBWMBHZxaCVUQHwgZMAA',
    );
  });

  test('5th result should have title "Google Domains - Google"', () => {
    expect(serp.organic[4].title).toBe('Google Domains - Google');
  });

  test('5th result should have snippet start with "Search for and register a domain, get hosting..."', () => {
    expect(serp.organic[4].snippet).toBe(
      'Search for and register a domain, get hosting, and build a site with Google Domains. The best of the internet backed by the security of Google.',
    );
  });

  test('1st result should have card sitelinks', () => {
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Images');
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 0, 'href'],
      '/url?q=https://www.google.com/imghp%3Fhl%3Den&sa=U&ved=0ahUKEwjvz7ySg9XfAhVTBWMBHZxaCVUQjBAIHDAB&usg=AOvVaw3Iif_Yr2t3-UMzTSEzaGi5',
    );
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 0, 'snippet'],
      'AllImages. Account &middot; Assistant &middot; Search &middot; Maps &middot; YouTube ...',
    );
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'CARD');
  });

  test('3rd result should not have sitelinks', () => {
    expect(serp.organic[2].hasOwnProperty('sitelinks')).toBeFalsy();
  });

  test('Keyword should be google', () => {
    expect(serp.keyword).toBe('google');
  });
});

describe('Parsing nojs Google page with 100 resuts', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/google100-nojs.html', { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html).serp;
  });

  test('serp should have 97 results', () => {
    expect(serp.organic).toHaveLength(97);
  });

  test('all results should have domain domains.google', () => {
    expect(serp.organic.filter(x => x.domain === '')).toEqual([]);
  });

  test('4th result should have url https://domains.google/', () => {
    expect(serp.organic[3].url).toBe('https://domains.google/');
  });

  test('4th result should have title "Google Domains - Google"', () => {
    expect(serp.organic[3].title).toBe('Google Domains - Google');
  });

  test('4th result should have snippet start with "Search for and register a domain, get hosting..."', () => {
    expect(serp.organic[3].snippet).toBe(
      'Search for and register a domain, get hosting, and build a site with Google Domains. The best of the internet backed by the security of Google.',
    );
  });

  test('Keyword should be google', () => {
    expect(serp.keyword).toBe('google');
  });
});
describe('Parsing nojs "The Matrix" search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/matrix-nojs.html', { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html).serp;
  });

  test('serp should have 10 results', () => {
    expect(serp.organic).toHaveLength(10);
  });

  test('1th result should have snippet start with "Gloria Foster in The Matrix (1999) Carrie-Anne Moss..."', () => {
    expect(serp.organic[0].snippet).toBe(
      'Gloria Foster in The Matrix (1999) Carrie-Anne Moss in The Matrix (1999) Laurence Fishburne in The Matrix (1999) Joe Pantoliano in The Matrix (1999) Keanu ...',
    );
  });

  test('Keyword should be "The Matrix"', () => {
    expect(serp.keyword).toBe('The Matrix');
  });

  test('1st result should have sitelinks and first sitelink should have title "Plot Summary"', () => {
    expect(serp.organic[0].sitelinks).toHaveLength(4);
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Plot Summary');
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'INLINE');
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 0, 'href'],
      '/url?q=https://www.imdb.com/title/tt0133093/plotsummary&sa=U&ved=0ahUKEwj1saWR2tnfAhUC3uAKHTZcCLcQ0gIIGigAMAA&usg=AOvVaw2YlqUvAZ4bHjCBnKL6SwFY',
    );
  });

  test('testing videos property for non existent results', () => {
    expect(serp.videos).toBeUndefined();
  });
  test('testing thumbnailGroups property for non existent results', () => {
    expect(serp.thumbnailGroups).toBeUndefined();
  });
});

describe('Parsing Hotels-nojs search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/hotels-nojs.html', { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html).serp;
  });

  test('Name of the first featured hotel should be "Row NYC"', () => {
    expect(serp.hotels?.hotels[0].name).toBe('Row NYC');
  });
  test('Rating of the first featured hotel should be 3.7', () => {
    expect(serp.hotels?.hotels[0].rating).toBe(3.7);
  });
  test('Number of votes of the first featured hotel should be 6489', () => {
    expect(serp.hotels?.hotels[0].votes).toBe(6489);
  });
  test('Number of stars of the first featured hotel should be 2', () => {
    expect(serp.hotels?.hotels[0].stars).toBe(2);
  });
  test('Description of the first featured hotel should be "Hip hotel with a trendy food court"', () => {
    expect(serp.hotels?.hotels[0].description).toBe('Hip hotel with a trendy food court');
  });
  test('Featured review of the first featured hotel should be "Hard to beat LOCATION CLEAN SMALL rooms ( NYC size) Pleasant staff"', () => {
    expect(serp.hotels?.hotels[0].featuredReview).toBe(
      'Hard to beat LOCATION CLEAN SMALL rooms ( NYC size) Pleasant staff',
    );
  });
  test(`MoreInfoLink of the first featured hotel should be
  "/search?sa=N&gl=us&hl=en&ie=UTF-8&q=Row+NYC+New+York,+NY&ludocid=2391828921476118880&ved=0ahUKEwj1g4bytYLhAhUDnRoKHbWnDUcQ_pABCEIwAA"`, () => {
    expect(serp.hotels?.hotels[0].moreInfoLink).toBe(
      '/search?sa=N&gl=us&hl=en&ie=UTF-8&q=Row+NYC+New+York,+NY&ludocid=2391828921476118880&ved=0ahUKEwj1g4bytYLhAhUDnRoKHbWnDUcQ_pABCEIwAA',
    );
  });
  test(`The 2nd featured hotel should have amenities "Free Wi-Fi"`, () => {
    expect(serp.hotels?.hotels[1].amenities).toBe('Free Wi-Fi');
  });

  test(`There should be a moreHotels link and it should have href
  "/search?sa=N&gl=us&hl=en&ie=UTF-8&q=hotels+NYC&npsic=0&rlst=f&rlha=1&rlla=0&rlhsc=Ch4IyamtyMPjxbh7COaI4bOI7frLRAiMk72-hdue-zkwAQ&rllag=40755324,-73968018,1746&ved=0ahUKEwj1g4bytYLhAhUDnRoKHbWnDUcQjGoIVw"`, () => {
    expect(serp.hotels?.moreHotels).toBe(
      '/search?sa=N&gl=us&hl=en&ie=UTF-8&q=hotels+NYC&npsic=0&rlst=f&rlha=1&rlla=0&rlhsc=Ch4IyamtyMPjxbh7COaI4bOI7frLRAiMk72-hdue-zkwAQ&rllag=40755324,-73968018,1746&ved=0ahUKEwj1g4bytYLhAhUDnRoKHbWnDUcQjGoIVw',
    );
  });
});

describe('Testing functions', () => {
  let serp: Serp;

  beforeAll(() => {
    serp = new GoogleNojsSERP('<body class="srp"><div></div></body>').serp;
  });

  test('testing getResults and getTime function for non existent results', () => {
    expect(serp.totalResults).toBeUndefined();
    expect(serp.timeTaken).toBeUndefined();
  });

  test('testing getHotels function for non existent results', () => {
    expect(serp.hotels).toBeUndefined();
  });
});

describe('Parsing Domain-nojs page', () => {
  let html: string;
  let serp: Serp;
  let adwords: { adwordsTop?: Ad[]; adwordsBottom?: Ad[] } | undefined;
  let adwordsTop: Ad[] | undefined;
  let adwordsBottom: Ad[] | undefined;

  beforeAll(() => {
    html = fs.readFileSync('test/domain-nojs.html', { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html).serp;
    adwords = serp.adwords;
    if (adwords) {
      adwordsTop = adwords.adwordsTop;
      adwordsBottom = adwords.adwordsBottom;
    }
  });

  test('There should be all ads', () => {
    expect(adwords).toBeDefined();
    expect(adwordsTop).toBeDefined();
    expect(adwordsBottom).toBeUndefined();
  });

  test('Testing first ad', () => {
    if (adwordsTop) {
      const ad = adwordsTop[0];
      expect(ad.position).toBe(1);
      expect(ad.title).toBe('Google Domains - Official Site | Fast & Secure Infrastructure');
      expect(ad.url).toBe(
        'http://www.google.com/aclk?sa=l&ai=DChcSEwiE9bnLr4LhAhVlM9MKHbOVCnAYABAAGgJ3Yg&sig=AOD64_1GGQgzaMznzDlCoRHMnpF57a6iKg&ved=0ahUKEwjyxLXLr4LhAhXp6eAKHaKPDQ4Q0QwIEg&adurl=',
      );
      expect(ad.domain).toBe('www.google.com');
      expect(ad.snippet).toBe(
        'Shop from a wide selection of domain name endings that will help you stand out on the web. Faster and reliable connection to your website, with same DNS servers as...',
      );
      expect(ad.linkType).toBe('LANDING');
    }
  });

  test(`Test first top ad card sitelink`, () => {
    if (adwordsTop) {
      const sitelink = adwordsTop[0].sitelinks[1];
      expect(sitelink.title).toBe('Stand out with .dev');
      expect(sitelink.href).toBe(
        'http://www.google.com/aclk?sa=l&ai=DChcSEwiE9bnLr4LhAhVlM9MKHbOVCnAYABACGgJ3Yg&sig=AOD64_33ueZUCXOl2-2F8tXhISqo7efG8Q&ved=0ahUKEwjyxLXLr4LhAhXp6eAKHaKPDQ4QqyQIGCgB&adurl=',
      );
      expect(sitelink.type).toBe('CARD');
    }
  });
});

describe('Parsing no results nojs page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/no-results-nojs.html', { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html).serp;
  });

  test('There should be 0 results', () => {
    expect(serp.organic).toHaveLength(0);
    expect(serp.error).toBe('No results page');
  });
});
