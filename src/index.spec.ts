import { GoogleSERP } from './index';
test('GoogleSERP should return empty array on empty html string', () => {
  expect(GoogleSERP('')).toEqual([]);
});
