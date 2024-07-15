# Route handlers 

## Table of Contents

<!-- toc -->

- [Route handlers (API routes)](#route-handlers-api-routes)
  * [request body](#request-body)
  * [url params](#url-params)
  * [headers](#headers)
  * [cookies](#cookies)
  * [redirects](#redirects)

<!-- tocstop -->

## Route handlers (API routes)

Route Handlers allow you to create custom request handlers for a given route using the Web [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) and [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) APIs.

In the app directory, create an `api` directory. Then, for every api route create a directory with the route name containing a file called `route.js`. Inside this file you will do a named export (not default) of an async function of a [http method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) like `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

```javascript
// app/api/rogers/route.js

export async function GET(request) {
  // Get search params from the request object
  const { searchParams } = new URL(request.url);
  const myparam = searchParams.get('myparam');
  // Get response data
  const quote = randomSelect(mrRogersQuotes);
  // Response in a native Web API
  return new Response(JSON.stringify({data: quote}))
}
```

For POST requests get access to the body like so:

```javascript
export async function POST(request) {
  const body = await req.json();
  console.log(body);
}
```

Next's example fetching from a database:

```javascript
import { NextResponse } from 'next/server';
 
export async function GET() {
  const res = await fetch('https://data.mongodb-api.com/...', {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  });
  const data = await res.json();
 
  return NextResponse.json({ data });
}
```

Route Handlers are cached by default when using the `GET` method with the Response object. You can opt out of caching by:

- Using the `Request` object with the `GET` method.
- Using any of the other HTTP methods.
- Using Dynamic Functions like cookies and headers.
- The Segment Config Options manually specifies dynamic mode.

The [NextResponse](https://nextjs.org/docs/app/api-reference/functions/next-response) extends the standard Web Response with some additional convenience methods.

> **UPDATE:** Next.js 15 changes the fetch requests, `GET` Route Handlers, and Client Router Cache from cached by default to uncached by default. 

### request body 

You can read the `Request` body using the standard Web API methods:

```javascript
import { NextResponse } from 'next/server';
 
export async function POST(request) {
  const res = await request.json();
  return NextResponse.json({ res });
}
```

### url params

You can get search params like this:

```javascript
import { NextResponse } from 'next/server';
 
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const res = await fetch(`https://data.mongodb-api.com/product/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'API-Key': process.env.DATA_API_KEY,
    },
  });
  const product = await res.json();
 
  return NextResponse.json({ product });
}
```

### headers 

You can read headers with headers from `next/headers`. This `headers` instance is read-only. To set `headers`, you need to return a new `Response` with new `headers`.

```javascript
import { headers } from 'next/headers';
 
export async function GET(request) {
  const headersList = headers();
  const referer = headersList.get('referer');
 
  return new Response(JSON.stringify('Hello, Next.js!'), {
    status: 200,
    headers: { 
      'referer': referer,
      'Content-Type': 'application/json'
      },
  });
}
```

CORS example:

```javascript
export async function GET(request) {
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

### cookies

You can read cookies with `cookies` from `next/headers`. This `cookies` instance is read-only. To set cookies, you need to return a new `Response` using the `Set-Cookie` header.

```javascript
import { cookies } from 'next/headers';
 
export async function GET(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
 
  return new Response('Hello, Next.js!', {
    status: 200,
    headers: { 'Set-Cookie': `token=${token}` },
  });
}
```

### redirects 

```javascript
import { redirect } from 'next/navigation';
 
export async function GET(request) {
  redirect('https://nextjs.org/');
}
```