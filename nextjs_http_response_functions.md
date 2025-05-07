# Next.js functions that return a specific response status code

## Table of Contents

<!-- toc -->

- [notFound](#notfound)
- [forbidden](#forbidden)
- [unauthorized](#unauthorized)
- [redirect](#redirect)
- [permanentRedirect](#permanentredirect)

<!-- tocstop -->

## notFound 

The [`norFound`](https://nextjs.org/docs/app/api-reference/functions/not-found) function throws a `404` error and renders the `not-found` file within a route segment as well as inject a `<meta name="robots" content="noindex" />` tag.

## forbidden

The [`forbidden`](https://nextjs.org/docs/app/api-reference/functions/forbidden) function throws an error that renders a Next.js `403` error page. It's useful for handling authorization errors in your application. You can customize the UI using the `forbidden.js` file.

## unauthorized

The [`unauthorized`](https://nextjs.org/docs/app/api-reference/functions/unauthorized) function throws an error that renders a Next.js 401 error page. It's useful for handling authorization errors in your application. You can customize the UI using the unauthorized.js file.

## redirect

The [`redirect`](https://nextjs.org/docs/app/api-reference/functions/redirect) function allows you to redirect the user to another URL. `redirect` can be used in Server Components, Route Handlers, and Server Actions.

When used in a streaming context, this will insert a meta tag to emit the redirect on the client side. When used in a server action, it will serve a `303` HTTP redirect response to the caller. Otherwise, it will serve a `307` HTTP redirect response to the caller.

## permanentRedirect

The [`permanentRedirect`](https://nextjs.org/docs/app/api-reference/functions/permanentRedirect) function allows you to redirect the user to another URL. `permanentRedirect` can be used in Server Components, Client Components, Route Handlers, and Server Actions.

When used in a streaming context, this will insert a meta tag to emit the redirect on the client side. When used in a server action, it will serve a `303` HTTP redirect response to the caller. Otherwise, it will serve a `308` (Permanent) HTTP redirect response to the caller.