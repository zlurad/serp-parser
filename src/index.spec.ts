import * as fs from 'fs-extra';
import { GoogleSERP } from './index';
import { Ad, Serp } from './models';

test('GoogleSERP should return empty organic array on empty html string', () => {
  expect(GoogleSERP('').organic).toEqual([]);
});

describe('Parsing Google page with 10 resuts', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/google.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  test('Page should have 25,270,000,000 results', () => {
    expect(serp.totalResults).toBe(25270000000);
  });
  test('Search should be done in 0.6 seconds', () => {
    expect(serp.timeTaken).toBe(0.6);
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
      'https://www.google.com/search?q=google+account&sa=X&ved=2ahUKEwjjqdW3oY7nAhVSCxoKHVwlA_YQ1QIoAHoECBEQAQ',
    );
  });
  test(`Link to 2nd page should have path`, () => {
    expect(serp.pagination[1].path).toBe(
      'https://www.google.com/search?q=google&ei=JI8jXuOHOdKWaNzKjLAP&start=10&sa=N&ved=2ahUKEwjjqdW3oY7nAhVSCxoKHVwlA_YQ8tMDegQIDhA1',
    );
  });

  test('serp should have 6 results', () => {
    expect(serp.organic).toHaveLength(6);
  });

  test('4th result should have url https://about.google/', () => {
    expect(serp.organic[3].url).toBe('https://about.google/');
  });

  test(`1st result should have cachedUrl`, () => {
    expect(serp.organic[0].cachedUrl).toBe(
      'https://webcache.googleusercontent.com/search?q=cache:y14FcUQOGl4J:https://www.google.com/+&cd=1&hl=en&ct=clnk&gl=us',
    );
  });
  test(`1st result should have similarUrl`, () => {
    expect(serp.organic[0].similarUrl).toBe(
      'https://www.google.com/search?q=related:https://www.google.com/+google&tbo=1&sa=X&ved=2ahUKEwjjqdW3oY7nAhVSCxoKHVwlA_YQHzAAegQIEBAI',
    );
  });

  test('4th result should have domain about.google', () => {
    expect(serp.organic[3].domain).toBe('about.google');
  });

  test('4th result should have title "Google Domains - Google"', () => {
    expect(serp.organic[3].title).toBe('Google: About');
  });

  test('4th result should have snippet to start with "Get the latest news, updates,...', () => {
    expect(serp.organic[3].snippet).toBe(
      `Get the latest news, updates, and happenings at Google. Learn about Google's core values and company philosophy.`,
    );
  });

  test('1st result should have card sitelinks', () => {
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Google Accounts');
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'href'], 'https://accounts.google.com/');
    expect(serp).toHaveProperty(
      ['organic', 0, 'sitelinks', 0, 'snippet'],
      'Not your computer? Use Guest mode to sign in privately. Learn ...',
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
  test('testing shop property for non existent results', () => {
    expect(serp.shopResults).toBeUndefined();
  });
});

describe('Parsing Google page with 100 results', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/google-100.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  test('serp should have 93 results', () => {
    expect(serp.organic).toHaveLength(93);
  });

  test('all results should have domain domains.google', () => {
    expect(serp.organic.filter(x => x.domain === '')).toEqual([]);
  });

  test('3rd result should have url https://about.google/', () => {
    expect(serp.organic[2].url).toBe('https://about.google/');
  });

  test('3rd result should have title "About Google"', () => {
    expect(serp.organic[2].title).toBe('Google: About');
  });

  test('3rd result should have snippet to start with "Get the latest news, updates...', () => {
    expect(serp.organic[2].snippet).toBe(
      `Get the latest news, updates, and happenings at Google. Learn about Google's core values and company philosophy.`,
    );
  });

  test('Keyword should be google', () => {
    expect(serp.keyword).toBe('google');
  });
});

describe('Parsing nojs Google page with 10 resuts', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/google-nojs.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
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
    serp = GoogleSERP(html);
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

describe('Parsing "The Matrix" search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/matrix.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  test('serp should have 8 results', () => {
    expect(serp.organic).toHaveLength(8);
  });

  test('Keyword should be "The Matrix"', () => {
    expect(serp.keyword).toBe('The Matrix');
  });

  test('1st result should have sitelinks and first sitelink should have title "Plot Summary"', () => {
    expect(serp).toHaveProperty(['organic', 1, 'sitelinks', 0, 'title'], 'The Matrix (franchise)');
    expect(serp).toHaveProperty(
      ['organic', 1, 'sitelinks', 0, 'href'],
      'https://en.wikipedia.org/wiki/The_Matrix_(franchise)',
    );
    expect(serp).toHaveProperty(['organic', 1, 'sitelinks', 0, 'type'], 'INLINE');
  });

  test('There should be Available On serp feature, 6 of them', () => {
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
    expect(serp).toHaveProperty(['videos', 0, 'date'], new Date('2013-11-19'));
    expect(serp).toHaveProperty(['videos', 0, 'channel'], 'Movieclips Classic Trailers');
    expect(serp).toHaveProperty(['videos', 0, 'videoDuration'], '2:20');
  });
  test('thumbnailGroups feature test', () => {
    expect(serp.thumbnailGroups).toHaveLength(3);
    expect(serp).toHaveProperty(['thumbnailGroups', 1, 'heading'], 'Keanu Reeves movies');
    expect(serp).toHaveProperty(['thumbnailGroups', 1, 'thumbnails', 0, 'title'], 'Johnny Mnemonic');
    expect(serp).toHaveProperty(
      ['thumbnailGroups', 1, 'thumbnails', 0, 'sitelink'],
      'https://www.google.com/search?q=Johnny+Mnemonic&stick=H4sIAAAAAAAAAONgFuLQz9U3ME-uMlICs7JLUpK0pLKTrfTTMnNywYRVUWpOYklqikJxaknxKkbJNKvs1Mry_KIUq9z8sszUYiuQPhNzy6RFrPxe-Rl5eZUKvnmpufl5mckAmNNcvGAAAAA&sa=X&ved=2ahUKEwiK0Z_0xY_nAhVmxYUKHa1kD5YQxA0wIHoECBkQBQ',
    );
  });
});

describe('Parsing nojs "The Matrix" search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/matrix-nojs.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
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

describe('Parsing Hotels search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/hotels.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  test('There should be 1417 similar hotels in the area', () => {
    expect(serp).toHaveProperty(['hotels', 'moreHotels'], 1417);
  });

  test('The searchTitle in searchFilters of hotels feature should be "Hotels | New York, NY"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'searchTitle'], 'Hotels | New York, NY');
  });
  test('The checkIn date in searchFilters of hotels feature should be "Thu Jan 23 2020"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'checkIn'], new Date('Thu Jan 23 2020'));
  });
  test('The checkOut date in searchFilters of hotels feature should be "Fri Jan 24 2020"', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'checkOut'], new Date('Fri Jan 24 2020'));
  });
  test('The guests number in searchFilters of hotels feature should be 2', () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'guests'], 2);
  });

  test(`First search filter should have title 'Guest favorites'`, () => {
    expect(serp).toHaveProperty(['hotels', 'searchFilters', 'filters', 0, 'title'], 'Guest favorites');

    // There is no explanation on the new search filters
    // expect(serp.hotels.searchFilters.filters[0].explanation).toBe('Based on your search, prices & quality');
  });
  test('The second hotel filter should not have a property called isActive', () => {
    expect(serp).not.toHaveProperty(['hotels', 'searchFilters', 'filters', 1, 'isActive']);
  });
  test('There should be 4 featured hotels in the hotels feature', () => {
    expect(serp.hotels?.hotels).toHaveLength(4);
  });
  test('First featured hotel should have name "Park Central Hotel New York"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'name'], 'Park Central Hotel New York');
  });
  test('First featured hotel should have currency "$"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'currency'], '$');
  });
  test('First featured hotel should have price 88', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'price'], 88);
  });
  test('First featured hotel should have rating 4.1', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'rating'], 4.1);
  });
  test('First featured hotel should have 3895 votes', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'votes'], 3895);
  });
  test('Second featured hotel should have following amenities: "Spa"', () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 1, 'amenities'], 'Spa');
  });
  test('First featured hotel should not have amenities property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 0, 'amenities']);
  });
  // TODO there is no featured review on the new hotels page, find one to test
  xtest('Fourth featured hotel should have featured review', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[3].featuredReview).toBe('');
    }
  });
  test('First featured hotel should not have featuredReview property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 0, 'featuredReview']);
  });
  test('3rd featured hotel should not have deal property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 2, 'deal']);
  });
  test(`First featured hotel should be labeled with deal,
   having dealType: "DEAL" and
   dealDetails: "22% less than usual"`, () => {
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'deal', 'dealType'], 'GREAT DEAL');
    expect(serp).toHaveProperty(['hotels', 'hotels', 0, 'deal', 'dealDetails'], '37% less than usual');
  });
  test('First featured hotel should not have originalPrice property', () => {
    expect(serp).not.toHaveProperty(['hotels', 'hotels', 0, 'deal', 'originalPrice']);
  });
});

describe('Parsing Hotels-nojs search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/hotels-nojs.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
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

describe('Parsing Hotels-London search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/hotels-london.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  test('Second featured hotel should have originalPrice property and should have value 113', () => {
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
});

describe('Testing functions', () => {
  let serp: Serp;

  beforeAll(() => {
    serp = GoogleSERP('<body class="srp"><div></div></body>');
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
    html = fs.readFileSync('test/domain.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  describe('Testing ads', () => {
    test('There should be top ads', () => {
      expect(serp.adwords).toBeDefined();
      expect(serp.adwords?.adwordsTop).toBeDefined();
      expect(serp.adwords?.adwordsBottom).toBeDefined();
    });

    test('There should be 4 ads on the top of the page', () => {
      expect(serp.adwords?.adwordsTop).toHaveLength(4);
    });

    test('Testing first ad', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'position'], 1);
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'title'],
        `Don't Overpay For A Domain | Get Yours For 99¢ | GoDaddy.com‎`,
      );
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'url'],
        'https://www.googleadservices.com/pagead/aclk?sa=L&ai=DChcSEwju1q-toY7nAhVEyt4KHXasAeEYABAAGgJ3Yg&ggladgrp=7066528666257623986&gglcreat=18388609245422997597&ohost=www.google.com&cid=CAASE-RoHgRhrdvvlXSNdwDfHE-UoBg&sig=AOD64_3vqRXzc5r0TD5CVlw_XI--pKlztw&adurl=&q=',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'domain'], 'www.googleadservices.com');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'snippet'],
        `Find The Perfect Domain at GoDaddy & Get it Before Someone Else Does! Easy Domain Setup. 100's of New Domains. Fast Domain Forwarding. Big Savings Over Others. Trusted By 19 Million. World's Largest Registrar. Services: Private Registration, WHOIS Lookup.`,
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'linkType'], 'LANDING');
    });

    test('Testing first ad sitelink', () => {
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1]);
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'title'], '$0.99 .CO or .com Sale');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'href'],
        'https://www.godaddy.com/offers/domains/tlds/great-price-first-year-com-or-co-domains?isc=gdcomg01',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsTop', 0, 'sitelinks', 1, 'type'], 'INLINE');
    });

    test('Testing adwordsBottom property', () => {
      expect(serp.adwords?.adwordsBottom).toHaveLength(1);
      expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'position'], 1);
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsBottom', 0, 'title'],
        'Cheap Domains from $0.98/yr | Free WhoisGuard Forever‎',
      );
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsBottom', 0, 'url'],
        'https://www.namecheap.com/promos/amazing98s/',
      );
      expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'domain'], 'www.namecheap.com');
      expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'linkType'], 'LANDING');
      expect(serp).toHaveProperty(
        ['adwords', 'adwordsBottom', 0, 'snippet'],
        `Namecheap Offers The Lowest Prices in the Market. Register at Namecheap & Save Big Now. Domains Come w Free Domains Privacy for Life & 2 Free Months of Private Email. Affordable Domains. Easy Registration Process. 2 Free Months of Email.`,
      );
    });
  });
});

describe('Parsing .com-domains page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/_com-domains.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  test('There should be all ads', () => {
    expect(serp.adwords).toBeDefined();
    expect(serp.adwords?.adwordsTop).toBeDefined();
    expect(serp.adwords?.adwordsBottom).toBeDefined();
  });

  test(`Testing first bottom ad sitelinks`, () => {
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'sitelinks', 1]);
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'sitelinks', 1, 'title'], 'Pricing and Plan Features');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 0, 'sitelinks', 1, 'href'],
      'https://www.squarespace.com/pricing/?channel=pnb&subchannel=go&campaign=pnb-dr-go-us-en-website-bmm&subcampaign=(website-website-build_Pricing-and-Plan-Features_sl)',
    );
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'sitelinks', 1, 'type'], 'INLINE');
  });

  test('There should be 1 ad on the bottom of the page', () => {
    expect(serp.adwords?.adwordsBottom).toHaveLength(3);
  });
  test('First bottom ad tests', () => {
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0]);
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'position'], 1);
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'title'], 'Claim Your Domain | Squarespace© Domains‎');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 0, 'url'],
      'https://www.squarespace.com/domain-name-search',
    );
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'domain'], 'www.squarespace.com');
    expect(serp).toHaveProperty(['adwords', 'adwordsBottom', 0, 'linkType'], 'LANDING');
    expect(serp).toHaveProperty(
      ['adwords', 'adwordsBottom', 0, 'snippet'],
      `The best websites start with the right domain. Start a website for free today! Free 14-day Trial. Services: Blog Platform, Modern Templates, SEO, Social Integrations, Mobile Friendly, Content Management, Analytics, 24/7 Support.`,
    );
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
    serp = GoogleSERP(html);
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

describe('Parsing Dell page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/dell.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  test('Page should have shop feature', () => {
    expect(serp.shopResults).toBeDefined();
  });

  test(`Page should have shop results and the title of the first shop result should be 
    "Dell XPS 13 9380 Business Laptop 13.3 inch Notebook - 8GB - 256GB - Windows 10 Pro"`, () => {
    expect(serp).toHaveProperty(
      ['shopResults', 0, 'title'],
      'Dell XPS 13 9380 Business Laptop 13.3 inch Notebook - 8GB - 256GB - Windows 10 Pro',
    );
  });

  test('First shop results on the page should have img link', () => {
    expect(serp).toHaveProperty(
      ['shopResults', 0, 'imgLink'],
      'https://www.dell.com/en-us/work/shop/cty/pdp/spd/xps-13-9380-laptop/cax13w10p1c706s',
    );
  });

  test('First shop result on the page should have price 1149.00', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'price'], 1149.0);
  });

  test('First shop result on the page should have currency "$"', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'currency'], '$');
  });

  test('Shopping site for the first shop result on the page should be "Dell"', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'shoppingSite'], 'Dell');
  });

  // TODO there is no special offer on this page, find one to test
  xtest('First shop result on the page should have specialOffer saying "Special offer"', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'specialOffer'], 'Special offer');
  });

  test('2nd shop result on the page should not have rating, votes, but will have commodity', () => {
    expect(serp).not.toHaveProperty(['shopResults', 1, 'votes']);
    expect(serp).not.toHaveProperty(['shopResults', 1, 'rating']);
    expect(serp).toHaveProperty(['shopResults', 1, 'commodity'], 'Free shipping');
  });

  test('1st shop result on the page should have rating 3.8', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'rating'], 3.6);
  });

  // TODO there is no 1k+ rating to test on this page, find one for testing
  xtest('2nd shop result on the page should have 1k+ votes', () => {
    expect(serp).toHaveProperty(['shopResults', 0, 'votes'], '1k+');
  });

  test('Page should have topStories feature', () => {
    expect(serp.topStories).toBeDefined();
  });

  test('2nd top stories card should have title "Deals: iPad Pro, Dell XPS 13, SanDisk Extreme MicroSDXC"', () => {
    expect(serp).toHaveProperty(
      ['topStories', 1, 'title'],
      'Dell laptop deal: the XPS 13 laptop gets a massive $969 price cut',
    );
    expect(serp).toHaveProperty(
      ['topStories', 1, 'imgLink'],
      'https://www.techradar.com/news/dell-laptop-deal-the-xps-13-laptop-gets-a-massive-dollar969-price-cut',
    );
    expect(serp).toHaveProperty(['topStories', 1, 'publisher'], 'TechRadar');
    expect(serp).toHaveProperty(['topStories', 1, 'published'], '3 days ago');
  });
});
