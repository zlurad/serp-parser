import * as fs from 'fs-extra';
import { GoogleSERP, Serp } from './index';

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

  test('serp should have 7 results', () => {
    expect(serp.organic).toHaveLength(7);
  });

  test('3rd result should have url https://domains.google/', () => {
    expect(serp.organic[2].url).toBe('https://domains.google/');
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

  test('serp should have 7 results', () => {
    expect(serp.organic).toHaveLength(7);
  });

  test('5th result should have url https://domains.google/', () => {
    expect(serp.organic[4].url).toBe('https://domains.google/');
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
});
