import { LinkType } from './models';
import { getDomain, getFirstMatch, getLinkType, getTimeTaken, getTotalResults, getUrlFromQuery } from './utils';

describe('Testing getDomain utility', () => {
  test('for url input it should return lowercase domain name', () => {
    expect(getDomain('https://google.com/test')).toEqual('google.com');
    expect(getDomain('https://GOOGLE.COM/something')).toEqual('google.com');
    expect(getDomain('https://v.me')).toEqual('v.me');
    expect(getDomain('https://google.domains/domains')).toEqual('google.domains');
    expect(getDomain('https://sub.domain.me')).toEqual('sub.domain.me');
  });
});

describe('Testing getUrlFromSearchString utility', () => {
  test('for empty input it should return google.com', () => {
    expect(getUrlFromQuery('')).toEqual('https://google.com');
  });

  test('for search query input it should return apropriate link', () => {
    expect(
      getUrlFromQuery(
        '/url?q=https://www.youtube.com/Google&sa=U&ved=0ahUKEwjvz7ySg9XfAhVTBWMBHZxaCVUQFghEMA0&usg=AOvVaw3hj_MvlPj_z331AUw0E8P8',
      ),
    ).toEqual('https://www.youtube.com/Google');
    expect(getUrlFromQuery('/search?q=google&safe=off&gl=US&pws=0&nfpr=1')).toEqual(
      'https://google.com/search?q=google&safe=off&gl=US&pws=0&nfpr=1',
    );
  });
});

describe('Testing getFirstMatch utility', () => {
  test('for provided string input that has matches with provided regex it should return only the first match', () => {
    expect(getFirstMatch('abcdefg', /cde/)).toBe('cde');
    expect(getFirstMatch('abcdefg', /cde/g)).toBe('cde'); // with global flag
    expect(getFirstMatch('abcdefgcde', /cde/g)).toBe('cde'); // with multiple matches
  });
  test('for provided string that has no matches with the provided regex it should return empty string', () => {
    expect(getFirstMatch('abcd', /efg/)).toBe('');
  });
});

describe('Testing getLinkType utility', () => {
  test('Return value should be "LANDING" when provided url contains hostname + "/" + some path after "/', () => {
    expect(getLinkType('http://www.abc.com/path')).toBe(LinkType.landing);
  });
  test('Return value should be "HOME" when provided url contains only hash', () => {
    expect(getLinkType('https://www.abc.com/#home')).toBe(LinkType.home);
  });
  test('Return value should be "HOME" when provided url contains only hostname', () => {
    expect(getLinkType('https://www.abc.com')).toBe(LinkType.home);
  });
});

describe('Testing getTimeTaken', () => {
  test('Testing get time function', () => {
    expect(getTimeTaken('About 1,240,000,000 results (0.58 seconds) ')).toBe(0.58);
    expect(getTimeTaken('About 1,240,000,000 results (1.12 seconds) ')).toBe(1.12);
    expect(getTimeTaken('About 1,160,000,000 results')).toBeUndefined();
  });
});

describe('Testing getTotalResults', () => {
  test('Testing get total results function', () => {
    expect(getTotalResults('About 1,240,000,000 results (0.58 seconds) ')).toBe(1240000000);
    expect(getTotalResults('About 1,000 results (1.12 seconds) ')).toBe(1000);
    expect(getTotalResults('')).toBeUndefined();
  });
});
