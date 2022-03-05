# Next.js

> Next.js is an open-source development framework built on top of Node.js enabling React based web applications functionalities such as server-side rendering and generating static websites. React documentation mentions Next.js among "Recommended Toolchains" advising it to developers as a solution when "Building a server-rendered website with Node.js". Where traditional React apps render all their content in the client-side browser, Next.js is used to extend this functionality to include applications rendered on the server side.

It's important to underline the fact that Next.js is a framework (as opposed to just a library). It enforces a structure and allows for advances features like server *side rendering* and *automatic code splitting*. It replaces `create-react-app` and has its own routing features, analytics, static file serving and more.

## Table of Contents

<!-- toc -->

- [Getting started](#getting-started)
  * [Manual setup](#manual-setup)
  * [Automatic setup](#automatic-setup)
- [Server side rendering](#server-side-rendering)
- [Automatic server side routing in pages](#automatic-server-side-routing-in-pages)
- [Client side routing with Link](#client-side-routing-with-link)
- [Styles](#styles)
  * [Global styles](#global-styles)
  * [Component-level css](#component-level-css)
- [pages/_app.js](#pages_appjs)

<!-- tocstop -->

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

dev - Runs next dev which starts Next.js in development mode
build - Runs next build which builds the application for production usage
start - Runs next start which starts a Next.js production server
lint - Runs next lint which sets up Next.js' built-in ESLint configuration

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


## Server side rendering

> Data fetching in Next.js allows you to render your content in different ways, depending on your application's use case. These include pre-rendering with Server-side Rendering or Static Generation, and updating or creating content at runtime with Incremental Static Regeneration.

In a nutshell, Next.js allows for hybrid rendering. The initial page request can be rendered on the server, then additional content could be rendered on the client. The benefit of have some of the app render on the server is improved SEO and a potentially a faster experience for users on old, slow devices.

Note: you can see the server-side rendering simply by placing a `console.log` in all your page components. You will see that these actually output in the node terminal where you are running `npm run dev` in addition to the browser console.

```bash
wait  - compiling / (client and server)...
event - compiled client and server successfully in 101 ms (124 modules)
Index render
wait  - compiling /about (client and server)...
event - compiled client and server successfully in 82 ms (125 modules)
About render
```

## Automatic server side routing in pages

Any `.js`, `.jsx`, `.ts`, or `.tsx` file in the pages directory will automatically be mapped to a (server-side) route based on their file name. For example pages/about.js is mapped to /about. You can even add dynamic route parameters with the filename (e.g. /pic/:id).

It is recommended that other (non page) components be placed in a compoennts directory.


## Client side routing with Link

See <https://nextjs.org/docs/api-reference/next/link>

In addition to the automatic routing with places files in the pages directory, you can also do client-side routing using `<Link>`:

```jsx
import Link from 'next/link';

function LandingPage() {
  console.log('Index render');
  return (
    <div>
      <h1>Hello</h1>
      <Link href="/about"><a>About</a></Link>
    </div>
  );
}

export default LandingPage;
```

When clicking the link we will see no page refresh and no console logging on the server-side.

Note the child of `<Link>` should be an `<a>`, but if you wanted to use a custom component, you need to add `passHref` to the `<link>` and wrap the component in React.forwardRef:

```jsx
import React from 'react';
import Link from 'next/link';

// Use React.forwardRef and pass `onClick`, `href`, and `ref`
// to the DOM element for proper handling
const CustomLink = React.forwardRef((props, ref) => {
  const { onClick, href, children } = props;
  return (
    <a href={href} onClick={onClick} ref={ref}>
      Custom link: {children}
    </a>
  );
});

function LandingPage() {
  console.log('Index render');
  return (
    <div>
      <h1>Hello</h1>
      {/* add passHref */}
      <Link href="/about" passHref>
        <CustomLink>About</CustomLink>
      </Link>
    </div>
  );
}

export default LandingPage;
```

## Styles

See: <https://nextjs.org/docs/basic-features/built-in-css-support>

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
    <div className="Nav" style={styles}>
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
import '../styles.css'

// This default export is required in a new `pages/_app.js` file.
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```

These styles (styles.css) will apply to all pages and components in your application. Due to the global nature of stylesheets, and to avoid conflicts, you may only import them inside pages/_app.js.

Other stylesheets from node_modules (e.g. bootstrap) should also be imported into _app.js:

```jsx
import 'bootstrap/dist/css/bootstrap.css';
import '../styles.css'
```

### Component-level css

Next.js supports CSS Modules using the `[name].module.css` file naming convention. CSS Modules locally scope CSS by automatically creating a unique class name. This allows you to use the same CSS class name in different files without worrying about collisions.

In this example, both Nav.js and Nav.module.css are saved in a directory called components.

```jsx
import React from 'react';
import Link from 'next/link';
import styles from './Nav.module.css';

function Nav() {

  return (
    <div className={styles.Nav}>
      <Link href="/"><a>Index</a></Link>
      <Link href="/about"><a>About</a></Link>
    </div>
  );
}

export default Nav;
```

CSS Modules are an optional feature and are only enabled for files with the .module.css extension. Regular <link> stylesheets and global CSS files are still supported.


## pages/_app.js

As noted above, this file is where you import global css files. In addition, you can use this file to place anything that should appear an all pages (it's like like App.js in create-react-app). For example:

```jsx
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import '../styles.css';

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Nav />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}

export default MyApp;
```

