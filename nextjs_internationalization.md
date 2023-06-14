# Internationalization

Next.js enables you to configure the routing and rendering of content to support multiple languages. It’s recommended to use the user’s language preferences in the browser to select which locale to use. Changing your preferred language will modify the incoming Accept-Language header to your application.

## Table of contents

<!-- toc -->

- [1. create a dynamic route segment [lang]](#1-create-a-dynamic-route-segment-lang)
- [2. i18n-config.js](#2-i18n-configjs)
- [3. middleware](#3-middleware)
- [4. dictionaries](#4-dictionaries)
- [5. get-dictionary.js](#5-get-dictionaryjs)
- [6. generateStaticParams for dynamic route segment [lang]](#6-generatestaticparams-for-dynamic-route-segment-lang)
- [7. using dictionaries in server components](#7-using-dictionaries-in-server-components)
- [8. using dictionaries in client components](#8-using-dictionaries-in-client-components)
- [gotchas](#gotchas)

<!-- tocstop -->

## 1. create a dynamic route segment [lang]

In the `app`, create a dynamic route segment for the language `[lang]`. So all our routes will be end up looking like `/fr/about` or `/en/about`, etc. Move all special files except `api`, `favicon.ico` and `globals.css` into the dynamic route.

```
app
 ├─[lang]
 │  ├─about
 │  ├─layout.js     <-- root layout
 │  ├─not-found.js  <-- we need to do more to get this to work, see below
 │  └─page.js       <-- index page
 ├─api
 ├─favicon.ico
 └─globals.css
```

## 2. i18n-config.js 

In our root folder (beside `app`) we can create a file that will define which locales we support and which are the default.

```javascript
// Supported languages
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'fr', 'es'],
};
```

## 3. middleware

Using the following libraries:

```bash
npm install @formatjs/intl-localematcher
npm install negotiator
npm install server-only
```

... you can look at an incoming Request to determine which locale to select, based on the Headers, locales you plan to support, and the default locale.

```javascript
import { NextResponse } from 'next/server';
import { i18n } from './i18n-config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';


function getLocale(request) {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // Use negotiator to extract and parse the `Accept-Language` header.
  // It will take into account any quality values, e.g.:
  // Accept-Language: en-US,en;q=0.8,fr;q=0.6,de;q=0.4
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  // Get our array of supported locales
  const locales = i18n.locales;

  // Use intl-localematcher to choose the best locale
  return matchLocale(languages, locales, i18n.defaultLocale);
}

export function middleware(request) {
  // Check the url path to see if it includes a locale already e.g. /en/about
  const pathname = request.nextUrl.pathname;

  // Check it against our supported locales:
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // If there is not supported local at the start of the pathname, add it and
  // redirect. This is so that throughout out app we can link to pages as normal
  // without having to worry about the [lang] dynamic part of the URL.
  // Technically, if someone manually typed in an unsupported locale like
  // /ja/about, it would redirect them to /en/ja/about and therefor return a 404
  // (just as it would without the /en).
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(new URL(`/${locale}/${pathname}`, request.url));
  }
}

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  //
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

```

See [language codes](https://www.loc.gov/standards/iso639-2/php/English_list.php).
See [region designators (country codes)](https://www.iso.org/obp/ui/#search).
See [http headers: Accept-Language](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language).

## 4. dictionaries

In out root folder (beside `app`) we can create a dictionaries directory with a json file for every language we're supporting. The files would have objects with identical keys:

/dictionaries/en.json

```javascript
{
    "global": {
        "hello": "Hello"
    },
    "navlinks": {
        "one": "one",
        "two": "two",
        "three": "three"
    },
   // ...
}
```

/dictionaries/fr.json

```javascript
{
    "global": {
        "hello": "Bonjour"
    },
    "navlinks": {
        "one": "un",
        "two": "deux",
        "three": "trois"
    },
   // ...
}
```

/dictionaries/es.json

```javascript
{
    "global": {
        "hello": "Hola"
    },
    "navlinks": {
        "one": "uno",
        "two": "dos",
        "three": "tres"
    },
   // ...
}
```

## 5. get-dictionary.js

Next create `get-dictionary.js` in the root folder (beside `app`) to contain a function that will load the above files as a module.

```javascript
import 'server-only';

// By using dynamic imports, the application only loads the dictionary for the
// current user's language, rather than loading all dictionaries upfront.
// Each function in the dictionaries object returns a promise that resolves to
// the imported dictionary, which is then used in the getDictionary function.
const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  fr: () => import('./dictionaries/fr.json').then((module) => module.default),
  es: () => import('./dictionaries/es.json').then((module) => module.default),
};

export const getDictionary = async (locale) => {
  return dictionaries[locale]();
};
```

## 6. generateStaticParams for dynamic route segment [lang] 

In the root layout, we'll `generateStaticParams` as we do for dynamic routes using our config file. We can then add `params` to the root layout props and pass `params.lang` to the html tag.

```javascript
import { i18n } from '@/i18n-config';
import '../globals.css';

// Generate routes for our dynamic route segment [lang]
export async function generateStaticParams() {
  return i18n.locales.map(locale => ({ lang: locale }));
}

// Root Layout
export default async function RootLayout({ children, params }) {
  return (
    <html lang={params.lang}>
      <body>
        {children}
      </body>
    </html>
  );
}
```

## 7. using dictionaries in server components

If my page/component is a server component, I can then call `getDictionary` (which we marked `server-only`) to grab the dictionary that matched the request `/[lang]`. We have to make the component and `async` function so that we can `await` the result of `getDictionary` which returns a promise. We also get `params` from the props. 

Remember **dynamic segments are automatically passed as the `params` prop in `layout`'s and `page`'s.** We can then access all the values with dot notation. For example, in my index page:

```javascript
import { getDictionary } from '@/get-dictionaries';  // <-- import it

export default async function Home({ params }) {  // <-- make this function async
  const dictionary = await getDictionary(params.lang);  // <-- call it and await the result
  return (
    <main>
      <p>{dictionary.global.hello}.</p>
    </main>
  )
}
```

You could also pass the dictionary, or part of the dictionary as a prop to components in the page (see next example).

## 8. using dictionaries in client components 

If my page/component is a client component then I can't call `getDictionary` directly because its `server-only`. Instead, use a parent that is a server component, get the dictionary there and then pass it down through props. 

For example, my root layout has a `<Navbar>` so I'll pass the `params.lang` to it since it won;t have access to `params` itself:

```javascript
// ...

// Root Layout
export default function RootLayout({ children, params }) {
  return (
    <html lang={params.lang}>
      <body>
        <Navbar lang={params.lang} />
        {children}
      </body>
    </html>
  );
}
```

Then in `Navbar`, I'll get the dictionary to pass the specfic section I need to my `Navlink` client component:

```javascript
import { getDictionary } from '@/get-dictionaries';
import Navlinks from './Navlinks';

export default async function Navbar({ lang }) {  // <-- dont forget to make it async!
  const dictionary = await getDictionary(lang);   // <-- await the getDictionary call
  return (
    <header>
      <Navlinks dictionary={dictionary.navlinks} />
    </header>
  );
}
```

Then I use the dictionary in my `Navlinks` client component:

```javascript
'use client';

import Link from 'next/link';

export default function Navlinks({ dictionary }) {

  const links = [
    { name: dictionary.one, href: '/one' },
    { name: dictionary.two, href: '/two' },
    { name: dictionary.three, href: '/three' }
  ];

  return (
    <ul>
      {links.map((link) => {
        return (
          <li key={link.name}>
            <Link href={link.href}>{link.name}</Link>
          </li>
        );
      })}
    </ul>
  );
}

```

You might be looking at this wondering why its a client component, well I pulled that stuff out for brevity. 

I could probably serve this dictionary through context too.

## gotchas

**Getting `not-found.js` to work correctly:**

- Initially I could not get `not-found.js` to work work is this setup. Given everything I've read, you would think it goes in the same `app/[lang]` directory as the root layout but it does not work. See [this github issue#5211681](https://github.com/vercel/next.js/discussions/50034#discussion-5211681). The workaround is to use dynamic catch all routes:

```
app
 ├─[lang]
 │  ├─[...not-found]   <-- dynamic catch-all route
 │  │  └─page.js       <-- page will call notFound() which raises an error 
 │  ├─about                which will be caught by the closest not-found.js
 │  ├─layout.js
 │  ├─not-found.js     <-- my normal not-found.js
 │  └─page.js
 ├─api
 ├─favicon.ico
 └─globals.css
```

app/[lang]/[...not-found]/page.js:

```javascript
import { notFound } from "next/navigation";

export default function NotFoundCatchAll() {
  // You want to call notFound() here and not just render a 404
  // so that the 404 status code gets sent correctly. notFound()
  // throws a NEXT_NOT_FOUND error which will then be caught by 
  // the closest not-found special file.
  notFound();
}
```

- Make sure `favicon.ico` is still in your app dir not `[lang]`
- If you have an `api` dir, it should also be in app. If it has route segments, make sure the top level has a `route.js` as well, otherwise if they go to `/api`, there's an error where its trying to call `getDictionary` despite `/api` being ignored in the middleware. I just made it an api route that describes all my other api routes:

```javascript
// app/api/route.js
const apiRoutes = [
  {
    route: '/api/demo',
    description: 'A test api that returns a random Mr. Rogers quote.'
  }
];

export async function GET(req) {
  // Response in a native Web API
  return new Response(JSON.stringify({ data: apiRoutes }));
}
```

