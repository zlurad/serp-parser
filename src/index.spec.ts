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

  test('1st result should have sitelinks and first sitelink should have title "Google Docs"', () => {
    expect(serp.organic[0].sitelinks[0].title).toBe('Google Docs');
  });
  test(`1st result should have sitelinks and first sitelink should have snippet
   "Google Docs brings your documents to life with smart ..."`, () => {
    expect(serp.organic[0].sitelinks[0].snippet).toBe('Google Docs brings your documents to life with smart ...');
  });
  test('1st result should have sitelinks and first sitelink should have title type "card"', () => {
    expect(serp.organic[0].sitelinks[0].type).toBe('card');
  });

  test('Keyword should be google', () => {
    expect(serp.keyword).toBe('google');
  });
});

describe('Parsing Google page with 100 resuts', () => {
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

  test('1st result should have sitelinks and 4th sitelink should have title "Google Translate"', () => {
    expect(serp.organic[0].sitelinks[3].title).toBe('Google Translate');
  });
  test(`1st result should have sitelinks and 4th sitelink should have snippet
   "Google\'s free service instantly translates words, phrases, and ..."`, () => {
    expect(serp.organic[0].sitelinks[3].snippet).toBe(
      "Google's free service instantly translates words, phrases, and ...",
    );
  });
  test('1st result should have sitelinks and 4th sitelink should have type "card"', () => {
    expect(serp.organic[0].sitelinks[3].type).toBe('card');
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

  test('1st result should have sitelinks and first sitelink should have title "Images"', () => {
    expect(serp.organic[0].sitelinks[0].title).toBe('Images');
  });
  test(`1st result should have sitelinks and first sitelink should have snippet
   "AllImages. Account &middot; Assistant &middot; Search &middot; Maps &middot; YouTube ..."`, () => {
    expect(serp.organic[0].sitelinks[0].snippet).toBe(
      'AllImages. Account &middot; Assistant &middot; Search &middot; Maps &middot; YouTube ...',
    );
  });
  test('1st result should have sitelinks and first sitelink should have type "card"', () => {
    expect(serp.organic[0].sitelinks[0].type).toBe('card');
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

  test('1st result should have sitelinks and 4th sitelink should have title "Google Translate"', () => {
    expect(serp.organic[0].sitelinks[3].title).toBe('Google Translate');
  });
  test(`1st result should have sitelinks and 4th sitelink should have snippet
   "Google\'s free service instantly translates words, phrases, and ..."`, () => {
    expect(serp.organic[0].sitelinks[3].snippet).toBe(
      "Google's free service instantly translates words, phrases, and ...",
    );
  });
  test('1st result should have sitelinks and 4th sitelink should have type "card"', () => {
    expect(serp.organic[0].sitelinks[3].type).toBe('card');
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
    // 9 results?
    expect(serp.organic).toHaveLength(9);
  });

  test('Keyword should be "The Matrix"', () => {
    expect(serp.keyword).toBe('The Matrix');
  });

  test('1st result should have sitelinks and first sitelink should have title "Plot Summary"', () => {
    expect(serp.organic[0].sitelinks[0].title).toBe('Plot Summary');
  });
  test('1st result should have sitelinks and first sitelink should have type "inline"', () => {
    expect(serp.organic[0].sitelinks[0].type).toBe('inline');
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

  test('Keyword should be "The Matrix"', () => {
    expect(serp.keyword).toBe('The Matrix');
  });

  test('1st result should have sitelinks and first sitelink should have title "Plot Summary"', () => {
    expect(serp.organic[0].sitelinks[0].title).toBe('Plot Summary');
  });
  test('1st result should have sitelinks and first sitelink should have type "inline"', () => {
    expect(serp.organic[0].sitelinks[0].type).toBe('inline');
  });
  
});
