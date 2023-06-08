# Internationalization

Next.js enables you to configure the routing and rendering of content to support multiple languages. It’s recommended to use the user’s language preferences in the browser to select which locale to use. Changing your preferred language will modify the incoming Accept-Language header to your application.

## Table of contents

<!-- toc -->

- [setup app/[lang]](#setup-applang)
- [middleware](#middleware)
- [i18n-config.js](#i18n-configjs)
- [dictionaries](#dictionaries)
- [get-dictionary.js](#get-dictionaryjs)
- [generateStaticParams for dynamic route segment [lang]](#generatestaticparams-for-dynamic-route-segment-lang)
- [using dictionaries in page content and components](#using-dictionaries-in-page-content-and-components)

<!-- tocstop -->

## setup app/[lang]


## middleware

For example, using the following libraries:

```bash
npm install @formatjs/intl-localematcher
npm install negotiator
```

... you can look at an incoming Request to determine which locale to select, based on the Headers, locales you plan to support, and the default locale.

```javascript
// middleware.js
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

// pretend these are the headers from the request
let headers = { 'accept-language': 'en-US,en;q=0.5' };
let languages = new Negotiator({ headers }).languages();

// the locales we support
let locales = ['en-US', 'fr-CA', 'es'];

/// the default
let defaultLocale = 'en-US';
 
match(languages, locales, defaultLocale); // -> 'en-US'
```

See [language codes](https://www.loc.gov/standards/iso639-2/php/English_list.php).
See [region designators (country codes)](https://www.iso.org/obp/ui/#search).
See [http headers: Accept-Language](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language).

With this information you could then redirect the user based on the locale.


## i18n-config.js 


## dictionaries


## get-dictionary.js


## generateStaticParams for dynamic route segment [lang] 


## using dictionaries in page content and components

