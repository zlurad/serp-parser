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

  test('Page should have 25,150,000,000 results', () => {
    expect(serp.totalResults).toBe(25150000000);
  });
  test('Search should be done in 0.62 seconds', () => {
    expect(serp.timeTaken).toBe(0.62);
  });
  test('Pagination should not be visible', () => {
    expect(serp.pagination).toHaveLength(0);
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
  test('serp should have 9 results', () => {
    expect(serp.organic).toHaveLength(9);
  });
  test('2nd result should have url https://www.google.com/', () => {
    expect(serp.organic[1].url).toBe('https://www.google.com/');
  });

  test('4th result should have title "Google Maps"', () => {
    expect(serp.organic[3].title).toBe('Google Maps');
  });

  test('4th result should have snippet to start with "Find local businesses, view maps and get driving directions in Google Maps.', () => {
    expect(serp.organic[3].snippet).toBe(`Find local businesses, view maps and get driving directions in Google Maps.`);
  });

  test('1st result should have card sitelinks', () => {
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Drive');
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'href'], 'https://www.google.com/drive/');
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

  test('7th result should have snippet to be "Use Google Docs to create, and collaborate on online documents."', () => {
    expect(serp.organic[6].snippet.replace(/\s+/g, ' ').trim()).toBe(
      'Use Google Docs to create, and collaborate on online documents.'.replace(/\s+/g, ' ').trim(),
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
    // Gets 11 results, because now the organic selectors match featured selectors as well
    expect(serp.organic).toHaveLength(10);
  });

  test('1st result should have featured snippet', () => {
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

  test('Keyword should be "The Matrix"', () => {
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

  test('trailers and clips feature', () => {
    expect(serp.trailersAndClips).toHaveLength(4);
    expect(serp).toHaveProperty(['trailersAndClips', 0, 'title'], 'The Matrix (1999) Official Trailer #1 - Sci-Fi Action Movie');
    expect(serp).toHaveProperty(['trailersAndClips', 0, 'sitelink'], 'https://www.youtube.com/watch?v=vKQi3bBA1y8');
    expect(serp).toHaveProperty(['trailersAndClips', 0, 'source'], 'YouTube');
    expect(serp).toHaveProperty(['trailersAndClips', 0, 'date'], new Date('2013-11-19'));
    expect(serp).toHaveProperty(['trailersAndClips', 0, 'channel'], 'Rotten Tomatoes Classic Trailers');
    expect(serp).toHaveProperty(['trailersAndClips', 0, 'videoDuration'], '2:20');
  })

  // test('thumbnailGroups feature test', () => {
  //   expect(serp.thumbnailGroups).toHaveLength(3);
  //   expect(serp).toHaveProperty(['thumbnailGroups', 0, 'heading'], 'The Matrix movies');
  //   expect(serp).toHaveProperty(['thumbnailGroups', 0, 'thumbnails', 0, 'title'], 'The Matrix Reloaded');
  //   expect(serp).toHaveProperty(
  //     ['thumbnailGroups', 0, 'thumbnails', 0, 'sitelink'],
  //     '/search?q=The+Matrix+Reloaded&stick=H4sIAAAAAAAAAONgFuLQz9U3ME-uMlICsyqMTAu1pLKTrfTTMnNywYRVUWpOYklqikJxaknxKkapNKvs1Mry_KIUq9z8sszUYiuQPiNDQ7O0RazCIRmpCr6JJUWZFQpBqTn5iSmpKQDpFzxLZQAAAA&sa=X&ved=2ahUKEwji-vSCuarsAhVTvZ4KHa3yDYsQxA0wG3oECAQQAw',
  //   );
  //   expect(serp).toHaveProperty(['thumbnailGroups', 1, 'heading'], 'Keanu Reeves movies');
  //   expect(serp).toHaveProperty(['thumbnailGroups', 1, 'thumbnails', 0, 'title'], 'Johnny Mnemonic');
  //   expect(serp).toHaveProperty(
  //     ['thumbnailGroups', 1, 'thumbnails', 0, 'sitelink'],
  //     '/search?q=Johnny+Mnemonic&stick=H4sIAAAAAAAAAONgFuLQz9U3ME-uMlICs7JLUpK0pLKTrfTTMnNywYRVUWpOYklqikJxaknxKkbJNKvs1Mry_KIUq9z8sszUYiuQPhNzy6RFrPxe-Rl5eZUKvnmpufl5mckAmNNcvGAAAAA&sa=X&ved=2ahUKEwji-vSCuarsAhVTvZ4KHa3yDYsQxA0wHHoECAYQBA',
  //   );
  // });
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

  test('The searchTitle in searchFilters of hotels feature should be "Hotels | New York City, NY"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchTitle'], 'Hotels | New York, NY');
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

    test('There should be 2 ads on the top of the page', () => {
      expect(serp.adwords?.adwordsTop).toHaveLength(2);
    });

    test('Testing first ad', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'position'], 1);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'title'], `Hotels in New York, NY - Booking.com`);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'url'], 'https://www.booking.com/city/us/new-york.html');
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.booking.com');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'snippet'],
        `Book your Hotel in New York City now. Quick, Easy Booking. No Reservation Costs. Choose from a wide range of properties which Booking.com offers. Search now! Great Availability. Motels. Hostels. Special Offers. Save 10% with Genius. Flight +...`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
    });

    test('Testing 1st ad sitelink', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'title'], 'Hotels at Great Prices');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'href'],
        'https://www.booking.com/go.html?slc=gp;aid=336408;label=',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'type'], 'INLINE');
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

  test('Second featured hotel should NOT have originalPrice property', () => {
    expect(serp.hotels?.hotels[0].deal?.originalPrice).toBeUndefined();
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

  test('Second featured hotel should NOT have amenities property', () => {
    expect(serp.hotels?.hotels[1].amenities).toBeUndefined();
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
      expect(serp.adwords?.adwordsBottom).toBeUndefined();
    });

    test('There should be 2 ads on the top of the page', () => {
      expect(serp.adwords?.adwordsTop).toHaveLength(2);
    });

    test('Testing first ad', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'position'], 1);
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'title'],
        `Buy Domain Names - Save On .com Domain Names`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'url'], 'https://www.godaddy.com/offers/domains/buy-domain');
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.godaddy.com');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'snippet'],
        `Domains, Websites, Email, Hosting, Security & More. Everything You Need To Succeed Online. Domain Names From $2.99 At The World's #1 Domain Registrar! Get Started Today!`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
    });

    test('Testing first ad sitelink', () => {
      const adwordsTop: Ad[] = serp.adwords?.adwordsTop as Ad[]; 
      // expect(adwordsTop[0].sitelinks.length).toBe(4);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'title'], 'Domain Name Generator');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'href'],
        'https://www.godaddy.com/offers/domains/domain-generator?isc=usdomgon1&currencyType=USD&countryview=1',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'snippet'], 
      'Get started by entering a word or phrase you want in your domain.'
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 0, 'type'], 'CARD');
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
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'sitelinks', 0]);
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'sitelinks', 0, 'title'], '.com Domain From $1/Year');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 0, 'sitelinks', 0, 'href'],
      'https://www.ionos.com/domains/com-domain',
    );
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'sitelinks', 0, 'type'], 'INLINE');
  });

  test('There should be 1 ad on the bottom of the page', () => {
    expect(serp.adwords?.adwordsBottom).toHaveLength(1);
  });
  test('First bottom ad tests', () => {
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0]);
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'position'], 1);
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 0, 'url'],
      'https://www.ionos.com/domains/com-domain',
    );
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'domain'], 'www.ionos.com');
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'linkType'], 'LANDING');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 0, 'snippet'],
      `Need a perfect domain? Includes email, privacy, SSL & 24/7 support. Score a deal today! Also included: 1 email account with 2 GB mailbox space. Find your perfect domain now!`,
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
    expect(serp).toHaveProperty(['locals', 2, 'name'], "Planet Cafe");
    expect(serp).toHaveProperty(['locals', 2, 'rating'], '4.7');
    expect(serp).toHaveProperty(['locals', 2, 'reviews'], '45');
    expect(serp).toHaveProperty(['locals', 2, 'expensiveness'], 1);
    expect(serp).toHaveProperty(['locals', 2, 'type'], 'Coffee shop');
    expect(serp).toHaveProperty(['locals', 2, 'address'], '244 Gough St');
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
    expect(serp).toHaveProperty(['shopResults', 0, 'title'], 'Dell XPS 13.3 inch Touchscreen Laptop, Intel Core i5 i5-6200U, 256gb Ssd, Windows 10 Home, 9350, Silver');
  });

  test('First shop results on the page should have img link', () => {
    expect(serp).toHaveProperty(
      ['shopResults', 0, 'imgLink'],
      'https://www.walmart.com/ip/Dell-XPS-13-3-Touchscreen-Laptop-Intel-Core-i5-i5-6200U-256GB-SSD-Windows-10-Home-9350/47431727?wmlspartner=wlpa&selectedSellerId=3558',
    );
  });

  test('First shop result on the page should have price 1034.98', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'price'], 1034.98);
  });

  test('First shop result on the page should have currency "$"', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'currency'], '$');
  });

  test('Shopping site for the first shop result on the page should be "Walmart"', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'shoppingSite'], 'Walmart');
  });

  test('First shop result on the page should not have specialOffer', () => {
    expect(serp).not.toHaveProperty(['shopResults', 0, 'specialOffer']);
  });

  // TODO there is no special offer on this page, find one to test
  test.skip('First shop result on the page should have specialOffer saying "Special offer"', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'specialOffer'], 'Special offer');
  });

  test('2nd shop result on the page should not have rating, votes, but will have commodity', () => {
    expect(serp).not.toHaveProperty(['shopResults', 1, 'votes']);
    expect(serp).not.toHaveProperty(['shopResults', 1, 'rating']);
    expect(serp).toHaveProperty(['shopResults', 1, 'commodity'], '30-day returns');
  });

  test('3rd shop result on the page should have rating 3.8', () => {
    expect(serp).toHaveProperty(['shopResults', 2, 'rating'], 3.8);
  });

  test('5th shop result on the page should have 52 votes', () => {
    expect(serp).toHaveProperty(['shopResults', 4, 'votes'], '52');
  });

  test('3rd shop result on the page should have 545 votes', () => {
    expect(serp).toHaveProperty(['shopResults', 2, 'votes'], '545');
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
