import * as fs from 'fs-extra';
import { BingNojsSERP } from './index';
import { Ad, Serp } from './models';

const root = 'test/bing/nojs/';

test('BingNojsSERP should return empty organic array on empty html string', () => {
  expect(new BingNojsSERP('').serp.organic).toEqual([]);
});

describe('Parsing nojs Bing page with 10 resuts', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}bing-nojs.html`, { encoding: 'utf8' });
    serp = new BingNojsSERP(html).serp;
  });

  test('keyword should be bing', () => {
    expect(serp.keyword).toBe('bing');
  });

  test('serp should have 10 results', () => {
    expect(serp.organic).toHaveLength(10);
  });

  test('Current page should be 1', () => {
    expect(serp.currentPage).toBe(1);
  });

  test('2nd result should have domain www.malavida.com', () => {
    expect(serp.organic[1].domain).toBe('www.malavida.com');
  });

  test('2nd result should have url https://www.malavida.com/', () => {
    expect(serp.organic[1].url).toBe('https://www.malavida.com/es/soft/bing/');
  });

  test('2nd result should have title "Bing - Descargar para PC Gratis - Malavida"', () => {
    expect(serp.organic[1].title).toBe('Bing - Descargar para PC Gratis - Malavida');
  });

  test('2nd result should have snippet start with "Discover all the latest about..."', () => {
    expect(serp.organic[1].snippet).toBe(
      '24/1/2013 · 8/10 (87 votos) - Descargar Bing para PC Última Versión Gratis. La descarga Bing te permite realizar búsquedas directamente desde el escritorio gracias a Bing Desktop para Windows. Plántale cara a Google en tu PC. En el campo de búsquedas por Internet parece que todo esté dominado por Google pero...',
    );
  });

  test(`1st result should have snippet start with "Bing te ayuda a convertir la información..."`, () => {
    expect(serp.organic[0].snippet).toBe(
      `Bing te ayuda a convertir la información en acción, ya que facilita y acelera la transición de la búsqueda a la actividad concreta.`,
    );
  });

  test('1st result should have inline sitelinks', () => {
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'title'], 'Bing News');
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'href'], 'https://www.bing.com/news');
    expect(serp).toHaveProperty(['organic', 0, 'sitelinks', 0, 'type'], 'INLINE');
  });

  test('3rd result should not have sitelinks', () => {
    expect(serp.organic[2].hasOwnProperty('sitelinks')).toBeFalsy();
  });

  test('Page should have 0 related keywords', () => {
    expect(serp.relatedKeywords).toHaveLength(0);
  });
});

describe('Parsing nojs Bing page with 50 resuts', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}bing50-nojs.html`, { encoding: 'utf8' });
    serp = new BingNojsSERP(html).serp;
  });

  test('serp should have 32 results', () => {
    expect(serp.organic).toHaveLength(32);
  });

  test('all results should have a domain', () => {
    expect(serp.organic.filter((x) => x.domain === '')).toEqual([]);
  });

  test('3rd result should have url https://es.wikipedia.org/wiki/Bing', () => {
    expect(serp.organic[2].url).toBe('https://es.wikipedia.org/wiki/Bing');
  });

  test('3rd result should have title "Microsoft Bing - Wikipedia, la enciclopedia libre"', () => {
    expect(serp.organic[2].title).toBe('Microsoft Bing - Wikipedia, la enciclopedia libre');
  });

  test('3rd result should have snippet start with "Microsoft Bing (anteriormente Bing..."', () => {
    expect(serp.organic[2].snippet).toBe(
      'Microsoft Bing (anteriormente Bing, Live Search, Windows Live Search y MSN Search) es un buscador web de Microsoft.Presentado por el antiguo director ejecutivo de Microsoft, Steve Ballmer, el 28 de mayo de 2009 en la conferencia All Things Digital en San Diego, fue puesto en línea el 3 de junio de 2009 con una versión preliminar publicada el 1 de junio del 2009.',
    );
  });

  test('Keyword should be bing', () => {
    expect(serp.keyword).toBe('bing');
  });
});

describe('Parsing nojs "The Matrix" search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}matrix-nojs.html`, { encoding: 'utf8' });
    serp = new BingNojsSERP(html).serp;
  });

  test('serp should have 5 results', () => {
    expect(serp.organic).toHaveLength(5);
  });

  test('1th result should have snippet start with "The Matrix (titulada Matrix en español) es una..."', () => {
    expect(serp.organic[0].snippet).toContain(
      'The Matrix (titulada Matrix en español) es una película de ciencia ficción escrita y dirigida por las hermanas Wachowski y protagonizada por Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss y Hugo Weaving. Estrenada en los Estados Unidos el 31 de marzo de 1999.',
    );
  });

  test('Keyword should be "The Matrix"', () => {
    expect(serp.keyword).toBe('The Matrix');
  });

  test('1st result should not have sitelinks', () => {
    expect(serp.organic[0].sitelinks).toBeUndefined();
  });

  test('testing videos property for non existent results', () => {
    expect(serp.videos).toBeUndefined();
  });
  test('testing thumbnailGroups property for non existent results', () => {
    expect(serp.thumbnailGroups).toBeUndefined();
  });
});

describe('Parsing Hotels-nojs search page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}hotels-nojs.html`, { encoding: 'utf8' });
    serp = new BingNojsSERP(html).serp;
  });

  test('Name of the first featured hotel should be "Novotel New York Times Square"', () => {
    expect(serp.hotels?.hotels[0].name).toBe('Novotel New York Times Square');
  });
  test('Rating of the first featured hotel should be 4.5', () => {
    expect(serp.hotels?.hotels[0].rating).toBe(4.5);
  });
  test('Number of votes of the first featured hotel should be 1.8K', () => {
    expect(serp.hotels?.hotels[0].votes).toBe('1.8K');
  });
  test('Number of stars of the first featured hotel should be 4', () => {
    expect(serp.hotels?.hotels[0].stars).toBe(4);
  });
  test('Description of the first featured hotel should be ""', () => {
    expect(serp.hotels?.hotels[0].description).toBe('');
  });
  xtest('Featured review of the first featured hotel should be "Hard to beat LOCATION CLEAN SMALL rooms ( NYC size) Pleasant staff"', () => {
    expect(serp.hotels?.hotels[0].featuredReview).toBe(
      'Hard to beat LOCATION CLEAN SMALL rooms ( NYC size) Pleasant staff',
    );
  });
  test(`MoreInfoLink of the first featured hotel should be`, () => {
    expect(serp.hotels?.hotels[0].moreInfoLink).toBe('');
  });
  xtest(`The 2nd featured hotel should have amenities "Free Wi-Fi"`, () => {
    expect(serp.hotels?.hotels[1].amenities).toBe('Free Wi-Fi');
  });

  test(`There should be a moreHotels link and it should have href "/search?sa=N&gl=us..."`, () => {
    expect(serp.hotels?.moreHotels).toBe('');
  });
});

describe('Testing functions', () => {
  let serp: Serp;

  beforeAll(() => {
    serp = new BingNojsSERP('<body class="srp"><div></div></body>').serp;
  });

  test('testing getResults and getTime function for non existent results', () => {
    expect(serp.totalResults).toBeUndefined();
    expect(serp.timeTaken).toBeUndefined();
  });

  test('testing getHotels function for non existent results', () => {
    expect(serp.hotels).toBeUndefined();
  });
});

describe('Parsing Domain-nojs page', () => {
  let html: string;
  let serp: Serp;
  let adwords: { adwordsTop?: Ad[]; adwordsBottom?: Ad[] } | undefined;
  let adwordsTop: Ad[] | undefined;
  let adwordsBottom: Ad[] | undefined;

  beforeAll(() => {
    html = fs.readFileSync(`${root}domain-nojs.html`, { encoding: 'utf8' });
    serp = new BingNojsSERP(html).serp;
    adwords = serp.adwords;
    if (adwords) {
      adwordsTop = adwords.adwordsTop;
      adwordsBottom = adwords.adwordsBottom;
    }
  });

  test('There should be all ads', () => {
    expect(adwords).toBeDefined();
    expect(adwordsTop).toBeDefined();
    expect(adwordsBottom).toBeUndefined();
  });

  test('Testing first ad', () => {
    if (adwordsTop) {
      const ad = adwordsTop[0];
      expect(ad.position).toBe(1);
      expect(ad.title).toBe('Domain - Free Domain Name - Get a Free Domain Easy & Quick');
      expect(ad.url).toBe(
        'https://www.bing.com/aclick?ld=e8T8_KoRE9AgX2iyn8dXB4uzVUCUxTHT2k0LJjGa0ldJiV90WE9HNKu8HJ1zmmb82w7jO5-glZrXXwJH6iYoq87LWZfPW43kwwtTf4MCAxBlo4sQmk2FSwra1rbOVm-AOK29UiBr9D6Q_Hp5A3Gqf3btuCD8m2-ZhRFZgw98hpISdYIHO4&u=aHR0cHMlM2ElMmYlMmZ3aXguY29tJTJmaHRtbDViaW5nJTJmaGlrZXItZG9tYWluJTNmdXRtX3NvdXJjZSUzZGJpbmclMjZ1dG1fbWVkaXVtJTNkY3BjJTI2dXRtX2NhbXBhaWduJTNkbXNfZW5fZV9leHBhbnNpb25fRGVjMTklNWVkbl9kb21haW5feF8ya2ElMjZleHBlcmltZW50X2lkJTNkZG9tYWluJTVlYmUlNWU3OTcxNDcwOTI0NDYzMyU1ZWRvbWFpbiUyNm1zY2xraWQlM2RmZDEwZTJiNjlkNTUxZDdiNGEwYTgyYmY1YTBmMzhkNA&rlid=fd10e2b69d551d7b4a0a82bf5a0f38d4',
      );
      expect(ad.domain).toBe('www.bing.com');
      expect(ad.snippet).toBe(
        'AdWix Has Free Domains - Sign Up Now!SEO Wizard · Easy-To-Add Blog · Custom Domain Name · 100s of Templates',
      );
      expect(ad.linkType).toBe('LANDING');
    }
  });

  test(`Test first top ad card sitelink`, () => {
    if (adwordsTop) {
      const sitelink = adwordsTop[1].sitelinks[1];
      expect(sitelink.title).toBe('US$8.99 .COM Domains');
      expect(sitelink.href).toBe(
        'https://www.bing.com/aclick?ld=e8Ju0amMJoiqDACFONs7ixojVUCUyNYip8fLEwh1zWjBWvcCu3XEzfJENQM6gCJxBufM3m1BdCPMP7D5_jMLP-kbKZg_hPUiSmxo8r8IT2EaeDhTRX2AizMyWzclbG52Y_DpIH59ZSUoeclAVhbVzqYaHlA6CcS84sfqr2_oTHnDoOcDnh&u=aHR0cHMlM2ElMmYlMmZ3d3cub25seWRvbWFpbnMuY29tJTJmZG9tYWlucyUyZldvcmxkJTJmLmNvbSUzZm1zY2xraWQlM2QxZmNiZTI2NzA1NmIxZDYyOTllOTgyNmVjMjMxOGU4NSUyNnV0bV9zb3VyY2UlM2RiaW5nJTI2dXRtX21lZGl1bSUzZGNwYyUyNnV0bV9jYW1wYWlnbiUzZEdlbmVyaWMlMjUyMC0lMjUyMFJlc3QlMjUyME9mJTI1MjBXb3JsZCUyNTIwLSUyNTIwRXhhY3QlMjUyMC0lMjUyMERlc2t0b3AlMjUyMChCaW5nKSUyNnV0bV90ZXJtJTNkZG9tYWluJTI2dXRtX2NvbnRlbnQlM2ROb3JtYWwlMjUyMEJpZCUyNTIwLSUyNTIwRXhhY3QlMjUyMC0lMjUyMERvbWFpbg&rlid=1fcbe267056b1d6299e9826ec2318e85',
      );
      expect(sitelink.type).toBe('INLINE');
    }
  });
});

describe('Parsing no results nojs page', () => {
  let html: string;
  let serp: Serp;

  beforeAll(() => {
    html = fs.readFileSync(`${root}no-results-nojs.html`, { encoding: 'utf8' });
    serp = new BingNojsSERP(html).serp;
  });

  test('There should be 0 results', () => {
    expect(serp.organic).toHaveLength(0);
    expect(serp.error).toBe('No results page');
  });
});
