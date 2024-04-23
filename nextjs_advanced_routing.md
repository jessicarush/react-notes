# Next.js advanced routing patterns 

The Nextjs App Router provides a set conventions to help you implement more advanced routing patterns. These include:

- **Parallel Routes**: Allow you to simultaneously show two or more pages in the same view that can be navigated independently. You can use them for split views that have their own sub-navigation. E.g. Dashboards.
- **Intercepting Routes**: Allow you to intercept a route and show it in the context of another route. You can use these when keeping the context for the current page is important. E.g. Seeing all tasks while editing one task or expanding a photo in a feed.


## Table of contents

<!-- toc -->

- [Parallel routes](#parallel-routes)
  * [simultaneously](#simultaneously)
  * [conditionally](#conditionally)
  * [Unmatched routes](#unmatched-routes)
  * [Using parallel routes for modals](#using-parallel-routes-for-modals)
- [Intercepting routes](#intercepting-routes)

<!-- tocstop -->

## Parallel routes

Parallel Routing allows you to *simultaneously* or *conditionally* render one or more pages in the same layout. This is helpful because each page can have it's own `loading.js` and `error.js`.

Parallel routes are created using named slots. Slots are defined with the `@folder` convention, and are passed to the same-level layout as props.

### simultaneously

For example:

```
app
 ├─dashboard
 │  ├─@team
 │  │  └─page.js
 │  ├─@projects
 │  │  └─page.js
 │  ├─layout.js    <-- This layout has props: children, team, projects
 │  └─page.js
 ├─error.js
 ├─favicon.ico
 ├─global-error.js
 ├─globals.css
 ├─layout.js
 ├─not-found.ico
 ├─page.js
 └─page.module.css
```

app/dashboard/layout.js

```javascript
export default function DashboardLayout({ children, team, projects }) {
  return (
    <div>
      <p>dashboard layout</p>
      {children}
      {team}
      {projects}
    </div>
  )
}
```

### conditionally

Parallel Routing also allows you to conditionally render a slot based on certain conditions, such as authentication state. This enables fully separated code on the same URL.

```javascript
import { getUser } from '@/lib/auth';

export default function Layout({ dashboard, login }) {
  const isLoggedIn = getUser();
  return isLoggedIn ? dashboard : login;
}
```

### Unmatched routes

[In the docs](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes#unmatched-routes) they talk about creating a `default.js` file to handle situations where the other slot has another directory (url segment). It looks like this situation:

```
app
 ├─dashboard
 │  ├─@team
 │  │  ├─settings    <-- This path doesn't exist for @projects
 │  │  │  └─page.js
 │  │  └─page.js
 │  ├─@projects
 │  │  └─page.js
 │  ├─layout.js
 │  └─page.js
 ├─error.js
 ├─favicon.ico
 ├─global-error.js
 ├─globals.css
 ├─layout.js
 ├─not-found.ico
 ├─page.js
 └─page.module.css
```

To resolve it, I need to add two `default.js` files. The one in `@projects` makes sense but the one in `dashboard` is a little less obvious. It turns out, during hard navigation, Next.js is unable to recover the active state for the `@projects` slot, and is looking for a `default.js` file in the dashboard segment.

```
app
 ├─dashboard
 │  ├─@team
 │  │  ├─settings 
 │  │  │  └─page.js
 │  │  └─page.js
 │  ├─@projects
 │  │  ├─default.js    <-- This default.js makes sense
 │  │  └─page.js
 │  ├─default.js       <-- Needed for some reason when hard navigating
 │  ├─layout.js
 │  └─page.js
 ├─error.js
 ├─favicon.ico
 ├─global-error.js
 ├─globals.css
 ├─layout.js
 ├─not-found.ico
 ├─page.js
 └─page.module.css
```

If I don't want to render anything just do:

```javascript
// default.js
export default function Default() {
  return null;
}
```

### Using parallel routes for modals

The [example in the docs](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes#examples) is particularly lacking. There's simply not enough information there to be able to understand the full usage. 

For example, if you navigate to the parallel route directly (or refresh while on the parallel route) Next.js cannot know which page should be showing in the background (`{children}` in the root layout). So in this case, you would want to define a root `default.js` for this situation specifically.

```
app
 ├─@auth
 │  ├─login
 │  │  └─page.js
 │  └─default.js    <-- So nothing is displayed in the toot layout unless we go to /login
 ├─default.js       <-- For if/when we navigate to /login first
 ├─error.js
 ├─favicon.ico
 ├─global-error.js
 ├─globals.css
 ├─layout.js
 ├─not-found.ico
 ├─page.js
 └─page.module.css
```

The next issue is when you want to dismiss the modal, they say:

> If a modal was initiated through client navigation, e.g. by using `<Link href="/login">`, you can dismiss the modal by calling `router.back()` or by using a `Link` component.

However they don't provide any hints as to what to do if a modal was navigated to directly. In this situation, `router.back()` would be empty or worse, be the URL of a previously visited website. 

I have tried using conditionals to determine whether to call `router.back()` or `router.push('/')` in the event they navigated directly to `/login`. For example:

```javascript
const closeModal = useCallback(() => {
  if (condition) {
    router.back();
  } else {
    router.push('/');
  }
}, [router]);
```

The first problem I encountered is finding an appropriate condition. For example checking `window.history.length` does not work because the history could contain URLs from other previously visited sites. Checking `document.referer` doesn't work because it returns an empty string with Next.js routing. 

The second problem is, even if I can trigger the condition, `router.push('/')` will successfully navigate to `/` but the `/login` modal stays open with no way to close it. Similarly if I create a `Link` component that goes back to `/`, the same thing will happen.

A note from [this github issue #51714](https://github.com/vercel/next.js/issues/51714):

> Also: soft navigating does not unmount the page in the parallel route slot. So modals won't disappear that easy. Its not a bug. But using refresh is bugged and routing stops working.

There's also [this github issue #49662](https://github.com/vercel/next.js/issues/49662) which makes it seem like it is a bug.

Cautiously optimistic that the following seems to working for now:

```javascript
import { headers } from 'next/headers';
import Modal from "@/app/_components/Modal";

export default function Login() {

  // If there is a next-url header, soft navigation has been performed
  // Otherwise, hard navigation has been performed.
  // We need to know this to handle if someone navigates directly to `/login`,
  // Dismissing the modal will be done with router.push instead of router.back.
  const headersList = headers();
  const isSoftNavigation = headersList.has('next-url');

  return (
    <Modal isSoftNavigation={isSoftNavigation}>
      {/* ... */}
    </Modal>
  )
}
```

Then in the modal:

```javascript
const closeModal = useCallback(() => {
  if (isSoftNavigation) {
    router.back();
  } else {
    router.push('/');
  }
}, [isSoftNavigation, router]);
```

If this method ends up not working down the road, you could also fix this by using *Intercepting routes* instead, but I'm not sure why they put this as a parallel routes example. **Note: they have since removed it from the parallel routes example and now show it as parallel + intercepting routes**.


## Intercepting routes 

Intercepting routes allows you to load a route within the current layout while keeping the context for the current page. This routing paradigm can be useful when you want to "intercept" a certain route to show a different route.

For example, when clicking on a photo from within a page, a modal overlaying the page should show up with a larger photo. In this case, Next.js intercepts the `/` route and "masks" this URL to show `/photo/123` instead.

However, when navigating to the photo directly by for example when clicking a shareable URL or by refreshing the page, the entire photo page should render instead of the modal. No route interception should occur.

Intercepting routes can be defined with the `(..)` convention, which is similar to relative path convention `../` but for segments.

You can use:

- `(.)` to match segments on the same level
- `(..)` to match segments one level above
- `(..)(..)` to match segments two levels above
- `(...)` to match segments from the root app directory

Using this pattern to create modals overcomes some common challenges when working with modals, by allowing you to:

- Make the modal content shareable through a URL
- Preserve context when the page is refreshed, instead of closing the modal
- Close the modal on backwards navigation rather than going to the previous route
- Reopen the modal on forwards navigation

For example:

```
app
 ├─@modal
 │  ├─(.)photos
 │  │  └─[id]
 │  │     └─page.js <-- This page will get rendered into the main layout.js 
 │  └─default.js    <-- This will prevent 404 not found when we're on other routes
 ├─photos
 │  └─[id]
 │     └─page.js    <-- This page will get rendered if I navigate directly to 
 ├─error.js             /photos/[id] or refresh the while the modal is open.
 ├─favicon.ico
 ├─global-error.js
 ├─globals.css
 ├─layout.js
 ├─not-found.ico
 ├─page.js          <-- This page has links to our dynamic routes /photos/[id]
 └─page.module.css
```

My root layout will render the `@modal` parallel route:

```javascript
// ...

// Root Layout
export default function RootLayout({ children, modal }) {
  return (
    <html lang="en">
      <body>
        {children}
        {modal} {/* <-- The name of the parallel route @modal */}
      </body>
    </html>
  );
}
```

My main `page.js` will contain links to the dynamic routes `/photos/${id}`:

```javascript
import Link from 'next/link';
import photos from './photos';

export default function Home() {
  return (
    <main>
      {photos.map(({id, imageSrc}) => (
        <Link key={id} href={`/photos/${id}`}>
        {/* ... */}
        </Link>
      ))}
    </main>
  )
}
```

`/photos/[id]/page.js` will be rendered if I navigate directly or refresh while
the modal is open:

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

`/@modal/[id]/page.js` will be shown when using internal links to `/photos/[id]`:

```javascript
import Image from 'next/image';
import photos from '@/app/photos';
import Modal from '@/app/components/Modal';

export default function PhotoModal({ params }) {
  const photo = photos.find((p) => p.id === params.id);
  const width = 450;

  // We don't need a 404 here because a manual navigation will return
  // the non-modal /photo/[id]/page above

  return (
    <Modal>
      <Image
        alt=""
        src={photo.imageSrc}
        height={width * 1.25}
        width={width}
      />
    </Modal>
  );
}
```

`/@modal/default.js` is required so that nothing is shown when we're on other routes:

```javascript
// This default.js is needed so that on all routes other than /photos/[id],
// {modal} in the root layout will return null. If we didn't do this, we would
// get our not-found.js rendered in that spot on every route. In other words,
// {modal} in our root layout will always return null *unless* we specifically
// use a <Link> to go to /photos/[id].
export default function Default() {
  return null;
}
```

When using the `Link` component to navigate away from a page that shouldn't render the `@modal` slot anymore, you can use a catch-all route that returns `null`.


app/@modal/[...catchAll]/page.tsx

```tsx
export default function CatchAll() {
  return null
}
```
