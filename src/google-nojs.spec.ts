import * as fs from 'fs-extra';
import { GoogleNojsSERP } from './index';
import { Ad, Serp } from './models';

const root = 'test/google/nojs/';

test('GoogleNojsSERP should return empty organic array on empty html string', () => {
  expect(new GoogleNojsSERP('').serp.organic).toEqual([]);
});

describe('Parsing nojs Google page with 10 resuts', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}google-nojs.html`, { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html).serp;
  });

  test('keyword should be google', () => {
    expect(serp.keyword).toBe('google');
  });

  test('serp should have 6 results', () => {
    expect(serp.organic).toHaveLength(6);
  });

  test('Current page should be 1', () => {
    expect(serp.currentPage).toBe(1);
  });

  test('2nd result should have domain blog.google', () => {
    expect(serp.organic[1].domain).toBe('blog.google');
  });

  test('2nd result should have url https://blog.google/', () => {
    expect(serp.organic[1].url).toBe('https://blog.google/');
  });

  test('2nd result should have title "The Keyword | Google"', () => {
    expect(serp.organic[1].title).toBe('The Keyword | Google');
  });

  test('2nd result should have snippet start with "Discover all the latest about..."', () => {
    expect(serp.organic[1].snippet).toBe(
      'Discover all the latest about our products, technology, and Google culture on our official blog.',
    );
  });

  test(`1st result should have snippet start with "Search the world's information..."`, () => {
    expect(serp.organic[0].snippet).toBe(
      `Search the world's information, including webpages, images, videos and more.`,
    );
  });

  test('1st result should have inline sitelinks', () => {
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Account');
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 0, 'href'],
      '/url?q=https://www.google.com/account/about/&sa=U&ved=2ahUKEwjs8e-35ansAhWI3OAKHd2sBaIQjBAwAXoECAgQAw&usg=AOvVaw0hv4bbdFsnMBUeqJxazrC8',
    );
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'INLINE');
  });

  test('3rd result should not have sitelinks', () => {
    expect(serp).not.toHaveProperty(['organic', 2, 'sitelinks']);
  });

  test('Page should have 12 related keywords', () => {
    expect(serp.relatedKeywords).toHaveLength(12);
  });
  test('1st related keyword should be "Google account"', () => {
    expect(serp.relatedKeywords[0].keyword).toBe('Google account');
  });
  test('1st related keyword should have path', () => {
    expect(serp.relatedKeywords[0].path).toContain(
      '/search?safe=off&gl=US&pws=0&nfpr=1&ie=UTF-8&oe=UTF-8&q=Google+account',
    );
  });
});

describe('Parsing nojs Google page with 100 resuts', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}google100-nojs.html`, { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html).serp;
  });

  test('serp should have 48 results', () => {
    expect(serp.organic).toHaveLength(48);
  });

  test('all results should have a domain', () => {
    expect(serp.organic.filter((x) => x.domain === '')).toEqual([]);
  });

  test('3rd result should have url https://blog.google/', () => {
    expect(serp.organic[2].url).toBe('https://blog.google/');
  });

  test('3rd result should have title "The Keyword | Google"', () => {
    expect(serp.organic[2].title).toBe('The Keyword | Google');
  });

  test('3rd result should have snippet start with "Search for and register a domain, get hosting..."', () => {
    expect(serp.organic[2].snippet).toBe(
      'Discover all the latest about our products, technology, and Google culture on our official blog.',
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
    html = fs.readFileSync(`${root}matrix-nojs.html`, { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html).serp;
  });

  test('serp should have 10 results', () => {
    expect(serp.organic).toHaveLength(10);
  });

  test('1th result should have snippet start with "The Matrix is a 1999 American science fiction action film written and directed by the Wachowskis."', () => {
    expect(serp.organic[0].snippet).toContain(
      'The Matrix is a 1999 American science fiction action film written and directed by the Wachowskis.',
    );
  });

  test('Keyword should be "The Matrix"', () => {
    expect(serp.keyword).toBe('The Matrix');
  });

  test('1st result should have sitelinks and first sitelink should have title "Franchise"', () => {
    expect(serp.organic[0].sitelinks).toHaveLength(8);
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Franchise');
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'INLINE');
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 0, 'href'],
      '/url?q=https://en.wikipedia.org/wiki/The_Matrix_(franchise)&sa=U&ved=2ahUKEwist4jXuKzsAhUuzYUKHcU0BXMQ0gIwGHoECAcQAg&usg=AOvVaw00V_e9CfJoi_LkrOLOlC2g',
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
    html = fs.readFileSync(`${root}hotels-nojs.html`, { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html, { hotels: true }).serp;
  });

  test('Name of the first featured hotel should be "Millennium Hilton New York Downtown"', () => {
    expect(serp.hotels?.hotels[0].name).toBe('Millennium Hilton New York Downtown');
  });
  test('Rating of the first featured hotel should be 4.2', () => {
    expect(serp.hotels?.hotels[0].rating).toBe(4.2);
  });
  test('Number of votes of the first featured hotel should be 2753', () => {
    expect(serp.hotels?.hotels[0].votes).toBe(2753);
  });
  test('Number of stars of the first featured hotel should be 4', () => {
    expect(serp.hotels?.hotels[0].stars).toBe(4);
  });
  test('Description of the first featured hotel should be "Sleek hotel with dining, a spa & a pool"', () => {
    expect(serp.hotels?.hotels[0].description).toBe('Sleek hotel with dining, a spa & a pool');
  });
  test.skip('Featured review of the first featured hotel should be "Hard to beat LOCATION CLEAN SMALL rooms ( NYC size) Pleasant staff"', () => {
    expect(serp.hotels?.hotels[0].featuredReview).toBe(
      'Hard to beat LOCATION CLEAN SMALL rooms ( NYC size) Pleasant staff',
    );
  });
  test(`MoreInfoLink of the first featured hotel should be`, () => {
    expect(serp.hotels?.hotels[0].moreInfoLink).toBe(
      'https://www.google.com/search?safe=off&gl=US&pws=0&nfpr=1&ie=UTF-8&oe=UTF-8&q=Millennium+Hilton+New+York+Downtown+New+York,+NY&ludocid=17735751118331707919&ibp=gwp;0,7&lsig=AB86z5XzVhvRx3-AsRIbzNDblrqP&phdesc=J519NBuV2wc&sa=X&ved=2ahUKEwiB86--vazsAhWq3OAKHVlZB08QvS4wAHoECBQQBA',
    );
  });
  test.skip(`The 2nd featured hotel should have amenities "Free Wi-Fi"`, () => {
    expect(serp.hotels?.hotels[1].amenities).toBe('Free Wi-Fi');
  });

  test(`There should be a moreHotels link and it should have href "/search?sa=N&gl=us..."`, () => {
    expect(serp.hotels?.moreHotels).toBe(
      'https://www.google.com/search?safe=off&gl=US&pws=0&nfpr=1&ie=UTF-8&oe=UTF-8&ei=b_KCX8H_Nqq5gwfZsp34BA&q=hotels+NYC&rlst=f&sa=X&ved=2ahUKEwiB86--vazsAhWq3OAKHVlZB08QjGowAHoECBQQDA',
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
    html = fs.readFileSync(`${root}domain-nojs.html`, { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html, { ads: true }).serp;
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
    expect(adwordsTop).toHaveProperty(['0']);
    expect(adwordsTop).toHaveProperty(['0', 'position'], 1);
    expect(adwordsTop).toHaveProperty(['0', 'title'], 'Google Domain Names - Domains, Custom Emails & Sites');
    expect(adwordsTop).toHaveProperty(
      ['0', 'url'],
      'http://www.google.com/aclk?sa=l&ai=DChcSEwid7uyi36zsAhXJmtUKHfkGDCEYABABGgJ3cw&sig=AOD64_174-onC0FNonRouW05eLvgf-ichg&ved=2ahUKEwiK5Oai36zsAhWRzIUKHXkhD1oQ0Qx6BAgVEAE&adurl=',
    );
    expect(adwordsTop).toHaveProperty(['0', 'domain'], 'www.google.com');
    expect(adwordsTop).toHaveProperty(
      ['0', 'snippet'],
      'Find a Domain, Get Custom Emails & Create a Site With Google. Get Started Today! Faster & Reliable Connection to Your Website, With Same DNS Servers as Google. Free Private Registration. 24-7 Support. New Domain Name Endings.',
    );
    expect(adwordsTop).toHaveProperty(['0', 'linkType'], 'LANDING');
  });

  test(`first top ad card sitelink`, () => {
    expect(adwordsTop).toHaveProperty(['1', 'sitelinks', '1']);
    expect(adwordsTop).toHaveProperty(['1', 'sitelinks', '1', 'title'], 'Customize Easily');
    expect(adwordsTop).toHaveProperty(
      ['1', 'sitelinks', '1', 'href'],
      'http://www.google.com/aclk?sa=l&ai=DChcSEwid7uyi36zsAhXJmtUKHfkGDCEYABAGGgJ3cw&sig=AOD64_2l9W5FDQtnwFl-SAL_GR7II4LX8A&ved=2ahUKEwiK5Oai36zsAhWRzIUKHXkhD1oQpigoAXoECBYQBA&adurl=',
    );
    expect(adwordsTop).toHaveProperty(['1', 'sitelinks', '1', 'type'], 'INLINE');
  });
});

describe('Parsing no results nojs page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}no-results-nojs.html`, { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html).serp;
  });

  test('There should be 0 results', () => {
    expect(serp.organic).toHaveLength(0);
    expect(serp.error).toBe('No results page');
  });
});

describe('Testing optional feature parsing', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}google-nojs.html`, { encoding: 'utf8' });
    serp = new GoogleNojsSERP(html, {}).serp;
  });

  test('Do not detect any module parsing', () => {
    expect(serp.organic).toHaveLength(0);
    expect(serp.relatedKeywords).toHaveLength(0);
    expect(serp).not.toHaveProperty(['hotels']);
    expect(serp).not.toHaveProperty(['adwords']);
    expect(serp).not.toHaveProperty(['error']);
  });
});
