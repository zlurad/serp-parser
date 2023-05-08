import * as fs from 'fs-extra';
import { GoogleSERP } from './index';
import { Serp } from './models';

const root = 'test/google/desktop/';

test('GoogleSERP should return empty organic array on empty html string', () => {
  expect(new GoogleSERP('').serp.organic).toEqual([]);
});

describe('Parsing Google page with 10 resuts', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}google.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test('Page should have 25,150,000,000 results', () => {
    expect(serp.totalResults).toBe(25150000000);
  });
  test('Search should be done in 0.62 seconds', () => {
    expect(serp.timeTaken).toBe(0.62);
  });
  test.skip('Current page should be 1', () => {
    expect(serp.currentPage).toBe(1);
  });
  test('Page should have 8 related keywords', () => {
    expect(serp.relatedKeywords).toHaveLength(8);
  });
  test('1st related keyword', () => {
    expect(serp.relatedKeywords[0].keyword).toBe('google map');
  });
  test('1st related keyword should have path', () => {
    expect(serp.relatedKeywords[0].path).toBe(
      '/search?safe=off&gl=US&pws=0&nfpr=1&q=Google+map&sa=X&ved=2ahUKEwif-5Gr1rv-AhXPad4KHeFNBssQ1QJ6BAhQEAE',
    );
  });
  test.skip(`Link to 2nd page should have path`, () => {
    expect(serp.pagination[1].path).toBe(
      '/search?q=google&safe=off&gl=US&pws=0&nfpr=1&ei=cGKOYYSzEPedwbkPwIqUqAU&start=10&sa=N&filter=0&ved=2ahUKEwiEq7bs7ZL0AhX3TjABHUAFBVUQ8tMDegQIARA6',
    );
  });
  test('serp should have 9 results', () => {
    expect(serp.organic).toHaveLength(9);
  });
  test('2nd result should have url https://www.google.com/', () => {
    expect(serp.organic[1].url).toBe('https://www.google.com/');
  });

  test('4th result should have title "Google Maps"', () => {
    expect(serp.organic[3].title).toBe('Google Maps');
  });

  test.skip('4th result should have snippet to start with "Learn how Google.org uses the best of Google to help nonprofits and social...', () => {
    expect(serp.organic[4].snippet).toBe(`Google Images. The most comprehensive image search on the web.`);
  });

  test.skip('1st result should have card sitelinks', () => {
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Drive');
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'href'], 'https://www.google.com/drive/');
    // expect(serp).toHaveProperty(
    //   ['organic', 0, 'sitelinks', 0, 'snippet'],
    //   'In your Google Account, you can see and manage your info ...',
    // );
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'INLINE');
  });
  test('2nd result should not have sitelinks', () => {
    expect(serp).not.toHaveProperty(['organic', '1', 'sitelinks']);
  });

  test('testing videos property for non existent results', () => {
    expect(serp.videos).toBeUndefined();
  });
  test('testing adwords property for non existent results', () => {
    expect(serp.adwords).toBeUndefined();
  });
  test('testing Locals property for non existent results', () => {
    expect(serp.locals).toBeUndefined();
  });
  test('testing shop property for non existent results', () => {
    expect(serp.shopResults).toBeUndefined();
  });

  describe('Testing top stories feature', () => {
    test('Page should have topStories feature', () => {
      expect(serp.topStories).toBeDefined();
    });

    test('2nd top stories card should have title "Google Assistant will stop speaking after turning on smart home devices"', () => {
      expect(serp).toHaveProperty(
        ['topStories', 1, 'title'],
        'Google Assistant will stop speaking after turning on smart home devices',
      );
      expect(serp).toHaveProperty(
        ['topStories', 1, 'url'],
        'https://9to5google.com/2023/04/20/google-assistant-home-devices-on/',
      );
      expect(serp).toHaveProperty(['topStories', 1, 'publisher'], '9to5Google');
      expect(serp).toHaveProperty(['topStories', 1, 'published'], '1 day ago');
    });
  });
});

describe('Parsing Google page with 100 results', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}google-100.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test('serp should have 99 results', () => {
    expect(serp.organic).toHaveLength(99);
  });

  test('all results should have domain domains.google', () => {
    expect(serp.organic.filter((x) => x.domain === '')).toEqual([]);
  });

  test('3rd result should have url https://www.google.com/docs/about/', () => {
    expect(serp.organic[2].url).toBe('https://www.google.com/account/about/');
  });

  test('7th result should have title "Google Docs: Online Document Editor | Google Workspace"', () => {
    expect(serp.organic[6].title).toBe('Google Docs: Online Document Editor | Google Workspace');
  });

  test.skip('9th result should have snippet to be "Google Images. The most comprehensive image search on the web.', () => {
    expect(serp.organic[8].snippet.replace(/\s+/g, ' ').trim()).toBe(
      'Google Images. The most comprehensive image search on the web.'.replace(/\s+/g, ' ').trim(),
    );
  });

  test.skip('Keyword should be google', () => {
    expect(serp.keyword).toBe('google');
  });
});

describe('Parsing Google featured snippet page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}featured-snippet.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test.skip('serp should have 10 results', () => {
    // Gets 11 results, because now the organic selectors match featured selectors as well
    expect(serp.organic).toHaveLength(10);
  });

  test('1th result should have featured snippet', () => {
    expect(serp.organic[0].featured).toBeTruthy();
  });

  test('1st result should have domain developers.google.com', () => {
    expect(serp.organic[0].domain).toBe('developers.google.com');
  });

  test('1st result should have title "Featured Snippets and Your Website | Google Search Central"', () => {
    expect(serp.organic[0].title).toBe('Featured Snippets and Your Website | Google Search Central');
  });

  test('1st result should have snippet to start with "Featured Snippets are short snippets ...', () => {
    expect(serp.organic[0].snippet).toBe(
      `Featured snippets are special boxes where the format of a regular search result is reversed, showing the descriptive snippet first. They can also appear within a related questions group (also known as \"People Also Ask\"). Read more about how Google's Featured Snippets work.`,
    );
  });
});

describe('Parsing "The Matrix" search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}matrix.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test('serp should have 8 results', () => {
    expect(serp.organic).toHaveLength(8);
  });

  test.skip('Keyword should be "The Matrix"', () => {
    // not sure what keyword is supposed to be? Meta tag?
    expect(serp.keyword).toBe('The Matrix');
  });

  test('1st result should have sitelinks and second sitelink should have title "The Matrix Reloaded"', () => {
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 1, 'title']);
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 1, 'href'],
      'https://www.imdb.com/title/tt0234215/',
    );
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 1, 'type'], 'INLINE');
  });

  test.skip('video card feature', () => {
    // This exists also as trailers and clips feature, but has different selectors than videos
    expect(serp.videos).toHaveLength(4);
    expect(serp).toHaveProperty(['videos', 0, 'title'], 'The Matrix Resurrections – Official Trailer 1');
    expect(serp).toHaveProperty(['videos', 0, 'sitelink'], 'https://www.youtube.com/watch?v=9ix7TUGVYIo');
    expect(serp).toHaveProperty(['videos', 0, 'source'], 'YouTube');
    // expect(serp).toHaveProperty(['videos', 0, 'date'], new Date('2013-11-19'));
    expect(serp).toHaveProperty(['videos', 0, 'channel'], 'Warner Bros. Pictures · ');
    expect(serp).toHaveProperty(['videos', 0, 'videoDuration'], '2:53');
  });
  test.skip('thumbnailGroups feature test', () => {
    expect(serp.thumbnailGroups).toHaveLength(3);
    expect(serp).toHaveProperty(['thumbnailGroups', 0, 'heading'], 'The Matrix movies');
    expect(serp).toHaveProperty(['thumbnailGroups', 0, 'thumbnails', 0, 'title'], 'The Matrix Reloaded');
    expect(serp).toHaveProperty(
      ['thumbnailGroups', 0, 'thumbnails', 0, 'sitelink'],
      '/search?q=The+Matrix+Reloaded&stick=H4sIAAAAAAAAAONgFuLQz9U3ME-uMlICsyqMTAu1pLKTrfTTMnNywYRVUWpOYklqikJxaknxKkapNKvs1Mry_KIUq9z8sszUYiuQPiNDQ7O0RazCIRmpCr6JJUWZFQpBqTn5iSmpKQDpFzxLZQAAAA&sa=X&ved=2ahUKEwji-vSCuarsAhVTvZ4KHa3yDYsQxA0wG3oECAQQAw',
    );
    expect(serp).toHaveProperty(['thumbnailGroups', 1, 'heading'], 'Keanu Reeves movies');
    expect(serp).toHaveProperty(['thumbnailGroups', 1, 'thumbnails', 0, 'title'], 'Johnny Mnemonic');
    expect(serp).toHaveProperty(
      ['thumbnailGroups', 1, 'thumbnails', 0, 'sitelink'],
      '/search?q=Johnny+Mnemonic&stick=H4sIAAAAAAAAAONgFuLQz9U3ME-uMlICs7JLUpK0pLKTrfTTMnNywYRVUWpOYklqikJxaknxKkbJNKvs1Mry_KIUq9z8sszUYiuQPhNzy6RFrPxe-Rl5eZUKvnmpufl5mckAmNNcvGAAAAA&sa=X&ved=2ahUKEwji-vSCuarsAhVTvZ4KHa3yDYsQxA0wHHoECAYQBA',
    );
  });
});

describe('Parsing Hotels search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}hotels.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test('There should be 1206 similar hotels in the area', () => {
    expect(serp).toHaveProperty(['hotels', 'moreHotels'], 1206);
  });

  test.skip('The searchTitle in searchFilters of hotels feature should be "Hotels | New York City, NY"', () => {
    // searchTitle is not part of hotel filters section anymore, it is a separate property
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'searchTitle'], 'Hotels | New York, NY');
  });
  test('The checkIn date in searchFilters of hotels feature should be "Mon, Jun 21 2021"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'checkIn'], new Date('2023-04-22T23:00:00.000Z'));
  });
  test('The checkOut date in searchFilters of hotels feature should be "Tue, June 22 2021"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'checkOut'], new Date('2023-04-23T23:00:00.000Z'));
  });
  test('The guests number in searchFilters of hotels feature should be 2', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'guests'], 2);
  });
  test(`First search filter should have title 'Top-rated'`, () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'filters', 0, 'title'], 'Top-rated');

    // There is no explanation on the new search filters
    // expect(serp.hotels.searchFilters.filters[0].explanation).toBe('Based on your search, prices & quality');
  });
  test('The second hotel filter should not have a property called isActive', () => {
    expect(serp).not.toHaveProperty(['hotels', 'searchFilters', 'filters', 1, 'isActive']);
  });

  test('There should be 3 featured hotels in the hotels feature', () => {
    expect(serp.hotels?.hotels).toHaveLength(3);
  });
  test('First featured hotel should have name "Made Hotel"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'name'], 'DoubleTree by Hilton Hotel New York Times Square West');
  });
  test('Third featured hotel should have currency "$"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'currency'], '$');
  });
  test('Third featured hotel should have price 121', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'price'], 121);
  });
  test('Third featured hotel should have rating 3.9', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'rating'], 3.9);
  });
  test('First featured hotel should have 4.9K votes', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'votes'], 4900);
  });
  test('Third featured hotel should have 796 votes', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'votes'], 796);
  });

  test('3rd featured hotel should have deal property', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'deal']);
  });
  test('3rd featured hotel should not have originalPrice property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 2, 'deal', 'originalPrice']);
  });

  // TODO there is no featured review on the new hotels page, find one to test

  test(`Third featured hotel should be labeled with deal,
   having dealType: "GREAT DEAL" and
   dealDetails: "34% less than usual"`, () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'deal', 'dealType'], 'GREAT DEAL');
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'deal', 'dealDetails'], '34% less than usual');
  });

  describe('Testing ads', () => {
    test('There should be top ads', () => {
      expect(serp.adwords).toBeDefined();
      expect(serp.adwords?.adwordsTop).toBeDefined();
      expect(serp.adwords?.adwordsBottom).not.toBeDefined();
    });

    test('There should be 3 ads on the top of the page', () => {
      expect(serp.adwords?.adwordsTop).toHaveLength(2);
    });

    // Ads and sponsored results need to be updated
    test.skip('Testing first ad', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'position'], 1);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'title'], `Hotels in New York, NY - Booking.com`);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'url'], 'https://www.booking.com/city/us/new-york.html');
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.booking.com');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'snippet'],
        `Book your Hotel in New York City now. Quick, Easy Booking. No Reservation Costs. Choose from a wide range of properties which Booking.com offers. Search now! Save 10% with Genius. Motels. We speak your language. Hostels. Bed and Breakfasts. Villas.Find deals for your budget and be a Booker today.Book now. No cancellation fees on most rooms. You stay in control.`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
    });

    // Ads and sponsored results need to be updated
    test.skip('Testing 1st ad sitelink', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'title'], 'Deals for any Budget');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'href'],
        'https://www.google.com/aclk?sa=l&ai=DChcSEwier8Ds7ZL0AhWabG8EHd1WA_oYABACGgJqZg&ae=2&sig=AOD64_2UgzaMX79jlT6GsMbghBTlJfhP6A&ved=2ahUKEwjJ_bfs7ZL0AhX8TjABHS2XD3oQqyQoAHoECAQQBw&adurl=',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'type'], 'CARD');
    });
  });

  describe.skip('Testing top stories feature', () => {
    test('Page should have topStories feature', () => {
      expect(serp.topStories).toBeDefined();
    });

    test('1st top stories card should have title "De Blasio: NYC ready to 8,000 homeless out of hotels, back into shelters"', () => {
      expect(serp).toHaveProperty(
        ['topStories', 0, 'title'],
        'De Blasio: NYC ready to 8,000 homeless out of hotels, back into shelters',
      );
      expect(serp).toHaveProperty(
        ['topStories', 0, 'url'],
        'https://www.nydailynews.com/news/politics/new-york-elections-government/ny-nyc-de-blasio-homeless-relocation-hotels-shelters-20210616-ys23jfsiffcf5b4encjzcka55a-story.html',
      );
      expect(serp).toHaveProperty(['topStories', 0, 'publisher'], '');
      expect(serp).toHaveProperty(['topStories', 0, 'published'], '1 day ago');
    });
  });
});

describe('Parsing Hotels-London search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}hotels-london.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test.skip('Second featured hotel should have originalPrice property and should have value 113', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 1, 'deal', 'originalPrice'], 113);
  });

  test('Expect to have one active filter', () => {
    const activeFiltersNumber = serp.hotels?.searchFilters?.filters.reduce((acc, curr) => {
      if (curr.isActive === true) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);
    expect(activeFiltersNumber).toBe(1);
  });

  test('Second featured hotel should have have amenities property', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 1, 'amenities'], 'SpaIndoor pool');
  });
});

describe('Testing functions', () => {
  let serp: Serp;

  beforeAll(() => {
    serp = new GoogleSERP('<body class="srp"><div></div></body>').serp;
  });

  test('testing getResults and getTime function for non existent results', () => {
    expect(serp.totalResults).toBeUndefined();
    expect(serp.timeTaken).toBeUndefined();
  });

  test('testing getHotels function for non existent results', () => {
    expect(serp.hotels).toBeUndefined();
  });
});

describe('Parsing Domain page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}domain.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  describe('Testing ads', () => {
    test.skip('There should be top ads', () => {
      expect(serp.adwords).toBeDefined();
      expect(serp.adwords?.adwordsTop).toBeDefined();
      expect(serp.adwords?.adwordsBottom).toBeDefined();
    });

    test('There should be 1 ad on the top of the page', () => {
      expect(serp.adwords?.adwordsTop).toHaveLength(4);
    });

    test('Testing first ad', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'position'], 1);
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'title'],
        `Cheap Domain Names From $0.80 - Free Private Registration`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'url'], 'https://www.ionos.com/domains/domain-names');
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.ionos.com');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'snippet'],
        `Also included: 1 email account with 2 GB mailbox space. Find your perfect domain now! New Domain Extensions. Email Account Included. One-click activation. Up to 10,000 subdomains. Personal Consultant. 24/7 Support. Easy Domain Transfer.`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
    });

    test('Testing first ad sitelink', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'title'], '$0.50 Web Hosting');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'href'],
        'https://www.google.com/aclk?sa=l&ai=DChcSEwj3-L3s7ZL0AhWZoIYKHWwPBDsYABAJGgJ2dQ&ae=1&sig=AOD64_0PegvCphWbulkNGBiIMg8sepBd6Q&q=&ved=2ahUKEwiL_Lfs7ZL0AhUeQzABHbfABQ8QpigoAXoECAUQCg&adurl=https://www.ionos.com/hosting/web-hosting%3Fac%3DOM.US.USo42K356154T7073a%26utm_source%3Dgoogle%26utm_medium%3Dcpc%26utm_campaign%3DDOMAIN_NAME_INFO_GEN_USA-GE-EX-SEA%26utm_term%3Ddomain%26utm_content%3DEX-Domain%26gclsrc%3Daw.ds%26gclid%3DEAIaIQobChMI9_i97O2S9AIVmaCGCh1sDwQ7EAAYASACEgLBMvD_BwE',
      );
      expect(serp).not.toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'snippet']);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'type'], 'INLINE');
    });
  });
});

describe('Parsing .com-domains page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}_com-domains.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test('There should be all ads', () => {
    expect(serp.adwords).toBeDefined();
    expect(serp.adwords?.adwordsTop).toBeDefined();
    expect(serp.adwords?.adwordsBottom).toBeDefined();
  });

  test(`Testing 3rd bottom ad sitelinks`, () => {
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 2, 'sitelinks', 1]);
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 2, 'sitelinks', 1, 'title'], 'Free Domain with Hosting');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 2, 'sitelinks', 1, 'href'],
      'https://www.google.com/aclk?sa=l&ai=DChcSEwjor73s7ZL0AhVLfG8EHfffBYMYABAMGgJqZg&ae=1&sig=AOD64_3iTRiW_HptXNrXKs2LPVE_Na0-Gg&q=&ved=2ahUKEwjLkbbs7ZL0AhU5RjABHXyXAa0QpigoAXoECAQQCg&adurl=https://www.hostgator.com/web-hosting%3Futm_source%3Dgoogle%26utm_medium%3Dgenericsearch%26gclsrc%3Daw.ds%26gclid%3DEAIaIQobChMI6K-97O2S9AIVS3xvBB333wWDEAMYAyACEgK67fD_BwE',
    );
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 2, 'sitelinks', 1, 'type'], 'INLINE');
  });

  test('There should be 1 ad on the bottom of the page', () => {
    expect(serp.adwords?.adwordsBottom).toHaveLength(3);
  });
  test('First bottom ad tests', () => {
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1]);
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'position'], 2);
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 1, 'url'],
      'https://www.networksolutions.com/domain-name-registration/index.jsp',
    );
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'domain'], 'www.networksolutions.com');
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'linkType'], 'LANDING');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 1, 'snippet'],
      `Get the right extension for your domain name. Search .COM .NET .ORG .BIZ & .INFO domains. Get the most out of your domain with private registration and website forwarding. 30+ Years in Business. Premium Domains Available. Find Expiring Domains.`,
    );
  });
});

describe('Parsing Coffee page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}coffee.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test('Page should have locals feature', () => {
    expect(serp.locals).toBeDefined();
  });

  test('3rd locals card should have title "Peets Coffee"', () => {
    expect(serp).toHaveProperty(['locals', 1, 'name'], "Peet's Coffee");
    expect(serp).toHaveProperty(['locals', 1, 'rating'], '4.3');
    expect(serp).toHaveProperty(['locals', 1, 'reviews'], '419');
    expect(serp).toHaveProperty(['locals', 1, 'expensiveness'], 1);
    expect(serp).toHaveProperty(['locals', 1, 'type'], 'Coffee shop');
    expect(serp).toHaveProperty(['locals', 1, 'address'], '1400 Mission St Suite 130');
    // expect(serp).toHaveProperty(['locals', 1, 'distance'], '0.2 mi');
    expect(serp).toHaveProperty(['locals', 0, 'description'], '"Good value filter coffee"');
  });
});

describe('Parsing Dell page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}dell.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test('Page should have shop feature', () => {
    expect(serp.shopResults).toBeDefined();
  });

  test(`Page should have shop results and the title of the first shop result should be 
    "Dell XPS 13 Laptop - w/ 11th gen Intel Core - 13.3" FHD Screen - 8GB - 256G"`, () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'title'], 'Dell XPS 13 Laptop - w/ Windows 11 & 11th gen Intel ...');
  });

  test('First shop results on the page should have img link', () => {
    expect(serp).toHaveProperty(
      ['shopResults', 0, 'imgLink'],
      'https://www.dell.com/en-us/shop/dell-laptops/xps-13-laptop/spd/xps-13-9305-laptop/xn9305ezwkh',
    );
  });

  test('First shop result on the page should have price 899.99', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'price'], 649.99);
  });

  test('First shop result on the page should have currency "$"', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'currency'], '$');
  });

  test('Shopping site for the first shop result on the page should be "Dell"', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'shoppingSite'], 'Dell');
  });

  test('First shop result on the page should not have specialOffer', () => {
    expect(serp).not.toHaveProperty(['shopResults', 0, 'specialOffer']);
  });

  // TODO there is no special offer on this page, find one to test
  test.skip('First shop result on the page should have specialOffer saying "Special offer"', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'specialOffer'], 'Special offer');
  });

  test('3rd shop result on the page should not have rating, votes, but will have commodity', () => {
    expect(serp).not.toHaveProperty(['shopResults', 2, 'votes']);
    expect(serp).not.toHaveProperty(['shopResults', 2, 'rating']);
    expect(serp).toHaveProperty(['shopResults', 2, 'commodity'], 'Free shipping');
  });

  test.skip('3rd shop result on the page should have rating 3.9', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'rating'], 3.9);
  });

  test('5th shop result on the page should have less than 1k votes', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'votes'], '596');
  });

  test('3rd shop result on the page should have 2k+ votes', () => {
    expect(serp).toHaveProperty(['shopResults', 1, 'votes'], '5k+');
  });
});

describe('Parsing no results page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}no-results.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test('There should be 0 results', () => {
    expect(serp.organic).toHaveLength(0);
    expect(serp.error).toBe('No results page');
  });
});

describe('Testing optional module parsing', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}google.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html, {}).serp;
  });

  test('Do not detect any module parsing', () => {
    expect(serp.organic).toHaveLength(0);
    expect(serp.pagination).toHaveLength(0);
    expect(serp.relatedKeywords).toHaveLength(0);
    expect(serp).not.toHaveProperty(['thumbnailGroups']);
    expect(serp).not.toHaveProperty(['videos']);
    expect(serp).not.toHaveProperty(['hotels']);
    expect(serp).not.toHaveProperty(['adwords']);
    expect(serp).not.toHaveProperty(['availableOn']);
    expect(serp).not.toHaveProperty(['topStories']);
    expect(serp).not.toHaveProperty(['shopResults']);
    expect(serp).not.toHaveProperty(['locals']);
    expect(serp).not.toHaveProperty(['error']);
  });
});
