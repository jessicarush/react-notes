# Next.js advanced routing patterns 

The Nextjs App Router provides a set conventions to help you implement more advanced routing patterns. These include:

- **Parallel Routes**: Allow you to simultaneously show two or more pages in the same view that can be navigated independently. You can use them for split views that have their own sub-navigation. E.g. Dashboards.
- **Intercepting Routes**: Allow you to intercept a route and show it in the context of another route. You can use these when keeping the context for the current page is important. E.g. Seeing all tasks while editing one task or expanding a photo in a feed.


## Table of contents

<!-- toc -->

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
  ├─favicon.ico
  ├─globals.css
  ├─layout.js
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

Parallel Routing also allow you to conditionally render a slot based on certain conditions, such as authentication state. This enables fully separated code on the same URL.

```javascript
import { getUser } from '@/lib/auth';

export default function Layout({ dashboard, login }) {
  const isLoggedIn = getUser();
  return isLoggedIn ? dashboard : login;
}
```


### Unmatched routes

[In the docs](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes#unmatched-routes) they talk about creating a `default.js` file to handle situations where the other slot has another directory. I couldn't always get this to work though. The docs are way too thin here.


### Using parallel routes for modals

The [example in the docs](https://nextjs.org/docs/app/building-your-application/routing/parallel-routes#examples) is particularly lacking. There's simply not enough information there to be able to understand the usage and the benefit of using a parallel route. 

For example, when navigating to `/login`, I get a 404 where `{ children }` is rendered. So I create a `default.js` for the root. Now I cannot see why I wouldn't just use a regular route.


## Intercepting routes 

Intercepting routes allows you to load a route within the current layout while keeping the context for the current page. This routing paradigm can be useful when you want to "intercept" a certain route to show a different route.

For example, when clicking on a photo from within a feed, a modal overlaying the feed should show up with the photo. In this case, Next.js intercepts the `/feed` route and "masks" this URL to show `/photo/123` instead.

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