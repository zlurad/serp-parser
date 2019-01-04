import * as fs from 'fs-extra';
import { GoogleSERP } from './index';

let google: string;
let google100: string;

beforeAll(() => {
  google = fs.readFileSync('test/google.html', { encoding: 'utf8' });
  google100 = fs.readFileSync('test/google100.html', { encoding: 'utf8' });
});

test('GoogleSERP should return empty array on empty html string', () => {
  expect(GoogleSERP('')).toEqual([]);
});

test('GoogleSERP should return 7 results for test/google.html', () => {
  expect(GoogleSERP(google)).toHaveLength(7);
});

test('3rd result from test/google.html should have url https://domains.google/', () => {
  expect(GoogleSERP(google)[2].url).toBe('https://domains.google/');
});

test('GoogleSERP should return 98 results for test/google100.html', () => {
  expect(GoogleSERP(google100)).toHaveLength(98);
});

test('2nd result from test/google100.html should have url https://domains.google/', () => {
  expect(GoogleSERP(google100)[1].url).toBe('https://domains.google/');
});