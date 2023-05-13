# Next.js (using App Router)

Next used to use something called *Pages router* but now they are moving to a different setup called *App router* which is now officially recommended over *Page router*. The information below is in the *App router* format. See [nextjs_app_router.md](nextjs_page_router.md) for *Page router* information. Note that you can continue to use a pages directory with the *App router*.

The [13.5 release blog post](https://nextjs.org/blog/next-13-4) explains some of the differences between the two routers.

## Table of Contents

<!-- toc -->

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

Components are now **server-side by default**. You need to specifically opt into client-side using `"use client"` at the start of your file.

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

### catch-all routes

Note the `[postid]` directory name will only handle and exact match for that url structure. For example: `app/post/100` or `app/post/fart` will be handled but `app/post/100/another` would result in a 404. If I rename my folder `[...postid]`, this will catch all urls such as:


Todo...
