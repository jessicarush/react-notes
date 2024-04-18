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
- [Static vs dynamic rendering](#static-vs-dynamic-rendering)
- [Dynamic functions](#dynamic-functions)
- [useSearchParams](#usesearchparams)
- [Server functions](#server-functions)
- [Images](#images)
  * [sizes](#sizes)
  * [fill](#fill)
  * [priority](#priority)
  * [warning](#warning)
- [revalidatePath](#revalidatepath)
- [revalidateTag](#revalidatetag)
- [Route segment config](#route-segment-config)
- [Scripts](#scripts)
- [Lazy loading](#lazy-loading)
  * [Loading External Libraries](#loading-external-libraries)
  * [Lazy loading with loader](#lazy-loading-with-loader)
- [Eslint](#eslint)
- [Environment variables](#environment-variables)
- [Absolute import path alias](#absolute-import-path-alias)
- [See also](#see-also)

<!-- tocstop -->

## Getting started

See the [create-next-app API reference](https://nextjs.org/docs/app/api-reference/create-next-app). 

There are many [official Next.js examples](https://github.com/vercel/next.js/tree/canary/examples) but they all seem to be using Pages Router.

- `npx create-next-app@latest`

To start the development server on http://localhost:3000

- `npm run dev`

To run the build:

- `npm run build && npm start`

Note: `next start` does not work with `output: export` (static exports... see [nextjs_deployment.md](nextjs_deployment.md)). Instead use: 

- `npm run build && npx serve@latest out`


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
 ├─_hooks
 ├─_lib
 ├─_ui
 ├─api
 │  └─apiname
 │    └─route.js
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

- **_hooks**: Put custom hooks in here.
- **_lib**: For library type functions and resources. Some people also call this `utils`.
- **_ui**: Components which are used or shared throughout the app can go here. Components which are only used on one route/page could be stored in that pages folder. The Next.js dashboard tutorial puts all components in the ui folder and only puts special files like `page` and `layout` in the route segment folders.
- **api**: Its a good idea to create API routes in an API folder. Then inside that folder another folder will determine the route name. Finally, the route is defined in a *special file* called `route.js`. This file name is specifically used for server-side API endpoints for a route.
- **pagename**: A page directory can contain its own `layout.js`. `loading.js` and `error.js` files get displayed automatically under certain conditions (they replace `page.js` in the layout).
- **favicon.ico**: (special file) Also apple-icon.jpg, icon.jpg.
- **global-error.js**: (special file) Displayed when catching errors in the root layout.js.
- **globals.css**: (special file) Global css file.
- **layout.js**: (special file) Root layout. A layout wraps a page or child segment.
- **not-found.js**: (special file) Create UI to show when the `notFound()` function is thrown within a route segment or when a URL is not matched by any route (404).
- **page.js**: (special file) index.html
- **page.module.css**: Css module for index.html
- **sitemap.js**: (special file) A file that can be used to generate an XML sitemap for web crawlers.
- **public**: You can optionally create a public folder to store static assets such as images, fonts, etc. Files inside public directory can then be referenced by your code starting from the base URL (/) e.g. `src="/origami.png"`. If you are importing your image, you need to write the full path e.g. `import origami from '../public/origami.png'` or `'@/public/origami.svg'`.

In addition:

- **template.js**: (special file) Similar to layout.js, except a new component instance is mounted on navigation. Use layouts unless you need this behavior.
- `.js`, `.jsx`, or `.tsx` file extensions can be used for special files.
- You can place page/feature specific components in the page segment folder and reusable components in the root components folder.
- **default.js**: (special file) A *parallel route* fallback page
- **_private**: Private folders can be created by prefixing a folder with an underscore: `_folderName`. This indicates the folder is a private implementation detail and should not be considered by the routing system, thereby opting the folder and all its subfolders out of routing.

See [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure).


## Special file hierarchy 

`page.js`, `layout.js`, `route.js`, `error.js`, `loading.js`, `not-found.js` are all examples of [special files](https://nextjs.org/docs/getting-started/project-structure#app-routing-conventions) in Next.js. The React components defined in the special files of a route segment are rendered in a specific hierarchy:

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
- A `page.js` file is required to make a route segment publicly accessible.
- Pages and layouts are server components by default but can be set to a client component, except for the root layout, which **can not** be set to a client component.
- On navigation, layouts preserve state, remain interactive, and do not re-render.
- Layouts can be nested.
- Layouts in a route are nested by default. Each parent layout wraps child layouts below it using the React children prop.
- You can use *Route Groups* to opt specific route segments in and out of shared layouts.
- Passing data between a parent layout and its children is not possible. However, you can fetch the same data in a route more than once, and React will automatically dedupe the requests without affecting performance.
- pages automatically receive `params` and `searchParams` in their props. `params` contain [dynamic route](nextjs_dynamic_routes.md) parameters and `searchParams` contain any search params from the URL. See [page.js](https://nextjs.org/docs/app/api-reference/file-conventions/page)


### layout.js 

The app has a root `layout.js` in the `app` directory. All pages are rendered in `{children}`. The root layout must define `<html>` and `<body>` tags since Next.js does not automatically create them.

```javascript
// Note: The root layout cannot be a client component
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
- You can use [route groups](#route-groups) to create multiple root layouts or opt specific routes out of shared layouts. Navigating across multiple root layouts will cause a full page load.


## Templates 

Templates are similar to layouts in that they wrap each child layout or page. Unlike layouts that persist across routes and maintain state, templates create a new instance for each of their children on navigation. This means that when a user navigates between routes that share a template, a new instance of the component is mounted, DOM elements are recreated, state is not preserved, and effects are re-synchronized.

There may be cases where you need those specific behaviors, and templates would be a more suitable option than layouts. For example:

- Enter/exit animations using CSS or animation libraries.
- Features that rely on useEffect (e.g logging page views) and useState (e.g a per-page feedback form).
- To change the default framework behavior. For example, Suspense Boundaries inside layouts only show the fallback the first time the Layout is loaded and not when switching pages. For templates, the fallback is shown on each navigation.

These are created the same as layouts but using the special name `template.js`.


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
Fetch data | ✓ | ✕ (I disagree)
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

If you have things like a react context provider, you can make the provider a client component and wrap it around server components without issues. Keep in mind though, context **cannot** be created or consumed directly within server components. This is because server components have no React state (since they're not interactive). If you need to use a third-party package provider and you get an error, its probably because they haven't added `use-client` yet. So just create your own:

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

If you have a module that is only intended to run on the server (in a server component), because it contains secrets, you can ensure it doesn't accidentally get used in a client component by installing the package `npm install server-only` then put `import 'server-only'` at the top of the file. Now, any client component that imports code from that file will receive a build-time error explaining that this module can only be used on the server. There in also a `client-only` package.

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

This just scratches the surface. See [Fetching, caching, and revalidating](nextjs_fetch_cache_revalidate.md) for more information.


## Server components cannot contain hooks

This is because Server Components have no React state (since they're not interactive) and they rely on client-side APIs. As a result, it would be difficult to implement a loading state, so they have designed it so that we do this simply by adding a file to our page route folder...


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

Sort of and here's why... As per the [React docs on Suspense](https://react.dev/reference/react/Suspense):

> Only Suspense-enabled data sources will activate the Suspense component. They include:
>
> - Data fetching with Suspense-enabled frameworks like Relay and Next.js
> - Lazy-loading component code with lazy
>
> Suspense does not detect when data is fetched inside an Effect or event handler.

If you were fetching data in a client component, you would be doing it in `useEffect` or an event handler. So `Suspense` and therefor `loading.js` will not work for these. Instead you would do the traditional manual custom loader using state. See examples/next_data_fetching.


## Streaming with suspense 

In addition to `loading.js`, you can also manually create Suspense Boundaries for your own components. This is great for isolating specific components that may take longer to fetch data on the server.

`<Suspense>` works by wrapping a component that performs an asynchronous action (e.g. fetch data), showing fallback UI (e.g. skeleton, spinner) while it's happening, and then swapping in your component once the action completes.

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

As noted above, `Suspense` does not detect when data is fetched inside an Effect or event handler.

It's also worth noting that wrapping a component in Suspense doesn't make the component itself *dynamic* (see [Static vs dynamic rendering](#static-vs-dynamic-rendering)), but rather `Suspense` is used as a boundary between the static and dynamic parts of your route.

For another example of this, see the streaming section in [nextjs_databases.md](nextjs_databases.md).

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

You can use native JavaScript patterns like global singletons within module scope if you have common data that multiple Server Components need to access.

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

The `<Link>` component works like this:

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
        const isActive = pathname?.startsWith(link.href) ?? false;

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

## Static vs dynamic rendering 

In addition to client and server components, both can be either statically or dynamically rendered.

With *Static Rendering*, both Server and Client Components can be prerendered on the server at build time. The result of the work is cached and reused on subsequent requests. The cached result can also be revalidated.

- Client Components have their HTML and JSON prerendered and cached on the server. The cached result is then sent to the client for hydration.
- Server Components are rendered on the server by React, and their payload is used to generate HTML. The same rendered payload is also used to hydrate the components on the client, resulting in no JavaScript needed on the client.

Static rendering is useful for UI with no data or data that is shared across users, such as a static blog post or a product page. It might not be a good fit for a dashboard that has personalized data that is regularly updated.

With *Dynamic Rendering*, both Server and Client Components are rendered on the server at request time. The result of the work is not cached. Benefits of dynamic rendering:

- Real-Time Data - Dynamic rendering allows your application to display real-time or frequently updated data. This is ideal for applications where data changes often.
- User-Specific Content - It's easier to serve personalized content, such as dashboards or user profiles, and update the data based on user interaction.
- Request Time Information - Dynamic rendering allows you to access information that can only be known at request time, such as cookies or the URL search parameters.

By default, Next.js statically renders routes to improve performance. To change to dynamic rendering you would do one if the following:

- `fetch()` with options `cache: 'no-store'` or `revalidate: 0` (see [nextjs_fetch_cache_revalidate.md](nextjs_fetch_cache_revalidate.md))
- Use the Segment Config Option `export const dynamic = "force-dynamic"` (see [nextjs_fetch_cache_revalidate.md](nextjs_fetch_cache_revalidate.md))
- Use `unstable_noStore` to indicate a particular component should not be cached (see [nextjs_databases.md](nextjs_databases.md))
- Use a Next.js dynamic function like `cookies()`, `headers()`, or `useSearchParams()`
- `searchParams` which are passed automatically in the props of a `page.js` is a Dynamic API whose values cannot be known ahead of time. Using it will opt the page into dynamic rendering at request time.


## Dynamic functions

During static rendering, if a [dynamic function](https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic-rendering#dynamic-functions) is discovered, Next.js will switch to dynamically rendering the whole route at request time. Any cached data requests can still be re-used during dynamic rendering.

Dynamic functions rely on information that can only be known at request time such as a user's cookies, current requests headers, or the URL's search params. In Next.js, these dynamic functions are:

- Using `cookies()` or `headers()` in a Server Component will opt the whole route into dynamic rendering at request time.
- Using `useSearchParams()` in Client Components will skip static rendering and instead render all Client Components up to the nearest parent Suspense boundary on the client.
- Using `unstable_noStore()` (soon to be `noStore()`) in a component makes the entire route become dynamic.


## useSearchParams 

`useSearchParams` is a Client Component hook that lets you read the current URL's query string. It returns a read-only version of the [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) interface.

```javascript
'use client'
 
import { useSearchParams } from 'next/navigation'
 
export default function SearchBar() {
  const searchParams = useSearchParams()
  const search = searchParams.get('myparam')
  // ...
}
```

Note that there are actually two different ways to extract search params: using the `useSearchParams` hook in client components and the `searchParams` prop in pages:

```jsx
export default function Page(props) {
  console.log(props);
  // { params: {}, searchParams: {} }
  return (
    <main>
      <p>Page.</p>
    </main>
  )
}
```

As a general rule, if you want to read the `params` from the client, use the `useSearchParams` hook as this avoids having to go back to the server.

However, if you want to access these in a server component that fetches its own data, you can pass the `searchParams` prop from the page to that component.


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

It sounds like Next creates a `srcset` and various optimized images for you:

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

In their [self-hosting deployment](https://nextjs.org/docs/app/building-your-application/deploying#nodejs-server) section they say:

> If you are using next/image, consider adding `sharp` for more performant Image Optimization in your production environment by running `npm install sharp` in your project directory. On Linux platforms, `sharp` may require additional configuration to prevent excessive memory usage.

Ok what?!

If you're exporting static HTML (no Node.js server) which doesn’t include a server to optimize images, you can disable Image Optimization completely using next.config.js for all instances of next/image:

```javascript
module.exports = {
 images: {
 unoptimized: true,
 },
};
```

Overall the whole thing feels a bit sus... like a money trap. 


## revalidatePath

`revalidatePath` allows you to revalidate data associated with a specific path. This is useful for scenarios where you want to update your cached data without waiting for a revalidation period to expire. Note this example uses [route handlers](nextjs_route_handlers.md).

```javascript
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
 
export async function POST(request) {
  const path = request.nextUrl.searchParams.get('path') || '/';
  revalidatePath(path);
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

`revalidatePath` only invalidates the cache when the path is next visited.


## revalidateTag

`revalidateTag` allows you to revalidate data associated with a specific cache tag. This is useful for scenarios where you want to update your cached data without waiting for a revalidation period to expire. Note this example uses [route handlers](nextjs_route_handlers.md).

app/api/revalidate/route.js

```javascript
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
 
export async function POST(request) {
  const tag = request.nextUrl.searchParams.get('tag');
  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

You can add tags to fetch as follows:

```javascript
fetch(url, { next: { tags: ['something'] } });
```


## Route segment config

The [Route Segment options](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) allows you configure the behavior of a Page, Layout, or Route Handler by directly exporting the following variables:

```javascript
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = false;
export const fetchCache = 'auto';
export const runtime = 'nodejs';
export const preferredRegion = 'all';
 
export default function MyComponent() {}
```

Note you can also do *comma-separated variable declarations* to visually group these:

```javascript
export const dynamic = 'auto',
  dynamicParams = false,
  revalidate = 300;
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

You van use the [strategy property](https://nextjs.org/docs/app/building-your-application/optimizing/scripts#strategy) to control when the script loads as well as offloading them to web workers. 

- `beforeInteractive`: Load the script before any Next.js code and before any page hydration occurs.
- `afterInteractive`: (default) Load the script early but after some hydration on the page occurs.
- `lazyOnload`: Load the script later during browser idle time.
- `worker`: (experimental) Load the script in a web worker.

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

See also the [Script component API reference](https://nextjs.org/docs/app/api-reference/components/script).


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

Eslint is automatically setup when using `npx create-next-app@latest`. See the [docs on eslint](https://nextjs.org/docs/app/building-your-application/configuring/eslint) for details on disabling rules, adding additional directories and more.


## Environment variables

Next.js comes with built-in support for environment variables, which allows you to do the following:

- use `.env.local` to load environment variables (server only)
- bundle environment variables for the browser by prefixing with `NEXT_PUBLIC_`

`.env.local` should be located in the root project folder (at the same level as `package.json` and `next.config.js`):

```bash
DB_HOST=localhost
DB_USER=myuser
DB_PASS=mypassword
```

This loads the variables into the Node.js environment allowing you to use them in Route Handlers (API routes), server actions and any other server functions or components.

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

> Note: to say they aren't available to the browser is actually a bit misleading because you CAN access and display an environment variable just fine in a server component. If it's a 'use client' component though, the value will be missing, so you'll need the `NEXT_PUBLIC` prefix.

In order to make the value of an environment variable accessible in ~~the browser~~ client components, Next.js can inline insert a value at build time, into the js bundle that is delivered to the client. It just replaces all references to `process.env.[variable]` with a hard-coded value. To tell it to do this, you just have to prefix the variable with `NEXT_PUBLIC_`.

```bash
NEXT_PUBLIC_ANALYTICS_ID=abcdefghijk
```

Note: All `NEXT_PUBLIC_` variables will be frozen with the value evaluated at build time. If you need access to runtime environment values, you'll have to setup your own API to provide them to the client (either on demand or during initialization).

### .env, .env.local, .env.production, .env.development

Firstly, know that Next.js will automatically look up environment variables in the following places, in order, stopping once the variable is found:

- `process.env`
- `.env.$(NODE_ENV).local` (`production`, `development` or `test`)
- `.env.local` (not checked when `NODE_ENV` is `test`.)
- `.env.$(NODE_ENV)` (`production`, `development` or `test`)
- `.env`

In general only one `.env.local` file is needed. However, sometimes you might want to add some defaults for the development (`next dev`) or production (`next start`) environment.

Next.js allows you to set **defaults** in `.env` (all environments), `.env.development` (development environment), and `.env.production` (production environment).

`.env.local` always overrides the defaults set.

You can use the `NODE_ENV` environment variable to determine which `.env` to use. The allowed values for `NODE_ENV` are `production`, `development` and `test`.

If the environment variable `NODE_ENV` is unassigned, Next.js automatically assigns `development` when running the `next dev` command, or `production` for all other commands. For example, if I was starting my application using a `server.ts` file, I would want to add the appropriate `NODE_ENV`:

```json
"scripts": {
    "dev": "next dev",
    "start": "next start",
    "build": "next build",
    "lint": "next lint",
    "init": "node -r dotenv/config ./scripts/initialize-database.js",
    "server-dev": "NODE_ENV=development npx tsx ./server.ts",
    "server-start": "NODE_ENV=production npx tsx ./server.ts"
  },
```

I think Next.js intends that you use `.env`, `.env.development`, and `.env.production` files for values that aren't secret (include them in your repo) and `env.local` for secrets (should be added to `.gitignore`). I don't really get this intention, because this assumes you have no secrets in the dev or prod files. So I guess that's why they've listed `.env.$(NODE_ENV).local` as another option.

I have a situation as seen in the `init` script where I have a separate file that I run in Node, (outside of Next.js) for initializing my database. That script needs access to the environment variables so I use the `dotenv` package which is only loading a `.env` file.

So, while it's cool they have all these other options... it doesn't work for me.

## Absolute import path alias

You can use the `@/` alias making it easier to import modules. For example:

```javascript
// before
import { Button } from '../../../_components/button';
 
// after
import { Button } from '@/app/_components/button';
```

## See also

- [nextjs_dynamic_routes.md](nextjs_dynamic_routes.md)
- [nextjs_fetch_cache_revalidate.md](nextjs_fetch_cache_revalidate.md)
- [nextjs_route_handlers.md](nextjs_route_handlers.md)
- [nextjs_middleware.md](nextjs_middleware.md)
- [nextjs_server_actions.md](nextjs_server_actions.md)
- [nextjs_advanced_routing.md](nextjs_advanced_routing.md)
- [nextjs_redirects.md](nextjs_redirects.md)
- [nextjs_styling.md](nextjs_styling.md)
- [nextjs_databases.md](nextjs_databases.md)
- [nextjs_internationalization.md](nextjs_internationalization.md)
- [nextjs_deployment.md](nextjs_deployment.md)
- [nextjs_seo.md](nextjs_seo.md)

There's additional topics in the Next documentation but from the sounds of it, these features require deploying to Vercel. These include:

- [Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/analytics) 
- [OpenTelemetry](https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry)

There are also some topics which would need further investigation:

- [Content Security Policy](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)

And others that are specific use cases:

- [MDX](https://nextjs.org/docs/app/building-your-application/configuring/mdx)
- [Draft Mode](https://nextjs.org/docs/app/building-your-application/configuring/draft-mode)