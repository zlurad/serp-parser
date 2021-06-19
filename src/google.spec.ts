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

  test('Page should have 11,310,000,000 results', () => {
    expect(serp.totalResults).toBe(11310000000);
  });
  test('Search should be done in 1.17 seconds', () => {
    expect(serp.timeTaken).toBe(1.17);
  });
  test('Current page should be 1', () => {
    expect(serp.currentPage).toBe(1);
  });
  test('Page should have 8 related keywords', () => {
    expect(serp.relatedKeywords).toHaveLength(8);
  });
  test('1st related keyword should be "google gravity"', () => {
    expect(serp.relatedKeywords[0].keyword).toBe('google gravity');
  });
  test('1st related keyword should have path', () => {
    expect(serp.relatedKeywords[0].path).toBe(
      '/search?rlz=1C1CHBF_en&gl=us&q=Google+Gravity&sa=X&ved=2ahUKEwigq5P7rdjwAhVClJUCHSatDmUQ1QIwHHoECC8QAQ',
    );
  });
  test(`Link to 2nd page should have path`, () => {
    expect(serp.pagination[1].path).toBe(
      '/search?q=google&rlz=1C1CHBF_en&gl=us&ei=NmOmYKC4OMKo1sQPptq6qAY&start=10&sa=N&ved=2ahUKEwigq5P7rdjwAhVClJUCHSatDmUQ8tMDegQIARA1',
    );
  });
  test('serp should have 5 results', () => {
    expect(serp.organic).toHaveLength(5);
  });
  test('3th result should have url https://about.google/', () => {
    expect(serp.organic[2].url).toBe('https://about.google/');
  });

  test('4th result should have title "Google - Wikipedia"', () => {
    expect(serp.organic[3].title).toBe('Google - Wikipedia');
  });

  test('4th result should have snippet to start with "Learn how Google.org uses the best of Google to help nonprofits and social...', () => {
    expect(serp.organic[4].snippet).toBe(
      `Learn how Google.org uses the best of Google to help nonprofits and social enterprises solve humanity's biggest challenges.`,
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
    expect(serp).not.toHaveProperty(['organic','1','sitelinks'])
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

  test('3rd result should have url https://www.google.com/photos/about/', () => {
    expect(serp.organic[2].url).toBe('https://www.google.com/photos/about/');
  });

  test('3rd result should have title "Google Photos"', () => {
    expect(serp.organic[2].title).toBe('Google Photos');
  });

  test('3rd result should have snippet to be "Use Google Hangouts to keep in touch with one person or a group. Available ...', () => {
    expect(serp.organic[4].snippet.replace(/\s+/g, ' ').trim()).toBe(
      'Use Google Hangouts to keep in touch with one person or a group. Available ...'.replace(/\s+/g, ' ').trim(),
    );
  });

  test('Keyword should be google', () => {
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

  test('serp should have 10 results', () => {
    expect(serp.organic).toHaveLength(10);
  });

  test('1th result should have featured snippet', () => {
    expect(serp.organic[0].featured).toBeTruthy();
  });

  test('1st result should have domain backlinko.com', () => {
    expect(serp.organic[0].domain).toBe('backlinko.com');
  });

  test('1st result should have title "What Are Featured Snippets? And How to Get Them - Backlinko"', () => {
    expect(serp.organic[0].title).toBe('What Are Featured Snippets? And How to Get Them - Backlinko');
  });

  test('1st result should have snippet to start with "Featured Snippets are short snippets ...', () => {
    expect(serp.organic[0].snippet).toBe(
      `Featured Snippets are short snippets of text that appear at the top of Google's search results in order to quickly answer a searcher's query. The content that appears inside of a Featured Snippet is automatically pulled from web pages in Google's index.`,
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

  test('Keyword should be "The Matrix"', () => {
    expect(serp.keyword).toBe('The Matrix');
  });

  test('1st result should have sitelinks and second sitelink should have title "‎Plot Summary"', () => {
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title']);
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 0, 'href'],
      'https://www.imdb.com/title/tt0133093/plotsummary',
    );
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'INLINE');
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
  describe('Testing top stories feature', () => {
    test('Page should have topStories feature', () => {
      expect(serp.topStories).toBeDefined();
    });

    test('2nd top stories card should have title "15 Movies To Watch To Get Excited For Matrix 4 | ScreenRant"', () => {
      expect(serp).toHaveProperty(
        ['topStories', 1, 'title'],
        '15 Movies To Watch To Get Excited For Matrix 4 | ScreenRant',
      );
      expect(serp).toHaveProperty(
        ['topStories', 1, 'url'],
        'https://screenrant.com/matrix-4-movies-watch-before/',
      );
      expect(serp).toHaveProperty(['topStories', 1, 'publisher'], '');
      expect(serp).toHaveProperty(['topStories', 1, 'published'], '3 weeks ago');
    });
    test('1st top stories card should have publisher "BuzzFeed"', () => {
      expect(serp).toHaveProperty(['topStories', 0, 'publisher'], 'BuzzFeed');
    });
  });
});

describe('Parsing Hotels search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}hotels.html`, { encoding: 'utf8' });
    serp = new GoogleSERP(html).serp;
  });

  test('There should be 1231 similar hotels in the area', () => {
    expect(serp).toHaveProperty(['hotels', 'moreHotels'], 1231);
  });

  test('The searchTitle in searchFilters of hotels feature should be "Hotels | New York City, NY"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'searchTitle'], 'Hotels | New York City, NY');
  });
  test('The checkIn date in searchFilters of hotels feature should be "Mon, Jun 21 2021"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'checkIn'], new Date('Mon, Jun 21 2021'));
  });
  test('The checkOut date in searchFilters of hotels feature should be "Tue, June 22 2021"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'checkOut'], new Date('Tue, June 22 2021'));
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
  test('First featured hotel should have name "Made Hotel"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'name'], 'Made Hotel');
  });
  test('Third featured hotel should have currency "$"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'currency'], '$');
  });
  test('Third featured hotel should have price 153', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'price'], 153);
  });
  test('Third featured hotel should have rating 4.2', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'rating'], 4.2);
  });
  test('Third featured hotel should have 1588 votes', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'votes'], 1588);
  });
  // TODO separate amenities
  test('Fourth featured hotel should have following amenities: "Free Wi-Fi"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 3, 'amenities'], 'Free Wi-FiFree breakfast');
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
   dealDetails: "27% less than usual"`, () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'deal', 'dealType'], 'GREAT DEAL');
    expect(serp).toHaveProperty(['hotels', 'hotels', 2, 'deal', 'dealDetails'], '27% less than usual');
  });

  describe('Testing ads', () => {
    test('There should be top ads', () => {
      expect(serp.adwords).toBeDefined();
      expect(serp.adwords?.adwordsTop).toBeDefined();
      expect(serp.adwords?.adwordsBottom).not.toBeDefined();
    });

    test('There should be 3 ads on the top of the page', () => {
      expect(serp.adwords?.adwordsTop).toHaveLength(3);
    });

    test('Testing first ad', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'position'], 1);
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'title'],
        `Hotel Rooms in New York, USA - Fast and Easy. Book in Minutes`,
      );
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'url'],
        'https://www.hotels.com/sa10233226/hotels-in-new-york-united-states-of-america/',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.hotels.com');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'snippet'],
        `Book Your Hotel Room in New York, USA. Browse Reviews. Check Out Our Price Guarantee.`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
    });

    test('Testing 1st ad sitelink', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'title'], 'Last-minute Deals');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'href'],
        'https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwiO6a7uzqHxAhWJrO0KHbKABWMYABADGgJkZw&ae=2&ohost=www.google.com&cid=CAASE-RosUUQf0MVx0A6AqLv69qcDoc&sig=AOD64_13l5aT46ME1PnbftvNnl_To848pQ&q=&ved=2ahUKEwj_y6buzqHxAhUjmFwKHeerBjIQqyQoAHoECAQQEw&adurl=',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'type'], 'CARD');
    });
  });

    describe('Testing top stories feature', () => {
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

  test('Second featured hotel should not have amenities property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 1, 'amenities']);
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
      expect(serp.adwords?.adwordsTop).toHaveLength(1);
    });

    test('Testing first ad', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'position'], 1);
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'title'],
        `GoDaddy $2.99 Domain Names - The Perfect Domain is Waiting`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'url'], 'https://www.godaddy.com/offers/domains/names');
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.godaddy.com');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'snippet'],
        `GoDaddy is trusted by over 20 million customers, with a Trustpilot rating of 4.1 stars. Simple Domain Setup. Free 24/7 Phone Support. Year-Round Special Offers. 100s Of Domain Endings. Free Basic Privacy. Services: Domain Privacy, WHOIS Lookup, Domains Transfers.`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
    });

    test('Testing first ad sitelink', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'title'], 'Domain Protection');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'href'],
        'https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwiI4NPtrdjwAhUZi8gKHXV2Cz8YABADGgJxdQ&ae=2&ggladgrp=7066528666257623986&gglcreat=17637698502619250955&ohost=www.google.com&cid=CAASE-RoWLc6kn9jPzcRcyX5AXMXa6E&sig=AOD64_0NVthcuhbArI2OnFI6CrN-Rvmy8w&q=&ved=2ahUKEwiAqMjtrdjwAhXmq5UCHebRDn0QqyQoAXoECAMQEg&adurl=',
      );
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'snippet'],
        'Make Sure Your Domain isFully Protected. Learn More!',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'type'], 'CARD');
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
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 2, 'sitelinks', 1, 'title'], 'Renew Your Domain');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 2, 'sitelinks', 1, 'href'],
      'https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwivjtSnrdjwAhWB4bMKHRofD2UYABAMGgJxbg&ae=2&ohost=www.google.com&cid=CAASE-RoPrYtA8dM2UVLjyFIkQLF8BY&sig=AOD64_1pjuJTaB2HPcQOdlG-v8EDvQXm-A&q=&ved=2ahUKEwin78inrdjwAhVzqZUCHYEfBqoQpigoAXoECAUQEg&adurl=',
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
      'https://www.godaddy.com/offers/domains/generic',
    );
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'domain'], 'www.godaddy.com');
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 1, 'linkType'], 'LANDING');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 1, 'snippet'],
      `It's never been more important to be online. Browse & buy your domain in seconds! Don't wait - snag your domain before someone else does! Free 24/7 phone support. Trusted By 20 Million. Simple Domain Setup. Year-Round Special Offers. 100s of Domain Endings.`,
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

  test('2nd locals card should have title "Peets Coffee"', () => {
    expect(serp).toHaveProperty(['locals', 1, 'name'], "Peet's Coffee");
    expect(serp).toHaveProperty(['locals', 1, 'rating'], '4.3');
    expect(serp).toHaveProperty(['locals', 1, 'reviews'], '398');
    expect(serp).toHaveProperty(['locals', 1, 'expensiveness'], 1);
    expect(serp).toHaveProperty(['locals', 1, 'type'], 'Coffee shop');
    expect(serp).toHaveProperty(['locals', 1, 'address'], '1400 Mission St Suite 130');
    // There is no distance and desc in current results
    // expect(serp).toHaveProperty(['locals', 1, 'distance'], '0.3 mi');
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

  test('3rd shop result on the page should have 2k+ votes', () => {
    expect(serp).toHaveProperty(['shopResults', 2, 'votes'], '2k+');
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
