# SEO in Next.js

## Table of Contents

<!-- toc -->

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

