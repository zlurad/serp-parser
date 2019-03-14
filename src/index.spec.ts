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
    expect(serp.relatedKeywords[0].path).toBe('/search?safe=off&gl=US&pws=0&nfpr=1&q=google+search&sa=X&ved=2ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQ1QIoAHoECA0QAQ');
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
    expect(serp.relatedKeywords[0].path).toBe('/search?safe=off&gl=US&pws=0&nfpr=1&ie=UTF-8&oe=UTF-8&q=google+search&sa=X&ved=0ahUKEwjvz7ySg9XfAhVTBWMBHZxaCVUQ1QIIUCgA');
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

describe('Testing functions', () => {
  let serp: Serp;

  beforeAll(() => {
    serp = GoogleSERP('<body class="srp"><div></div></body>');
  });

  test('testing getResults and getTime function for non existent results', () => {
    expect(serp.totalResults).toBeUndefined();
    expect(serp.timeTaken).toBeUndefined();
  });
});
