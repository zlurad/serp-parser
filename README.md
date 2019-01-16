# SERP Parser

[![Build Status](https://travis-ci.org/zlurad/serp-parser.svg?branch=master)](https://travis-ci.org/zlurad/serp-parser) [![codecov](https://codecov.io/gh/zlurad/serp-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/zlurad/serp-parser)

serp-parser is small lib writen in typescript used to extract search engine rank position from the html. 

## Instalation

```
npm i serp-parser
yarn add serp-parser
```

## Usage - Google SERP extraction

GoogleSERP accepts both html that is extracted with any headless browser lib (`puppeteer`, `phantomjs`...) that have enabled javascript as well as html page structure from no-js-enabled requests from for example `request` lib.

With html from headless browser
```
import { GoogleSERP } from 'serp-parser'

const results = GoogleSERP(html);

console.log(results);
```

Or on es5 with request lib
```
var request = require("request")
var sp = require("serp-parser")

request('https://www.google.com/search?q=google', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    console.log(sp.GoogleSERP(html));
  }
});
```

It will return serp object with array of results with position, title, url, domain, snippet and sitelinks
```
{
  "keyword: "google",
  "organic": [
    {
      "position": 1,
      "title": "Google",
      "url": "https://www.google.com/",
      "domain": "www.google.com",
      "sitelinks": [
        { "title": "Google Docs", 
          "snippet": "Google Docs brings your documents to life with smart ...",
          "type": "card" },
        { "title": "Google News", 
          "snippet": "Comprehensive up-to-date news coverage, aggregated from ...",
          "type": "card" },
        ...
      ],
      "snippet": "Settings Your data in Search Help Send feedback. AllImages. Account · Assistant · Search · Maps · YouTube · Play · News · Gmail · Contacts · Drive · Calendar."
    },
    {
      "position": 2,
      "title": "Google.org: Home",
      "url": "https://www.google.org/",
      "domain": "www.google.org",
      "snippet": "Data-driven, human-focused philanthropy powered by Google. We bring the best of Google to innovative nonprofits that are committed to creating a world that..."
    },
    ...
  ]
}
```

## Roadmap

We are working on enriching parsed data to grab all existing and new SERP features from Google search page results, as well as knowlege graph, ads, and any related info. Also we will add more Search engines along the way.

Anyone willing to help - please submit issues, feature requests, fork away and send PR's
