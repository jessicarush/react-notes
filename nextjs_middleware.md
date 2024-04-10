# Middleware 

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
  * [matcher](#matcher)
  * [conditional statements](#conditional-statements)
  * [response](#response)

<!-- tocstop -->

## Introduction

Middleware allows you to run code before a request is completed. Then, based on the incoming request, you can modify the response by rewriting, redirecting, modifying the request or response headers, or responding directly.

Middleware runs before cached content and routes are matched.

Some common scenarios where Middleware is particularly effective include:

- **Authentication and Authorization**: Ensure user identity and check session cookies before granting access to specific pages or API routes.
- **Server-Side Redirects**: Redirect users at the server level based on certain conditions (e.g., locale, user role).
- **Path Rewriting**: Support A/B testing, feature rollouts, or legacy paths by dynamically rewriting paths to API routes or pages based on request properties.
- **Bot Detection**: Protect your resources by detecting and blocking bot traffic.
- **Logging and Analytics**: Capture and analyze request data for insights before processing by the page or API.
- **Feature Flagging**: Enable or disable features dynamically for seamless feature rollouts or testing.

Recognizing situations where middleware may **not** be the optimal approach is just as crucial. Here are some scenarios to be mindful of:

- **Complex Data Fetching and Manipulation**: Middleware is not designed for direct data fetching or manipulation, this should be done within Route Handlers or server-side utilities instead.
- **Direct Database Operations**: Performing direct database operations within Middleware is not recommended. Database interactions should done within Route Handlers or server-side utilities.
- **Heavy Computational Tasks**: Middleware should be lightweight and respond quickly or it can cause delays in page load. Heavy computational tasks or long-running processes should be done within dedicated Route Handlers.
- **Extensive Session Management**: While Middleware can manage basic session tasks, extensive session management should be managed by dedicated authentication services or within Route Handlers.

The **most important thing to understand about middleware** is this:

From the [Middleware docs](https://nextjs.org/docs/app/building-your-application/routing/middleware#runtime):

> Middleware currently only supports the Edge runtime. The Node.js runtime can not be used.

From the [Deploying docs](https://nextjs.org/docs/app/building-your-application/deploying):

> Middleware works self-hosted with zero configuration when deploying using next start. Since it requires access to the incoming request, it is not supported when using a static export.
>
> Middleware uses a runtime that is a subset of all available Node.js APIs to help ensure low latency, since it may run in front of every route or asset in your application. This runtime does not require running “at the edge” and works in a single-region server. Additional configuration and infrastructure are required to run Middleware in multiple regions.

So basically what this means is, currently, the design of Next.js middleware prioritizes integration with the Edge Runtime. It was 

So basically how I interpret this is that the design of Next.js middleware prioritizes integration with the Edge Runtime. There's an intentional restriction on what you can do inside middleware to maintain its speed and performance. However, you *can* still use middleware with a traditional Node.js server, but if you attempt to use a Node.js API that isn't in runtime subset they mentioned, then you'll will get a build warning and it may not work. 

A solution would be to run that code in a server action or server component instead.

## middleware.js

Use the file `middleware.js` in the root of your project to define Middleware. In other words, it should be at the same level as your `app` directory.

```javascript
import { NextResponse } from 'next/server';
 
// This function can be marked `async` if using `await` inside
export function middleware(request) {
  return NextResponse.redirect(new URL('/home', request.url));
}
 
// Matcher to determine which paths the middleware will run on
export const config = {
  matcher: '/about',
};
```

By default middleware will be invoked for every route in your project. There are two ways to define which paths Middleware will run on:

- Custom matcher config
- Conditional statements 

### matcher 

You can match a single path or multiple paths with an array syntax:

```javascript
export const config = {
  matcher: '/about/:path*',
};
```

```javascript
export const config = {
  matcher: ['/about/:path*', '/dashboard/:path*'],
};
```

The matcher config allows full regex so matching like *negative lookaheads* or character matching is supported. An example of a negative lookahead to match all except specific paths can be seen here:

```javascript
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

Configures matchers:

- must start with `/`
- can include named parameters: `/about/:path` matches `/about/a` and `/about/b` but not `/about/a/c`
- can have modifiers on named parameters (starting with `:`): `/about/:path*` matches `/about/a/b/c` because `*` is zero or more. `?` is zero or one and `+` one or more
- can use regular expression enclosed in parenthesis: `/about/(.*)` is the same as `/about/:path*`
- values need to be constants so they can be statically analyzed at build-time. Dynamic values such as variables will be ignored.


### conditional statements

```javascript
import { NextResponse } from 'next/server';

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.rewrite(new URL('/about-2', request.url));
  }
 
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.rewrite(new URL('/dashboard/user', request.url));
  }
}
```

> URL rewriting is the process of internally changing the URL behind the scenes. This doesn't send an HTTP redirect to the client. It is used to serve a different page than the one at the requested URL, without the client knowing about it. For instance, in the above, all requests to /about get served /about-2 but the client would still see the URL as /about.

### response 

To produce a response from middleware, you can:

- rewrite to a route (page or API route) that produces a response
- return a `Response` or `NextResponse` directly.


The `NextResponse` API allows you to:

- redirect the incoming request to a different URL
- rewrite the response by displaying a given URL
- [set request headers](https://nextjs.org/docs/app/building-your-application/routing/middleware#setting-headers) for API Routes, getServerSideProps, and rewrite destinations
- [set response cookies](https://nextjs.org/docs/app/building-your-application/routing/middleware#using-cookies)
- [set response headers](https://nextjs.org/docs/app/building-your-application/routing/middleware#setting-headers)


An example of returning a response directly:

```javascript
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@lib/auth';
 
// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: '/api/:function*',
};
 
export function middleware(request) {
  // Call our authentication function to check the request
  if (!isAuthenticated(request)) {
    // Respond with JSON indicating an error message
    return new NextResponse(
      JSON.stringify({ success: false, message: 'authentication failed' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    );
  }
}
```