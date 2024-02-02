# Dynamic routes 

## Table of Contents

<!-- toc -->

- [Creating dynamic routes](#creating-dynamic-routes)
- [Pre-render static routes](#pre-render-static-routes)
- [Link to dynamic routes](#link-to-dynamic-routes)
- [catch-all routes](#catch-all-routes)

<!-- tocstop -->

## Creating dynamic routes

Create dynamic routes by doing the directory structure like: `app/post/[postid]/page.js`.

Then we create a component in `page.js`:

```javascript
function Example(props) {
  console.log(props); // { params: { postid: '100' }, searchParams: {} }
  const postid = props.params.postid; // returns the postid of /app/post/100
  return (
    <main>
      <p>Post { postid }.</p>
    </main>
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

## Pre-render static routes

To pre-render static pages (like `getStaticPaths` with `fallback: false`), you would create and export a special function called `generateStaticParams`. 

> The `generateStaticParams` function can be used in combination with dynamic route segments to statically generate routes at build time instead of on-demand at request time.

```javascript
// The object keys should be the same as the filename [postid].js
export async function generateStaticParams() {
  return [
    { postid: '100' },
    { postid: '101' }
  ]
}

export default function Example(props) {
  const postid = props.params.postid;
  return (
    <main>
      <p>Post { postid }.</p>
    </main>
  );
}
```

At this point you want to consider how you are deploying your app/site:

1. If you are planning to build and deploy a [static export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports) (see [nextjs_deployment.md](nextjs_deployment.md)), then this is all you need to do. In this case, any routes not returned in by `generateStaticParams` will not be generated and therefor result in a 404. Note that in `npm run dev` mode, you will still get on-demand generated routes, even if they are not included in `generateStaticParams`:

> During `next dev`, `generateStaticParams` will be called when you navigate to a route.
> During `next build`, `generateStaticParams` runs before the corresponding Layouts or Pages are generated.

So, to test this properly you will need to first add the `output: 'export'` to your `next.config.js`, then build and run the export:

```
npm run build && npx serve@latest out
```

2. If you are NOT doing a static export but planning to build and deploy with Node.js, then you get to control what happens when a dynamic segment is visited that was not generated with `generateStaticParams`. This is done with the [dynamicParams](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams) segment config option:


```javascript
// Control what happens when a dynamic segment is visited that was not
// generated with generateStaticParams.
export const dynamicParams = false;
```

- `true` (default): Dynamic segments not included in `generateStaticParams` are generated on demand.
- `false`: Dynamic segments not included in `generateStaticParams` will return a `404`.

With the `dynamicParams` option set, you should be able to test this with `npm run dev` or `npm run build && npm start`.

## Link to dynamic routes

```javascript
<ul>
  {allPostsData.map((post) => (
    <li key={post.id}>
      <Link href={`/posts/${post.id}`}>{post.title}</Link>
    </li>
  ))}
</ul>
```

## catch-all routes

Note the `[postid]` directory name will only handle and exact match for that url structure. For example: `app/post/100` or `app/post/fart` will be handled but `app/post/100/another` would result in a 404. If I rename my folder `[...postid]`, this will catch all urls such as:

```
/app/post/100
/app/post/100/another
/app/post/100/a/b/c
```

In this case `props.params/postid` would return an array like `[ '100', 'a', 'b', 'c' ]`.
