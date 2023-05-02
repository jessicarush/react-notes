# Next.js

> Next.js is an open-source development framework built on top of Node.js enabling React based web applications functionalities such as server-side rendering and generating static websites. React documentation mentions Next.js among "Recommended Toolchains" advising it to developers as a solution when "Building a server-rendered website with Node.js". Where traditional React apps render all their content in the client-side browser, Next.js is used to extend this functionality to include applications rendered on the server side.

It's important to underline the fact that Next.js is a framework (as opposed to just a library). It enforces a structure and allows for advanced features like hybrid *server side + client side rendering*. It has its own routing features, analytics, static file serving and more.

Also noteworthy is the documentation looks very good and includes a [nice tutorial section](https://nextjs.org/learn/foundations/about-nextjs).

## Table of Contents

<!-- toc -->

- [Next.js vs React](#nextjs-vs-react)
- [Getting started](#getting-started)
  * [Manual setup](#manual-setup)
  * [Automatic setup](#automatic-setup)
- [Server side rendering](#server-side-rendering)
- [Directory structure](#directory-structure)
  * [pages/_app.js](#pages_appjs)
  * [pages/index.js](#pagesindexjs)
- [Automatic server side routing in pages](#automatic-server-side-routing-in-pages)
- [Client side routing with Link](#client-side-routing-with-link)
- [Scripts](#scripts)
- [Images](#images)
- [Styles](#styles)
  * [Inline styles](#inline-styles)
  * [Global styles](#global-styles)
  * [CSS Modules](#css-modules)
  * [CSS-in-JS](#css-in-js)
    + [styled-jsx](#styled-jsx)
    + [styled-components](#styled-components)
  * [Tailwind](#tailwind)
  * [SASS](#sass)
  * [Google fonts](#google-fonts)
- [Using a template](#using-a-template)
- [Notes](#notes)
- [Q&As](#qas)
  * [If I build a react app using Next.js, do I have to deploy on Vercel, or can I deploy on my own server?](#if-i-build-a-react-app-using-nextjs-do-i-have-to-deploy-on-vercel-or-can-i-deploy-on-my-own-server)
  * [Requires more reading:](#requires-more-reading)

<!-- tocstop -->

## Next.js vs React

React is a "JavaScript library for building user interfaces".

Next.js is a production framework for React. It is used on top of React, expanding its capabilities and streamlining the development process. React doesn't need to work with Next.js, but Next.js uses React to deploy apps.

## Getting started

### Manual setup

- Create a new project directory
- `npm init`
- `npm install react react-dom next`
- add scripts to package.json

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

These scripts refer to the different stages of developing an application:

`dev` - Runs next dev which starts Next.js in development mode  
`build` - Runs next build which builds the application for production usage  
`start` - Runs next start which starts a Next.js production server  
`lint` - Runs next lint which sets up Next.js' built-in ESLint configuration  

- Create a pages directory inside the project dir.
- Populate ./pages/index.js with the following content:

```jsx
function HomePage() {
  return <div>Welcome to Next.js!</div>
}

export default HomePage
```

- `npm run dev`

### Automatic setup

See <https://nextjs.org/docs/api-reference/create-next-app>

- `npx create-next-app@latest`

To start the development server on http://localhost:3000

- `npm run dev`


## Directory structure

Todo..


### pages/_app.js

The default export of `_app.js` is a top-level React component that wraps all the pages in your application. You can use this component to keep state when navigating between pages, to add global styles or place anything that should appear an all pages. For example:

```jsx
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Nav />
      <Component {...pageProps} /> {/* The active page */}
      <Footer />
    </div>
  );
}

export default MyApp;
```

### pages/index.js 

Note `<Head>` is a React Component that is built into Nextjs. It allows you to modify the `<head>` of any page.


## Automatic server side routing in pages

Any `.js`, `.jsx`, `.ts`, or `.tsx` file in the pages directory will automatically be mapped to a (server-side) route based on their file name. For example pages/about.js is mapped to /about. You can even add dynamic route parameters with the filename (e.g. /pic/:id).

It is recommended that other (non page) components be placed in a components directory.


## Client side routing with Link

See <https://nextjs.org/docs/api-reference/next/link>

In addition to the automatic routing with files placed in the pages directory, you can also do client-side routing using `<Link>`:

```jsx
import Link from 'next/link';

function LandingPage() {
  console.log('Index render');
  return (
    <div>
      <h1>Hello</h1>
      <Link href="/about">About</Link>
    </div>
  );
}

export default LandingPage;
```

When clicking the link we will see no page refresh and no console logging on the server-side.

If you are linking to an external site, use the `<a>` element.


## Scripts 

`next/script` is an extension of the HTML `<script>` element and optimizes when additional scripts are fetched and executed. This is generally used for third-party scripts but for demo purposes only, I'm using my own:

```jsx
import Head from 'next/head';
import Script from 'next/script';

function FirstPost() {
  return (
    <>
      <Head>
        <title>First Post</title>
      </Head>
      <Script
        src="/js/myscript.js"
        strategy="afterInteractive"
        onLoad={() =>
          console.log(`script loaded`)
        }
      />

      <h1>First post</h1>
    </>
  )
}

export default FirstPost;
```

- `strategy` controls when the third-party script should load. `beforeInteractive`: Load the script before any Nextjs code and before any page hydration occurs. `afterInteractive`: (default) Load the script early but after some hydration on the page occurs. `lazyOnload`: Load the script later during browser idle time.
- `onLoad` is used to run any JavaScript code immediately after the script has finished loading. There is also an `onReady` which runs after the script has finished loading and every time the component is mounted and `onError` which runs if the script fails to load.

To test `strategy`, I'm importing this:

```javascript
// Test script for Script component

function doSomething() {
  console.log('I have done something!');
}

function doAnother() {
  console.log('I have done another.');
}

window.addEventListener('DOMContentLoaded', () => {
  doSomething();
});

doAnother();
```

The output for each:

```console
// With beforeInteractive:
// I have done another.
// I have done something!

// With afterInteractive:
// I have done another
// script loaded

// With lazyOnload:
// I have done another.
// script loaded
```

Clearly the event listener for `DOMContentLoaded` doesn't fire with `afterInteractive` and `lazyOnload`. 

Note that `onLoad` does not work when used with the `beforeInteractive` strategy.

To load a third-party script in a single route, import `next/script` and include the script directly in your page component. The script will only be fetched and executed when this specific page is loaded on the browser. 

To load a third-party script for all routes, import `next/script` and include the script directly in pages/_app.js:

```javascript
import Script from 'next/script'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script src="https://example.com/script.js" />
      <Component {...pageProps} />
    </>
  )
}
```

Keep in mind, for a lot of scripts, you can just `npm install` and `import` them:

```bash
npm install moment
```

```javascript
import moment from 'moment';
```

## Images 

Next has a built-in Image component that handles things like:

- Ensuring your image is responsive on different screen sizes
- Optimizing your images with a third-party tool or library
- Only loading images when they enter the viewport

Instead of optimizing images at build time, Next.js optimizes images on-demand, as users request them and images are rendered in such a way as to avoid *Cumulative Layout Shift*.

Note the height and width props should be the desired rendering size, with an aspect ratio identical to the source image:

```jsx
<Image
  src="/img/headshot.jpg" // path to file from the public dir
  className={styles.profilePic} // css modules
  height={144} // Desired size with correct aspect ratio
  width={144} // Desired size with correct aspect ratio
  alt="Jessica Rush"
/>
```

## Styles

See: <https://nextjs.org/docs/basic-features/built-in-css-support>

### Inline styles

You can apply css inline as usual:

```jsx
import React from 'react';
import Link from 'next/link';

function Nav() {
  const styles = {
    background: "#000",
    padding: ".5rem"
  };
  return (
    <div style={styles}>
      <Link href="/about"><a>Index</a></Link>
      <Link href="/about"><a>About</a></Link>
    </div>
  );
}

export default Nav;
```

### Global styles

To add a global stylesheet to your application, import the CSS file within pages/_app.js. This file is created automatically with `create-next-app`. For example:

```jsx
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```

These styles (styles.css) will apply to all pages and components in your application. Due to the global nature of stylesheets, and to avoid conflicts, **you may only import global styles inside pages/_app.js**.

Other stylesheets from node_modules (e.g. bootstrap) should also be imported into _app.js:

```jsx
import 'bootstrap/dist/css/bootstrap.css';
import '../styles/globals.css';
```

### CSS Modules

Next.js supports CSS Modules using the `[name].module.css` file naming convention. CSS Modules locally scope CSS by automatically creating a unique class name. This allows you to use the same CSS class name in different files without worrying about collisions.

In this example, both `nav.js` and `nav.module.css` are saved in a directory called components.

```jsx
import React from 'react';
import Link from 'next/link';
import styles from './nav.module.css';

function Nav() {

  return (
    <div className={styles.nav}>
      <Link href="/"><a>Index</a></Link>
      <Link href="/about"><a>About</a></Link>
    </div>
  );
}

export default Nav;
```

CSS Modules are an optional feature and are only enabled for files with the .module.css extension. Regular <link> stylesheets and global CSS files are still supported.


> :warning: with css modules, class names with hyphens will break. The recommendation is to use camelCase instead but you can also use bracket notation instead of dot notation: `<div className={styles.['nav-wrapper']}>`.

### CSS-in-JS 

See: <https://nextjs.org/docs/basic-features/built-in-css-support#css-in-js>

#### styled-jsx 

`styled-jsx` is a built-in CSS-in-JS library for Nextjs, so you don't need to install it separately when creating a new project with `create-next-app`. Nextjs originally chose to include `styled-jsx` as the built-in CSS-in-JS solution because it was specifically designed for Next.

See: 

- <https://nextjs.org/blog/styling-next-with-styled-jsx>
- <https://github.com/vercel/styled-jsx>

It looks like this:

```jsx
import Layout from '../components/layout';

export default function Home() {
  return (
    <Layout>
      <footer>
        <p className='test'>Test footer</p>
      </footer>

      <style jsx>{`
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .test {
          color: #fff;
          background: blueviolet;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </Layout>
  );
}
```

#### styled-components

See: 

- <https://github.com/vercel/next.js/tree/canary/examples/with-styled-components>
- <https://nextjs.org/docs/advanced-features/compiler#styled-components>

First, install styled components:

```bash
npm install --save styled-components
```

You can use styled-components now but note you'll want to do more so that you can see class names in dev tools:

```bash
npm install --save-dev babel-plugin-styled-components
```

Then update your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
}

module.exports = nextConfig
```

Instead of `true`, you can pass a [custom options object](https://nextjs.org/docs/advanced-features/compiler#styled-components).


### Tailwind 

See: 

- <https://nextjs.org/learn/basics/assets-metadata-css/styling-tips>
- <https://github.com/vercel/next.js/tree/canary/examples/with-tailwindcss>


### SASS

See: 

- <https://nextjs.org/learn/basics/assets-metadata-css/styling-tips>
- <https://nextjs.org/docs/basic-features/built-in-css-support#sass-support>


### Google fonts 

Automatically self-host any Google Font. Fonts are included in the deployment and served from the same domain as your deployment. No requests are sent to Google by the browser. See the [next/font API](https://nextjs.org/docs/api-reference/next/font#nextfontgoogle).


They recommend using [variable fonts](https://fonts.google.com/variablefonts) for the best performance and flexibility.

```jsx
import { Inter } from 'next/font/google';
import { Roboto } from 'next/font/google';

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({ subsets: ['latin'] })

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})

function Home() {
  return (
   <h2 className={inter.className}>Hello</h2>
  )
}
```

You can specify multiple weights and/or styles by using an array:

```javascript
const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
})
```

Use `_` for fonts with spaces in the name. For example Titillium Web should be `Titillium_Web`.

To use the font in all your pages, add it to _app.js file under /pages as shown below:

```jsx
// pages/_app.js
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function MyApp({ Component, pageProps }) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  )
}
```

You can also use the font without a wrapper and className by injecting it inside the <head> as follows:

```jsx
// pages/_app.js
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  )
}
```

Or set a css variable:

```jsx 
import '@/styles/globals.css';
import { Exo } from 'next/font/google';

const exo = Exo({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        :root {
          --main-font: ${exo.style.fontFamily}, -apple-system,
            'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
            'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
```


## Pre-rendering 


> Data fetching in Next.js allows you to render your content in different ways, depending on your application's use case. These include pre-rendering with Server-side Rendering or Static Generation, and updating or creating content at runtime with Incremental Static Regeneration.

There are two forms of pre-rendering: *Static Generation* and *Server-side Rendering*. The benefit of have some pre-rendering is improved SEO and a potentially a faster experience for users on old, slow devices.

- Static Generation is the pre-rendering method that generates the HTML at **build time**. The pre-rendered HTML is then reused on each request.
- Server-side Rendering is the pre-rendering method that generates the HTML on each **request**.

Next.js lets you choose which pre-rendering form to use for each page. You can create a "hybrid" Next.js app by using Static Generation for most pages and using Server-side Rendering for others.

Data fetching in Static Generation is done with `getStaticProps`.
Data fetching in Server-side rendering is done with `getServerSideProps` or `getInitialProps` (legacy). 

Note: you can see the server-side rendering simply by placing a `console.log` in all your page components. You will see that these actually output in the node terminal where you are running `npm run dev` in addition to the browser console.

```bash
wait  - compiling / (client and server)...
event - compiled client and server successfully in 101 ms (124 modules)
Index render
wait  - compiling /about (client and server)...
event - compiled client and server successfully in 82 ms (125 modules)
About render
```

### Static Generation 

With static generation, HTML is generated at **build time** (`npm run build`) and is reused for each request. Static Generation can be done with data, and without data.

Nextjs recommends using Static Generation (with and without data) whenever possible because your page can be built once and served by CDN, which makes it much faster than having a server render the page on every request.

You can use Static Generation for many types of pages, including:

- Marketing pages
- Blog posts
- Product listings
- Help and documentation

You should ask yourself: "Can I pre-render this page ahead of a user's request?" If the answer is yes, then you should choose Static Generation.

Pages that do not require fetching external data will automatically be statically generated when the app is built for production.

However, for some pages, you might not be able to render the HTML without first fetching some external data. Maybe you need to access the file system, fetch external API, or query your database at build time. That could be done with *static generation with data* using `getStaticProps`.

When you export a page component, you can also export an async function called `getStaticProps`. Inside the function, you can fetch external data and send it as props to the page. The `getStaticProps` function runs at **build time** in production.

> Note: In development mode, getStaticProps runs on each request instead.

```javascript
import Head from 'next/head';
import Layout from '../components/layout';
import { getSortedPostsData } from '../lib/posts';


export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
  return (
    <Layout home>
      {/* ... */}
    </Layout>
  );
}
```

As for the actual getting of data, we could be getting from a file:

```javascript
import fs from 'fs';               // Node.js built-in module
import path from 'path';           // Node.js built-in module
import matter from 'gray-matter';  // npm install gray-matter

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => a.date < b.date ? 1 : -1);
}
```

Or from an API...

```javascript
export async function getSortedPostsData() {
  // Fetch data from an external API endpoint
  const res = await fetch('..');
  const data = await res.json();
  return data;
}
```

Or from a database...

```javascript
import someDatabaseSDK from 'someDatabaseSDK'

const databaseClient = someDatabaseSDK.createClient(...);

export async function getSortedPostsData() {
  // Fetch post data from a database
  return databaseClient.query('SELECT posts...')
}
```

NOTE: the Next docs don't say this but in order to get the API example to work, I also had to add an `await` to the `getStaticProps` function, otherwise I got a json serialization error. Others have said you can also use some `superjson` package.

```javascript
export async function getStaticProps() {
  const randomColor = await getColorWithFetch(); // <-- await!
  return {
    props: {
      randomColor,
    },
  };
}
```

This is possible because getStaticProps only runs on the server-side. It will never run on the client-side. It won’t even be included in the JS bundle for the browser.

- Remember, in development (npm run dev), `getStaticProps` runs on every request but in production, `getStaticProps` runs at build time. 
- Because it’s meant to be run at build time, you won’t be able to use data that’s only available during request time, such as query parameters or HTTP headers.
- `getStaticProps` can only be exported from a `page`. You can’t export it from non-page files.

### Server-side rendering

To fetch data a **request time** with Server-side Rendering, you need to export `getServerSideProps` instead of `getStaticProps` from your page.

```javascript
export async function getServerSideProps(context) {
  return {
    props: {
      // props for your component
    },
  };
}
```

Because `getServerSideProps` is called at request time, its parameter (`context`) contains request specific parameters. The context parameter is an object containing the following keys:

- `params`: If this page uses a dynamic route, params contains the route parameters. If the page name is [id].js , then params will look like { id: ... }.
- `req`: The HTTP IncomingMessage object, with an additional cookies prop, which is an object with string keys mapping to string values of cookies.
- `res`: The HTTP response object.
- `query`: An object representing the query string, including dynamic route parameters.
- `preview`: preview is true if the page is in the Preview Mode and false otherwise.
- `previewData`: The preview data set by setPreviewData.
- `resolvedUrl`: A normalized version of the request URL that strips the _next/data prefix for client transitions and includes original query values.
- `locale` contains the active locale (if enabled).
- `locales` contains all supported locales (if enabled).
- `defaultLocale` contains the configured default locale (if enabled).


You should use `getServerSideProps` only if you need to pre-render a page whose data must be fetched at request time. Keep in mind, it will be slower than `getStaticProps`.

You can also skip pre-rendering and use client-side JavaScript to populate frequently updated data.

### Client-side rendering 

If you do not need to pre-render data, you can also use the following strategy (client-side rendering):

Statically generate (pre-render) parts of the page that do not require external data. When the page loads, fetch external data from the client using JavaScript and populate the remaining parts.

This approach works well for user dashboard pages, for example. Because a dashboard is a private, user-specific page, SEO is not relevant, and the page doesn’t need to be pre-rendered. The data is frequently updated, which requires request-time data fetching.


## Client-side fetching with SWR 

The Next.js team has created a React hook for data fetching called [SWR](https://swr.vercel.app/docs/getting-started). They highly recommend it if you’re fetching data on the client side.

The name “SWR” is derived from stale-while-revalidate, a HTTP cache invalidation strategy. SWR is a strategy to first return the data from cache (stale), then send the fetch request (revalidate), and finally come with the up-to-date data.

With SWR, components will get a stream of data updates constantly and automatically.
And the UI will be always fast and reactive. For example, if you click to another app or tab, when you reactive the tab with SWR, it will get new data.

It is an external package, so you need to install it:

```bash
npm install swr
```

Example:

```javascript
import Head from 'next/head';
import useSWR from 'swr';

const url = 'https://log.zebro.id/api_demo_one';
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function Home() {
  const { data, error, isLoading } = useSWR(url, fetcher);
  const name = data ? Object.keys(data)[0] : '';
  const value = data ? Object.values(data)[0] : '';

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

You could use axios as well:

```javascript
import axios from 'axios';

const url = 'https://log.zebro.id/api_demo_one';
// const fetcher = (...args) => fetch(...args).then((res) => res.json());
const fetcher = url => axios.get(url).then(res => res.data);

// ...
```

You can also fetch via a user event using `mutate`:

```javascript
import Head from 'next/head';
import useSWR, { mutate } from 'swr'; // <-- import mutate

const url = 'https://log.zebro.id/api_demo_one';
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function Home() {
  const { data, error, isLoading } = useSWR(url, fetcher);
  const name = data ? Object.keys(data)[0] : '';
  const value = data ? Object.values(data)[0] : '';

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


## Using a template 

`create-next-app`, which bootstraps a Next.js app for you, can then use a template through the `--example flag`.

```bash
npx create-next-app@latest nextjs-blog --use-npm --example "https://github.com/vercel/next-learn/tree/master/basics/learn-starter"
```


## Notes

- page components must export as a `default` export.
- in a production build of Next.js, whenever Link components appear in the browser’s viewport, Next.js automatically prefetches the code for the linked page in the background
- serve static assets, like images, robots.txt, under the top-level public directory
- If you use `fs` (`import fs from 'fs'`), be sure it's only within `getInitialProps` or `getServerSideProps`.


## Q&As

### If I build a react app using Next.js, do I have to deploy on Vercel, or can I deploy on my own server?

No, you do not have to deploy a Next.js app on Vercel. While Vercel is the recommended deployment platform for Next.js apps, you can deploy a Next.js app on your own server or any other hosting platform that supports Node.js applications.

To deploy a Next.js app on your own server or a different hosting platform, you would typically follow these steps:

- Generate a production build of your Next.js app using the next build command.
- Start the production server using the next start command.
- Configure your server environment to run the production server and serve the appropriate ports and routes.
- Optionally, configure your server environment to handle routing, caching, and other optimizations for your Next.js app.

Note that deploying a Next.js app on your own server may require additional setup and configuration compared to deploying on Vercel, as Vercel provides a lot of automation and optimization for Next.js apps out of the box. However, with the proper setup, you can deploy your Next.js app on any server that supports Node.js applications.

### Requires more reading:

- In Next.js, you can opt to server-side render pages by using getServerSideProps.
- In Next.js, you can opt to statically generate pages by using getStaticProps.


