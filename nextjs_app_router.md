# Next.js (using App Router)

Next used to use something called *Pages router* but now they are moving to a different setup called *App router* which is now officially recommended over *Page router*. The information below is in the *App router* format. See [nextjs_app_router.md](nextjs_page_router.md) for *Page router* information. Note that you can continue to use a pages directory with the *App router*.

The [13.5 release blog post](https://nextjs.org/blog/next-13-4) explains some of the differences between the two routers.


## Table of Contents

<!-- toc -->

- [Getting started](#getting-started)
- [Directory structure](#directory-structure)
- [Special file hierarchy](#special-file-hierarchy)
- [Pages and layouts](#pages-and-layouts)
  * [layout.js](#layoutjs)
- [Templates](#templates)
- [Server-side vs Client-side components](#server-side-vs-client-side-components)
- [context with server components](#context-with-server-components)
- [server-only](#server-only)
- [Server components can do API calls](#server-components-can-do-api-calls)
- [Server components cannot contain hooks](#server-components-cannot-contain-hooks)
- [loading.js](#loadingjs)
- [error.js](#errorjs)
- [Sharing data between server components](#sharing-data-between-server-components)
  * [Sharing fetch request data between server components](#sharing-fetch-request-data-between-server-components)
- [Linking and navigating](#linking-and-navigating)
  * [Active links](#active-links)
- [Route groups](#route-groups)
- [Dynamic routes](#dynamic-routes)
  * [Link to dynamic routes](#link-to-dynamic-routes)
  * [catch-all routes](#catch-all-routes)
- [Caching/revalidating with `fetch()`](#cachingrevalidating-with-fetch)
- [Caching/revalidating with `dynamic` and `revalidate`](#cachingrevalidating-with-dynamic-and-revalidate)
- [API Routes](#api-routes)
- [meta data](#meta-data)

<!-- tocstop -->

## Getting started

See <https://nextjs.org/docs/app/api-reference/create-next-app>

- `npx create-next-app@latest`

To start the development server on http://localhost:3000

- `npm run dev`


## Directory structure

Page routes are indicated by folders instead of files with App Router. Each folder represents a *route segment* (maps to a *URL segment*) and it will have a `page.js` file which is the content. The `layout.js` is where you can place UI that is shared across pages.

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

If you want to put a bunch of page folders in a folder just for your own organization, you can *opt out* of the routing structure by naming the folder with brackets `()`. This is called a *route group*. These folders will be ignored in the url path.

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

Other files and folders that can be used:

```
app
  ├─api
  │  └─apiname
  │    └─route.js
  ├─components
  ├─hooks
  ├─lib
  ├─pagename
  │  ├─error.js
  │  ├─layout.js
  │  ├─loading.js
  │  ├─Navbar.js
  │  ├─Navbar.js
  │  ├─Navbar.module.css
  │  ├─Navbar.test.js
  │  ├─page.js
  │  └─page.module.css
  ├─favicon.ico
  ├─global-error.js
  ├─globals.css
  ├─layout.js
  ├─not-found.js
  ├─page.js
  ├─page.module.css
  └─sitemap.js
public
```

**api**

Its a good idea to create API routes in an API folder. Then inside that folder another folder will determine the route name. Finally, the route is defined in a file called `route.js`. This file name is specifically used for server-side API endpoints for a route.

- **components**: Components which are shared throughout the app can go here. Components which are only used on ine page could be stored in that pages folder.
- **hooks**: Put yer custom hooks in here.
- **lib**: For library type functions and resources. Some people also call this `utils`.
- **pages**: A page directory can contain its own `layout.js`. `loading.js` and `error.js` files get displayed automatically under certain conditions (they replace `page.js` in the layout).
- **favicon.ico**: Yep.
- **global-error.js**: Displayed when catching errors in the root layout.js.
- **globals.css**: Global css file.
- **layout.js**: Root layout. A layout wraps a page or child segment.
- **not-found.js**: Create UI to show when the notFound function is thrown within a route segment or when a URL is not matched by any route (404).
- **page.js**: index.html
- **page.module.css**: Css module for index.html
- **sitemap.js**: A file that can be used to generate an XML sitemap for web crawlers.
- **public**: You can optionally create a public folder to store static assets such as images, fonts, etc. Files inside public directory can then be referenced by your code starting from the base URL (/).

In addition:

- **template.js**: Similar to layout.js, except a new component instance is mounted on navigation. Use layouts unless you need this behavior.
- `.js`, `.jsx`, or `.tsx` file extensions can be used for special files.
- You can place page/feature specific components in the page segment folder and reusable components in the root components folder.


## Special file hierarchy 

`pages.js`, `layout.js`, `route.js`, `error.js` are all examples of *special* files in Nextjs. The React components defined in the special files of a route segment are rendered in a specific hierarchy:

For example: 

- layout.js
- template.js
- error.js (React error boundary)
- loading.js (React suspense boundary)
- not-found.js (React error boundary)
- page.js or nested layout.js

Converts to:

```javascript
<Layout>
  <Template>
    <ErrorBoundry fallback={<Error />}>
      <Suspense fallback={<Loading />}>
        <ErrorBoundry fallback={<NotFound />}>
          <Page />
        </ErrorBoundry>
      </Suspense>
    </ErrorBoundry>
  </Template>
</Layout>
```

In a nested route, the components of a segment will be nested inside the components of its parent segment.


## Pages and layouts 

Pages are intended to show UI **unique** to a route, and layouts to show UI that is **shared** across multiple routes. You can have a root layout (required) and optional layouts in a page segments as well. 

Define a layout by *default exporting* a React component from a `layout.js` file. The component should accept a `children` prop that will be populated with a child layout (if it exists) or a child page during rendering.

- A page is always the leaf of the route subtree.
- `.js`, `.jsx`, or `.tsx` file extensions can be used for pages and layouts.
- A page.js file is required to make a route segment publicly accessible.
- Pages and layouts are server components by default but can be set to a client component, except for the root layout, which **can not** be set to a client component.
- On navigation, layouts preserve state, remain interactive, and do not re-render.
- Layouts can be nested.
- Layouts in a route are nested by default. Each parent layout wraps child layouts below it using the React children prop.
- You can use *Route Groups* to opt specific route segments in and out of shared layouts.
- Passing data between a parent layout and its children is not possible. However, you can fetch the same data in a route more than once, and React will automatically dedupe the requests without affecting performance.


### layout.js 

The app has a root `layout.js` in the `app` directory. All pages are rendered in `{children}`. The root layout must define <html> and <body> tags since Next.js does not automatically create them.

```javascript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Each page can then optionally have its own layout. The page will be rendered again in the `{children}`. Note each layout can have its own metadata.

```javascript
export const metadata = {
  title: 'Fetch color demo',
  description: 'Fetching from an API demo.',
}

export default function ColorLayout({ children }) {
  return (
      <div>
        <p>color page layout</p>
        {children}
      </div>
  )
}
```

- The app directory must include a root `layout.js`
- The root layout must define `<html>` and `<body>` tags
- You should **not** manually add `<head>` tags such as `<title>` and `<meta>` to root layouts. Instead, you should use the [Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata) which automatically handles advanced requirements such as streaming and de-duplicating `<head>` elements.
- You can use [route groups](https://nextjs.org/docs/app/building-your-application/routing/defining-routes#route-groups) to create multiple root layouts or opt specific routes out of shared layouts. Navigating across multiple root layouts will cause a full page load.


## Templates 

Templates are similar to layouts in that they wrap each child layout or page. Unlike layouts that persist across routes and maintain state, templates create a new instance for each of their children on navigation. This means that when a user navigates between routes that share a template, a new instance of the component is mounted, DOM elements are recreated, state is not preserved, and effects are re-synchronized.

There may be cases where you need those specific behaviors, and templates would be a more suitable option than layouts. For example:

- Enter/exit animations using CSS or animation libraries.
- Features that rely on useEffect (e.g logging page views) and useState (e.g a per-page feedback form).
- To change the default framework behavior. For example, Suspense Boundaries inside layouts only show the fallback the first time the Layout is loaded and not when switching pages. For templates, the fallback is shown on each navigation.

These are created the same layouts but using the special name `template.js`.


## Server-side vs Client-side components

All Components inside `app` are **server-side by default**, where previously you had to use `getServerSideProps`. Now, you need to specifically opt into client-side using `'use client'` at the start of your file.

You can test this with a `console.log`. Without `'use client'`, you will only see the log on the server where npm is running the app.

```javascript
'use client'

export default function About() {
  console.log('About render');
  return (
    <main>
      <p>About.</p>
    </main>
  )
}
```

Once `'use client'` is defined in a file, all other modules *imported* into it are considered part of the client bundle. Technically, you don't need to put `'use client'` at the top of these imported components. 

So if a server component is **imported** into a client component, it too becomes a client component.

Instead, you could pass the server component as a **prop** to the client component. This will keep it a server component.

In addition, if a server component is **nested** inside a client component, it remains a server component. for example:

```jsx
<MyClientComponent>
  <MyServerComponent /> {/* Will remain a server component */}
</MyClientComponent>
```

What do you need to do? | Server Component | Client Component
:---------------------- | :--------------- | :---------------
Fetch data | ✓ | ✕
Access backend resources (directly) | ✓ | ✕
Keep sensitive information on the server (access tokens, API keys, etc) | ✓ | ✕
Keep large dependencies on the server / Reduce client-side JavaScript | ✓ | ✕
Add interactivity and event listeners (onClick(), onChange(), etc) | ✕ | ✓
Use State and Lifecycle Effects (useState(), useReducer(), useEffect(), createContext) | ✕ | ✓
Use browser-only APIs | ✕ | ✓
Use custom hooks that depend on state, effects, or browser-only APIs | ✕ | ✓
Use React Class components | ✕ | ✓

Props passed from server to client Components need to be serializable. This means that values such as functions, Dates, etc, cannot be passed directly to Client Components.


## context with server components

So, if you have things like a react context provider, you can make the provider a client component and wrap it around server components without issues. Keep in mind though, context **cannot** be created or consumed directly within server components. This is because server components have no React state (since they're not interactive). If you need to use a third-party package provider and you get an error, its probably because they haven't added `use-client` yet. So just create your own:

```javascript
'use client';
 
import { ThemeProvider } from 'acme-theme';
import { AuthProvider } from 'acme-auth';
 
export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
```

Then in your server component:

```javascript
import { Providers } from './providers';
 
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```


## server-only

If you have a module that it only intended to run on the server (in a server component), because it contains secrets, you can ensure it doesn't accidentally get used in a client component by installing the package `npm install server-only` then put `import 'server-only'` at the top of the file. Now, any client component that imports code from that file will receive a build-time error explaining that this module can only be used on the server. There in also a `client-only` package.


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
      <p>I am a skeleton/wireframe version or loading animation.</p>
    </div>
  );
};

export default Loading;
```

Q: `loading.js` file is for **server components only**?


## Streaming with suspense 

In addition to `loading.js`, you can also manually create Suspense Boundaries for your own components. This is great for isolating specific components that may take longer to fetch data on the server.

`<Suspense> `works by wrapping a component that performs an asynchronous action (e.g. fetch data), showing fallback UI (e.g. skeleton, spinner) while it's happening, and then swapping in your component once the action completes.

```javascript
import { Suspense } from 'react';
import { PostFeed, Weather } from './Components';
 
export default function Posts() {
  return (
    <section>
      <Suspense fallback={<p>Loading feed...</p>}>
        <PostFeed />
      </Suspense>
      <Suspense fallback={<p>Loading weather...</p>}>
        <Weather />
      </Suspense>
    </section>
  );
}
```


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


## Sharing data between server components

You can use native JavaScript patterns like global singletons within module scope if you have common data that multiple Server Component need to access.

For example, a module can be used to share a database connection across multiple components:

```javascript
// utils/database.js
export const db = new DatabaseConnection();
```

```javascript
// app/users/layout.js
import { db } from '@utils/database';
 
export async function UsersLayout() {
  let users = await db.query();
  // ...
}
```

```javascript
// app/users/[id]/page.js
import { db } from '@utils/database';
 
export async function DashboardPage() {
  let user = await db.query();
  // ...
}
```


### Sharing fetch request data between server components

When fetching data, you may want to share the result of a fetch between a page or layout and some of its children components. Next recommends that rather than passing props around, you put your data fetching code in the same place as the code that uses the data (colocating). If you do this and multiple components end up making the same fetch request, Next.js will automatically optimize this by only making the request once (deduping).


## Linking and navigating 

There are two ways to navigate between routes:

- `<Link> `Component
- `useRouter` Hook

The `<Link>` component is done the same as in Page Router:

```javascript
import Link from 'next/link';
 
export default function Home() {
  return <Link href="/dashboard">Dashboard</Link>;
}
```

Note, links will cause the page to be *prefetched* in the background. You can disable prefetching by passing `prefetch={false}`.

### Active links

Use the `usePathname` hook to determine if a link is active:

```javascript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navlinks.module.css';

const links = [
  { name: 'one', href: '/one' },
  { name: 'two', href: '/two' },
  { name: 'three', href: '/three' }
];

export default function Navlinks(props) {
  const pathname = usePathname();

  return (
    <ul className={styles.navlinks}>
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href);

        return (
          <li key={link.name}>
            <Link href={link.href} className={isActive ? styles.active : ''}>
              {link.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
```

### Fragment links

```javascript
<Link href="/#test" scroll={false}>
  Scroll to id.
</Link>
// ...
<p id="test">Test fragment</p>
```

### useRouter 

The `useRouter` hook can be used if you need to do some work before navigating.

```javascript
'use client'

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    // Do some other stuff
    console.log('to color');
    // Then go to route
    router.push('/color');
  };

  return (
    <main>
      <button type='button' onClick={handleClick}>Go to color</button>
    </main>
  );
}
```

> :warning: Don't let vscode fuck you here. When I imported `useRouter`, it autocompleted as `from next/router` which does not work. You need to import it from `next/navigation`!

In addition is `push()` you can `refresh()`, `prefetch()`, `back()` and `forward()`.


## Route groups 

The hierarchy of the app folder maps directly to URL paths. However, it’s possible to break out of this pattern by creating a route group. Route groups are created by using parenthesis in the filder name, e.g. `(auth)`. Route groups can be used to:

- Organize routes without affecting the URL structure.
- Opting-in specific route segments into a layout.
- Create multiple root layouts by splitting your application.

For example:

```
Organize routes without affecting the URL:

app
  ├─(auth)
  │  ├─login
  │  │  └─page.js
  │  └─signup
  │     └─page.js
  ├─favicon.ico
  ├─globals.css
  ├─layout.js
  └─page.js

Opting-in routes that use the same layout:

app
  ├─(shop)
  │  ├─account
  │  │  └─page.js
  │  ├─cart
  │  │  └─page.js
  │  └─layout.js
  ├─favicon.ico
  ├─globals.css
  ├─layout.js
  └─page.js

Creating multiple root layouts:

app
  ├─(main)
  │  ├─layout.js
  │  └─...
  ├─(auth)
  │  ├─layout.js
  │  └─...
  ├─favicon.ico
  └─globals.css
```

With multiple root layouts: 

- the `<html>` and `<body>` tags need to be added to each root layout!
- update the global css import to `import '../globals.css'`
- one of the root groups should contain the `page.js` for `/`
- make sure routes in different route groups don't resolve to the same URL!
- Navigating across different root layouts will cause a full page load


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


### Link to dynamic routes


```javascript
<ul>
  {allPostsData.map((post) => (
    <li key={post.id}>
      <Link href={`/posts/${post.id}`}>{post.title}</Link>
    </li>
  ))}
</ul>
```

### catch-all routes

Note the `[postid]` directory name will only handle and exact match for that url structure. For example: `app/post/100` or `app/post/fart` will be handled but `app/post/100/another` would result in a 404. If I rename my folder `[...postid]`, this will catch all urls such as:

```
/app/post/100
/app/post/100/another
/app/post/100/a/b/c
```

In this case `props.params/postid` would return an array like `[ '100', 'a', 'b', 'c' ]`.


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

Keep in mind this can be hard to test because with axios in dev, it runs on every page refresh. If you do a `npm run build`, the output will tell you whether that page is dynamic or static.


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
