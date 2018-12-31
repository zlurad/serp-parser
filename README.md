# SERP Parser

[![Build Status](https://travis-ci.org/zlurad/serp-parser.svg?branch=master)](https://travis-ci.org/zlurad/serp-parser) [![codecov](https://codecov.io/gh/zlurad/serp-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/zlurad/serp-parser)

serp-parser is small lib writen in typescript used to extract search engine rank position from the html. 

## Instalation

```
npm i serp-parser
yarn add serp-parser
```

# Usage - Google SERP extraction

GoogleSERP accepts html that is extracted with any headless browser lib (puppeteer, phantomjs...) that have enabled javascript. Google is serving different html page structure to no-js-enabled requests.

```
import { GoogleSERP } from 'serp-parser'

const results = GoogleSERP(html);

console.log(results);
```

It will return array of results with position and url
```
[
  {
    "position": 1,
    "url": "https://www.google.com/"
  },
  {
    "position": 2,
    "url": "https://www.google.org/"
  },
  ...
]
```

## Roadmap

We are working on enriching parsed data to grab all existing and new SERP features from Google search page results, as well as knowlege graph, Ads, and any related info. Also we will add more Search engines along the way.

Anyone willing to help - please fork away and send PR's