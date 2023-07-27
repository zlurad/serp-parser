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

  test('serp should have 10 results', () => {
    expect(serp.organic).toHaveLength(10);
  });

  test('Current page should be 1', () => {
    expect(serp.currentPage).toBe(1);
  });

  test('8th result should have domain maps.google.com', () => {
    expect(serp.organic[7].domain).toBe('maps.google.com');
  });

  test('8th result should have url https://maps.google.com/', () => {
    expect(serp.organic[7].url).toBe('https://maps.google.com/');
  });

  test('2nd result should have title "Google Account"', () => {
    expect(serp.organic[1].title).toBe('Google Account');
  });

  test('3rd result should have snippet start with "Find local businesses, view maps and get driving directions in Google Maps.', () => {
    expect(serp.organic[2].snippet).toBe(
      'Find local businesses, view maps and get driving directions in Google Maps.',
    );
  });

  test(`1st result should have snippet start with "Search the world's information..."`, () => {
    expect(serp.organic[0].snippet).toBe(
      `Search the world's information, including webpages, images, videos and more. Google has many special features to help you find exactly what you're looking for.`,
    );
  });

  test.skip('1st result should have inline sitelinks', () => {
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

  test('Page should have 8 related keywords', () => {
    expect(serp.relatedKeywords).toHaveLength(8);
  });
  test('2nd related keyword should be "Google account"', () => {
    expect(serp.relatedKeywords[1].keyword).toBe('Google account');
  });
  test('1st related keyword should have path', () => {
    expect(serp.relatedKeywords[0].path).toContain(
      '/search?safe=off&gl=US&pws=0&nfpr=1&q=www.google+search+web&sa=X&ved=2ahUKEwjkq82NgKX_AhXGCTQIHTcgBdAQ1QJ6BAgAEAI',
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

  test('serp should have 99 results', () => {
    expect(serp.organic).toHaveLength(99);
  });

  test('all results should have a domain', () => {
    expect(serp.organic.filter((x) => x.domain === '')).toEqual([]);
  });

  test('3rd result should have url https://www.google.com/maps', () => {
    expect(serp.organic[2].url).toBe('https://www.google.com/maps');
  });

  test('3rd result should have title "Google Maps"', () => {
    expect(serp.organic[2].title).toBe('Google Maps');
  });

  test('3rd result should have snippet start with "Find local businesses, view maps and get driving directions in Google Maps."', () => {
    expect(serp.organic[2].snippet).toBe(
      'Find local businesses, view maps and get driving directions in Google Maps.',
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

  test('1th result should have snippet start with "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate ..."', () => {
    expect(serp.organic[0].snippet).toContain(
      'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate ...',
    );
  });

  test('Keyword should be "The Matrix"', () => {
    expect(serp.keyword).toBe('The Matrix');
  });

  test('1st result should have sitelinks and first sitelink should have title "Full Cast & Crew"', () => {
    expect(serp.organic[0].sitelinks).toHaveLength(4);
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Full Cast & Crew');
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'INLINE');
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 0, 'href'],
      '/url?q=https://www.imdb.com/title/tt0133093/fullcredits&sa=U&ved=2ahUKEwi7xNWPgaX_AhW0AjQIHU5BCxcQ0gJ6BAgCEAY&usg=AOvVaw0TZoysIWu54_cGsPGk6fWH',
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

  test('Name of the first featured hotel should be "The Manhattan at Times Square Hotel"', () => {
    expect(serp.hotels?.hotels[0].name).toBe('The Manhattan at Times Square Hotel');
  });
  test('Rating of the first featured hotel should be 3.1', () => {
    expect(serp.hotels?.hotels[0].rating).toBe(3.1);
  });
  test('Number of votes of the first featured hotel should be 6738', () => {
    expect(serp.hotels?.hotels[0].votes).toBe(6738);
  });
  test.skip('Number of stars of the first featured hotel should be 3', () => {
    expect(serp.hotels?.hotels[0].stars).toBe(3);
  });
  test.skip('Description of the first featured hotel should be "Sleek hotel with dining, a spa & a pool"', () => {
    expect(serp.hotels?.hotels[0].description).toBe('Sleek hotel with dining, a spa & a pool');
  });
  test.skip('Featured review of the first featured hotel should be "Hard to beat LOCATION CLEAN SMALL rooms ( NYC size) Pleasant staff"', () => {
    expect(serp.hotels?.hotels[0].featuredReview).toBe(
      'Hard to beat LOCATION CLEAN SMALL rooms ( NYC size) Pleasant staff',
    );
  });
  test(`MoreInfoLink of the first featured hotel should be`, () => {
    expect(serp.hotels?.hotels[0].moreInfoLink).toBe(
      '/search?safe=off&gl=US&pws=0&nfpr=1&q=The+Manhattan+at+Times+Square+Hotel+New+York,+NY&ludocid=16204309452407439394&gsas=1&lsig=AB86z5W5IELJXXmYSDMSuyFLF0jj&phdesc=RZ6aC3DM1OQ&sa=X&ved=2ahUKEwjmyqPugKX_AhW-EjQIHeUhBJ8QvS56BAgGEAQ',
    );
  });
  test.skip(`The 2nd featured hotel should have amenities "Free Wi-Fi"`, () => {
    expect(serp.hotels?.hotels[1].amenities).toBe('Free Wi-Fi');
  });

  test(`There should be a morePlaces link and it should have href "/search?sa=N&gl=us..."`, () => {
    expect(serp.hotels?.moreHotels).toBe(
      '/search?safe=off&gl=US&pws=0&nfpr=1&tbs=lf:1,lf_ui:6&q=hotels+NYC&rlst=f&rflfq=1&num=10&rlha=1&uule=w+CAIQICISU2FuIEZyYW5jaXNjbywgVVNB&sa=X&ved=2ahUKEwjmyqPugKX_AhW-EjQIHeUhBJ8QjGp6BAgGEAw',
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
    expect(adwordsTop).toHaveProperty(['0', 'title'], 'Buy Domain Names - .com Domains From $2.99');
    expect(adwordsTop).toHaveProperty(
      ['0', 'url'],
      'https://www.google.com/aclk?sa=l&ai=DChcSEwj8ivPI_qT_AhUgFq0GHdcOBWMYABABGgJwdg&sig=AOD64_3pUOf0yQKvAKp3jxz_NQ6H7cqqUA&ved=2ahUKEwjcqe3I_qT_AhUcMDQIHTv7CGkQ0Qx6BAgOEAE&adurl=',
    );
    expect(adwordsTop).toHaveProperty(['0', 'domain'], 'www.google.com');
    expect(adwordsTop).toHaveProperty(
      ['0', 'snippet'],
      'Domains, Websites, Email, Hosting, Security & More. Everything You Need To Succeed Online.',
    );
    expect(adwordsTop).toHaveProperty(['0', 'linkType'], 'LANDING');
  });

  test.skip(`first top ad card sitelink`, () => {
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
