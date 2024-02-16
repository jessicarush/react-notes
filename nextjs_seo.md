# SEO in Next.js

## Table of Contents

<!-- toc -->

- [HTTP status codes](#http-status-codes)
  * [200](#200)
  * [307/308](#307308)
  * [404](#404)
  * [500](#500)
  * [503](#503)
- [Meta data](#meta-data)
  * [Config-based metadata](#config-based-metadata)
  * [file-based metadata](#file-based-metadata)
  * [favicon.ico, apple-icon.jpg, icon.jpg](#faviconico-apple-iconjpg-iconjpg)
  * [opengraph-image and twitter-image](#opengraph-image-and-twitter-image)
  * [robots.txt](#robotstxt)
  * [sitemap.xml](#sitemapxml)

<!-- tocstop -->

## HTTP status codes 

There are many status codes, but only a handful are meaningful in an SEO context.

### 200 

This is the default code that will be set when Next.js renders a page successfully.

### 307/308 

Indicates that the resource requested has been moved temporarily (307) or permanently (308) to the destination URL.

You can trigger a 307 or 308 redirect in Next.js in next.config.js.

```javascript
// next.config.js
module.exports = {
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/',
        permanent: true, // triggers 308
      },
    ];
  },
};
```

`redirects` is an `async` function that expects an array to be returned holding objects with `source`, `destination`, and `permanent` properties:

- `source` is the incoming request path pattern.
- `destination` is the path you want to route to.
- `permanent` `true` or `false` - if `true` will use the `308` status code which instructs clients/search engines to cache the redirect forever, if false will use the 30`7 status code which is temporary and is not cached.


### 404

Next.js will automatically return a 404 status code for URLs that do not exist in your application. In some cases, you might also want to return a 404 status code from a page (for example with [dynamic routes](nextjs_app_router.md#dynamic-routes)):

```javascript
import Image from 'next/image';
import { notFound } from 'next/navigation';
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

### 500 

Next.js will automatically return a 500 status code for an unexpected application error.

### 503 

It's recommended to return this status code when your website is down and you predict that the website will be down by an extended period of time. This prevents losing rankings on a long-term basis.

The only way I could think to do this is with middleware, by returning JSON:

```javascript
// This function can be marked `async` if using `await` inside
export function middleware(request) {
  console.log('middleware running');

  if (request.nextUrl.pathname.startsWith('/')) {
    return new Response(JSON.stringify('Service temporarily unavailable!'), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': 'Wed, 21 Oct 2023 07:28:00 GMT'
        },
    });
  }
```

It would be great if I could return a custom 503 page, but not sure that's possible at this time. See also [github issue #52378](https://github.com/vercel/next.js/discussions/52378) and [github issue #50383](https://github.com/vercel/next.js/discussions/50383).


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

Some [fields](https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields):

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
  colorScheme: 'dark',
  robots: {
    index: true,
    follow: true,
    noarchive: true,
  },
};
```

There's way more, e.g. robots,  icons, etc. See also the [HTML standard](https://html.spec.whatwg.org/multipage/semantics.html#the-meta-element).

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

Place a `png|jpeg|gif` image called `opengraph-image.png` in your `app` directory and to any route segment. This will get added as the meta tags like:

```html
<meta property="og:image" content="" />
```

File convention | Supported file types
--------------- | --------------------
opengraph-image | .jpg, .jpeg, .png, .gif
twitter-image | .jpg, .jpeg, .png, .gif
opengraph-image.alt | .txt
twitter-image.alt | .txt

See [metadata/opengraph-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image).

Note you can also create this as a `.js` file: see the [open graph protocol](https://ogp.me/).


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