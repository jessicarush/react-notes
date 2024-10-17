# Fetching data in Next.js 

## Table of contents

<!-- toc -->

- [Demos](#demos)
- [Server components](#server-components)
- [Server actions](#server-actions)
- [Client-side](#client-side)
- [Client-side with react query](#client-side-with-react-query)
- [Server components + react query](#server-components--react-query)
- [React use() API](#react-use-api)

<!-- tocstop -->

## Demos 

- examples/next_data_fetching
- examples/next_data_fetching_with_react_query
- examples/next_node_postgres
- examples/next_kysely

## Server components 

Whenever possible, data fetching should be done in server components. It's easy, improves performance, reduces bundle size, and ensures that sensitive data stays secure on the server. Since data fetching is done on the server-side, functions can directly read data from a database without the need for an API. Async components pause their execution until the asynchronous operation is done. Once the awaited promise is resolved, the component will continue rendering with the fetched data. 

**Fetching data from a database**

server component:

```tsx 
import ItemList from '@/app/_ui/ItemList';
import { getItems } from '@/app/_lib/get-data';

export default async function Home() {
  const items = await getItems();

  return (
    <main>
      <ItemList items={items} />
    </main>
  );
}
```

data fetching function:

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
import { getColor } from '@/app/_lib/get-data';

export default async function ServerSide() {
  const color = await getColor();

  // Just for example:
  const headersList = headers();
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

data fetching function:

```js 
import type { Color } from '@/app/_lib/definitions';

async function getColor(): Promise<Color> {
  const url = 'https://log.zebro.id/api_demo_two';
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

## Server actions

Server Actions are exposed server endpoints and can be called anywhere in client code. When using a Server Action outside of a form, call the Server Action in a Transition, which allows you to display a loading indicator, show optimistic state updates, and handle unexpected errors. Forms will automatically wrap Server Actions in transitions. See: <https://react.dev/reference/rsc/use-server#calling-a-server-action-outside-of-form>

**Server action called in a form**

server component:

```tsx
import { headers } from 'next/headers';
import Form from './form';

interface Color {
  name: string;
  value: string;
}

async function getColor(): Promise<Color> {
  const url = 'https://log.zebro.id/api_demo_two';
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

export default async function ServerActionWithForm() {
  console.log('server-side render');
  const color: Color = await getColor();

  const headersList = headers();
  const referer = headersList.get('referer');
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

import { useFormState, useFormStatus } from 'react-dom';
import { revalidateColor } from '@/app/_lib/actions';
import { initialFormState } from '@/app/_lib/definitions';

export default function Form() {
  const [state, dispatch] = useFormState(revalidateColor, initialFormState);
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
import type { FormState } from '@/app/_lib/definitions';


export async function revalidateColor(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    // We are demonstrating using server actions with a form and revalidatePath('/') to update the
    // page after the form is submitted. In theory, you would choose this method when you want to
    // Post data to an API, (which would update its database), then we would revalidatePath('/')
    // which would run the fetch call again inside the server component and update the results.
    // See nextjs_server_actions.md, databases.md, examples/next_kysely,
    // and templates/next_lucia_kysely_postgres for handling and validating form data with Zod.
    console.log('Doing something');
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
export interface FormState {
  status: 'UNSET' | 'SUCCESS' | 'ERROR';
  message: string;
  errors: {};
  timestamp: number;
  resetKey?: number;
  data?: {
    name: string;
    value: string;
  }
}

export const initialFormState: FormState = {
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
import { getColor } from '@/app/_lib/actions';

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
      const res = await getColor('rgb');
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

action.ts:

```ts
'use server';

import type { FormState } from '@/app/_lib/definitions';

export async function getColor(value: string): Promise<FormState> {
  const url = 'https://log.zebro.id/api_demo_two';
  const options: RequestInit = {
    cache: 'no-store'
  };
  const params = new URLSearchParams({ value });

  try {
    const res = await fetch(`${url}?${params}`, options);

    if (!res.ok) { // http errors e.g. 404, 500
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
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

## Client-side

Client-side data fetching is necessary when data needs to be updated dynamically after the initial page load, such as for real-time updates, user interactions that trigger data changes (e.g., search inputs, filters), or when using APIs that require client authentication tokens. It’s also used when some data depends on browser state, like window size or user geolocation, which isn’t available on the server. This demonstrates fetching data on load with `useEffect` as well as `Onclick`. 

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
      const url = 'https://log.zebro.id/api_demo_two';

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

## Client-side with react query 

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

get-data.ts:

```ts
export async function getColor(): Promise<Color> {
  const url = 'https://log.zebro.id/api_demo_two';
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

import { getColor } from '@/app/_lib/get-data';
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

## React use() API 

React's use API is still in experimental mode. It allows you to pass a Promise from a Server Component to a Client Component and resolve it in the Client Component. This way you can avoid blocking the rendering of the Server Component with await.
