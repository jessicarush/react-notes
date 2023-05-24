# Next.js (using App Router)

Next used to use something called *Pages router* but now they are moving to a different setup called *App router* which is now officially recommended over *Page router*. The information below is in the *App router* format. See [nextjs_app_router.md](nextjs_page_router.md) for *Page router* information. Note that you can continue to use a pages directory with the *App router*.

The [13.5 release blog post](https://nextjs.org/blog/next-13-4) explains some of the differences between the two routers.

## Table of Contents

<!-- toc -->

- [Getting started](#getting-started)
- [Directory structure](#directory-structure)
- [Server-side vs Client-side components](#server-side-vs-client-side-components)
- [Server components can do API calls](#server-components-can-do-api-calls)
- [Server components cannot contain hooks](#server-components-cannot-contain-hooks)
- [loading.js](#loadingjs)
- [error.js](#errorjs)
- [Dynamic routes](#dynamic-routes)
  * [catch-all routes](#catch-all-routes)
- [Caching/revalidating with `fetch()`](#cachingrevalidating-with-fetch)
- [Caching/revalidating with `dynamic` and `revalidate`](#cachingrevalidating-with-dynamic-and-revalidate)
- [layout.js](#layoutjs)
- [meta data](#meta-data)
- [API Routes](#api-routes)

<!-- tocstop -->

## Getting started

See <https://nextjs.org/docs/app/api-reference/create-next-app>

- `npx create-next-app@latest`

To start the development server on http://localhost:3000

- `npm run dev`

## Directory structure

Page routes are indicated by folders instead of files with App Router. Each folder represents a route and it will have a `page.js` file which is the content.

```
app
  ├─about
  │  └─page.js
  ├─contact
  │  └─page.js
  ├─favicon.ico
  ├─globals.css
  ├─layout.js
  ├─page.js
  └─page.module.css
```

This will produce:

```
/
/about
/contact
```

If you want to put a bunch of page folders in a folder just for your own organization, you can *opt out* of the routing structure by naming the folder with brackets `()`. These will be ignored in the url path.

```
app
  ├─about
  │  └─page.js
  ├─(auth)
  │  ├─login
  │  │  └─page.js
  │  └─signup
  │     └─page.js
  ├─contact
  │  └─page.js
  ├─favicon.ico
  ├─globals.css
  ├─layout.js
  ├─page.js
  └─page.module.css
```

This will produce:

```
/
/about
/contact
/login
/signup
```

If I took away the brackets in the `auth` folder name, the routes would be:

```
/auth/login
/auth/signup
```

And, `/auth` would return a 404 since there is no `page.js` in that directory.

## Server-side vs Client-side components

Components are now **server-side by default**, where previously you had to use `getServerSideProps`. Now, you need to specifically opt into client-side using `"use client"` at the start of your file.

You can test this with a `console.log`. Without `"use client"`, you will only see the log on the server where npm is running the app.

```javascript
"use client"

export default function About() {
  console.log('About render');
  return (
    <main>
      <p>About.</p>
    </main>
  )
}
```

What do you need to do? | Server Component | Client Component
:---------------------- | :--------------- | :---------------
Fetch data | ✓ | ✕
Access backend resources (directly) | ✓ | ✕
Keep sensitive information on the server (access tokens, API keys, etc) | ✓ | ✕
Keep large dependencies on the server / Reduce client-side JavaScript | ✓ | ✕
Add interactivity and event listeners (onClick(), onChange(), etc) | ✕ | ✓
Use State and Lifecycle Effects (useState(), useReducer(), useEffect(), etc) | ✕ | ✓
Use browser-only APIs | ✕ | ✓
Use custom hooks that depend on state, effects, or browser-only APIs | ✕ | ✓
Use React Class components | ✕ | ✓

It looks like if you have things like a react context provider, you can make the provider a client component and wrap it around server components.

## Server components can do API calls

In *server* components you can do really easy API calls just by making the component async:

```javascript
import { getColorWithAxios } from "@/lib/colors";

async function Color() {
  console.log('Color render');
  const color = await getColorWithAxios();

  return (
    <main>
      <p>Color. <span style={{ color: color.hex }}>{color.name}</span></p>
    </main>
  )
}

export default Color;
```

And my function looks like this:

```javascript
import axios from 'axios';

const url = 'https://log.zebro.id/api_demo_one';

export async function getColorWithAxios() {
  const response = await axios.get(url);
  const color = {
    name: Object.keys(response.data)[0],
    hex: Object.values(response.data)[0]
  }
  return color;
}
```

## Server components cannot contain hooks

This is because Server Components have no React state (since they're not interactive) and they rely on client-side APIs. As a result, it would be difficult to implement a loading state, so they have designed it so that we do this simply by adding a file to our page route folder:


## loading.js

This `loading.js` file in our page's route folder will be displayed until the above axios call is resolved:

```javascript
const Loading = () => {
  return (
    <div>
      <p>I am a skelelton/wireframe version or loading animation.</p>
    </div>
  );
};

export default Loading;
```

Q: `loading.js` file is for **server components only**?

## error.js 

Similarly, if something goes wrong, Next.js uses Suspense magic to catch it and render the component in `error.js`. Error components need to be a client component because Next.js has to pass props to it implicitly. 

An error file defines an error UI boundary for a route segment.

```javascript
'use client' // Error components must be Client Components

const Error = () => {
  return (
    <div>
      <p>I am a custom error page.</p>
    </div>
  );
};

export default Error;
```

This is what gets passed to it:

```javascript
'use client' // Error components must be Client Components

import { useEffect } from 'react';

const PageError = ({ error, reset }) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div>
      <p>I am a custom error page.</p>
      <p>{ error.message }</p>
      <button onClick={() => reset()}>try again</button>
    </div>
  );
};

export default PageError;
```

Reset is a function that will run whatever it was that triggered the error again. You can test the error by using a non existent url (404) or by temporarily adding:

```javascript
import { getColorWithAxios } from "@/lib/colors";

const session = null;

async function Color() {
  console.log('Color render');
  const color = await getColorWithAxios();
  if (!session) throw new Error('Auth is required to access this page.');

  return (
    <main>
      <p>Color. <span style={{ color: color.hex }}>{color.name}</span></p>
    </main>
  )
}

export default Color;
```

To specifically handle errors in root `layout.js`, use a variation of `error.js` called `global-error.js` located in the root app directory. `global-error.js` replaces the root layout.js when active and so must define its own `<html>` and `<body>` tags.

```javascript
'use client';
 
export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

## Dynamic routes 

Create dynamic routes by doing the directory structure like: `app/post/[postid]/page.js`.

Then we create a component in `page.js`:

```javascript
function Example(props) {
  console.log(props); // { params: { postid: '100' }, searchParams: {} }
  console.log(props.params.postid); // returns the postid of /app/post/100
  return (
    <div className='Example'>
      <p>Post.</p>
    </div>
  );
}

export default Example;
```

This would be equivalent to `getStaticPaths` with `fallback: true`. In other words, these will be dynamic pages so you will need to do your own handling for when the route doesn't exist. 

**TODO... how to return a 404 when necessary here?**

To pre-render static pages (like default `getStaticPaths` with `fallback: false`), you would create and export a special function called `generateStaticParams`. 

> The `generateStaticParams` function can be used in combination with dynamic route segments to statically generate routes at build time instead of on-demand at request time.

```javascript
export async function generateStaticParams() {
  // The key here should be the same as the filename [postid].js
  return [
    { postid: '100' },
    { postid: '101' }
  ]
}

function Example(props) {
  const postid = props.params.postid;
  console.log(postid);
  return (
    <div className='Example'>
      <p>Post { postid }.</p>
    </div>
  );
}

export default Example;
```

In this case, any routes not returned in by `generateStaticParams` will not be generated and therefor result in a 404. NOTE: I haven't been able to test this yet... in dev mode, its dynamic.

> During `next dev`, `generateStaticParams` will be called when you navigate to a route.
> During `next build`, `generateStaticParams` runs before the corresponding Layouts or Pages are generated.

**TODO... how to test a 404 is returned here?**

### catch-all routes

Note the `[postid]` directory name will only handle and exact match for that url structure. For example: `app/post/100` or `app/post/fart` will be handled but `app/post/100/another` would result in a 404. If I rename my folder `[...postid]`, this will catch all urls such as:

```
/app/post/100
/app/post/100/another
/app/post/100/a/b/c
```

In this case `props.params/postid` would return an array like `[ '100', 'a', 'b', 'c' ]`.


## Caching/revalidating with `fetch()`

Nextjs has extended the standard `fetch()` API. One of the main options is to do with caching and asa result whether the page is static or dynamic. By default, a fetch call will have its result cache set to `force-cache` which means it will fetch the data once during build time and return a static page with the result data. 

If you want the page to fetch new data on every request (thereby creating a dynamic page), you can add your own cache object to the `fetch()` call:

```javascript
export async function getColorWithFetch() {
  const options = {
    cache: 'no-store'
  };
  const res = await fetch(url, options);
  const data = await res.json();
  // ...
}
```

This is like `getServerSideProps` in `Page Router` versions of Nextjs.

You can also revalidate cached data at a timed interval (`Incremental Static Regeneration`). If many requests come in for the same page, a cached static version of the page will be used until the time interval has passed, then fresh data will be fetch and a new static page is served and cached until the next interval has passed. 

```javascript
export async function getColorWithFetch() {
  const options = {
    // cache: 'no-store',
    next: { revalidate: 60 } // seconds
  };
  const res = await fetch(url, options);
  const data = await res.json();
  //...
}
```

The downside of this (ISR) is any `loading.js` is ignored because with this strategy we are still serving static pages. If you happen to be the one initiating the request causing the new fetch, you will just see the loading spinner in the tab.

> NOTE: Caching at the fetch level via `revalidate` or `cache: 'force-cache'` stores the data across requests in a **shared cache**. You should avoid using it for user specific data (i.e. requests that derive data from cookies() or headers()).


## Caching/revalidating with `dynamic` and `revalidate`

If you prefer using `axios`, you can still get these features. To force a refresh of data on every request:

```javascript
import { getColorWithAxios, getColorWithFetch } from "@/lib/colors";

// Change the dynamic behavior of a layout or page to fully static or fully dynamic.
export const dynamic = 'force-dynamic';

async function Color() {
  console.log('Color render');
  const color = await getColorWithAxios();
  // const color = await getColorWithFetch();

  return (
    <main>
      <p>Color. <span style={{ color: color.hex }}>{color.name}</span></p>
    </main>
  )
}

export default Color;
```

See the [dynamic option](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic).


To force a revalidate:

```javascript
import { getColorWithAxios, getColorWithFetch } from "@/lib/colors";

// Set the default revalidation time for a layout or page.
// This option does not override the revalidate set by individual fetch requests.
export const revalidate = 20;

async function Color() {
  console.log('Color render');
  const color = await getColorWithAxios();
  // const color = await getColorWithFetch();

  return (
    <main>
      <p>Color. <span style={{ color: color.hex }}>{color.name}</span></p>
    </main>
  )
}

export default Color;
```

See the [revalidate option](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate).

Keep in mind this can be hard to test because with axios in dev, it runs on every page refresh. If you do a `npm run build`, teh output will tell you whether that page is dynamic or static.


## layout.js 

The app has a root `layout.js` in the `app` directory. All pages are rendered in `{children}`.

Each page can then optionally have its own layout. The page will be rendered again in the `{children}`. Note each layout can have its own metadata.

```javascript
export const metadata = {
  title: 'Fetch color demo',
  description: 'Fetching from an API demo.',
}

export default function ColorLayout({ children }) {
  return (
      <div>
        {children}
        <p>color page layout</p>
      </div>
  )
}
```

- The app directory must include a root `layout.js`
- The root layout must define `<html>` and `<body>` tags
- You should **not** manually add `<head>` tags such as `<title>` and `<meta>` to root layouts. Instead, you should use the [Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata) which automatically handles advanced requirements such as streaming and de-duplicating `<head>` elements.
- You can use [route groups](https://nextjs.org/docs/app/building-your-application/routing/defining-routes#route-groups) to create multiple root layouts. Navigating across multiple root layouts will cause a full page load.


## meta data

There are [two ways to define Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata):

- Config-based Metadata: Export a static metadata object or a dynamic generateMetadata function in a layout.js or page.js file.
- File-based Metadata: Add static or dynamically generated special files to route segments.

Config-based looks like this:

```javascript
// either Static metadata
export const metadata = {
  title: '...',
};
 
// or Dynamic metadata
export async function generateMetadata({ params }) {
  // This is useful for dynamic routes
  // For example you could await a fetch call here:
  // const postid = params.postid;
  // const res = await fetch('...');
  // const data = await res.json();
  return {
    title: '...',
  };
}
```

- The metadata object and `generateMetadata` function exports are only supported in **Server Components**.
- You cannot export both the metadata object and generateMetadata function from the same route segment.

Some [fields](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields);

```javascript
export const metadata = {
  generator: 'Next.js',
  applicationName: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: ['Next.js', 'React', 'JavaScript'],
  authors: [{ name: 'Jessica' }, { name: 'Scott', url: 'https://nextjs.org' }],
  colorScheme: 'dark',
  creator: 'Scott Volk',
  publisher: 'Jessica Rush',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};
```


## API Routes

In the app directory, create an `api` directory. Then, for every api route create a directory with the route name containing a file called `route.js`. Inside this file you will do a named export (not default) of an async function of a http verb like `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.

```javascript
// app/api/rogers/route.js

export async function GET(req) {
  // Get search params from the request object
  const { searchParams } = new URL(req.url);
  const myparam = searchParams.get('myparam');
  // Get response data
  const quote = randomSelect(mrRogersQuotes);
  // Response in a native Web API
  return new Response(JSON.stringify({data: quote}))
}
```

For POST requests get access to the body like so:

```javascript
export async function POST(req) {
  const body = await req.json();
  console.log(body);
}
```