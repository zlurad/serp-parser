import * as fs from 'fs-extra';
import { GoogleSERP } from './index';
import { Serp } from './models';

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

  test('Page should have 15,860,000,000 results', () => {
    expect(serp.totalResults).toBe(15860000000);
  });
  test('Search should be done in 0.61 seconds', () => {
    expect(serp.timeTaken).toBe(0.61);
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
      '/search?safe=off&gl=US&pws=0&nfpr=1&q=google+search&sa=X&ved=2ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQ1QIoAHoECA0QAQ',
    );
  });
  test(`Link to 2nd page should have path 
  "/search?q=google&safe=off&gl=US&pws=0&nfpr=1&ei=N1QvXKbhOLCC5wLlvLa4Dg&start=10&sa=N&ved=0ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQ8tMDCOwB"`, () => {
    expect(serp.pagination[1].path).toBe(
      '/search?q=google&safe=off&gl=US&pws=0&nfpr=1&ei=N1QvXKbhOLCC5wLlvLa4Dg&start=10&sa=N&ved=0ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQ8tMDCOwB',
    );
  });

  test('serp should have 7 results', () => {
    expect(serp.organic).toHaveLength(7);
  });

  test('3rd result should have url https://domains.google/', () => {
    expect(serp.organic[2].url).toBe('https://domains.google/');
  });

  test(`1st result should have cachedUrl 
  "https://webcache.googleusercontent.com/search?q=cache:y14FcUQOGl4J:https://www.google.com/+&cd=1&hl=en&ct=clnk&gl=us"
  `, () => {
    expect(serp.organic[0].cachedUrl).toBe(
      'https://webcache.googleusercontent.com/search?q=cache:y14FcUQOGl4J:https://www.google.com/+&cd=1&hl=en&ct=clnk&gl=us',
    );
  });
  test(`1st result should have similarUrl 
  "/search?safe=off&gl=US&pws=0&nfpr=1&q=related:https://www.google.com/+google&tbo=1&sa=X&ved=2ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQHzAAegQIARAG"
  `, () => {
    expect(serp.organic[0].similarUrl).toBe(
      '/search?safe=off&gl=US&pws=0&nfpr=1&q=related:https://www.google.com/+google&tbo=1&sa=X&ved=2ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQHzAAegQIARAG',
    );
  });

  test('3rd result should have domain domains.google', () => {
    expect(serp.organic[2].domain).toBe('domains.google');
  });

  test('3rd result should have title "Google Domains - Google"', () => {
    expect(serp.organic[2].title).toBe('Google Domains - Google');
  });

  test('3rd result should have snippet to start with "Search for and register a domain, get hosting...', () => {
    expect(serp.organic[2].snippet).toBe(
      'Search for and register a domain, get hosting, and build a site with Google Domains. The best of the internet backed by the security of Google.',
    );
  });

  test('1st result should have card sitelinks', () => {
    if (serp.organic[0].sitelinks) {
      expect(serp.organic[0].sitelinks[0].title).toBe('Google Docs');
      expect(serp.organic[0].sitelinks[0].snippet).toBe('Google Docs brings your documents to life with smart ...');
      expect(serp.organic[0].sitelinks[0].type).toBe('card');
    }
  });
  test('2nd result should not have sitelinks', () => {
    expect(serp.organic[1].hasOwnProperty('sitelinks')).toBeFalsy();
  });

  test('testing videos property for non existent results', () => {
    expect(serp.videos).toBeUndefined();
  });
});

describe('Parsing Google page with 100 results', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/google100.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  test('serp should have 98 results', () => {
    expect(serp.organic).toHaveLength(98);
  });

  test('all results should have domain domains.google', () => {
    expect(serp.organic.filter(x => x.domain === '')).toEqual([]);
  });

  test('2nd result should have url https://domains.google/', () => {
    expect(serp.organic[1].url).toBe('https://domains.google/');
  });

  test('2nd result should have title "Google Domains - Google"', () => {
    expect(serp.organic[1].title).toBe('Google Domains - Google');
  });

  test('2nd result should have snippet to start with "Search for and register a domain, get hosting...', () => {
    expect(serp.organic[1].snippet).toBe(
      'Search for and register a domain, get hosting, and build a site with Google Domains. The best of the internet backed by the security of Google.',
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
    if (serp.organic[0].sitelinks) {
      expect(serp.organic[0].sitelinks[0].title).toBe('Images');
      expect(serp.organic[0].sitelinks[0].snippet).toBe(
        'AllImages. Account &middot; Assistant &middot; Search &middot; Maps &middot; YouTube ...',
      );
      expect(serp.organic[0].sitelinks[0].type).toBe('card');
    }
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

  test('serp should have 9 results', () => {
    expect(serp.organic).toHaveLength(9);
  });

  test('Keyword should be "The Matrix"', () => {
    expect(serp.keyword).toBe('The Matrix');
  });

  test('1st result should have sitelinks and first sitelink should have title "Plot Summary"', () => {
    if (serp.organic[0].sitelinks) {
      expect(serp.organic[0].sitelinks[0].title).toBe('Plot Summary');
      expect(serp.organic[0].sitelinks[0].type).toBe('inline');
    }
  });

  test(`first videoCard in videos array should have title 
  "The Matrix YouTube Movies Science Fiction - 1999 $ From $3.99"`, () => {
    if (serp.videos) {
      expect(serp.videos[0].title).toBe('The Matrix YouTube Movies Science Fiction - 1999 $ From $3.99');
    }
  });
  test(`first videoCard in videos array should have sitelink 
  "https://www.youtube.com/watch?v=3DfOTKGvtOM"`, () => {
    if (serp.videos) {
      expect(serp.videos[0].sitelink).toBe('https://www.youtube.com/watch?v=3DfOTKGvtOM');
    }
  });
  test(`first videoCard in videos array should have source 
  "YouTube"`, () => {
    if (serp.videos) {
      expect(serp.videos[0].source).toBe('YouTube');
    }
  });
  test(`first videoCard in videos array should have string representation of date 
  "Mon Oct 29 2018"`, () => {
    if (serp.videos) {
      expect(serp.videos[0].date.toDateString()).toBe('Mon Oct 29 2018');
    }
  });
  test('first videoCard in videos array should have channel "Warner Movies On Demand"', () => {
    if (serp.videos) {
      expect(serp.videos[0].channel).toBe('Warner Movies On Demand');
    }
  });
  test('first videoCard in videos array should have videoDuration "2:23"', () => {
    if (serp.videos) {
      expect(serp.videos[0].videoDuration).toBe('2:23');
    }
  });
  test('thumbnailGroups feature should have length of 3', () => {
    if (serp.thumbnailGroups) {
      expect(serp.thumbnailGroups.length).toBe(3);
    }
  });
  test('2nd thumbnailGroup should have heading "Cyberpunk movies"', () => {
    if (serp.thumbnailGroups) {
      expect(serp.thumbnailGroups[1].heading).toBe('Cyberpunk movies');
    }
  });
  test('title of 2nd thumbnail in 2nd thumbnailGroup should be "Johnny Mnemonic"', () => {
    if (serp.thumbnailGroups) {
      expect(serp.thumbnailGroups[1].thumbnails[1].title).toBe('Johnny Mnemonic');
    }
  });
  test(`sitelink of 2nd thumbnail in 2nd thumbnailGroup should be 
  "/search?safe=off&gl=US&pws=0&nfpr=1&q=Johnny+Mnemonic&stick=H4sIAAAAAAAAAONgFuLQz9U3ME-uMlICs7JLUpK0pLKTrfTTMnNywYRVUWpOYklqikJxaknxKkbJNKvs1Mry_KIUq9z8sszUYiuQPsPCgmQAE-6fSE4AAAA&sa=X&ved=2ahUKEwiVguyg0t_fAhWNm1kKHbSKAmMQxA0wFnoECAYQBw"`, () => {
    if (serp.thumbnailGroups) {
      expect(serp.thumbnailGroups[1].thumbnails[1].sitelink).toBe(
        '/search?safe=off&gl=US&pws=0&nfpr=1&q=Johnny+Mnemonic&stick=H4sIAAAAAAAAAONgFuLQz9U3ME-uMlICs7JLUpK0pLKTrfTTMnNywYRVUWpOYklqikJxaknxKkbJNKvs1Mry_KIUq9z8sszUYiuQPsPCgmQAE-6fSE4AAAA&sa=X&ved=2ahUKEwiVguyg0t_fAhWNm1kKHbSKAmMQxA0wFnoECAYQBw',
      );
    }
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
    if (serp.organic[0].sitelinks) {
      expect(serp.organic[0].sitelinks[0].title).toBe('Plot Summary');
      expect(serp.organic[0].sitelinks[0].type).toBe('inline');
    }
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

  test('There should be 1258 similar hotels in the area', () => {
    if (serp.hotels) {
      expect(serp.hotels.moreHotels).toBe(1258);
    }
  });

  test('The searchTitle in searchFilters of hotels feature should be "Hotels near New York, NY"', () => {
    if (serp.hotels) {
      if (serp.hotels.searchFilters) {
        expect(serp.hotels.searchFilters.searchTitle).toBe('Hotels near New York, NY');
      }
    }
  });
  test('The checkIn date in searchFilters of hotels feature should be "Thu Mar 21 2019"', () => {
    if (serp.hotels) {
      if (serp.hotels.searchFilters) {
        expect(serp.hotels.searchFilters.checkIn.toDateString()).toBe('Thu Mar 21 2019');
      }
    }
  });
  test('The checkOut date in searchFilters of hotels feature should be "Fri Mar 22 2019"', () => {
    if (serp.hotels) {
      if (serp.hotels.searchFilters) {
        expect(serp.hotels.searchFilters.checkOut.toDateString()).toBe('Fri Mar 22 2019');
      }
    }
  });
  test('The guests number in searchFilters of hotels feature should be 2', () => {
    if (serp.hotels) {
      if (serp.hotels.searchFilters) {
        expect(serp.hotels.searchFilters.guests).toBe(2);
      }
    }
  });
  test(`There should be 
  ONE active hotel filter and 
  it should have title "Top choices" and explanation "Based on your search, prices & quality"`, () => {
    if (serp.hotels) {
      if (serp.hotels.searchFilters) {
        const activeFiltersNumber = serp.hotels.searchFilters.filters.reduce((acc, curr) => {
          if (curr.isActive === true) {
            return acc + 1;
          } else {
            return acc;
          }
        }, 0);
        expect(activeFiltersNumber).toBe(1);
        expect(serp.hotels.searchFilters.filters[0].title).toBe('Top choices');
        expect(serp.hotels.searchFilters.filters[0].explanation).toBe('Based on your search, prices & quality');
      }
    }
  });
  test('The second hotel filter should not have a property called isActive', () => {
    if (serp.hotels) {
      if (serp.hotels.searchFilters) {
        expect(serp.hotels.searchFilters.filters[1].isActive).toBeUndefined();
      }
    }
  });
  test('There should be 4 featured hotels in the hotels feature', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels.length).toBe(4);
    }
  });
  test('First featured hotel should have name "Row NYC"', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].name).toBe('Row NYC');
    }
  });
  test('First featured hotel should have currency "$"', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].currency).toBe('$');
    }
  });
  test('First featured hotel should have price 128', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].price).toBe(128);
    }
  });
  test('First featured hotel should have rating 3.7', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].rating).toBe(3.7);
    }
  });
  test('First featured hotel should have 6489 votes', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].votes).toBe(6489);
    }
  });
  test('Second featured hotel should have following amenities: "Free Wi-Fi"', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[1].amenities).toBe('Free Wi-Fi');
    }
  });
  test('First featured hotel should not have amenities property', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].amenities).toBeUndefined();
    }
  });
  test('Fourth featured hotel should have featured review: "Small rooms, sink and shower but good for the price."', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[3].featuredReview).toBe('Small rooms, sink and shower but good for the price.');
    }
  });
  test('First featured hotel should not have featuredReview property', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].featuredReview).toBeUndefined();
    }
  });
  test('Fourth featured hotel should not have deal property', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[3].deal).toBeUndefined();
    }
  });
  test(`First featured hotel should be labeled with deal,
   having dealType: "DEAL" and
   dealDetails: "22% less than usual"`, () => {
    if (serp.hotels) {
      if (serp.hotels.hotels[0].deal) {
        expect(serp.hotels.hotels[0].deal.dealType).toBe('DEAL');
        expect(serp.hotels.hotels[0].deal.dealDetails).toBe('22% less than usual');
      }
    }
  });
  test('First featured hotel should not have originalPrice property', () => {
    if (serp.hotels) {
      if (serp.hotels.hotels[0].deal) {
        expect(serp.hotels.hotels[0].deal.originalPrice).toBeUndefined();
      }
    }
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
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].name).toBe('Row NYC');
    }
  });
  test('Rating of the first featured hotel should be 3.7', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].rating).toBe(3.7);
    }
  });
  test('Number of votes of the first featured hotel should be 6489', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].votes).toBe(6489);
    }
  });
  test('Number of stars of the first featured hotel should be 2', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].stars).toBe(2);
    }
  });
  test('Description of the first featured hotel should be "Hip hotel with a trendy food court"', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].description).toBe('Hip hotel with a trendy food court');
    }
  });
  test('Featured review of the first featured hotel should be "Hard to beat LOCATION CLEAN SMALL rooms ( NYC size) Pleasant staff"', () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].featuredReview).toBe(
        'Hard to beat LOCATION CLEAN SMALL rooms ( NYC size) Pleasant staff',
      );
    }
  });
  test(`MoreInfoLink of the first featured hotel should be 
  "/search?sa=N&gl=us&hl=en&ie=UTF-8&q=Row+NYC+New+York,+NY&ludocid=2391828921476118880&ved=0ahUKEwj1g4bytYLhAhUDnRoKHbWnDUcQ_pABCEIwAA"`, () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[0].moreInfoLink).toBe(
        '/search?sa=N&gl=us&hl=en&ie=UTF-8&q=Row+NYC+New+York,+NY&ludocid=2391828921476118880&ved=0ahUKEwj1g4bytYLhAhUDnRoKHbWnDUcQ_pABCEIwAA',
      );
    }
  });
  test(`The 2nd featured hotel should have amenities 
  "Free Wi-Fi"`, () => {
    if (serp.hotels) {
      expect(serp.hotels.hotels[1].amenities).toBe('Free Wi-Fi');
    }
  });

  test(`There should be a moreHotels link and it should have href 
  "/search?sa=N&gl=us&hl=en&ie=UTF-8&q=hotels+NYC&npsic=0&rlst=f&rlha=1&rlla=0&rlhsc=Ch4IyamtyMPjxbh7COaI4bOI7frLRAiMk72-hdue-zkwAQ&rllag=40755324,-73968018,1746&ved=0ahUKEwj1g4bytYLhAhUDnRoKHbWnDUcQjGoIVw"`, () => {
    if (serp.hotels) {
      expect(serp.hotels.moreHotels).toBe(
        '/search?sa=N&gl=us&hl=en&ie=UTF-8&q=hotels+NYC&npsic=0&rlst=f&rlha=1&rlla=0&rlhsc=Ch4IyamtyMPjxbh7COaI4bOI7frLRAiMk72-hdue-zkwAQ&rllag=40755324,-73968018,1746&ved=0ahUKEwj1g4bytYLhAhUDnRoKHbWnDUcQjGoIVw',
      );
    }
  });
});

describe('Parsing Hotels-London search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/hotels-london.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  test('Second featured hotel should have originalPrice property and should have value 221', () => {
    if (serp.hotels) {
      if (serp.hotels.hotels[1].deal) {
        expect(serp.hotels.hotels[1].deal.originalPrice).toBe(221);
      }
    }
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

  test('There should be 4 ads on the top of the page', () => {
    if (serp.adwords) {
      expect(serp.adwords.length).toBe(4);
    }
  });
  test('Title of the first top ad should be "GoDaddy $0.99 Domains | Get Your Domain Today | GoDaddy.com‎"', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].title).toBe('GoDaddy $0.99 Domains | Get Your Domain Today | GoDaddy.com‎');
    }
  });
  test('Url of the first top ad should be "https://www.godaddy.com/offers/domains/godaddy-b"', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].url).toBe('https://www.godaddy.com/offers/domains/godaddy-b');
    }
  });
  test('Domain of the first top ad should be "www.godaddy.com"', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].domain).toBe('www.godaddy.com');
    }
  });
  test(`Snippet of the first top ad should be "Find Your Perfect Domain at GoDaddy and Get it Before Someone Else Does!"`, () => {
    if (serp.adwords) {
      expect(serp.adwords[0].snippet).toBe('Find Your Perfect Domain at GoDaddy and Get it Before Someone Else Does!');
    }
  });
  test(`Snippet of the first top ad should be "Find Your Perfect Domain at GoDaddy and Get it Before Someone Else Does!"`, () => {
    if (serp.adwords) {
      expect(serp.adwords[0].snippet).toBe('Find Your Perfect Domain at GoDaddy and Get it Before Someone Else Does!');
    }
  });
  test('Position of the first top ad should be 1', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].position).toBe(1);
    }
  });
  test('LinkType of the first top ad should be "LANDING"', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].linkType).toBe('LANDING');
    }
  });
  test('2nd sitelink title of the first top ad should be "Domain Privacy" and should be of type "inline"', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].sitelinks[1].title).toBe('Domain Privacy');
      expect(serp.adwords[0].sitelinks[1].type).toBe('inline');
    }
  });
  test('Location of the first top ad should be "TOP"', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].location).toBe('TOP');
    }
  });
});

describe('Parsing .com-domains page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/.com-domains.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  test(`First top ad should have sitelinks of type card and 2nd sitelink should have sitelinkSnippet 
  "Special offer for WP users.Free domain and site builders."`, () => {
    if (serp.adwords) {
      expect(serp.adwords[0].sitelinks[1].type).toBe('card');
      expect(serp.adwords[0].sitelinks[1].snippet).toBe('Special offer for WP users.Free domain and site builders.');
    }
  });
  test('5th ad should have location "BOTTOM"', () => {
    if (serp.adwords) {
      expect(serp.adwords[4].location).toBe('BOTTOM');
    }
  });
});

describe('Parsing Domain-nojs page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync('test/domain-nojs.html', { encoding: 'utf8' });
    serp = GoogleSERP(html);
  });

  test('Title of the first top ad should be "Google Domains - Official Site | Fast & Secure Infrastructure"', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].title).toBe('Google Domains - Official Site | Fast & Secure Infrastructure');
    }
  });
  test('Url of the first top ad should be "http://www.google.com/aclk?sa=l&ai=DChcSEwiE9bnLr4LhAhVlM9MKHbOVCnAYABAAGgJ3Yg&sig=AOD64_1GGQgzaMznzDlCoRHMnpF57a6iKg&ved=0ahUKEwjyxLXLr4LhAhXp6eAKHaKPDQ4Q0QwIEg&adurl="', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].url).toBe(
        'http://www.google.com/aclk?sa=l&ai=DChcSEwiE9bnLr4LhAhVlM9MKHbOVCnAYABAAGgJ3Yg&sig=AOD64_1GGQgzaMznzDlCoRHMnpF57a6iKg&ved=0ahUKEwjyxLXLr4LhAhXp6eAKHaKPDQ4Q0QwIEg&adurl=',
      );
    }
  });
  test('Domain of the first top ad should be "www.google.com"', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].domain).toBe('www.google.com');
    }
  });
  test(`Snippet of the first top ad should be "Shop from a wide selection of domain name endings that will help you stand out on the web. Faster and reliable connection to your website, with same DNS servers as..."`, () => {
    if (serp.adwords) {
      expect(serp.adwords[0].snippet).toBe('Shop from a wide selection of domain name endings that will help you stand out on the web. Faster and reliable connection to your website, with same DNS servers as...');
    }
  });
  test('Position of the first top ad should be 1', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].position).toBe(1);
    }
  });
  test('LinkType of the first top ad should be "LANDING"', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].linkType).toBe('LANDING');
    }
  });
  test('2nd sitelink title of the first top ad should be "Stand out with .dev" and should be of type "card"', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].sitelinks[1].title).toBe('Stand out with .dev');
      expect(serp.adwords[0].sitelinks[1].type).toBe('card');
    }
  });
  test('Location of the first top ad should be "TOP"', () => {
    if (serp.adwords) {
      expect(serp.adwords[0].location).toBe('TOP');
    }
  });
});
