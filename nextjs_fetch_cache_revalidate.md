# Fetching, caching and revalidating

## Table of Contents

<!-- toc -->

- [Static/dynamic data fetching](#staticdynamic-data-fetching)
- [Caching/revalidating with `fetch()`](#cachingrevalidating-with-fetch)
- [Caching/revalidating with segment config options](#cachingrevalidating-with-segment-config-options)
- [Revalidation](#revalidation)
- [Data fetching examples](#data-fetching-examples)
- [Fetching user-specific data](#fetching-user-specific-data)
- [Client-side fetching with SWR](#client-side-fetching-with-swr)
- [Fetching Data on the client with route handlers](#fetching-data-on-the-client-with-route-handlers)
- [Data fetching summary](#data-fetching-summary)

<!-- tocstop -->

## Static/dynamic data fetching 

By default, Next.js will cache the result of `fetch()` requests that do not specifically opt out of caching behavior. Dynamic data fetches are `fetch()` requests that specifically opt out of caching behavior by setting the `cache` option to `'no-store'` or `revalidate` to `0`.

> **UPDATE:** Next.js 15 changes the fetch requests, `GET` Route Handlers, and Client Router Cache from cached by default to uncached by default. 

The caching options for **all** `fetch` requests in a layout, page or route handler can also be set using the [segment config object](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config).

Lastly, there's also [unstable_noStore](https://nextjs.org/docs/app/api-reference/functions/unstable_noStore) which can be used to declaratively opt out of static rendering and indicate a particular component should not be cached.

```tsx
import { unstable_noStore as noStore } from 'next/cache';
 
export default async function Component() {
  noStore();
  const result = await db.query(...);
  // ...
```

`unstable_noStore` is equivalent to cache: 'no-store' on a fetch, but is useful because it can be used where we are fetching data via some function other that `fetch()`, say an `sql` query. `unstable_noStore` is preferred over the segment config `export const dynamic = 'force-dynamic'` as it is more granular and can be used on a per-component basis.

## Caching/revalidating with `fetch()`

Nextjs has extended the standard `fetch()` API. One of the main options is about caching and whether the page is static or dynamic. By default, a fetch call will have its result cache set to `force-cache` which means it will fetch the data once during build time and return a static page with the result data. 

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

> :warning: NOTE: Caching at the fetch level via `revalidate` or `cache: 'force-cache'` stores the data across requests in a **shared cache**. You should avoid using it for user specific data (i.e. requests that derive data from cookies() or headers()).


## Caching/revalidating with segment config options

If you prefer using `axios`, you can still get these features. To force a refresh of data on every request:

```javascript
import { getColorWithAxios, getColorWithFetch } from "@/lib/colors";

// Change the dynamic behavior of a layout, page or route to fully static or fully dynamic.
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

// Set the default revalidation time for a layout, page or route.
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

Keep in mind this can be hard to test because with axios in dev, it runs on every page refresh. If you do a `npm run build`, the output will tell you whether that page is dynamic or static.

Note that all signs seem to point to using `fetch()` over `axios`. `axios` is still awesome as a js package but in Next.js, `fetch()` is preferred as they've extended it.


## Revalidation

There are two types of revalidation in Next.js:

- Background: Revalidates the data at a specific time interval.
- On-demand: Revalidates the data based on an event such as an update.

**Background revalidation**

To revalidate cached data at a specific interval, you can use the `next.revalidate` option in `fetch()` to set the cache lifetime of a resource (in seconds).

```javascript
fetch('https://...', { next: { revalidate: 60 } })
```

If you want to revalidate data that does not use fetch (i.e. using an external package or query builder), you can use the route segment config.

```javascript
export const revalidate = 60 // revalidate this page every 60 seconds
```

**On-demand revalidation**

The [examples in the Next.js docs](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating#on-demand-revalidation) don't really explain how this would be used practically but here's what they say.

You can use `revalidateTag` or `revalidatePath` to force a refresh of fetched data on-demand. They say this can be done inside a *Route Handler* or a *Server Action*.

Using `revalidateTag` in a *Route Handler*, first you would add a tag to the options that are passed to `fetch()`:

```javascript
async function getColor() {
  // ...
  const options = {
    cache: 'force-cache',
    next: { tags: ['color'] }
  };
  const res = await fetch(url, options);
  // ...
}
```

Then, create a route handler to revalidate a given tag.

```javascript
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// e.g a webhook to `your-website.com/api/revalidate?tag=color`
export async function GET(request) {
  const tag = request.nextUrl.searchParams.get('tag');

  if (!tag) {
    return NextResponse.json({ message: 'Missing tag param' }, { status: 400 });
  }

  revalidateTag(tag);

  return NextResponse.json({ tag: tag, revalidated: true, now: Date.now() });
}
```

So I will need to navigate to `my-website.com/api/revalidate?tag=color`. This tells Next.js that the **next request** to a page that does a fetch with that tag should be refreshed. 

Instead of returning json, you could also redirect to the page thereby triggering the refresh right away;

```javascript
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

// e.g a webhook to `your-website.com/api/revalidate?tag=color`
export async function GET(request) {
  const tag = request.nextUrl.searchParams.get('tag');

  if (!tag) {
    return NextResponse.json({ message: 'Missing tag param' }, { status: 400 });
  }

  revalidateTag(tag);
  redirect('/server-side');
}
```

If you want to protect who can revalidate you could use a token:

```javascript
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
 
// e.g a webhook to `your-website.com/api/revalidate?tag=color&secret=<token>`
export async function POST(request) {
  const secret = request.nextUrl.searchParams.get('secret')
  const tag = request.nextUrl.searchParams.get('tag')
 
  if (secret !== process.env.MY_SECRET_TOKEN) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }
 
  if (!tag) {
    return NextResponse.json({ message: 'Missing tag param' }, { status: 400 })
  }
 
  revalidateTag(tag)
 
  return NextResponse.json({ revalidated: true, now: Date.now() })
}
```

`revalidatePath` works the same way except you don't need to add options to the fetch call:

```javascript
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// e.g a webhook to `your-website.com/api/revalidate?path=/server-side`
export async function GET(request) {
  const path = request.nextUrl.searchParams.get('path');

  console.log(path);
  if (!path) {
    return NextResponse.json(
      { message: 'Missing path param' },
      { status: 400 }
    );
  }

  revalidatePath(path);

  return NextResponse.json({ path: path, revalidated: true, now: Date.now() });
}
```

Still not sure of the practical application of this. 


## Data fetching examples 

Parallel data fetching:

```javascript
import Albums from './albums';
 
async function getArtist(username) {
  const res = await fetch(`https://api.example.com/artist/${username}`);
  return res.json();
}
 
async function getArtistAlbums(username) {
  const res = await fetch(`https://api.example.com/artist/${username}/albums`);
  return res.json();
}
 
export default async function Page({ params: { username } }) {
  // Initiate both requests in parallel
  const artistData = getArtist(username);
  const albumsData = getArtistAlbums(username);
 
  // Wait for the promises to resolve
  const [artist, albums] = await Promise.all([artistData, albumsData]);
 
  return (
    <>
      <h1>{artist.name}</h1>
      <Albums list={albums}></Albums>
    </>
  );
}
```

Add a suspense boundary to break up the rendering work and show part of the result as soon as possible:

```javascript
import { getArtist, getArtistAlbums } from './api';
 
export default async function Page({ params: { username } }) {
  // Initiate both requests in parallel
  const artistData = getArtist(username);
  const albumData = getArtistAlbums(username);
 
  // Wait for the artist's promise to resolve first
  const artist = await artistData;
 
  return (
    <>
      <h1>{artist.name}</h1>
      {/* Send the artist information first,
      and wrap albums in a suspense boundary */}
      <Suspense fallback={<div>Loading...</div>}>
        <Albums promise={albumData} />
      </Suspense>
    </>
  );
}
 
// Albums Component
async function Albums({ promise }) {
  // Wait for the albums promise to resolve
  const albums = await promise;
 
  return (
    <ul>
      {albums.map((album) => (
        <li key={album.id}>{album.name}</li>
      ))}
    </ul>
  );
}
```

Sequential data fetching:

```javascript
// ...
 
async function Playlists({ artistID }) {
  // Wait for the playlists
  const playlists = await getArtistPlaylists(artistID);
 
  return (
    <ul>
      {playlists.map((playlist) => (
        <li key={playlist.id}>{playlist.name}</li>
      ))}
    </ul>
  );
}
 
export default async function Page({ params: { username } }) {
  // Wait for the artist
  const artist = await getArtist(username);
 
  return (
    <>
      <h1>{artist.name}</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Playlists artistID={artist.id} />
      </Suspense>
    </>
  );
}
```

## Fetching user-specific data 

Keeping in mind that you shouldn't cache at the fetch level using `revalidate` or `cache: 'force-cache'` (because shared cache), this doesn't mean you can't fetch user-specific data in a server component.

In fact, you could fetch user-specific data in both server and client components.

In a server component, the user ID needed to fetch user-specific data can be obtained from the incoming request. Common ways to obtain the user ID in a server component:

- Authentication: If your application has an authentication system in place, the user ID can be obtained from the authenticated user's session or token. When a user logs in or authenticates, their user ID is typically stored in the session or token, which can be accessed in the server component.

- Request Headers: You can access request headers in the server component. For example, the user ID could be included in an "Authorization" header, which you can extract and use to fetch user-specific data.

When it comes to data fetching in a client component, the approach for using authentication and request headers can be similar to that in a server component, but there are some differences to consider.

In a client component, the user's authentication and authorization information is typically stored on the client-side, such as in local storage, session storage, or cookies. When making requests to fetch user-specific data, you can include the authentication information in the request headers to authenticate the user and authorize access to the data.

Here are some considerations for using authentication and request headers in client components:

- Authentication: In a client component, you would typically retrieve the authentication information, such as an authentication token, from the client-side storage where it was stored during the authentication process. This token can then be included in the request headers when making API calls to fetch user-specific data.

- Request Headers: Similar to server components, you can include custom headers in the request to pass additional information, such as the user ID or any other necessary data, to the server. These headers can be used to authenticate the user and authorize access to the user-specific data.

However, it's important to note that client-side authentication and request headers are generally less secure than server-side authentication and headers. Client-side code can be inspected and manipulated by users, so it's crucial to implement additional security measures, such as validating the authentication token on the server-side and implementing proper authorization checks, to ensure the integrity and security of the data.


## Client-side fetching with SWR 

Vercel created a React hook for data fetching called [SWR](https://swr.vercel.app/docs/getting-started). They recommend it if you’re fetching data on the client side.

The name “SWR” is derived from stale-while-revalidate, a HTTP cache invalidation strategy. SWR is a strategy to first return the data from cache (stale), then send the fetch request (revalidate), and finally come with the up-to-date data.

With SWR, components will get a stream of data updates constantly and automatically. For example, if you click to another app or tab, when you reactivate the tab with SWR, it will automatically get new data.

```bash
npm install swr
```

Example:

```javascript
import useSWR from 'swr';

const url = 'https://log.zebro.id/api_demo_one';
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function Home() {
  const { data, error, isLoading } = useSWR(url, fetcher);
  const name = data ? data.name : '';
  const value = data ? data.value : '';

  let content;
  if (error) content = 'Failed to load.';
  if (isLoading) content = 'Loading...';
  if (data)
    content = (
      <>
        Your color is{' '}
        <span style={{ color: value }}>
          {name} {value}
        </span>
      </>
    );

  return (
    <>
      <p>{content}</p>
    </>
  );
}
```

You can also fetch via a user event using `mutate`:

```javascript
import useSWR, { mutate } from 'swr'; // <-- import mutate

const url = 'https://log.zebro.id/api_demo_one';
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function Home() {
  const { data, error, isLoading } = useSWR(url, fetcher);
  const name = data ? data.name : '';
  const value = data ? data.value : ''

  const fetchNewColor = async () => {  // <-- create a handler
    mutate(url);
  }

  let content;

  if (error) content = 'Failed to load.';
  if (isLoading) content = 'Loading...';
  if (data)
    content = (
      <>
        Your color is{' '}
        <span style={{ color: value }}>
          {name} {value}
        </span>
      </>
    );

  return (
    <>
      <p>{content}</p>
      <button onClick={fetchNewColor}>get another</button>
    </>
  );
}
```

Side note, it's perfectly fine to return different content too:

```javascript
export default function Home() {
  const { data, error, isLoading } = useSWR(url, fetcher);
  // ...
 
  if (error) return <div>Failed to load.</div>
  if (isLoading) return <div>Loading...</div>
 
  return <div>{data.name}</div>
}
```


## Fetching Data on the client with route handlers

> If you need to fetch data in a client component, you can call a Route Handler from the client. Route Handlers execute on the server and return the data to the client. This is useful when you don't want to expose sensitive information to the client, such as API tokens.

They don't give an example but I'm guessing they mean doing something like this:

```javascript
export async function GET(req) {
  const url = 'https://log.zebro.id/api_demo_two';
  const options = {
    cache: 'no-store'
  };
  const params = new URLSearchParams({ value: 'rgb' });
  const res = await fetch(`${url}?${params}`, options);
  const data = await res.json()

  // Response in a native Web API
  return new Response(JSON.stringify( data ));
}
```

Then your client component would fetch from this API instead of the original?

```javascript
'use client';

import { useEffect, useState, useRef } from 'react';
import ThrottledButton from '../_components/ThrottledButton';

export default function ClientSide() {
  const [color, setColor] = useState({ name: null, value: null });
  const [isLoading, setIsLoading] = useState(false);
  const abortController = useRef(null);

  useEffect(() => {
    return () => {
      console.log('aborting...');
      abortController.current?.abort();
    };
  }, []);

  async function getColor() {
    setIsLoading(true);
    abortController.current = new AbortController();
    const config = { signal: abortController.current.signal };

    try {
      console.log('fetching...');
      const url = '/api/get-color';
      const res = await fetch(url, { ...config });
      const data = await res.json();
      setColor({ name: data.name, value: data.value });
    } catch (err) {
      console.log(`Something went wrong: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    // ...
  );
}
```

Not sure if this is what they mean.


## Data fetching summary 

> Whenever possible, we recommend fetching data in Server Components. It's still possible to fetch data client-side. We recommend using a third-party library such as SWR or React Query with Client Components. In the future, it'll also be possible to fetch data in Client Components using React's use() hook.

Next.js recommends fetching data in Server Components whenever possible. This is because Server Components always fetch data on the server, which provides several benefits such as direct access to backend data resources, improved security, reduced client-server communication, and potentially improved performance due to reduced latency (<https://nextjs.org/docs/app/building-your-application/data-fetching>).

However, Next.js also acknowledges that there are valid situations where client-side data fetching is necessary, such as when dealing with user-specific data or frequently updating data. For example, user dashboard pages that are private, user-specific, and frequently updated can benefit from client-side data fetching.

That being said, if you're fetching data from the client, you can use an API layer that runs on the server to avoid exposing your database secrets to the client. In Next.js, you can create API endpoints using [Route Handlers](#fetching-data-on-the-client-with-route-handlers).

As for the recommendation to use SWR or React Query for client-side data fetching, it's not that using a standard fetch in an async function triggered by an `onclick` is wrong. Rather, libraries like SWR and React Query provide additional features that can make client-side data fetching more efficient and easier to manage. For instance, SWR handles caching, revalidation, focus tracking, refetching on intervals, and more.

- Whenever possible, fetch data on the server using Server Components.
- Fetch data in parallel to minimize waterfalls and reduce loading times.
- By fetching data in a layout, rendering for all route segments beneath it can only start once the data has finished loading.
- For Layouts, Pages and components, fetch data where it's used. Next.js will automatically dedupe requests in a tree.
- In general, it's good practice to move your data fetches down to the components that need it, and then wrap those components in `<Suspense>`. 
- Use `loading.js`, Streaming and `<Suspense>` to progressively render a page and show a result to the user while the rest of the content loads.
- React extends fetch to provide automatic request deduping.
- Next.js extends the fetch options object to allow each request to set its own caching and revalidating rules.
- Static Data is data that doesn't change often. For example, a blog post.
- Dynamic Data is data that changes often or can be specific to users. For example, a shopping cart list.
- By default, Next.js automatically does static fetches. This means that the data will be fetched at build time, cached, and reused on each request.
- Caching at the fetch level with revalidate or cache: 'force-cache' stores the data across requests in a **shared cache**. You should avoid using it for user-specific data (i.e. requests that derive data from [cookies()](https://nextjs.org/docs/app/api-reference/functions/cookies) or [headers()](https://nextjs.org/docs/app/api-reference/functions/headers))
- If your data is personalized to the user or you want to always fetch the latest data, you can mark requests as dynamic and fetch data on each request without caching (`cache: 'no-store'` or `next: { revalidate: 0 }`).
