import * as fs from 'fs-extra';
import { GoogleMobileSERP } from './index';
import { Serp } from './models';

const root = 'test/google/mobile/';

test('GoogleMobileSERP should return empty organic array on empty html string', () => {
  expect(new GoogleMobileSERP('').serp.organic).toEqual([]);
});

describe('Parsing Google page with 10 resuts', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}google.html`, { encoding: 'utf8' });
    serp = new GoogleMobileSERP(html).serp;
  });

  test('Keyword should be google', () => {
    expect(serp.keyword).toBe('google');
  });

  test('serp should have 5 results', () => {
    expect(serp.organic).toHaveLength(9);
  });

  test('result test', () => {
    expect(serp.organic[6].url).toBe('https://hangouts.google.com/');
    expect(serp.organic[6].domain).toBe('hangouts.google.com');
    expect(serp.organic[6].title).toBe('Google Hangouts - Get Started with Hangouts on Desktop or Mobile');
    expect(serp.organic[6].snippet).toBe(
      `Use Google Hangouts to keep in touch with one person or a group. Available ...`,
    );
  });

  test('1st result should have inline sitelinks', () => {
    expect(serp.organic[0].sitelinks).toHaveLength(7);
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'To continue to Gmail');
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'href'], 'https://www.google.com/gmail/');
    expect(serp).not.toHaveProperty(['organic', 0, 'sitelinks', 0, 'snippet']);
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'INLINE');
  });

  test('2nd result should not have sitelinks', () => {
    expect(serp).not.toHaveProperty(['organic', '1', 'sitelinks']);
  });

  test('Testing related keywords', () => {
    expect(serp.relatedKeywords).toHaveLength(3);
    expect(serp.relatedKeywords).toHaveProperty(['0', 'keyword'], 'Google Docs');
    expect(serp.relatedKeywords).toHaveProperty(
      ['0', 'path'],
      '/search?safe=off&gl=US&pws=0&nfpr=1&q=Google+Docs&sa=X&ved=2ahUKEwivoKacpvvwAhX4JzQIHQLKABoQ1QJ6BAglEAQ',
    );
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
  test('testing Locals property for non existent results', () => {
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
    serp = new GoogleMobileSERP(html, { organic: true }).serp;
  });

  test('Keyword should be google', () => {
    expect(serp.keyword).toBe('google');
  });

  test('serp should have 99 results', () => {
    expect(serp.organic).toHaveLength(98);
  });

  test('Testing domains', () => {
    expect(serp.organic.filter((x) => x.domain === '')).toEqual([]);
    expect(serp.organic[0].domain).toBe('www.google.com');
    expect(serp.organic[5].domain).toBe('blog.google');
  });

  test('Testing urls', () => {
    expect(serp.organic[0].url).toBe('https://www.google.com/');
    expect(serp.organic[5].url).toBe('https://blog.google/');
  });

  test('Testing titles', () => {
    expect(serp.organic[1].title).toBe('Google Account');
    expect(serp.organic[97].title).toBe('Google Meet: Video Conferencing for Business | Google Workspace');
  });

  test('Testing snippets', () => {
    expect(serp.organic[0].snippet).toBe(
      `Search the world's information, including webpages, images, videos and more. Google has many special features to help you find exactly what you're looking for .`,
    );
    expect(serp.organic[5].snippet).toBe(
      `Discover all the latest about our products, technology, and Google culture on our official blog.`,
    );
  });
});

describe('Parsing Google featured snippet page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}featured-snippets.html`, { encoding: 'utf8' });
    serp = new GoogleMobileSERP(html, { organic: true, related: true }).serp;
  });

  test('serp should have 9 results', () => {
    expect(serp.organic).toHaveLength(9);
  });

  test('1th result should have featured snippet', () => {
    expect(serp.organic[0].featured).toBeTruthy();
    expect(serp.organic[0].domain).toBe('backlinko.com');
    expect(serp.organic[0].title).toBe('What Are Featured Snippets? And How to Get Them - Backlinko');
    expect(serp.organic[0].snippet.substr(0, 40)).toBe(`Featured Snippets are short snippets of `);
  });

  test('2nd result should not have featured snippet', () => {
    expect(serp.organic[1].featured).toBeUndefined();
  });

  test('Testing related keywords', () => {
    expect(serp.relatedKeywords).toHaveLength(12);
    expect(serp.relatedKeywords).toHaveProperty(['1', 'keyword'], 'Why are featured snippets important');
  });
});

describe.skip('Parsing "The Matrix" search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}matrix.html`, { encoding: 'utf8' });
    serp = new GoogleMobileSERP(html).serp;
  });

  test('serp should have 8 results', () => {
    expect(serp.organic).toHaveLength(8);
  });

  test('Keyword should be "The Matrix"', () => {
    expect(serp.keyword).toBe('The Matrix');
  });

  test.skip('1st result should have sitelinks and first sitelink should have title "‎Franchise"', () => {
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Franchise');
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 0, 'href'],
      'https://en.wikipedia.org/wiki/The_Matrix_(franchise)',
    );
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'INLINE');
  });

  // Moved to knowledge graph
  test.skip('There should be Available On serp feature, 6 of them', () => {
    expect(serp.availableOn).toHaveLength(6);
    expect(serp).toHaveProperty(['availableOn', 0, 'service'], 'YouTube');
    expect(serp).toHaveProperty(['availableOn', 0, 'price'], '$3.99');
    expect(serp).toHaveProperty(['availableOn', 0, 'url'], 'http://www.youtube.com/watch?v=qEXv-rVWAu8');
  });

  test('video card feature', () => {
    expect(serp.videos).toHaveLength(4);
    expect(serp).toHaveProperty(['videos', 0, 'title'], 'Matrix Trailer HD (1999)');
    expect(serp).toHaveProperty(['videos', 0, 'sitelink'], 'https://www.youtube.com/watch?v=m8e-FF8MsqU');
    expect(serp).toHaveProperty(['videos', 0, 'source'], 'YouTube');
    // expect(serp).toHaveProperty(['videos', 0, 'date'], new Date('2013-11-19'));
    expect(serp).toHaveProperty(['videos', 0, 'channel'], 'Face Off');
    expect(serp).toHaveProperty(['videos', 0, 'videoDuration'], '2:31');
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

describe.skip('Parsing Hotels search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}hotels.html`, { encoding: 'utf8' });
    serp = new GoogleMobileSERP(html).serp;
  });

  test('There should be 1228 similar hotels in the area', () => {
    expect(serp).toHaveProperty(['hotels', 'moreHotels'], 1228);
  });

  test('The searchTitle in searchFilters of hotels feature should be "Hotels | New York, NY, USA"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'searchTitle'], 'Hotels | New York, NY');
  });
  test('The checkIn date in searchFilters of hotels feature should be "Sat Oct 17 2020"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'checkIn'], new Date('Sat, May 29 2021'));
  });
  test('The checkOut date in searchFilters of hotels feature should be "Sun Oct 18 2020"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'checkOut'], new Date('Sun, May 30 2021'));
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

  test('There should be 4 featured hotels in the hotels feature', () => {
    expect(serp.hotels?.hotels).toHaveLength(4);
  });
  test('First featured hotel should have name "Four Seasons Hotel New York"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'name'], 'Four Seasons Hotel New York');
  });
  test('Third featured hotel should have currency "$"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'currency'], '$');
  });
  test('Third featured hotel should have price 359', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'price'], 359);
  });
  test('Third featured hotel should have rating 4.3', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'rating'], 4.3);
  });
  test('Third featured hotel should have 3699 votes', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'votes'], 3699);
  });
  test.skip('Second featured hotel should have following amenities: "Spa"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 1, 'amenities'], 'Indoor pool');
  });
  test('First featured hotel should not have featuredReview property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 0, 'featuredReview']);
  });
  test('2rd featured hotel should not have deal property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 1, 'deal']);
  });
  test('First featured hotel should not have originalPrice property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 0, 'deal', 'originalPrice']);
  });

  // TODO there is no featured review on the new hotels page, find one to test

  test.skip(`First featured hotel should be labeled with deal,
   having dealType: "DEAL" and
   dealDetails: "22% less than usual"`, () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'deal', 'dealType'], 'DEAL');
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'deal', 'dealDetails'], '23% less than usual');
  });

  describe('Testing ads', () => {
    test('There should be top ads', () => {
      expect(serp.adwords).toBeDefined();
      expect(serp.adwords?.adwordsTop).toBeDefined();
      expect(serp.adwords?.adwordsBottom).not.toBeDefined();
    });

    test('There should be 1 ad on the top of the page', () => {
      expect(serp.adwords?.adwordsTop).toHaveLength(1);
    });

    test('Testing first ad', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'position'], 1);
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'title'],
        `Hilton Hotels In New York - Hilton Hotels & Resorts® - hilton.com`,
      );
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'url'],
        'https://www.hilton.com/en/locations/usa/new-york/new-york/',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.hilton.com');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'snippet'],
        `Stay Comfortably While Exploring New York's Historical Landmarks and Modern City.`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
    });

    test.skip('Testing 2nd ad sitelink', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 1, 'sitelinks', 1]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 1, 'sitelinks', 1, 'title'], 'Book for Tonight');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 1, 'sitelinks', 1, 'href'],
        'https://www.google.com/aclk?sa=l&ai=DChcSEwiA7-O9h6_sAhVpCIgJHTzzDPcYABAFGgJxbg&sig=AOD64_0hx2qloY4Q2WqN1a2KcdqXsCe7jg&rct=j&q=&ved=2ahUKEwiF4Ny9h6_sAhXopnIEHT_OBlMQpigoAXoECCEQFA&adurl=',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 1, 'sitelinks', 1, 'type'], 'INLINE');
    });
  });

  describe.skip('Testing top stories feature', () => {
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

describe.skip('Parsing Hotels-London search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}hotels-london.html`, { encoding: 'utf8' });
    serp = new GoogleMobileSERP(html).serp;
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

  test.skip('4th featured hotel should not have amenities property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 0, 'amenities']);
  });
});

describe('Testing functions', () => {
  let serp: Serp;

  beforeAll(() => {
    serp = new GoogleMobileSERP('<body class="srp"><div></div></body>').serp;
  });

  test('testing getResults and getTime function for non existent results', () => {
    expect(serp.totalResults).toBeUndefined();
    expect(serp.timeTaken).toBeUndefined();
  });

  test('testing getHotels function for non existent results', () => {
    expect(serp.hotels).toBeUndefined();
  });
});

// There are no ADs in paris page anymore, remove this in next few iterations
describe.skip('Parsing Paris page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}paris.html`, { encoding: 'utf8' });
    serp = new GoogleMobileSERP(html).serp;
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
    serp = new GoogleMobileSERP(html, { ads: true }).serp;
  });

  test('There should be all ads', () => {
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
      `Domains From Only $1/Year - .com, .org & more for $1/Year`,
    );
    expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'url'], 'https://www.ionos.com/domains/domain-names');
    expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.ionos.com');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsTop', 0, 'snippet'],
      `Free email address, wildcard ssl certificate, domain lock, 10,000 subdomains & many more! Need a perfect domain? Includes email, privacy, SSL & 24/7 support. Score a deal...`,
    );
    expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
  });

  test('Testing first ad sitelink', () => {
    expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0]);
    expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'title'], '.com Domain From $1/Year');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'href'],
      'https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwiMqLj_pvvwAhVyH60GHTfpAkwYABAKGgJwdg&ae=1&ohost=www.google.com&cid=CAASEuRoixU4cSaOKjQNjhc3ZYIvjQ&sig=AOD64_2t0zioT87_jgUqhmcUAKu6sGWwIw&q=&ved=2ahUKEwiW5bH_pvvwAhXcFTQIHexeDioQwgUoAHoECAUQDQ&adurl=https://www.ionos.com/domains/com-domain%3Fac%3DOM.US.USo42K356154T7073a%26gclsrc%3Daw.ds%26gclid%3DEAIaIQobChMIjKi4_6b78AIVch-tBh036QJMEAAYASABEgII1_D_BwE',
    );
    expect(serp).not.toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'snippet']);
    expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'type'], 'INLINE');
  });

  test('There should be 1 ad on the bottom of the page', () => {
    expect(serp.adwords?.adwordsBottom).toHaveLength(3);
  });

  test('First bottom ad tests', () => {
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1]);
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'position'], 2);
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'url'], 'https://www.hostgator.com/web-hosting');
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'domain'], 'www.hostgator.com');
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'linkType'], 'LANDING');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 1, 'snippet'],
      `HostGator® Is The Perfect Solution For You. We Are With You Every Step Of The Way. Powerful Web Hosting Made Easy and Affordable. Great Bundle with Every Plan! Free SSL. Free Website Templates. Unmetered Disk Space.`,
    );
  });

  test(`Testing bottom ad sitelinks`, () => {
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'sitelinks', 1]);
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'sitelinks', 1, 'title'], 'App Hosting');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 1, 'sitelinks', 1, 'href'],
      'https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwiMqLj_pvvwAhVyH60GHTfpAkwYABALGgJwdg&ae=1&ohost=www.google.com&cid=CAASEuRoixU4cSaOKjQNjhc3ZYIvjQ&sig=AOD64_1mq-gMpp58rz745u0yej7PlvoKTQ&q=&ved=2ahUKEwiW5bH_pvvwAhXcFTQIHexeDioQvrcBegQIAxAN&adurl=https://www.hostgator.com/apps%3Futm_source%3Dgoogle%26utm_medium%3Dgenericsearch%26gclsrc%3Daw.ds%26gclid%3DEAIaIQobChMIjKi4_6b78AIVch-tBh036QJMEAMYAiACEgIhx_D_BwE',
    );
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'sitelinks', 1, 'type'], 'INLINE');
  });
});

describe.skip('Parsing Coffee page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}coffee.html`, { encoding: 'utf8' });
    serp = new GoogleMobileSERP(html).serp;
  });

  test('Page should have locals feature', () => {
    expect(serp.locals).toBeDefined();
  });

  test('2nd locals card should have title "Peets Coffee"', () => {
    expect(serp).toHaveProperty(['locals', 1, 'name'], "Peet's Coffee");
    expect(serp).toHaveProperty(['locals', 1, 'rating'], '4.3');
    expect(serp).toHaveProperty(['locals', 1, 'reviews'], '398');
    expect(serp).toHaveProperty(['locals', 1, 'expensiveness'], 1);
    expect(serp).toHaveProperty(['locals', 1, 'type'], 'Coffee shop');
    // There is no distance prop in current results
    // expect(serp).toHaveProperty(['locals', 1, 'distance'], '0.3 mi');
    expect(serp).toHaveProperty(['locals', 1, 'address'], '1400 Mission St Suite 130');
    // expect(serp).toHaveProperty(['locals', 1, 'description'], 'Small cafe for coffee & frozen yogurt');
  });
});

describe.skip('Parsing Dell page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}dell.html`, { encoding: 'utf8' });
    serp = new GoogleMobileSERP(html).serp;
  });

  test('Page should have shop feature', () => {
    expect(serp.shopResults).toBeDefined();
  });

  test(`Page should have shop results and the title of the first shop result should be 
    "Dell XPS 13 Laptop - w/ 11th gen Intel Core - 13.3" FHD Screen - 8GB - 256G"`, () => {
    expect(serp).toHaveProperty(
      ['shopResults', 0, 'title'],
      'Dell XPS 13 Laptop - w/ 11th gen Intel Core - 13.3" FHD Screen - 8GB - 256G',
    );
  });

  test('First shop results on the page should have img link', () => {
    expect(serp).toHaveProperty(
      ['shopResults', 0, 'imgLink'],
      'https://www.dell.com/en-us/shop/dell-laptops/xps-13-laptop/spd/xps-13-9305-laptop/mktxn9305epfns',
    );
  });

  test('First shop result on the page should have price 899.99', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'price'], 899.99);
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

  test('1nd shop result on the page should not have rating, votes, but will have commodity', () => {
    expect(serp).not.toHaveProperty(['shopResults', 0, 'votes']);
    expect(serp).not.toHaveProperty(['shopResults', 0, 'rating']);
    expect(serp).toHaveProperty(['shopResults', 0, 'commodity'], 'Free shipping');
  });

  test('3rd shop result on the page should have rating 3.9', () => {
    expect(serp).toHaveProperty(['shopResults', 2, 'rating'], 3.9);
  });

  test('5th shop result on the page should have less than 1k votes', () => {
    expect(serp).toHaveProperty(['shopResults', 4, 'votes'], '168');
  });

  // TODO there is no 1k+ rating to test on this page, find one for testing
  test('3rd shop result on the page should have 2k+ votes', () => {
    expect(serp).toHaveProperty(['shopResults', 2, 'votes'], '2k+');
  });
});

describe('Parsing no results page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}no-results.html`, { encoding: 'utf8' });
    serp = new GoogleMobileSERP(html).serp;
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
    serp = new GoogleMobileSERP(html, {}).serp;
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
