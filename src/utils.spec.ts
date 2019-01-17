import { getDomain, getUrlFromQuery } from './utils';

describe('Testing getDomain utility', () => {
  // test('for empty input it should return empty string', () => {
  //   expect(getDomain('')).toThrow();
  // });

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
