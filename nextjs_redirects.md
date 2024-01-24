# Redirecting

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Redirect](#redirect)
- [permanentRedirect](#permanentredirect)
- [useRouter](#userouter)
- [redirects in next.config.js](#redirects-in-nextconfigjs)
- [NextResponse.redirect in middleware](#nextresponseredirect-in-middleware)
- [Managing redirects at scale](#managing-redirects-at-scale)

<!-- tocstop -->

## Introduction 

There are a few ways you can handle [redirects](https://nextjs.org/docs/app/building-your-application/routing/redirecting) in Next.js.

API | Purpose | Where | Status Code
--- | ------- | ----- | -----------
redirect | Redirect user after a mutation or event | Server Components, Server Actions, Route Handlers | 307 (Temporary) or 303 (Server Action)
permanentRedirect | Redirect user after a mutation or event | Server Components, Server Actions, Route Handlers | 308 (Permanent)
useRouter | Perform a client-side navigation | Event Handlers in Client Components | N/A
redirects in next.config.js | Redirect an incoming request based on a path | next.config.js file | 307 (Temporary) or 308 (Permanent)
NextResponse.redirect | Redirect an incoming request based on a condition | Middleware

## Redirect

The `redirect` function allows you to redirect the user to another URL. You can call `redirect` in Server Components, Route Handlers, and Server Actions.

`redirect` is often used after a mutation or event. For example, creating a post:

```ts
'use server'
 
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
 
export async function createPost(id: string) {
  try {
    // Call database
  } catch (error) {
    // Handle errors
  }
 
  revalidatePath('/posts'); // Update cached posts
  redirect(`/post/${id}`); // Navigate to the new post page
}
```

- `redirect` can be called in Client Components during the rendering process but not in event handlers. You can use the `useRouter` hook instead.
- If you'd like to redirect before the render process, use `next.config.js` or `Middleware`.
- See the [redirect API reference](https://nextjs.org/docs/app/api-reference/functions/redirect) for more information.

## permanentRedirect

The `permanentRedirect` function allows you to permanently redirect the user to another URL. You can call `permanentRedirect` in Server Components, Route Handlers, and Server Actions.

`permanentRedirect` is often used after a mutation or event that changes an entity's canonical URL, such as updating a user's profile URL after they change their username:

```ts
'use server'
 
import { permanentRedirect } from 'next/navigation';
import { revalidateTag } from 'next/cache';
 
export async function updateUsername(username: string, formData: FormData) {
  try {
    // Call database
  } catch (error) {
    // Handle errors
  }
 
  revalidateTag('username'); // Update all references to the username
  permanentRedirect(`/profile/${username}`); // Navigate to the new user profile
}
```

- If you'd like to redirect before the render process, use `next.config.js` or `Middleware`.
- See the [permanentRedirect API reference ](https://nextjs.org/docs/app/api-reference/functions/permanentRedirect) for more information.

## useRouter

If you need to redirect inside an event handler in a Client Component, you can use the push method from the useRouter hook. For example:

```tsx
'use client'
 
import { useRouter } from 'next/navigation';
 
export default function Page() {
  const router = useRouter();
 
  return (
    <button type="button" onClick={() => router.push('/dashboard')}>
      Dashboard
    </button>
  )
```

- If you don't need to programatically navigate a user, you should use a `<Link>` component
- See the [redirect API reference](https://nextjs.org/docs/app/api-reference/functions/redirect) for more information.

## redirects in next.config.js

The `redirects` option in the `next.config.js` file allows you to redirect an incoming request path to a different destination path. This is useful when you change the URL structure of pages or have a list of redirects that are known ahead of time.

redirects supports [path](https://nextjs.org/docs/app/api-reference/next-config-js/redirects#path-matching), [header, cookie, and query matching](https://nextjs.org/docs/app/api-reference/next-config-js/redirects#header-cookie-and-query-matching), giving you the flexibility to redirect users based on an incoming request.

To use redirects, add the option to your next.config.js file:

```js
module.exports = {
  async redirects() {
    return [
      // Basic redirect
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
      // Wildcard path matching
      {
        source: '/blog/:slug',
        destination: '/news/:slug',
        permanent: true,
      },
    ]
  },
}
```

- `redirects` runs before Middleware.
- See the [redirects API reference](https://nextjs.org/docs/app/api-reference/next-config-js/redirects) for more information.

## NextResponse.redirect in middleware

Middleware allows you to run code before a request is completed. Then, based on the incoming request, redirect to a different URL using `NextResponse.redirect`. This is useful if you want to redirect users based on a condition (e.g. authentication, session management, etc) or have a large number of redirects.

For example, to redirect the user to a `/login` page if they are not authenticated:

```ts
import { NextResponse, NextRequest } from 'next/server';
import { authenticate } from 'auth-provider';
 
export function middleware(request: NextRequest) {
  const isAuthenticated = authenticate(request);
 
  // If the user is authenticated, continue as normal
  if (isAuthenticated) {
    return NextResponse.next();
  }
 
  // Redirect to login page if not authenticated
  return NextResponse.redirect(new URL('/login', request.url));
}
 
export const config = {
  matcher: '/dashboard/:path*',
}
```

- See the [middleware docs](https://nextjs.org/docs/app/building-your-application/routing/middleware) for more information.

## Managing redirects at scale 

To manage a large number of redirects (1000+), you may consider creating a custom solution using Middleware. This allows you to handle redirects programmatically without having to redeploy your application. See [the docs for more information](https://nextjs.org/docs/app/building-your-application/routing/redirecting#managing-redirects-at-scale-advanced).