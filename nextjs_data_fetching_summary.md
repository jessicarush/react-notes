# Fetching data in Next.js 

## Table of contents

<!-- toc -->

- [Demos](#demos)
- [data.ts vs actions.ts](#datats-vs-actionsts)
- [Server-side fetch in server components](#server-side-fetch-in-server-components)
- [Server-side fetch in server actions](#server-side-fetch-in-server-actions)
- [Client-side fetch](#client-side-fetch)
- [Client-side fetch with react query](#client-side-fetch-with-react-query)
- [Server components + react query](#server-components--react-query)
- [React use() API](#react-use-api)
- [GET/POST fetch() examples](#getpost-fetch-examples)

<!-- tocstop -->

## Demos 

**Fetching from API**
- examples/next_data_fetching
- examples/next_data_fetching_with_react_query

**Fetching from Database**
- examples/next_node_postgres
- examples/next_kysely


## data.ts vs actions.ts

Some foundational points to keep in mind:

- Whenever possible, data fetching should be done server-side.
- `data.ts` should be used for functions that `GET` or do database queries that just `select`. These can then be called in server components.
- `actions.ts` should be used for functions that `POST` or do database queries that mutate (`POST`, `PUT`, `DELETE`) as these can be called as server actions in client components.
- `data.ts` does not need the `use server` directive because these functions are only called from server components, which already run on the server.
- `actions.ts` must use the `use server` directive as they are called from client components, either via a form’s action prop or from a client-side event handler.
- Since server actions can be called in client components, they can be used as a wrapper to call any server-only function (including those in `data.ts`) from a client component. This is helpful for when you want to call a `GET` function in `data.ts` in a client component even handler. 


## Server-side fetch in server components 

Fetching in server components easy, improves performance, reduces bundle size, and ensures that sensitive data stays secure on the server. Since data fetching is done on the server-side, functions can directly read data from a database without the need for an API. Async components pause their execution until the asynchronous operation is done. Once the awaited promise is resolved, the component will continue rendering with the fetched data. 

**Fetching data from a database**

server component:

```tsx 
import ItemList from '@/app/_ui/ItemList';
import { getItems } from '@/app/_lib/data';

export default async function Home() {
  const items = await getItems();

  return (
    <main>
      <ItemList items={items} />
    </main>
  );
}
```

data.ts:

```ts 
import { unstable_noStore as noStore } from 'next/cache';
// This would be needed if we had a getItem function
// import { notFound } from 'next/navigation';
import { db } from '@/app/_lib/database';
import type { Item } from '@/app/_lib/definitions';

export async function getItems(): Promise<Item[]> {
  // Add noStore() to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  // unstable_noStore is preferred over export const dynamic = 'force-dynamic'
  // as it is more granular and can be used on a per-component basis.
  noStore();

  try {
    const result = await db.selectFrom('item').selectAll().execute();
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch items.');
  }
}
```

**Fetching data from an API**

server component:

```jsx 
import { headers } from 'next/headers';
import { getColor } from '@/app/_lib/data';

export default async function ServerSide() {
  const color = await getColor();

  // Just for example:
  const headersList = await headers();
  const referer = headersList.get('referer');
  console.log('server-side render');
  console.log(Array.from(headersList.keys()));
  console.log(referer);

  return (
    <main>
      <p style={{ color: color.value }}>
        {color.name} {color.value}
      </p>
    </main>
  );
}
```

data.ts:

```ts 
interface Color {
  name: string;
  value: string;
};

async function getColor(): Promise<Color> {
  const url = 'https://log.zebro.id/api/demo_two';
  // RequestInit defines the shape of the options you can pass to the fetch function
  const options: RequestInit = {
    cache: 'no-store'
    // next: { revalidate: 20 }
  };
  const res = await fetch(url, options);

  // Handle errors using the standard Response.ok (a boolean indicating whether
  // the response was successful (status in the range 200 – 299) or not.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  const data = await res.json();
  const color: Color = {
    name: data.name,
    value: data.value
  };
  return color;
}
```

From here you can add a loading state to the component by using the `Suspense` component from React.

## Server-side fetch in server actions

Server Actions are exposed server endpoints and can be called anywhere in client code. When using a Server Action outside of a form, call the Server Action in a Transition, which allows you to display a loading indicator, show optimistic state updates, and handle unexpected errors. Forms will automatically wrap Server Actions in transitions. See: <https://react.dev/reference/rsc/use-server#calling-a-server-action-outside-of-form>

**Server action called in a form**

server component:

```tsx
import { headers } from 'next/headers';
import { getColor } from '@/app/_lib/data'; // same as in previous example
import Form from './form';

export default async function ServerActionWithForm() {
  const color: Color = await getColor();

  // Just for example:
  const headersList = await headers();
  const referer = headersList.get('referer');
  console.log('server-side render');
  console.log(Array.from(headersList.keys()));
  console.log(referer);

  return (
    <main>
      <Form />
      <p style={{ color: color.value }}>
        {color.name} {color.value}
      </p>
    </main>
  );
}
```

form.tsx:

```tsx
'use client';

import { useActionState, useFormStatus } from 'react-dom';
import { revalidateColor } from '@/app/_lib/actions';
import { initialActionState } from '@/app/_lib/definitions';

export default function Form() {
  const [state, dispatch] = useActionState(revalidateColor, initialActionState);
  const { pending } = useFormStatus();

  return (
    <form action={dispatch}>
      <button type='submit' disabled={pending}>
        Revalidate path
      </button>
    </form>
  );
}
```

action.ts:

```ts
'use server';

// Use this if you want to revalidate the cache
import { revalidatePath } from 'next/cache';
// Use this if you want to redirect after revalidatePath
// import { redirect } from 'next/navigation';
import type { ActionState } from '@/app/_lib/definitions';


export async function revalidateColor(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    // We are demonstrating using server actions with a form and revalidatePath('/') to update the
    // page after the form is submitted. In theory, you would choose this method when you want to
    // POST data to an API, (which would update its database), then we would revalidatePath('/')
    // which would run the fetch call again inside the server component and update the results.
    // See nextjs_server_actions.md, databases.md, examples/next_kysely, examples/next_data_fetching
    // and templates/next_lucia_kysely_postgres for handling and validating form data with Zod.
    console.log('Do something e.g. POST request to an API, or mutate a database');
    revalidatePath('/');
    return {
      status: 'SUCCESS' as const,
      message: 'Successfully revalidated path.',
      errors: {},
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      status: 'ERROR' as const,
      message:
        error instanceof Error ? error.message : 'Failed to fetch data: an unknown error occurred.',
      errors: {},
      timestamp: Date.now()
    };
  }
}
```

type definition:

```ts
export interface ActionState {
  status: 'UNSET' | 'SUCCESS' | 'ERROR';
  message: string;
  errors: {};
  timestamp: number;
  data?: {
    name: string;
    value: string;
  }
}

export const initialActionState: ActionState = {
  status: 'UNSET' as const,
  message: '',
  errors: {},
  timestamp: Date.now()
};
```

**Server action called outside of a form**

client component:

```tsx
'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { getColor2Action } from '@/app/_lib/actions';

interface Color {
  name: string | null;
  value: string | null;
}

export default function ServerActions() {
  const [color, setColor] = useState<Color>({ name: null, value: null });
  const [isPending, startTransition] = useTransition();
  const didFetch = useRef(false);

  useEffect(() => {
    // Prevents double API call in dev mode
    if (!didFetch.current) {
      handleGetColor();
      didFetch.current = true;
    }
  }, []);

  const handleGetColor = async () => {
    startTransition(async () => {
      const res = await getColor2Action('rgb');
      if (res.status === 'SUCCESS' && res.data) {
        console.log('Success getting color');
        setColor({ name: res.data.name, value: res.data.value });
      } else {
        console.error('Error fetching color');
      }
    });
  };

  return (
    <main>
      <button onClick={handleGetColor} disabled={isPending}>Get color</button>
      {isPending && <span> getting color...</span>}
      {color.value && (
        <p style={{ color: color.value }}>
          {color.name} {color.value}
        </p>
      )}
    </main>
  );
}
```

*Note: This is primarily demonstrating how server actions can be called outside of a form, but it's also showing how you can use a server action as a wrapper for a fetching function in `data.ts`. Remember, server actions can be called by client-components, regular server files like `data.ts` cannot. Lastly to show something different we'll have this getColor function send query params and also a slightly different error message:*

data.ts:

```ts
interface Color {
  name: string;
  value: string;
};

export async function getColor2(value: string): Promise<Color> {
  const url = 'https://log.zebro.id/api/demo_two';
  // RequestInit defines the shape of the options you can pass to the fetch function
  const options: RequestInit = {
    cache: 'no-store'
  };
  const params = new URLSearchParams({ value });
  const res = await fetch(`${url}?${params}`, options);

  // Handle errors using the standard Response.ok (a boolean indicating whether
  // the response was successful (status in the range 200 – 299) or not.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    // throw new Error('Failed to fetch data')
    throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const color: Color = {
    name: data.name,
    value: data.value
  };
  return color;
}
```

action.ts:

```ts
'use server';

import type { ActionState } from '@/app/_lib/definitions';
import { getColor2 } from '@/app/_lib/data';

export async function getColor2Action(value: string): Promise<ActionState> {
  try {
    const data = await getColor2(value);
    return {
      status: 'SUCCESS' as const,
      message: 'Successfully fetched data.',
      errors: {},
      timestamp: Date.now(),
      data: { name: data.name, value: data.value }
    };
  } catch (error) { // network errors or error converting response to json
    return {
      status: 'ERROR' as const,
      message:
        error instanceof Error ? error.message : 'Failed to fetch data: an unknown error occurred.',
      errors: {},
      timestamp: Date.now()
    };
  }
}
```

## Client-side fetch

Client-side data fetching may be necessary when data needs to be updated dynamically after the initial page load, such as for real-time updates, user interactions that trigger data changes (e.g., search inputs, filters), or when using APIs that require client authentication tokens. It’s also used when some data depends on browser state, like window size or user geolocation, which isn’t available on the server. This demonstrates fetching data on load with `useEffect` as well as `onClick`. 

```jsx 
'use client';

import { useEffect, useState, useRef } from 'react';
import ThrottledButton from '../_components/ThrottledButton';

export default function ClientSide() {
  const [color, setColor] = useState({ name: null, value: null });
  const [isLoading, setIsLoading] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    getColor();
    return () => {
      console.log('aborting...');
      // Optional chaining syntax (new to ES2020), in the event that
      // the AbortController is null, prevents TypeError.
      abortController.current?.abort();
    };
  }, []);

  async function getColor(): Promise<void> {
    setIsLoading(true);
    abortController.current = new AbortController();
    // RequestInit defines the shape of the options you can pass to the fetch function
    const config: RequestInit = { signal: abortController.current.signal };
    // Optionally, you can also pass a timeout so it automatically
    // aborts after a given milliseconds:
    // const config: RequestInit = { signal: AbortSignal.timeout(3000) }

    try {
      console.log('fetching...');
      const url = 'https://log.zebro.id/api/demo_two';

      // Sending request args with a fetch request:
      const params = new URLSearchParams({ value: 'rgb' });
      const res = await fetch(`${url}?${params}`, { ...config });

      if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error(`Failed to fetch data. status: ${res.status}`);
      }

      const data = await res.json();
      setColor({ name: data.name, value: data.value });
    } catch (err) {
      console.log(`Something went wrong: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <ThrottledButton onClick={getColor}>Get color</ThrottledButton>
      {isLoading && <span> getting color...</span>}
      {color.value && (
        <p style={{ color: color.value }}>
          {color.name} {color.value}
        </p>
      )}
    </main>
  );
}
```

## Client-side fetch with react query 

When it comes to client-side rendered React applications (i.e. SPAs), the most recommended way to fetch data is by using a library like React Query. This library comes with a bunch of additional features like automatic retry on failure, optimized performance with request deduplication, support for pagination and infinite scrolling and more.

This is the method the docs recommend for [server components & Next.js app router](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#server-components-and-nextjs-app-router).

app/_lib/query-provider.ts:

```ts
'use client';

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        // This value is in milliseconds therefor 60 * 1000 = 1 minute
        staleTime: 60 * 1000
      }
    }
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  // Avoid useState when initializing the query client if you don't
  // have a suspense boundary between this and the code that may
  // suspend because React will throw away the client on the initial
  // render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

layout.tsx:

```tsx
// Note: The root layout cannot be a client component
import { fontSans, fontMono, fontAlt } from '@/app/fonts';
import QueryProvider from '@/app/_lib/query-provider';
import '@/app/globals.css';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} ${fontAlt.variable}`}>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

data.ts:

```ts
export async function getColor(): Promise<Color> {
  const url = 'https://log.zebro.id/api/demo_two';
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await res.json();
  return {
    name: data.name,
    value: data.value
  };
}
```

demo.tsx:

```tsx
'use client';

import { getColor } from '@/app/_lib/data';
import { useQuery } from '@tanstack/react-query';

type Props = {
  children?: React.ReactElement;
};

export default function ReactQueryDemo({}: Props) {
  const {
    isPending,
    isError,
    isRefetching,
    data: color,
    error,
    refetch
  } = useQuery({
    queryKey: ['colorData'],
    queryFn: getColor
    // staleTime: 60 * 1000, // data becomes stale after 1 minute
    // gcTime: 5 * 60 * 1000 // unused data is garbage collected after 5 minutes
  });

  const handleRefetch = () => {
    refetch();
  };

  return (
    <div>
      <p>client-side data fetching with react query</p>

      {isPending && <span> getting color...</span>}

      {isError && <p>An error has occurred: {error.message}</p>}

      {color?.value && (
        <p>
          color:{' '}
          <span style={{ color: color.value }}>
            {color.name} {color.value}
          </span>
        </p>
      )}
      <p>
        <button onClick={handleRefetch} disabled={isPending || isRefetching}>
          Get color
        </button>
      </p>
    </div>
  );
}
```

## Server components + react query

If you have RSC enabled and want to support more advanced data fetching patterns such as infinite scrolling, you can combine React Server Components with React Query. This way you can fetch initial data on the server-side and then use React Query for continued data fetching on the client-side.

To start, you might fetch data in a server component, then pass that data to a client component:

```tsx
// ...

export default async function PostPage() {
  const posts = await getPosts();

  return (
    <div>
      <PostList initialPosts={posts} />
    </div>
  );
}
```

Then in the client component, use the initialData option to prepopulate the query:

```tsx
"use client";
// ...

type PostListProps = {
  initialPosts: Post[];
};

const PostList = ({ initialPosts }: PostListProps) => {
  const { data: posts } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
    initialData: initialPosts,
  });

  return (
    <ul>
      {posts?.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
};
```

To implement infinite scrolling see [Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries).

## React use() API 

React's use API is still in experimental mode. It allows you to pass a Promise from a Server Component to a Client Component and resolve it in the Client Component. This way you can avoid blocking the rendering of the Server Component with await.

app/page.tsx:

```tsx
import { getColor } from '@/app/_lib/data';
import { Suspense } from 'react';
import RandomColor from './random-color';

export default async function ServerSide() {
  // const colorPromise: Color = await getColor();
  const colorPromise = getColor();

  return (
    <main>
      <p>React use() API.</p>
      <Suspense>
        <RandomColor promisedColor={colorPromise} />
      </Suspense>
    </main>
  );
}
```

app/random-color.tsx:

```tsx
'use client';

import { use } from "react";
import type { Color } from "@/app/_lib/definitions";

type Props = {
  children?: React.ReactElement;
  // promisedColor: Color;
  promisedColor: Promise<Color>;
};

export default function RandomColor({promisedColor}: Props) {
  const color = use(promisedColor);

  return (
    <div>
      <p>
        color:{' '}
        <span style={{ color: color.value }}>
          {color.name} {color.value}
        </span>
      </p>
    </div>
  );
}
```

## GET/POST fetch() examples

**GET**

**GET with query params**

**POST**

- Use query params when:
  - you're retrieving data (read-only)
  - the parameters are simple and idempotent
  - you want the request to be bookmarkable, or shareable.
- Use `POST` when:
  - you’re submitting data (e.g. creating or updating resources)
  - parameters include sensitive, complex, or large payloads
  - you don’t want the data visible in the URL or cached
