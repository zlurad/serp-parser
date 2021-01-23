# SERP Parser

[![Build Status](https://travis-ci.org/zlurad/serp-parser.svg?branch=master)](https://travis-ci.org/zlurad/serp-parser) [![codecov](https://codecov.io/gh/zlurad/serp-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/zlurad/serp-parser)

serp-parser is small lib writen in typescript used to extract search engine rank position from the html.

## Instalation

```
npm i serp-parser
yarn add serp-parser
```

## Usage - Google SERP extraction

GoogleSERP accepts both html that is extracted with any headless browser lib (`puppeteer`, `phantomjs`...) that have enabled javascript as well as html page structure from no-js-enabled requests from for example `request` lib. For full enabled js html we use `GoogleSERP` class, and for nojs pages `GoogleNojsSERP` class.

With html from headless browser we use full `GoogleSERP` parser

```
import { GoogleSERP } from 'serp-parser'

const parser = new GoogleSERP(html);

console.dir(parser.serp);
```

Or on es5 with request lib, we get nojs Google results, so we use `GoogleNojsSERP` parser that is separate class in the lib

```
var request = require("request")
var sp = require("serp-parser")

request('https://www.google.com/search?q=google', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    parser = new sp.GoogleNojsSERP(html);
    console.dir(parser.serp);
  }
});
```

It will return serp object with array of results with domain, position, title, url, cached url, similar url, link type, sitelinks and snippet

```
{
  "keyword: "google",
  "totalResults": 15860000000,
  "timeTaken": 0.61,
  "currentPage": 1,
  "pagination": [
    { page: 1,
      path: "" },
    { page: 2,
      path: "/search?q=google&safe=off&gl=US&pws=0&nfpr=1&ei=N1QvXKbhOLCC5wLlvLa4Dg&start=10&sa=N&ved=0ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQ8tMDCOwB" },
    ...
  ],
  "videos": [
    { title: "The Matrix YouTube Movies Science Fiction - 1999 $ From $3.99",
      sitelink: "https://www.youtube.com/watch?v=3DfOTKGvtOM",
      date: 2018-10-28T23:00:00.000Z,
      source: "YouTube",
      channel: "Warner Movies On Demand",
      videoDuration: "2:23" },
    ...
  ],
  "thumbnailGroups": [
      { "heading": "Organization software",
        "thumbnails:": [ {
          "sitelink": "/search?safe=off&gl=US&pws=0&nfpr=1&q=Microsoft&stick=H4sIAAAAAAAAAONgFuLUz9U3MDFNNk9S4gAzi8tMtGSyk630k0qLM_NSi4v1M4uLS1OLrIozU1LLEyuLVzGKp1n5F6Un5mVWJZZk5ucpFOenlZQnFqUCAMQud6xPAAAA&sa=X&ved=2ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQxA0wHXoECAQQBQ",
          "title": "Microsoft Corporation"
        },
        ...
      ]
    },
    ...
  ],
  "organic": [
    {
      "domain": "www.google.com",
      "position": 1,
      "title": "Google",
      "url": "https://www.google.com/",
      "cachedUrl": "https://webcache.googleusercontent.com/search?q=cache:y14FcUQOGl4J:https://www.google.com/+&cd=1&hl=en&ct=clnk&gl=us",
      "similarUrl": "/search?safe=off&gl=US&pws=0&nfpr=1&q=related:https://www.google.com/+google&tbo=1&sa=X&ved=2ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQHzAAegQIARAG",
      "linkType": "HOME",
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
      "domain": "www.google.org",
      "position": 2,
      "title": "Google.org: Home",
      "url": "https://www.google.org/",
      "cachedUrl": "https://webcache.googleusercontent.com/search?q=cache:Nm9ycLj-SKoJ:https://www.google.org/+&cd=24&hl=en&ct=clnk&gl=us",
      "similarUrl": "/search?safe=off&gl=US&pws=0&nfpr=1&q=related:https://www.google.org/+google&tbo=1&sa=X&ved=2ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQHzAXegQIDBAF",
      "linkType": "HOME",
      "snippet": "Data-driven, human-focused philanthropy powered by Google. We bring the best of Google to innovative nonprofits that are committed to creating a world that..."
    },
    ...
  ],
  "relatedKeywords": [
    { keyword: google search,
      path: "/search?safe=off&gl=US&pws=0&nfpr=1&q=google+search&sa=X&ved=2ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQ1QIoAHoECA0QAQ" },
    { keyword: google account,
      path: "/search?safe=off&gl=US&pws=0&nfpr=1&q=google+account&sa=X&ved=2ahUKEwjm2Mn2ktTfAhUwwVkKHWWeDecQ1QIoAXoECA0QAg" },
    ...
  ]
}
```

## Usage - Bing SERP extraction

**Note: Only BingNojsSerp is implemented so far.**

BingSERP works the same as GoogleSerp. It accepts both html that is extracted with any headless browser lib (`puppeteer`, `phantomjs`...) that have enabled javascript as well as html page structure from no-js-enabled requests from for example `request` lib. For full enabled js html we use `BingSERP` class, and for nojs pages `BingNojsSERP` class.

With html from headless browser we use full `BingSERP` parser

```
import { BingSERP } from 'serp-parser'

const parser = new BingSERP(html);

console.dir(parser.serp);
```

Or on es5 with request lib, we get nojs Bing results, so we use `BingNojsSERP` parser that is separate class in the lib

```
var request = require("request")
var sp = require("serp-parser")

request('https://www.bing.com/search?q=bing', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    parser = new sp.BingNojsSERP(html);
    console.dir(parser.serp);
  }
});
```

## Roadmap

We are working on enriching parsed data to grab all existing and new SERP features from Google search page results, as well as knowlege graph, ads, and any related info. Also we will add more Search engines along the way.

Anyone willing to help - please submit issues, feature requests, fork away and send PR's
