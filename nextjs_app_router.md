# Next.js (using App Router)

Next used to use something called *Pages router* but now they are moving to a different setup called *App router* which is now officially recommended over *Page router*. The information below is in the *App router* format. See [nextjs_app_router.md](nextjs_page_router.md) for *Page router* information. Note that you can continue to use a pages directory with the *App router*.

The [13.5 release blog post](https://nextjs.org/blog/next-13-4) explains some of the differences between the two routers.


## Table of Contents

<!-- toc -->

- [Getting started](#getting-started)
- [Updating](#updating)
- [Directory structure](#directory-structure)
- [Special file hierarchy](#special-file-hierarchy)
- [Pages and layouts](#pages-and-layouts)
  * [layout.js](#layoutjs)
- [Templates](#templates)
- [Server-side vs client-side components](#server-side-vs-client-side-components)
- [Context with server components](#context-with-server-components)
- [server-only](#server-only)
- [Server components can fetch](#server-components-can-fetch)
- [Server components cannot contain hooks](#server-components-cannot-contain-hooks)
- [loading.js](#loadingjs)
- [Streaming with suspense](#streaming-with-suspense)
- [error.js](#errorjs)
- [Sharing data between server components](#sharing-data-between-server-components)
  * [Sharing fetch request data between server components](#sharing-fetch-request-data-between-server-components)
- [Linking and navigating](#linking-and-navigating)
  * [Active links](#active-links)
  * [Fragment links](#fragment-links)
  * [useRouter](#userouter)
- [Route groups](#route-groups)
- [Dynamic routes](#dynamic-routes)
  * [Link to dynamic routes](#link-to-dynamic-routes)
  * [catch-all routes](#catch-all-routes)
- [Caching/revalidating with `fetch()`](#cachingrevalidating-with-fetch)
- [Caching/revalidating with `dynamic` and `revalidate`](#cachingrevalidating-with-dynamic-and-revalidate)
- [Revalidation](#revalidation)
- [Data fetching examples](#data-fetching-examples)
- [Data fetching summary](#data-fetching-summary)
- [Static vs dynamic rendering](#static-vs-dynamic-rendering)
  * [Static rendering](#static-rendering)
  * [Static/dynamic data fetching](#staticdynamic-data-fetching)
  * [Dynamic Rendering](#dynamic-rendering)
- [Server functions](#server-functions)
- [Server actions (experimental)](#server-actions-experimental)
  * [Validation](#validation)
  * [Headers](#headers)
  * [Server Mutations](#server-mutations)
- [Route handlers (API routes)](#route-handlers-api-routes)
  * [request body](#request-body)
  * [url params](#url-params)
  * [headers](#headers)
  * [cookies](#cookies)
  * [redirects](#redirects)
- [Images](#images)
  * [sizes](#sizes)
  * [fill](#fill)
  * [priority](#priority)
  * [warning](#warning)
- [Meta data](#meta-data)
  * [Config-based metadata](#config-based-metadata)
  * [file-based metadata](#file-based-metadata)
  * [favicon.ico, apple-icon.jpg, icon.jpg](#faviconico-apple-iconjpg-iconjpg)
  * [opengraph-image and twitter-image](#opengraph-image-and-twitter-image)
  * [robots.txt](#robotstxt)
  * [sitemap.xml](#sitemapxml)
- [Route segment config](#route-segment-config)
- [Middleware](#middleware)
  * [matcher](#matcher)
  * [conditional statements](#conditional-statements)
  * [response](#response)
- [Scripts](#scripts)
- [revalidatePath](#revalidatepath)
- [revalidateTag](#revalidatetag)
- [Lazy loading](#lazy-loading)
  * [Loading External Libraries](#loading-external-libraries)
  * [Lazy loading with loader](#lazy-loading-with-loader)

<!-- tocstop -->

## Getting started

See <https://nextjs.org/docs/app/api-reference/create-next-app>

- `npx create-next-app@latest`

To start the development server on http://localhost:3000

- `npm run dev`

To run the build:

- `npm run build && npm start`

## Updating 

```
npm i next@latest react@latest react-dom@latest eslint-config-next@latest
```

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

- **api**: Its a good idea to create API routes in an API folder. Then inside that folder another folder will determine the route name. Finally, the route is defined in a file called `route.js`. This file name is specifically used for server-side API endpoints for a route.
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
- **public**: You can optionally create a public folder to store static assets such as images, fonts, etc. Files inside public directory can then be referenced by your code starting from the base URL (/) e.g. `src="/origami.png"`. If you are importing your image, you need to write the full path e.g. `import origami from '../public/origami.png'`.

In addition:

- **template.js**: Similar to layout.js, except a new component instance is mounted on navigation. Use layouts unless you need this behavior.
- `.js`, `.jsx`, or `.tsx` file extensions can be used for special files.
- You can place page/feature specific components in the page segment folder and reusable components in the root components folder.
- **default.js**: A *parallel route* fallback page
- **_private**: Private folders can be created by prefixing a folder with an underscore: `_folderName`. This indicates the folder is a private implementation detail and should not be considered by the routing system, thereby opting the folder and all its subfolders out of routing.

See [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure).

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


## Server-side vs client-side components

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


## Context with server components

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

Next.js recommends using `server-only` to make sure server data fetching functions are never used on the client.


## Server components can fetch

In *server* components you can do really easy API calls just by making the component async:

```javascript
import { getColorWithFetch } from "@/lib/colors";

async function Color() {
  console.log('Color render');
  const color = await getColorWithFetch();

  return (
    <main>
      <p>Color. <span style={{ color: color.value }}>{color.name}</span></p>
    </main>
  )
}

export default Color;
```

And my fetch function looks like:

```javascript
const url = 'https://log.zebro.id/api_demo_one';

export async function getColorWithFetch() {
  const res = await fetch(url, options);
  const data = await res.json();
  const color = {
    name: data.name,
    value: data.value
  }
  return color;
}
```

See also: [Caching/revalidating with `fetch()`](#cachingrevalidating-with-fetch) and [Caching/revalidating with `dynamic` and `revalidate`](#cachingrevalidating-with-dynamic-and-revalidate) below.


## Server components cannot contain hooks

This is because Server Components have no React state (since they're not interactive) and they rely on client-side APIs. As a result, it would be difficult to implement a loading state, so they have designed it so that we do this simply by adding a file to our page route folder:


## loading.js

This `loading.js` file in our page's route folder will be displayed until the above fetch call is resolved:

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
import { getColorWithFetch } from "@/lib/colors";

const session = null;

async function Color() {
  console.log('Color render');
  const color = await getColorWithFetch();
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

- Errors bubble up to the nearest parent error boundary. This means an `error.js` file will handle errors for all its nested child segments. More or less granular error UI can be achieved by placing `error.js` files at different levels in the nested folders of a route.
- An `error.js` boundary will not handle errors thrown in a `layout.js` component in the same segment because the error boundary is nested inside that layouts component.
- Even if a `global-error.js` is defined, it is still recommended to define a root `error.js` whose fallback component will be rendered within the root layout, which includes globally shared UI and branding.


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

The hierarchy of the app folder maps directly to URL paths. However, it’s possible to break out of this pattern by creating a route group. Route groups are created by using parenthesis in the folder name, e.g. `(auth)`. Route groups can be used to:

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
- use a catch-all dynamic route to get `not-found.js` to work (see below)

**Getting `not-found.js` to work correctly:**

- Initially I could not get `not-found.js` to work work is this setup. I figured you would place a `not-found.js` in each route group, but it does not work. See [this github issue#5211681](https://github.com/vercel/next.js/discussions/50034#discussion-5211681). The workaround is to use dynamic catch all routes:

```
app
 ├─(main)
 │  ├─[...not-found]    <-- dynamic catch-all route
 │  │  ├─page.js        <-- page will call notFound() which raises an error 
 │  ├─layout.js             which will be caught by the closest not-found.js
 │  ├─not-found.js      <-- my normal not-found.js
 │  └─...
 ├─(auth)
 │  ├─layout.js
 │  └─...
 ├─favicon.ico
 └─globals.css
```

app/(main)/[...not-found]/page.js:

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

Note that the dynamic segments are passed as the `params` prop to `layout`, `page`, `route`, and `generateMetadata` functions.

This would be equivalent to `getStaticPaths` with `fallback: true`. In other words, these will be dynamic pages so you will need to do your own handling for when the route doesn't exist. 

**Q: how to return a 404 when necessary here?**

If the dynamic route doesn't exist, call `notFound()` from `next/navigation`. Calling this function will raise a `NEXT_NOT_FOUND` error which will then be caught by the closest `not-found.js`.

```javascript
import { notFound } from 'next/navigation';
import Image from 'next/image';
import photos from '@/app/photos';
import styles from './page.module.css';

export default function PhotoPage({ params }) {
  const photo = photos.find((p) => p.id === params.id);
  const width = 600;

  // If photo not found, return 404.
  // You want to call notFound() here and not just render a 404
  // so that the 404 status code gets sent correctly. notFound()
  // throws a NEXT_NOT_FOUND error which will then be caught by
  // the closest not-found special file.
  if (!photo) {
    notFound();
  }

  return (
    <main>
      <Image
        alt=""
        src={photo.imageSrc}
        height={width * 1.25}
        width={width}
        className={styles.photo}
      />
    </main>
  );
}
```

To pre-render static pages (like default `getStaticPaths` with `fallback: false`), you would create and export a special function called `generateStaticParams`. 

> The `generateStaticParams` function can be used in combination with dynamic route segments to statically generate routes at build time instead of on-demand at request time.

```javascript
export async function generateStaticParams() {
  // The key here should be the same as the filename [postid]
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

Note that all signs seem to point to using `fetch()` over `axios`. `axios` is still awesome for as a js package but in Next.js, `fetch()` is preferred as they've extended it.


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

The [examples in the Next.js docs](https://nextjs.org/docs/app/building-your-application/data-fetching/revalidating#on-demand-revalidation) don't do much to shed light on how this works. Skipping.


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

## Data fetching summary 

> Whenever possible, we recommend fetching data in Server Components. It's still possible to fetch data client-side. We recommend using a third-party library such as SWR or React Query with Client Components. In the future, it'll also be possible to fetch data in Client Components using React's use() hook.

Next.js recommends fetching data in Server Components whenever possible. This is because Server Components always fetch data on the server, which provides several benefits such as direct access to backend data resources, improved security, reduced client-server communication, and potentially improved performance due to reduced latency (<https://nextjs.org/docs/app/building-your-application/data-fetching>).

However, Next.js also acknowledges that there are valid situations where client-side data fetching is necessary, such as when dealing with user-specific data or frequently updating data. For example, user dashboard pages that are private, user-specific, and frequently updated can benefit from client-side data fetching.

As for the recommendation to use SWR or React Query for client-side data fetching, it's not that using a standard fetch in an async function triggered by an `onclick` is wrong. Rather, libraries like SWR and React Query provide additional features that can make client-side data fetching more efficient and easier to manage. For instance, SWR handles caching, revalidation, focus tracking, refetching on intervals, and more.


- Whenever possible, fetch data on the server using Server Components.
- Fetch data in parallel to minimize waterfalls and reduce loading times.
- By fetching data in a layout, rendering for all route segments beneath it can only start once the data has finished loading.
- For Layouts, Pages and components, fetch data where it's used. Next.js will automatically dedupe requests in a tree.
- Whenever possible, it's best to fetch data in the segment that uses it. This also allows you to show a loading state for only the part of the page that is loading, and not the entire page.
- Use `loading.js`, Streaming and Suspense to progressively render a page and show a result to the user while the rest of the content loads.
- React extends fetch to provide automatic request deduping.
- Next.js extends the fetch options object to allow each request to set its own caching and revalidating rules.
- Static Data is data that doesn't change often. For example, a blog post.
- Dynamic Data is data that changes often or can be specific to users. For example, a shopping cart list.
- By default, Next.js automatically does static fetches. This means that the data will be fetched at build time, cached, and reused on each request.
- Caching at the fetch level with revalidate or cache: 'force-cache' stores the data across requests in a **shared cache**. You should avoid using it for user-specific data (i.e. requests that derive data from [cookies()](https://nextjs.org/docs/app/api-reference/functions/cookies) or [headers()](https://nextjs.org/docs/app/api-reference/functions/headers))
- If your data is personalized to the user or you want to always fetch the latest data, you can mark requests as dynamic and fetch data on each request without caching (`cache: 'no-store'` or `next: { revalidate: 0 }`).


## Static vs dynamic rendering 

In addition to client and server components, both can be either statically or dynamically rendered.

- With Static Rendering, both Server and Client Components can be prerendered on the server at build time. The result of the work is cached and reused on subsequent requests. The cached result can also be revalidated.
  - Client Components have their HTML and JSON prerendered and cached on the server. The cached result is then sent to the client for hydration.
  - Server Components are rendered on the server by React, and their payload is used to generate HTML. The same rendered payload is also used to hydrate the components on the client, resulting in no JavaScript needed on the client.

- With Dynamic Rendering, both Server and Client Components are rendered on the server at request time. The result of the work is not cached.

### Static rendering 

By default, Next.js statically renders routes to improve performance.

### Static/dynamic data fetching 

By default, Next.js will cache the result of `fetch()` requests that do not specifically opt out of caching behavior. Dynamic data fetches are `fetch()` requests that specifically opt out of caching behavior by setting the `cache` option to `'no-store'` or `revalidate` to `0`.

The caching options for all `fetch` requests in a layout or page can also be set using the [segment config object](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config).

**Note** I'm still a bit confused by this.For example, when fetching a color from my random color API in a server-component:

**With default 'force-cache'**

- The same color will be served to two different users. Navigation between pages will serve the same color. A hard refresh will still serve the same color. *This seems to makes sense.*

**With 'no-cache'**

- Different colors will be served to different users. Navigation between pages will usually serve the same color... but then eventually/sometimes it will fetch a new color. *This makes no sense. You would think it would always serve the same color (to the same user) or always fetch a new color. It seems like there's a timeout, after x minutes has passed it fetches again.*
A hard refresh will fetch a new color.

### Dynamic Rendering

During static rendering, if a *dynamic function* or a dynamic `fetch()` request *(no caching)* is discovered, Next.js will switch to dynamically rendering the whole route at request time. Any cached data requests can still be re-used during dynamic rendering.

[Dynamic functions](https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic-rendering#dynamic-functions) rely on information that can only be known at request time such as a user's cookies, current requests headers, or the URL's search params. In Next.js, these dynamic functions are:

 - Using `cookies()` or `headers()` in a Server Component will opt the whole route into dynamic rendering at request time.
- Using `useSearchParams()` in Client Components will skip static rendering and instead render all Client Components up to the nearest parent Suspense boundary on the client.


## Server functions

> Functions that run on the server, but can be called on the client.

Next.js provides helpful server functions you may need when fetching data in Server Components:

- [cookies()](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [headers()](https://nextjs.org/docs/app/api-reference/functions/headers)

For example: 


```javascript
import { headers } from 'next/headers';
 
export default function Page() {
  const headersList = headers();
  const referer = headersList.get('referer');
  // List all header keys:
  console.log(Array.from(headersList.keys()));
 
  return <div>Referer: {referer}</div>;
}

```

`headers()` is a *dynamic function* whose returned values cannot be known ahead of time. Using it in a layout or page will opt a route into dynamic rendering at request time.


## Server actions (experimental)

> Server Functions called as an action on forms or form elements.

[Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) are an alpha feature in Next.js, built on top of [React Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions#actions). They enable server-side data mutations, reduced client-side JavaScript, and progressively enhanced forms.

app/actions.js

```javascript
'use server'

export async function addItem(data) {
  const cartId = cookies().get('cartId')?.value;
  await saveToDb({ cartId, data });
}
```

app/add-to-cart.js

```javascript
'use client'
 
import { addItem } from './actions.js';
 
// Server Action being called inside a Client Component
export default function AddToCart({ productId }) {
  return (
    <form action={addItem}>
      <button type="submit">Add to Cart</button>
    </form>
  );
}
```

In addition to invoking with the `action` prop on a `<form>`, you can also invoke with the `formAction` prop to on elements such as `button`, `input type="submit"`, and `input type="image"`:

```javascript
 
import { addItem, addImage } from './actions.js';
 
// Server Action being called inside a Client Component
export default function AddToCart({ productId }) {
  return (
    <form action={addItem}>
      <input type="image" formAction={addImage} />
      <button type="submit">Add to Cart</button>
    </form>
  );
}
```

You can also do [custom invocation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions#custom-invocation-using-starttransition) with `startTransition`: Invoke Server Actions without using `action` or `formAction` by using `startTransition`.

For now you can enable Server Actions in your Next.js project by enabling the experimental serverActions flag.

next.config.js

```
module.exports = {
  experimental: {
    serverActions: true,
  },
}
```

By default, the maximum size of the request body sent to a Server Action is 1MB. This prevents large amounts of data being sent to the server, which consumes a lot of server resource to parse. However, you can configure this limit using the experimental serverActionsBodySizeLimit option.

```
module.exports = {
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: '2mb',
  },
}
```

Server Actions can be defined in two places:

- Inside the component that uses it (Server Components only)
- In a separate file (Client and Server Components), for reusability. You can define multiple Server Actions in a single file.


### Validation 

Data passed to a Server Action can be validated or sanitized before invoking the action. For example, you can create a wrapper function that receives the action as its argument, and returns a function that invokes the action if it's valid.

app/actions.js

```javascript
'use server'
 
import { withValidate } from 'lib/form-validation';
 
export const action = withValidate((data) => {
  // ...
});
```

lib/form-validation.js

```javascript
export function withValidate(action) {
  return async (formData) => {
    'use server'
 
    const isValidData = verifyData(formData);
 
    if (!isValidData) {
      throw new Error('Invalid input.')
    }
 
    const data = process(formData);
    return action(data);
  }
}
```


### Headers

You can read incoming request headers such as cookies and headers within a Server Action.

```javascript
'use server'

import { cookies } from 'next/headers';
 
export async function addItem(data) {
  const cartId = cookies().get('cartId')?.value;
  await saveToDb({ cartId, data });
}
```

You can also modify cookies inside a server action:

```javascript
'use server'

import { cookies } from 'next/headers';

export async function create(data) {

  const cart = await createCart():
  cookies().set('cartId', cart.id)
  // or
  cookies().set({
    name: 'cartId',
    value: cart.id,
    httpOnly: true,
    path: '/'
  })
}
```


### Server Mutations

> Server Actions that mutates your data and calls redirect, revalidatePath, or revalidateTag.

Have not been able to find good examples of this.


## Route handlers (API routes)

Route Handlers allow you to create custom request handlers for a given route using the Web [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) APIs.

In the app directory, create an `api` directory. Then, for every api route create a directory with the route name containing a file called `route.js`. Inside this file you will do a named export (not default) of an async function of a [http method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) like `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

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

Next's example fetching from a database:

```javascript
import { NextResponse } from 'next/server';
 
export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  });
  const data = await res.json();
 
  return NextResponse.json({ data });
}
```

The [NextResponse](https://nextjs.org/docs/app/api-reference/functions/next-response) extends the standard Web Response with some additional convenience methods.

### request body 

You can read the `Request` body using the standard Web API methods:

```javascript
import { NextResponse } from 'next/server';
 
export async function POST(request) {
  const res = await request.json();
  return NextResponse.json({ res });
}
```

### url params

You can get search params like this:

```javascript
import { NextResponse } from 'next/server';
 
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const res = await fetch(`https://data.mongodb-api.com/product/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  });
  const product = await res.json();
 
  return NextResponse.json({ product });
}
```

### headers 

You can read headers with headers from `next/headers`. This `headers` instance is read-only. To set `headers`, you need to return a new `Response` with new `headers`.

```javascript
import { headers } from 'next/headers';
 
export async function GET(request) {
  const headersList = headers();
  const referer = headersList.get('referer');
 
  return new Response(JSON.stringify('Hello, Next.js!'), {
    status: 200,
    headers: { 
      'referer': referer,
      'Content-Type': 'application/json'
      },
  });
}
```

CORS example:

```javascript
export async function GET(request) {
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

### cookies

You can read cookies with `cookies` from `next/headers`. This `cookies` instance is read-only. To set cookies, you need to return a new `Response` using the `Set-Cookie` header.

```javascript
import { cookies } from 'next/headers';
 
export async function GET(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
 
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: { 'Set-Cookie': `token=${token}` },
  });
}
```

### redirects 

```javascript
import { redirect } from 'next/navigation';
 
export async function GET(request) {
  redirect('https://nextjs.org/');
}
```


## Images 

Next has its own [Image component](https://nextjs.org/docs/app/api-reference/components/image) built on the native `<img>` element. The Image Component optimizes images for performance by lazy loading and automatically resizing images based on device size. See also [Using Images in Next.js video](https://www.youtube.com/watch?v=IU_qq_c_lKA).


```javascript
import Image from 'next/image';
import profilePic from '../public/me.png';
 
export default function Page() {
  return (
    <Image
      src={profilePic}
      alt="Picture of the author"
      // width={500} automatically provided
      // height={500} automatically provided
      // blurDataURL="data:..." automatically provided
      // placeholder="blur" // Optional blur-up while loading
    />
  );
}
```

Next will automatically determine the width and height of your image based on the *imported file*. These values are used to prevent layout shift while your image is loading. If you are using a remote image src (e.g. `src="https://s3.amazonaws.com/my-bucket/profile.png"`), you will need to provide the `width`, `height` and optional `blurDataURL` props manually since Next does not have access to remote files during the build process. The width and height do not determine the rendered size of the image file, they're just used to prevent layout shift.

> blurDataURL is a Data URL to be used as a placeholder image before the src image successfully loads. Only takes effect when combined with placeholder="blur".

For example:

```javascript
import Image from 'next/image';
import origami from '../public/origami.png';

export default function Home() {
  return (
    <main>
      <Image
        src={origami}
        alt="origami bird"
        // no need to add width and height
      />
      <Image
        src="/origami.png"
        alt="origami bird"
        width={500}
        height={572}
      />
    </main>
  )
}
```

If your image src was a remote file (a URL) you will also want to set up some [config to list the domains](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns) that we want to allow Next to optimize images from.

### sizes 

The `sizes` attribute is usually used with `srcset` to give the browser information about how wide the image will be at different breakpoints (media conditions).

It sounds like Next creates a `srcset` and various optimzed images for you:

> First, the value of sizes is used by the browser to determine which size of the image to download, from next/image's *automatically-generated source set*. 

> Second, the sizes property configures how next/image automatically generates an image source set. If no sizes value is present, a small source set is generated, suitable for a fixed-size image. If sizes is defined, a large source set is generated, suitable for a responsive image

For example:

```javascript
import Image from 'next/image';
import origami from '../public/origami.png';

export default function Home() {
  return (
    <main>
      <Image
        src={origami}
        alt="origami bird"
        sizes="100vw"
      />
      <Image
        src={origami}
        alt="origami bird"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </main>
  )
}
```

### fill 

The fill prop allows your image to be sized by its parent element. You can also use `object-fit` with `fill`, `contain`, or `cover`, and `object-position` to define how the image should occupy that space.

When using fill, the parent element must have `position: relative` and `display: block`. In the browser, the image itself will be absolutely positioned within the parent with width and height set at 100%. 

```javascript
import Image from 'next/image';
import mountains from '../public/mountains.jpg';
 
export default function Fill() {
  return (
    <div
      style={{
        display: 'grid',
        gridGap: '8px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, auto))',
      }}
    >
      <div style={{ position: 'relative', height: '400px' }}>
        <Image
          alt="Mountains"
          src={mountains}
          fill
          sizes="(min-width: 808px) 50vw, 100vw"
          style={{
            objectFit: 'cover'
          }}
        />
      </div>
      {/* And more images in the grid... */}
    </div>
  )
}
```

### priority

You should add the priority property to the image that will be the Largest Contentful Paint (LCP) element for each page. Doing so allows Next.js to specially prioritize the image for loading.

```javascript
import Image from 'next/image';
import profilePic from '../public/me.png';
 
export default function Page() {
  return <Image src={profilePic} alt="Picture of the author" priority />
}
```

### warning 

When you're not using Vercel and have a lot of traffic, the on-demand image optimization can put a significant load on your server because each image needs to be processed and served in an optimized format. This process involves resizing the images, converting them to a more efficient format (like WebP or AVIF), and then serving them to the client. All these operations consume CPU and memory resources on your server.

However, once an image has been optimized, it is cached for future requests. This means that if another user (or the same user at a later time) requests the same image with the same parameters, the server can serve the cached, optimized image instead of having to optimize the image again.

If you're self-hosting your Next.js application, the Image Optimization uses the default Next.js server for optimization. This server manages the rendering of pages and serving of static files.

Vercel supposedly gives you a certain amount of image optimizations for free, then they start charging you. Apparently you can use a *"third-party Image Optimization provider"* which "usually charge based on the number of images processed or the amount of data transferred".

If you're exporting static HTML (no Node.js server) which doesn’t include a server to optimize images, you can disable Image Optimization completely using next.config.js for all instances of next/image:

```javascript
module.exports = {
 images: {
 unoptimized: true,
 },
};
```

Overall the whole thing feels a bit sus... like a money trap. 


## Meta data

There are [two ways to define Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata):

- **Config-based Metadata**: Export a static metadata object or a dynamic generateMetadata function in a layout.js or page.js file.
- **File-based Metadata**: Add static or dynamically generated special files to route segments (e.g. `favicon.ico`, `apple-icon.jpg`, and `icon.jpg`, `opengraph-image.jpg` and `twitter-image.jpg`, `robots.txt`, `sitemap.xml`).

There are two default meta tags that are always added even if a route doesn't define metadata:

```javascript
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### Config-based metadata

```javascript
// Static metadata object
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

- The `metadata` object and `generateMetadata` function exports are only supported in **Server Components**.
- You cannot export both the metadata object and generateMetadata function from the same route segment.

Some [fields](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields);

```javascript
export const metadata = {
  title: 'Next.js',
  description: 'The React Framework for the Web',
  generator: 'Next.js',
  applicationName: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: ['Next.js', 'React', 'JavaScript'],
  authors: [{ name: 'Jessica' }, { name: 'Scott', url: 'https://nextjs.org' }],
  creator: 'Scott Volk',
  publisher: 'Jessica Rush',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  colorScheme: 'dark'
};
```

There's way more, e.g. for robots, icons, etc. See also the [HTML standard](https://html.spec.whatwg.org/multipage/semantics.html#the-meta-element).

### file-based metadata 

These special files are available for metadata:

- `favicon.ico`, `apple-icon.jpg`, and `icon.jpg`
- `opengraph-image.jpg` and `twitter-image.jpg`
- `robots.txt`
- `sitemap.xml`

See the [Metadata Files API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)

### favicon.ico, apple-icon.jpg, icon.jpg

File convention | Supported file types | Valid locations
--------------- | -------------------- | ---------------
favicon | .ico | `app/`
icon | .ico, .jpg, .jpeg, .png, .svg | `app/**/*`
apple-icon | .jpg, .jpeg, .png | `app/**/*`

You can set multiple icons by adding a number suffix to the file name. For example, `icon1.png`, `icon2.png`, etc. Numbered files will sort lexically.

### opengraph-image and twitter-image

These are useful for setting the images that appear on social networks and messaging apps when a user shares a link to your site. These files can be placed in any segment.

File convention | Supported file types
--------------- | --------------------
opengraph-image | .jpg, .jpeg, .png, .gif
twitter-image | .jpg, .jpeg, .png, .gif
opengraph-image.alt | .txt
twitter-image.alt | .txt

### robots.txt 

Add a static robots.txt file to your `app/` directory. For example:

```
User-Agent: *
Allow: /
Disallow: /private/

Sitemap: https://acme.com/sitemap.xml
```

You can also [generate this file](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots#generate-a-robots-file) with a `robots.js` but I don't really see any added benefit.

### sitemap.xml

You can add a static xml file to your `app/` directory, however in this case it's easier automatically generate the file with a `app/sitemap.js`:

```javascript
export default function sitemap() {
  return [
    {
      url: 'https://acme.com',
      lastModified: new Date(),
    },
    {
      url: 'https://acme.com/about',
      lastModified: new Date(),
    },
    {
      url: 'https://acme.com/blog',
      lastModified: new Date(),
    },
  ]
}
```

If you had dynamic routes, you could do:

```javascript
export default async function sitemap() {
  // List regular routes
  const pages = ['', 'about', 'login', 'signup'];

  // Also fetch any dynamic routes
  const res = await fetch(url);
  const posts = await res.json()

  // Create arrays:
  const dynamicRoutes = posts.map((post) => {
    return {
      url: `http://localhost:3000/post/${post.id}`,
      lastModified: new Date()
    }
  });
  const routes = pages.map((route) => {
    return {
      url: `http://localhost:3000/${route}`,
      lastModified: new Date()
    }
  });

  return [...routes, ...dynamicRoutes];
}
```


## Route segment config

The [Route Segment options](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) allows you configure the behavior of a Page, Layout, or Route Handler by directly exporting the following variables:

```javascript
export const dynamic = 'auto';
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = 'auto';
export const runtime = 'nodejs';
export const preferredRegion = 'all';
 
export default function MyComponent() {}
```


## Middleware

Middleware allows you to run code before a request is completed. Then, based on the incoming request, you can modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.

Middleware runs before cached content and routes are matched.

Use the file middleware.js in the root of your project to define Middleware. In other words, it should be at the same level as your `app` directory.

```javascript
import { NextResponse } from 'next/server';
 
// This function can be marked `async` if using `await` inside
export function middleware(request) {
  return NextResponse.redirect(new URL('/home', request.url));
}
 
// Matcher to determine which paths the middleware will run on
export const config = {
  matcher: '/about',
};
```

By default middleware will be invoked for every route in your project. There are two ways to define which paths Middleware will run on:

- Custom matcher config
- Conditional statements 

### matcher 

You can match a single path or multiple paths with an array syntax:

```javascript
export const config = {
  matcher: '/about/:path*',
};
```

```javascript
export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*'],
};
```

The matcher config allows full regex so matching like *negative lookaheads* or character matching is supported. An example of a negative lookahead to match all except specific paths can be seen here:

```javascript
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

Configures matchers:

- must start with `/`
- can include named parameters: `/about/:path` matches `/about/a` and `/about/b` but not `/about/a/c`
- can have modifiers on named parameters (starting with `:`): `/about/:path*` matches `/about/a/b/c` because `*` is zero or more. `?` is zero or one and `+` one or more
- can use regular expression enclosed in parenthesis: `/about/(.*)` is the same as `/about/:path*`
- values need to be constants so they can be statically analyzed at build-time. Dynamic values such as variables will be ignored.


### conditional statements

```javascript
import { NextResponse } from 'next/server';

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.rewrite(new URL('/about-2', request.url));
  }
 
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.rewrite(new URL('/dashboard/user', request.url));
  }
}
```

> URL rewriting is the process of internally changing the URL behind the scenes. This doesn't send an HTTP redirect to the client. It is used to serve a different page than the one at the requested URL, without the client knowing about it. For instance, in the above, all requests to /about get served /about-2 but the client would still see the URL as /about.

### response 

To produce a response from middleware, you can:

- rewrite to a route (page or API route) that produces a response
- return a `Response` or `NextResponse` directly.


The `NextResponse` API allows you to:

- redirect the incoming request to a different URL
- rewrite the response by displaying a given URL
- [set request headers](https://nextjs.org/docs/app/building-your-application/routing/middleware#setting-headers) for API Routes, getServerSideProps, and rewrite destinations
- [set response cookies](https://nextjs.org/docs/app/building-your-application/routing/middleware#using-cookies)
- [set response headers](https://nextjs.org/docs/app/building-your-application/routing/middleware#setting-headers)


An example of returning a response directly:

```javascript
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@lib/auth';
 
// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: '/api/:function*',
};
 
export function middleware(request) {
  // Call our authentication function to check the request
  if (!isAuthenticated(request)) {
    // Respond with JSON indicating an error message
    return new NextResponse(
      JSON.stringify({ success: false, message: 'authentication failed' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    );
  }
}
```


## Scripts 

Next has a [Script](https://nextjs.org/docs/app/building-your-application/optimizing/scripts) component for including third-party scripts.

```javascript
import Script from 'next/script'
 
export default function DashboardLayout({ children }) {
  return (
    <>
      <section>{children}</section>
      <Script src="https://example.com/script.js" />
    </>
  )
}
```

There are [options](https://nextjs.org/docs/app/building-your-application/optimizing/scripts#strategy) to control when the script loads as well as offloadig them to web workers. 

You can also do inline scripts:

```javascript
// Inline scripts must have an id
<Script id="show-banner">
  {`document.getElementById('banner').classList.remove('hidden')`}
</Script>
```

You can also use event with Script component to execute additional code after a certain event occurs:

- `onLoad`: Execute code after the script has finished loading.
- `onReady`: Execute code after the script has finished loading and every time the component is mounted.
- `onError`: Execute code if the script fails to load.

These handlers will only work when next/script is imported and used inside of a Client Component where `"use client"` is defined as the first line of code:

```javascript
'use client'
 
import Script from 'next/script';
 
export default function Page() {
  return (
    <>
      <Script
        src="https://example.com/script.js"
        onLoad={() => {
          console.log('Script has loaded')
        }}
      />
    </>
  );
}
```

See also the [<Script> component API reference](https://nextjs.org/docs/app/api-reference/components/script).


## revalidatePath

`revalidatePath` allows you to revalidate data associated with a specific path. This is useful for scenarios where you want to update your cached data without waiting for a revalidation period to expire.

```javascript
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
 
export async function GET(request) {
  const path = request.nextUrl.searchParams.get('path') || '/';
  revalidatePath(path);
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

`revalidatePath` only invalidates the cache when the path is next visited.


## revalidateTag

`revalidateTag` allows you to revalidate data associated with a specific cache tag. This is useful for scenarios where you want to update your cached data without waiting for a revalidation period to expire.

app/api/revalidate/route.js

```javascript
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
 
export async function GET(request) {
  const tag = request.nextUrl.searchParams.get('tag');
  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

You can add tags to fetch as follows:

```javascript
fetch(url, { next: { tags: ['something'] } });
```


## Lazy loading

Defer loading of Client Components and imported libraries, and only include them in the client bundle when they're needed. For example, you might want to defer loading a modal until a user clicks to open it.

There are two ways you can implement lazy loading in Next.js:

- Using Dynamic Imports with `next/dynamic`
- Using `React.lazy()` with Suspense

`next/dynamic` is a composite of `React.lazy()` and `Suspense`.

By default, Server Components are automatically code split, and you can use [streaming](#streaming-with-suspense) to progressively send pieces of UI from the server to the client. Lazy loading applies to Client Components. If you dynamically import a Server Component, only the Client Components that are children of the Server Component will be lazy-loaded - not the Server Component itself.

```javascript
'use client'

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Client Components:
const ComponentA = dynamic(() => import('./_components/A'))
const ComponentB = dynamic(() => import('./_components/B'))
const ComponentC = dynamic(() => import('./_components/C'), { ssr: false })

export default function Home() {
  const [showMore, setShowMore] = useState(false);

  return (
    <main>

      {/* Load immediately, but in a separate client bundle */}
      <ComponentA />

      {/* Load on demand, only when/if the condition is met */}
      {showMore && <ComponentB />}
      <button onClick={() => setShowMore(!showMore)}>Toggle B</button>

      {/* Load only on the client side */}
      <ComponentC />

    </main>
  );
}
```

When using `React.lazy()` and `Suspense`, Client Components will be pre-rendered (SSR) by default. If you want to disable pre-rendering for a Client Component, you can use the `ssr` option set to `false` as demonstrated with `ComponentC`.

### Loading External Libraries

External libraries can be loaded on demand using the `import()` function. This example uses the external library [fuse.js](https://www.fusejs.io/) for fuzzy search. The module is only loaded on the client after the user types in the search input.

```
npm install fuse.js
```

```javascript
'use client';

import { useState } from 'react';

const names = ['Tim', 'Joe', 'Bel', 'Lee', 'Jessica', 'Scott'];

export default function LoadExternalLibraryDemo() {
  const [results, setResults] = useState();

  const fuzzySearch = async (e) => {
    const { value } = e.currentTarget;
    // Dynamically load fuse.js
    const Fuse = (await import('fuse.js')).default;
    const fuse = new Fuse(names);
    // Update state with results
    setResults(fuse.search(value));
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search"
        onChange={fuzzySearch}
      />
      <pre>Results: {JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
```

### Lazy loading with loader

```javascript
import dynamic from 'next/dynamic';

// Client Components:
const ComponentD = dynamic(
  () => import('./_components/D'),
  {
    loading: () => <p>Loading...</p>,
  }
)

export default function Home() {

  return (
    <main>

      {/* lazy loading a component with a custom loader */}
      <ComponentD />

    </main>
  );
}
```


## Eslint 

Eslint is automatically setup when using `npx create-next-app@latest`. See the [docs on eslint] for details on disabling rules, adding additional directories and more.


## Environment variables

Next.js comes with built-in support for environment variables, which allows you to do the following:

- use `.env.local` to load environment variables (server only)
- bundle environment variables for the browser by prefixing with `NEXT_PUBLIC_`

`.env.local` should be located in the root project folder (at the same level as `package.json` and `next.config.js`):

```
DB_HOST=localhost
DB_USER=myuser
DB_PASS=mypassword
```

This loads the variables into the Node.js environment allowing you to use them in Route Handlers (API routes).

```javascript
export async function GET() {
  const db = await myDB.connect({
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
  })
  // ...
}
```

These environment variables are only available in the Node.js environment, meaning they aren't accessible to the browser. 

In order to make the value of an environment variable accessible in the browser, Next.js can inline insert a value at build time, into the js bundle that is delivered to the client. It just replaces all references to `process.env.[variable]` with a hard-coded value. To tell it to do this, you just have to prefix the variable with `NEXT_PUBLIC_`.

```
NEXT_PUBLIC_ANALYTICS_ID=abcdefghijk
```

Note: All `NEXT_PUBLIC_` variables will be frozen with the value evaluated at build time. If you need access to runtime environment values, you'll have to setup your own API to provide them to the client (either on demand or during initialization).

In general only one `.env.local` file is needed. However, sometimes you might want to add some defaults for the development (next dev) or production (next start) environment.

Next.js allows you to set **defaults** in `.env` (all environments), `.env.development` (development environment), and `.env.production` (production environment).

`.env.local` always overrides the defaults set.

`.env`, `.env.development`, and `.env.production` files should be included in your repository as they define defaults. `.env*.local` should be added to `.gitignore`, as those files are intended to be ignored. .`env.local` is where secrets can be stored.


## Absolute import path alias

You can use the `@/` alias making it easier to import modules. For example:

```javascript
// before
import { Button } from '../../../_components/button';
 
// after
import { Button } from '@/app/_components/button';
```


## Other features

There's additional topics in the Next documentation but from the sounds of it, these features require deploying to Vercel. These include:

- [Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/analytics) 
- [OpenTelemetry](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry)

There are also some topics which would need further investigation because there's just not enough in the docs to know how/when/when to use:

- [Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)

And others that are specific use cases:

- [MDX](https://nextjs.org/docs/app/building-your-application/configuring/mdx)
- [Draft Mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode)


