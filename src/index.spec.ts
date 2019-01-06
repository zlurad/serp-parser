import * as fs from 'fs-extra';
import { GoogleSERP, Result } from './index';

test('GoogleSERP should return empty array on empty html string', () => {
  expect(GoogleSERP('')).toEqual([]);
});

describe('Parsing Google page with 10 resuts', () => {
  let google: string;
  let serp: Result[];

  beforeAll(() => {
    google = fs.readFileSync('test/google.html', { encoding: 'utf8' });
    serp = GoogleSERP(google);
  });

  test('serp should have 7 results', () => {
    expect(serp).toHaveLength(7);
  });
  
  test('3rd result should have url https://domains.google/', () => {
    expect(serp[2].url).toBe('https://domains.google/');
  });
});

describe('Parsing Google page with 100 resuts', () => {
  let google: string;
  let serp: Result[];

  beforeAll(() => {
    google = fs.readFileSync('test/google100.html', { encoding: 'utf8' });
    serp = GoogleSERP(google);
  });

  test('serp should have 98 results', () => {
    expect(serp).toHaveLength(98);
  });
  
  test('2nd result should have url https://domains.google/', () => {
    expect(serp[1].url).toBe('https://domains.google/');
  });
});

describe('Parsing nojs Google page with 10 resuts', () => {
  let google: string;
  let serp: Result[];

  beforeAll(() => {
    google = fs.readFileSync('test/google-nojs.html', { encoding: 'utf8' });
    serp = GoogleSERP(google);
  });

  test('serp should have 7 results', () => {
    expect(serp).toHaveLength(7);
  });
  
  test('5th result should have url https://domains.google/', () => {
    expect(serp[4].url).toBe('https://domains.google/');
  });
});

describe('Parsing nojs Google page with 100 resuts', () => {
  let google: string;
  let serp: Result[];

  beforeAll(() => {
    google = fs.readFileSync('test/google100-nojs.html', { encoding: 'utf8' });
    serp = GoogleSERP(google);
  });

  test('serp should have 97 results', () => {
    expect(serp).toHaveLength(97);
  });
  
  test('4th result should have url https://domains.google/', () => {
    expect(serp[3].url).toBe('https://domains.google/');
  });
});


