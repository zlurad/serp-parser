import * as fs from 'fs-extra';
import { GoogleSERP, Serp } from './index';

test('GoogleSERP should return empty array on empty html string', () => {
  expect(GoogleSERP('')).toEqual({ organic: [] });
});

describe('Parsing Google page with 10 resuts', () => {
  let google: string;
  let serp: Serp;

  beforeAll(() => {
    google = fs.readFileSync('test/google.html', { encoding: 'utf8' });
    serp = GoogleSERP(google);
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
});

describe('Parsing Google page with 100 resuts', () => {
  let google: string;
  let serp: Serp;

  beforeAll(() => {
    google = fs.readFileSync('test/google100.html', { encoding: 'utf8' });
    serp = GoogleSERP(google);
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
});

describe('Parsing nojs Google page with 10 resuts', () => {
  let google: string;
  let serp: Serp;

  beforeAll(() => {
    google = fs.readFileSync('test/google-nojs.html', { encoding: 'utf8' });
    serp = GoogleSERP(google);
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
});

describe('Parsing nojs Google page with 100 resuts', () => {
  let google: string;
  let serp: Serp;

  beforeAll(() => {
    google = fs.readFileSync('test/google100-nojs.html', { encoding: 'utf8' });
    serp = GoogleSERP(google);
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
});
