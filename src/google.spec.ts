import * as fs from 'fs-extra';
import { GoogleSERP } from './index';
import { Ad, Serp } from './models';

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

  test('Page should have 10,230,000,000 results', () => {
    expect(serp.totalResults).toBe(10230000000);
  });
  test('Search should be done in 0.87 seconds', () => {
    expect(serp.timeTaken).toBe(0.87);
  });
  test('Current page should be 1', () => {
    expect(serp.currentPage).toBe(1);
  });
  test('Page should have 8 related keywords', () => {
    expect(serp.relatedKeywords).toHaveLength(8);
  });
  test('1st related keyword should be "google account"', () => {
    expect(serp.relatedKeywords[0].keyword).toBe('google account');
  });
  test('1st related keyword should have path', () => {
    expect(serp.relatedKeywords[0].path).toBe(
      '/search?q=google+account&sa=X&ved=2ahUKEwj9jtai65_sAhVGQBoKHahaA0IQ1QIoAHoECCgQAQ',
    );
  });
  test(`Link to 2nd page should have path`, () => {
    expect(serp.pagination[1].path).toBe(
      '/search?q=google&ei=nVF8X73MDsaAaai1jZAE&start=10&sa=N&ved=2ahUKEwj9jtai65_sAhVGQBoKHahaA0IQ8tMDegQIJxAv',
    );
  });

  test('serp should have 6 results', () => {
    expect(serp.organic).toHaveLength(6);
  });

  test('4th result should have url https://blog.google/', () => {
    expect(serp.organic[3].url).toBe('https://blog.google/');
  });

  test(`1st result should have cachedUrl`, () => {
    expect(serp.organic[0].cachedUrl).toBe(
      'https://webcache.googleusercontent.com/search?q=cache:y14FcUQOGl4J:https://www.google.com/+&cd=1&hl=en&ct=clnk&gl=us',
    );
  });
  test(`1st result should have similarUrl`, () => {
    expect(serp.organic[0].similarUrl).toBe(
      '/search?q=related:https://www.google.com/+google&sa=X&ved=2ahUKEwj9jtai65_sAhVGQBoKHahaA0IQHzAAegQIARAH',
    );
  });

  test('4th result should have domain blog.google', () => {
    expect(serp.organic[3].domain).toBe('blog.google');
  });

  test('4th result should have title "The Keyword | Google"', () => {
    expect(serp.organic[3].title).toBe('The Keyword | Google');
  });

  test('4th result should have snippet to start with "Discover all the latest about our products...', () => {
    expect(serp.organic[3].snippet).toBe(
      `Discover all the latest about our products, technology, and Google culture on our official blog.`,
    );
  });

  test('1st result should have card sitelinks', () => {
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Account');
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'href'], 'https://www.google.com/account/about/');
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 0, 'snippet'],
      'In your Google Account, you can see and manage your info ...',
    );
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'CARD');
  });
  test('2nd result should not have sitelinks', () => {
    expect(serp.organic[1].hasOwnProperty('sitelinks')).toBeFalsy();
  });

  test('testing videos property for non existent results', () => {
    expect(serp.videos).toBeUndefined();
  });
  test('testing adwords property for non existent results', () => {
    expect(serp.adwords).toBeUndefined();
  });
  test('testing topStories property for non existent results', () => {
    expect(serp.topStories).toBeUndefined();
  });
  xtest('testing Locals property for non existent results', () => {
    expect(serp.locals).toBeUndefined();
  });
  test('testing shop property for non existent results', () => {
    expect(serp.shopResults).toBeUndefined();
  });
});

describe('Parsing Google page with 100 results', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}google-100.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test('serp should have 100 results', () => {
    expect(serp.organic).toHaveLength(100);
  });

  test('all results should have domain domains.google', () => {
    expect(serp.organic.filter((x) => x.domain === '')).toEqual([]);
  });

  test('3rd result should have url https://www.google.com/account/about/', () => {
    expect(serp.organic[2].url).toBe('https://www.google.com/account/about/');
  });

  test('3rd result should have title "Google Account"', () => {
    expect(serp.organic[2].title).toBe('Google Account');
  });

  test('3rd result should have snippet to start with "In your Google Account, you can see ...', () => {
    expect(serp.organic[2].snippet).toBe(
      `In your Google Account, you can see and manage your info, activity, security&nbsp;...`,
    );
  });

  test('Keyword should be google', () => {
    expect(serp.keyword).toBe('google');
  });
});

describe('Parsing "The Matrix" search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}matrix.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test('serp should have 9 results', () => {
    expect(serp.organic).toHaveLength(9);
  });

  test('Keyword should be "The Matrix"', () => {
    expect(serp.keyword).toBe('The Matrix');
  });

  test('1st result should have sitelinks and first sitelink should have title "‎Franchise"', () => {
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Franchise');
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 0, 'href'],
      'https://en.wikipedia.org/wiki/The_Matrix_(franchise)',
    );
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'INLINE');
  });

  // Moved to knowledge graph
  xtest('There should be Available On serp feature, 6 of them', () => {
    expect(serp.availableOn).toHaveLength(6);
    expect(serp).toHaveProperty(['availableOn', 0, 'service'], 'YouTube');
    expect(serp).toHaveProperty(['availableOn', 0, 'price'], '$3.99');
    expect(serp).toHaveProperty(['availableOn', 0, 'url'], 'http://www.youtube.com/watch?v=qEXv-rVWAu8');
  });

  test('Test videoCard feature', () => {
    expect(serp.videos).toHaveLength(10);
    expect(serp).toHaveProperty(['videos', 0, 'title'], 'The Matrix (1999) Official Trailer #1 - Sci-Fi Action Movie');
    expect(serp).toHaveProperty(['videos', 0, 'sitelink'], 'https://www.youtube.com/watch?v=vKQi3bBA1y8');
    expect(serp).toHaveProperty(['videos', 0, 'source'], 'YouTube');
    // expect(serp).toHaveProperty(['videos', 0, 'date'], new Date('2013-11-19'));
    expect(serp).toHaveProperty(['videos', 0, 'channel'], 'Movieclips Classic Trailers');
    expect(serp).toHaveProperty(['videos', 0, 'videoDuration'], '2:20');
  });
  test('thumbnailGroups feature test', () => {
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

  test('There should be 1300 similar hotels in the area', () => {
    expect(serp).toHaveProperty(['hotels', 'moreHotels'], 1300);
  });

  test('The searchTitle in searchFilters of hotels feature should be "Hotels | New York, NY, USA"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'searchTitle'], 'Hotels | New York, NY');
  });
  // TODO fix tests for checkin-out
  // test('The checkIn date in searchFilters of hotels feature should be "Sat Oct 17 2020"', () => {
  //   expect(serp).toHaveProperty(['hotels', 'searchFilters', 'checkIn'], new Date('2020-10-17'));
  // });
  // test('The checkOut date in searchFilters of hotels feature should be "Sun Oct 18 2020"', () => {
  //   expect(serp).toHaveProperty(['hotels', 'searchFilters', 'checkOut'], new Date('2020-10-18'));
  // });
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

  test('There should be 4 featured hotels in the hotels feature', () => {
    expect(serp.hotels?.hotels).toHaveLength(4);
  });
  test('First featured hotel should have name "The Roosevelt Hotel"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'name'], 'The Roosevelt Hotel');
  });
  test('First featured hotel should have currency "$"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'currency'], '$');
  });
  test('First featured hotel should have price 80', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'price'], 80);
  });
  test('First featured hotel should have rating 4.1', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'rating'], 3.7);
  });
  test('First featured hotel should have 6412 votes', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'votes'], 6412);
  });
  test('Second featured hotel should have following amenities: "Spa"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 1, 'amenities'], 'Indoor pool');
  });
  test('First featured hotel should not have featuredReview property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 0, 'featuredReview']);
  });
  test('3rd featured hotel should not have deal property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 2, 'deal']);
  });
  test('First featured hotel should not have originalPrice property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 0, 'deal', 'originalPrice']);
  });

  // TODO there is no featured review on the new hotels page, find one to test
  xtest('Fourth featured hotel should have featured review', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[3].featuredReview).toBe('');
    }
  });

  xtest(`First featured hotel should be labeled with deal,
   having dealType: "DEAL" and
   dealDetails: "22% less than usual"`, () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'deal', 'dealType'], 'GREAT DEAL');
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'deal', 'dealDetails'], '37% less than usual');
  });

  describe('Testing ads', () => {
    test('There should be top ads', () => {
      expect(serp.adwords).toBeDefined();
      expect(serp.adwords?.adwordsTop).toBeDefined();
      expect(serp.adwords?.adwordsBottom).not.toBeDefined();
    });

    test('There should be 4 ads on the top of the page', () => {
      expect(serp.adwords?.adwordsTop).toHaveLength(4);
    });

    test('Testing first ad', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'position'], 1);
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'title'],
        `New York Hotels from $29 | Cheap Hotels Up to 60% off`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'url'], 'https://www.priceline.com/vacationpackages');
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.priceline.com');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'snippet'],
        `Best Price Guarantee on All Hotels. Over 1,000,000 Hotels with Great Prices! Find Incredible Deals for Hotels in New York. Save Big with Exclusive Rates! Save Big w/ Express Deals.`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
    });

    test('Testing 2nd ad sitelink', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 1, 'sitelinks', 1]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 1, 'sitelinks', 1, 'title'], 'Book for Tonight');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 1, 'sitelinks', 1, 'href'],
        'https://www.google.com/aclk?sa=l&ai=DChcSEwiA7-O9h6_sAhVpCIgJHTzzDPcYABAFGgJxbg&sig=AOD64_0hx2qloY4Q2WqN1a2KcdqXsCe7jg&rct=j&q=&ved=2ahUKEwiF4Ny9h6_sAhXopnIEHT_OBlMQpigoAXoECCEQFA&adurl=',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 1, 'sitelinks', 1, 'type'], 'INLINE');
    });
  });

  describe('Testing top stories feature', () => {
    test('Page should have topStories feature', () => {
      expect(serp.topStories).toBeDefined();
    });

    test('2nd top stories card should have title "The Roosevelt Hotel in Midtown Manhattan to Close Permanently"', () => {
      expect(serp).toHaveProperty(
        ['topStories', 1, 'title'],
        'The Roosevelt Hotel in Midtown Manhattan to Close Permanently',
      );
      expect(serp).toHaveProperty(
        ['topStories', 1, 'url'],
        'https://www.nbcnewyork.com/news/local/the-roosevelt-hotel-in-midtown-manhattan-to-close-permanently/2662259/',
      );
      expect(serp).toHaveProperty(['topStories', 1, 'publisher'], 'NBC New York');
      expect(serp).toHaveProperty(['topStories', 1, 'published'], '1 day ago');
    });
  });
});

xdescribe('Parsing Hotels-London search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}hotels-london.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  xtest('Second featured hotel should have originalPrice property and should have value 113', () => {
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

  test('4th featured hotel should not have amenities property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 0, 'amenities']);
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
    test('There should be top ads', () => {
      expect(serp.adwords).toBeDefined();
      expect(serp.adwords?.adwordsTop).toBeDefined();
      expect(serp.adwords?.adwordsBottom).toBeDefined();
    });

    test('There should be 3 ads on the top of the page', () => {
      expect(serp.adwords?.adwordsTop).toHaveLength(3);
    });

    test('Testing first ad', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'position'], 1);
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'title'],
        `GoDaddy.com - Huge Domain Selection - Get the Perfect Domain`,
      );
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'url'],
        'https://www.godaddy.com/offers/domains/names?isc=coaugau001',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.godaddy.com');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'snippet'],
        `Enter the Domain You Want or Search Relevant Terms + We'll Give You a List Of Suggestions.`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
    });

    test('Testing first ad sitelink', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'title'], '$1.99 Professional Email');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'href'],
        'https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwjZjMzZiq3sAhVxPa0GHY6MD3gYABAOGgJwdg&ggladgrp=7066528666257623986&gglcreat=1209075016982593652&ohost=www.google.com&cid=CAASEuRoOUMv0LYpTSUmDlTUL-AuLA&sig=AOD64_0AhqAQShl5WGdfz_MHVtJQuFz9fQ&q=&ved=2ahUKEwjv78XZiq3sAhXFjp4KHabTB4QQqyQoAXoECCAQFA&adurl=',
      );
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'snippet'],
        'Look Professional & Instill Trust.Get Email That Matches Your Domain',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'type'], 'CARD');
    });

    test('Testing 2nd ad sitelink', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 1, 'sitelinks', 1]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 1, 'sitelinks', 1, 'title'], 'Website Templates');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 1, 'sitelinks', 1, 'href'],
        'https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwjZjMzZiq3sAhVxPa0GHY6MD3gYABAFGgJwdg&ae=2&ohost=www.google.com&cid=CAASEuRoOUMv0LYpTSUmDlTUL-AuLA&sig=AOD64_1g0V9TDulFD6DL-HKhZhBUXJLKPw&q=&ved=2ahUKEwjv78XZiq3sAhXFjp4KHabTB4QQpigoAXoECB8QEg&adurl=',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 1, 'sitelinks', 1, 'type'], 'INLINE');
    });

    test('Testing adwordsBottom property', () => {
      expect(serp.adwords?.adwordsBottom).toHaveLength(1);
      expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'position'], 1);
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsBottom', 0, 'title'],
        '.com, .org & more - Exclusive Prices - Domain Names',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'url'], 'https://www.ionos.com/domains/domain-names');
      expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'domain'], 'www.ionos.com');
      expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'linkType'], 'LANDING');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsBottom', 0, 'snippet'],
        `.com domain only $1 in the first year. Register a .com that's all in. Limited time only! Need a...`,
      );
    });
  });
});

// There are no ADs in paris page anymore, remove this in next few iterations
xdescribe('Parsing Paris page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}paris.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  describe('Testing ads', () => {
    test('There should be top ads', () => {
      expect(serp.adwords).toBeDefined();
      expect(serp.adwords?.adwordsTop).toBeDefined();
      expect(serp.adwords?.adwordsBottom).not.toBeDefined();
    });

    test('There should be 4 ads on the top of the page', () => {
      expect(serp.adwords?.adwordsTop).toHaveLength(4);
    });

    test('Testing first ad', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'position'], 1);
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'title'],
        `The Best Things to Do in Paris - Airbnb - airbnb.com‎`,
      );
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'url'],
        '/aclk?sa=l&ai=DChcSEwidtOmvrb_nAhXX-FEKHbj0DbIYABAAGgJ3cw&sig=AOD64_30sqttmnoUUIsmjWZ1SV9X-Odg0w&adurl=&q=',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.googleadservices.com');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'snippet'],
        `Search for Rentals with Airbnb. Book Online with Instant Confirmation! Over 6 Million Listings. 100,000 Cities. 191 Countries. 24/7 Customer Service. Best Prices. Superb Locations. Amenities: Business Travel Ready, Family Friendly, Pet Friendly.`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
    });

    test('Testing first ad sitelink', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'title'], 'Long-Term Housing');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'href'],
        'https://www.airbnb.com/b/Long-Term-Stay',
      );
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
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 2, 'sitelinks', 1, 'title'], 'Pick Your Plan');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 2, 'sitelinks', 1, 'href'],
      'https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwim47HPv7fsAhUWPmAKHeUTAqgYABAUGgJ0bQ&ohost=www.google.com&cid=CAASEuRoekkJ8_7KALOXeRdsBBNG8w&sig=AOD64_1U10eN9pFCwcAtcP-rYX4G9S_W7A&q=&ved=2ahUKEwj776rPv7fsAhXz7HMBHeCKBxwQpigoAXoECA0QEg&adurl=',
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
      'https://www.networksolutions.com/network-solutions-domains.jsp?promo=35768',
    );
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'domain'], 'www.networksolutions.com');
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'linkType'], 'LANDING');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 1, 'snippet'],
      `Get the Domain Name You Always Wanted! Search .COM Domains Now. Over 3 Million Customers. 99.9% Uptime Rating. 30+ Years in Business. 500+ Domain Extensions. The Original Registrar. Services: Domain Registration, Cloud Hosting, SSL Certificates.`,
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

  test('2nd locals card should have title "Starbucks"', () => {
    expect(serp).toHaveProperty(['locals', 1, 'name'], 'Starbucks');
    expect(serp).toHaveProperty(['locals', 1, 'rating'], '3.9');
    expect(serp).toHaveProperty(['locals', 1, 'reviews'], '403');
    expect(serp).toHaveProperty(['locals', 1, 'expensiveness'], 2);
    // expect(serp).toHaveProperty(['locals', 1, 'type'], 'Coffee shop');
    // There is no distance prop in current results
    // expect(serp).toHaveProperty(['locals', 1, 'distance'], '0.3 mi');
    expect(serp).toHaveProperty(['locals', 1, 'address'], '1390 Market St UNIT 107');
    // expect(serp).toHaveProperty(['locals', 1, 'description'], 'Small cafe for coffee & frozen yogurt');
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
    "XPS 13 Laptop - w/ 10th gen Intel Core - 13.3'' FHD screen - 8GB - 256G"`, () => {
    expect(serp).toHaveProperty(
      ['shopResults', 0, 'title'],
      "XPS 13 Laptop - w/ 10th gen Intel Core - 13.3'' FHD screen - 8GB - 256G",
    );
  });

  test('First shop results on the page should have img link', () => {
    expect(serp).toHaveProperty(
      ['shopResults', 0, 'imgLink'],
      'https://www.dell.com/en-us/shop/dell-laptops/xps-13-laptop/spd/xps-13-7390-laptop/xn7390ehscs',
    );
  });

  test('First shop result on the page should have price 799.99', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'price'], 799.99);
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
  xtest('First shop result on the page should have specialOffer saying "Special offer"', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'specialOffer'], 'Special offer');
  });

  test('1nd shop result on the page should not have rating, votes, but will have commodity', () => {
    expect(serp).not.toHaveProperty(['shopResults', 0, 'votes']);
    expect(serp).not.toHaveProperty(['shopResults', 0, 'rating']);
    expect(serp).toHaveProperty(['shopResults', 0, 'commodity'], 'Free shipping');
  });

  test('2st shop result on the page should have rating 3.8', () => {
    expect(serp).toHaveProperty(['shopResults', 1, 'rating'], 3.8);
  });

  test('1st shop result on the page should have less than 1k votes', () => {
    expect(serp).toHaveProperty(['shopResults', 1, 'votes'], '616');
  });

  // TODO there is no 1k+ rating to test on this page, find one for testing
  xtest('2nd shop result on the page should have 1k+ votes', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'votes'], '1k+');
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
