# SEO in Next.js

## Table of Contents

<!-- toc -->

- [HTTP status codes](#http-status-codes)
  * [200](#200)
  * [301/308](#301308)
  * [404](#404)
  * [500](#500)
  * [503](#503)
- [Robots.txt](#robotstxt)
- [Metadata files](#metadata-files)
  * [favicon.ico, apple-icon.jpg, icon.jpg](#faviconico-apple-iconjpg-iconjpg)
  * [opengraph-image](#opengraph-image)
  * [robots.txt](#robotstxt)
  * [sitemap.xml](#sitemapxml)

<!-- tocstop -->

## HTTP status codes 

There are many status codes, but only a handful are meaningful in an SEO context.

### 200 

This is the default code that will be set when Next.js renders a page successfully.

### 301/308 

Indicates that the resource requested has been definitively moved to the destination URL (a permanent redirect).

You can trigger a 308 redirect in Next.js by returning a redirect instead of props in the `getStaticProps()` function.

```javascript
// pages/about.js
export async function getStaticProps(context) {
  return {
    redirect: {
      destination: '/',
      permanent: true, // triggers 308
    },
  };
}
```

You can also use the permanent: true key in redirects set in next.config.js.

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

### 404

Next.js will automatically return a 404 status code for URLs that do not exist in your application. In some cases, you might also want to return a 404 status code from page (for example with [dynamic routes using fallbacks](nextjs.md#fallbacks)). You can do this by returning the following in place of props:

```javascript
export async function getStaticProps(context) {
  return {
    notFound: true, // triggers 404
  };
}
```

### 500 

Next.js will automatically return a 500 status code for an unexpected application error.

### 503 

It's recommended to return this status code when your website is down and you predict that the website will be down by an extended period of time. This prevents losing rankings on a long-term basis.

## Robots.txt 

Todo... 

<https://nextjs.org/learn/seo/crawling-and-indexing/robots-txt>


------------------------------------------------------------------------------

> The above info is from the old tutorial that uses Page Router. This all needs to be translated to App Router. The following is App Router stuff.

## Metadata files

For most meta data see [nextjs_app_router.md](nextjs_app_router.md#meta-data).

### favicon.ico, apple-icon.jpg, icon.jpg 

### opengraph-image

A custom image when the url is shared.

Place a `png|jpeg|gif` image called `opengraph-image.png` in your `app` directory and to any route segment. This will get added as the meta tags like:

```html
<meta property="og:image" content="" />
```

See [metadata/opengraph-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)

Note you can also create this as a `.js` file: see the [open graph protocol](https://ogp.me/).

### robots.txt 

### sitemap.xml 

Generate site maps at build time.

Create `app/sitemap.js` and `export` and `async` function called `sitemap` that returns an array of objects that contain a url and last modified. This page will be read by web crawlers and be available at `http://localhost:3000/sitemap.xml`. For example:


```javascript
export default async function sitemap() {
  // List regular routes
  const pages = ['', 'about', 'color', 'login', 'signup'];

  // Also fetch any dynamic routes
  const res = await fetch(url);
  const posts = await res.json()

  // Create arrays:
  const dynamicRoutes = posts.map((post) => {
    return {
      url: `http://localhost:3000/post/${post.id}`,
      lastModified: new Date().toISOString()
    }
  });
  const routes = pages.map((route) => {
    return {
      url: `http://localhost:3000/${route}`,
      lastModified: new Date().toISOString()
    }
  });

  return [...routes, ...dynamicRoutes];
}
```