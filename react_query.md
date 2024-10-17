# React query 

> Fetching directly in Effects usually means you don’t preload or cache data. For example, if the component unmounts and then mounts again, it would have to fetch the data again. Consider using or building a client-side cache. Popular open source solutions include React Query, useSWR, and React Router 6.4+.

React Query (now known as TanStack Query) is a library for managing and caching server state in React apps, making data fetching, synchronization, and state updates easier. It’s useful in Next.js or React apps for client-side fetching because it simplifies managing loading states, caching, and refetching, which improves performance and reduces manual state management.

React query says is is "hands down one of the best libraries for managing **server state**". The server state they are referring to is the server that they are fetching from. So to clarify: React Query isn’t managing the state on the API server itself. Instead, it’s managing the **client-side representation** of that server state within your app. Essentially, React Query is responsible for:

- Fetching the latest data from the API (which reflects the state on the server).
- Caching that data to avoid unnecessary re-fetching.
- Keeping track of when the data needs to be refetched to stay up-to-date (e.g., on certain user actions or time intervals).
- Managing loading, error, and success states to make working with server data easier on the client side.

So, React Query manages how your app interacts with and synchronizes server state data.

## Table of contents

<!-- toc -->

- [Installation](#installation)
- [Example](#example)
- [Queries](#queries)
- [Additional features](#additional-features)
- [Examples](#examples)

<!-- tocstop -->

## Installation 

```bash
npm i @tanstack/react-query
npm i -D @tanstack/eslint-plugin-query
```

## Example

In this example, we are using the useQuery hook from React Query to fetch a color with **client-side data fetching**. The useQuery hook takes an object with a `queryKey` and a `queryFn`. The `queryKey` is an array that identifies the query (i.e. used for cache management) and the `queryFn` is the function that fetches the data.

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

This is the method the docs recommend for [server components & Next.js app router](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#server-components-and-nextjs-app-router).

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
interface Color {
  name: string;
  value: string;
}

// Same function used in examples/next_data_fetching server-side demo
export async function getColor(): Promise<Color> {
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

The above function is the same one used for fetching in a server component. It works fine as is, however the `cache: 'no-store'` option is not necessary when using React Query. React Query handles its own caching strategy, which is controlled by options like `staleTime` and `gcTime` that you set in the `QueryClient` or individual queries.

So we could shorten this function to:

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

Note: The reason for sometimes using a wrapper function like `handleRefetch`:

- **Flexibility for future changes**: If you later need to add more logic before or after the refetch (like logging, state updates, or additional API calls), it's easier to modify a wrapper function.
- **Passing parameters**: If you need to pass specific parameters to refetch, a wrapper function allows you to do so easily.
- **Error handling**: You might want to add try/catch blocks or other error handling logic.

Reminder: With client-side data fetching, we cannot access backend code directly. For example, communicating with a remote API over HTTP (e.g. using REST and the native fetch API) works great, but if we want to do database queries, we would use an API route: (e.g. `api/route.ts` in Next.js).

## Queries

```ts
const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
```

The result object contains a few very important states. A query can only be in one of the following states at any given moment:

- `isPending` or `status === 'pending'` - The query has no data yet
- `isError` or `status === 'error'` - The query encountered an error
- `isSuccess` or `status === 'success'` - The query was successful and data is available

Beyond those primary states, more information is available depending on the state of the query:

- `error` - If the query is in an `isError` state, the error is available via the `error` property.
- `data` - If the query is in an `isSuccess` state, the data is available via the `data` property.
- `isFetching` - In any state, if the query is fetching at any time (including background refetching) `isFetching` will be true.

For most queries, it's usually sufficient to check for the `isPending` state, then the `isError` state, then finally, assume that the data is available and render the successful state:

```tsx
function Todos() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  })

  if (isPending) {
    return <span>Loading...</span>
  }

  if (isError) {
    return <span>Error: {error.message}</span>
  }

  // We can assume by this point that `isSuccess === true`
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

Using `status` instead of `isPending` and `isError`:

```tsx
function Todos() {
  const { status, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  })

  if (status === 'pending') {
    return <span>Loading...</span>
  }

  if (status === 'error') {
    return <span>Error: {error.message}</span>
  }

  // also status === 'success', but "else" logic works, too
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

There are many more returned items you can use. See the [useQuery API](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery) for details.

## Additional features 

There are many other things react query is good add. These will require additional setup:

- [Suspense](https://tanstack.com/query/latest/docs/framework/react/guides/suspense): Dedicated hooks to be used with React's Suspense for Data Fetching API's
- [Mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations): For handling POST, PUT, DELETE operations with `useMutation` hook.
- [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation): Automatically refetch and update related queries after a mutation using `queryClient.invalidateQueries()`.
- [Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries): Handle pagination and "load more" scenarios with `useInfiniteQuery`. Your API must also be set up to support pagination.
- [Paginated / Lagged Queries](https://tanstack.com/query/latest/docs/framework/react/guides/paginated-queries): Render paginated data using by including the page information in the queryKey. 
- [Parallel Queries](https://tanstack.com/query/latest/docs/framework/react/guides/parallel-queries): Queries that are executed in parallel, or at the same time so as to maximize fetching concurrency.
- [Dependent Queries](https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries): Dependent (or serial) queries depend on previous ones to finish before they can execute. 
- [Disabling/Pausing Queries](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries): Disabling or pausing queries can be useful in some cases.
- [Initial Query Data](https://tanstack.com/query/latest/docs/framework/react/guides/initial-query-data): Used to prepopulate a query.
- [Placeholder data](https://tanstack.com/query/latest/docs/framework/react/guides/placeholder-query-data): Allows a query to behave as if it already has data, similar to the initialData option, but the data is not persisted to the cache.
- [Prefetching](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching): Load data ahead of time for improved user experience using `queryClient.prefetchQuery()`.
- [Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates): Update UI immediately before server confirmation for a snappier feel. Requires custom setup in your mutation logic.
- [Query Filters](https://tanstack.com/query/latest/docs/framework/react/guides/filters): Bulk updates to queries matching certain criteria.
- [Query Observers](https://tanstack.com/query/latest/docs/reference/QueryObserver): Subscribe to query results without necessarily rendering anything.
- [Devtools](https://tanstack.com/query/latest/docs/framework/react/devtools): Built-in devtools for debugging and inspecting query states.

## Examples 

- [Nextjs App with Prefetching](https://github.com/TanStack/query/tree/main/examples/react/nextjs-suspense-streaming)
- [Nextjs App with Suspense Streaming](https://github.com/tanstack/query/tree/main/examples/react/nextjs-suspense-streaming)


