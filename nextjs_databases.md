# Working with Databases 

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [dotenv](#dotenv)
- [Seeding (with @vercel/postgres)](#seeding-with-vercelpostgres)
- [Querying (fetching) data](#querying-fetching-data)
- [Request waterfalls](#request-waterfalls)
- [Parallel data fetching](#parallel-data-fetching)
- [Streaming a whole page with loading.tsx/jsx](#streaming-a-whole-page-with-loadingtsxjsx)
- [Streaming a specific component](#streaming-a-specific-component)
- [Search](#search)
- [Pagination](#pagination)

<!-- tocstop -->

## Introduction 

For relational databases like Postgres, you can interact with them using `SQL`, or an ORM
like [Prisma](https://www.prisma.io/) or [Drizzle](https://orm.drizzle.team/). 

Vercel has a [@vercel/postgres SDK](https://vercel.com/docs/storage/vercel-postgres/sdk) that makes writing `SQL` queries a little easier. I'm not sure if it will work with non-vercel databases. An example of the `@vercel/postgres` SDK is in the seeding section below.

It looks like [node-postgres](https://github.com/brianc/node-postgres?tab=readme-ov-file) is the main non-vendor-locked `SQL` query tool for postgres, but the documentation is a little confusing. There's a few posts on how to set it up:

- [How to use PostgreSQL database in Next.js apps](https://www.simplenextjs.com/posts/next-postgresql)
- [How to set up Next.js with Node Postgres](https://ethanmick.com/how-to-set-up-next-js-with-node-postgres/)
- [Writing Database Functions using Next.js, TypeScript, and PostgreSQL](https://www.linkedin.com/pulse/writing-database-functions-using-nextjs-typescript-postgresql-milne)

There's also a [node-sqlite3](https://github.com/TryGhost/node-sqlite3#README) driver. In addition, you can apparently do [raw SQL queries with Prisma](https://www.prisma.io/docs/orm/prisma-client/queries/raw-database-access/raw-queries) and [raw SQL queries with Drizzle](https://orm.drizzle.team/docs/sql#sqlraw).

When doing database queries, you will want to do this through an API (route handler) to avoid exposing your database secrets to the client.

If you are using React Server Components (fetching data on the server), you can skip the API layer, and query your database directly without risking exposing your database secrets to the client.

## dotenv

```bash
npm install dotenv --save-dev
```

```bash
POSTGRES_URL=""
POSTGRES_PRISMA_URL=""
POSTGRES_URL_NON_POOLING=""
POSTGRES_USER=""
POSTGRES_HOST=""
POSTGRES_PASSWORD=""
POSTGRES_DATABASE=""
```

## Seeding (with @vercel/postgres)

```bash
npm install @vercel/postgres
npm install bcrypt
```

```js
const { db } = require('@vercel/postgres');
const { customers, users } = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

async function seedUsers(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "users" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;
    console.log(`Created "users" table`);

    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
      }),
    );
    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      createTable,
      users: insertedUsers,
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedCustomers(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "customers" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      );
    `;
    console.log(`Created "customers" table`);

    // Insert data into the "customers" table
    const insertedCustomers = await Promise.all(
      customers.map(
        (customer) => client.sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );
    console.log(`Seeded ${insertedCustomers.length} customers`);

    return {
      createTable,
      customers: insertedCustomers,
    };
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();
  await seedUsers(client);
  await seedCustomers(client);
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
```

To run the seed script:

```json
{
  "scripts": {
    "seed": "node -r dotenv/config ./scripts/seed.js"
    // ...
  }
}
```

Definition: use `node` to run `seed.js` but preload the `dotenv` module. Dotenv loads environment variables from a `.env` file into `process.env`.

## Querying (fetching) data 

Database querying functions could all be stored in one file and then imported where needed. For example:

```ts
import { sql } from '@vercel/postgres';

type Revenue = {
  month: string;
  revenue: number;
};

export async function fetchRevenue() {
  try {
    const data = await sql<Revenue>`SELECT * FROM revenue`;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}
```

Then in my **server component**:

```tsx
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import { fetchRevenue } from '../lib/data';

export default async function Page() {
  // SQL query database using @vercel/postgres SDK
  const revenue = await fetchRevenue();

  return (
    <main>
      <RevenueChart revenue={revenue} />
    </main>
  );
}
```

By default, Next.js prerenders routes *Static Rendering*. With static rendering, data fetching and rendering happens on the server at build time (when you deploy) or during revalidation. So currently, if the data changes, it won't be reflected in this page.

To make it dynamically rendered:

```ts
import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';

// ...

export async function fetchRevenue() {
  noStore();
  // ...
}
```

> Note: `unstable_noStore` is an experimental API and may change in the future. If you prefer to use a stable API, you can also use the Segment Config Option `export const dynamic = "force-dynamic"`.

`unstable_noStore` is equivalent to cache: 'no-store' on a fetch, but is useful because it can be used where we are fetching data via some function other that `fetch()`. `unstable_noStore` is preferred over the segment config `export const dynamic = 'force-dynamic'` as it is more granular and can be used on a per-component basis.

## Request waterfalls

A [Request waterfall](https://nextjs.org/learn/dashboard-app/fetching-data#what-are-request-waterfalls) refers to a sequence of network requests that depend on the completion of previous requests. For example:

```tsx
const revenue = await fetchRevenue();
const latestInvoices = await fetchLatestInvoices(); // wait for fetchRevenue() to finish
const {
  numberOfInvoices,
  numberOfCustomers,
  totalPaidInvoices,
  totalPendingInvoices,
} = await fetchCardData(); // wait for fetchLatestInvoices() to finish
```

This pattern is not necessarily bad. For example, you might want to fetch a user's ID and profile information first. Once you have the ID, you might then proceed to fetch their list of friends using their ID. In this case, each request is contingent on the data returned from the previous request.

However, this behavior can also be unintentional and impact performance.

With static rendering, this is no big deal because the data would be pulled from the cache.

With dynamic rendering though, your application is only as fast as your slowest data fetch. In the above example page, if `fetchRevenue` takes a long time, the whole page won't load until it's done.

## Parallel data fetching

A common way to avoid waterfalls is to initiate all data requests at the same time - in parallel. In JavaScript, you can use the [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) or [Promise.allSettled()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled) functions to initiate all promises at the same time. However, you're app will still only load as fast as the slowest fetch in the group.

This is where we turn to *streaming* (Suspense). By streaming, you can prevent slow data requests from blocking your whole page.

## Streaming a whole page with loading.tsx/jsx

We can start streaming by simply adding a `loading.tsx` to out route folder:

```tsx
export default function Loading() {
  return <DashboardSkeleton />;
}
```

You can use route groups to ensure this `loading.tsx` is only applied to the segments you need it to.

However, a full page loading skeleton may not be appropriate. You can also set up streaming for individual components...

## Streaming a specific component

Using the example above, what we need to do is move each potentially time-consuming fetch into the component itself that uses it, then where that component is placed in our page; wrap it in `<Suspense>` and pass it a fallback skeleton component:

```tsx
import { fetchRevenue } from '@/app/lib/data';

export default async function RevenueChart() {
  // SQL query database using @vercel/postgres SDK
  const revenue = await fetchRevenue();
  // ...
  return (
    // ...
  );
}
```

Then in our page:

```tsx
import { Suspense } from 'react';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import { RevenueChartSkeleton } from '@/app/ui/skeletons';

export default async function Page() {

  return (
    <main>
      <Suspense fallback={<RevenueChartSkeleton />}>
        <RevenueChart />
      </Suspense>
    </main>
  );
}
```

If you have a group of components that you want to load at the same time instead of popping in one by one, wrap them in their own component and make a skelton for that group.

For example:

```tsx
import { Suspense } from 'react';
import CardWrapper from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import { CardsSkeleton, RevenueChartSkeleton } from '@/app/ui/skeletons';

export default async function Page() {

  return (
    <main>
      <div className="cardgrid">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <Suspense fallback={<RevenueChartSkeleton />}>
        <RevenueChart />
      </Suspense>
    </main>
  );
}
```

Then:

```tsx
import { fetchCardData } from '@/app/lib/data';

export default async function CardWrapper() {
  // SQL query database using @vercel/postgres SDK
  const {
    numberOfCustomers,
    numberOfInvoices,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();
  return (
    <>
      <Card title="Collected" value={totalPaidInvoices} type="collected" />
      <Card title="Pending" value={totalPendingInvoices} type="pending" />
      <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
      <Card title="Total Customers" value={numberOfCustomers} type="customers" />
    </>
  );
}

export function Card({title, value, type}) {
  return (
    // ...
  );
}
```

Deciding where to place your Suspense boundaries will depend on a few things:

- How you want the user to experience the page as it streams.
- What content you want to prioritize.
- If the components rely on data fetching.

In general, it's good practice to move your data fetches down to the components that need it, and then wrap those components in Suspense.

## Search

We can implement a database search like this:

- Capture the user's input.
- Update the URL with the search params.
- Keep the URL in sync with the input field.
- Update the ui data to reflect the search query

```tsx
'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function Search({ placeholder }: { placeholder: string }) {
  // A client component hook that lets you read the current URL's query string.
  const searchParams = useSearchParams();
  // A client component hook that lets you read the current URL's pathname.
  const pathname = usePathname();
  // A client component hook that allows you to programmatically change routes.
  const router = useRouter();

  function handleSearch(term: string) {
    // URLSearchParams is a Web API that provides utility methods for manipulating the
    // URL query parameters. Instead of creating a complex string literal, you can use
    // it to get the params string like ?page=1&query=a.
    const params = new URLSearchParams(searchParams);
    // Set the params string based on the user’s input. If the input is empty, delete it:
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    // router.replace let's you perform a client-side navigation to the provided route
    // without adding a new entry into the browser’s history stack. The URL is updated
    // without reloading the page, thanks to Next.js's client-side navigation
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="">
      {/* To ensure the input field is in sync with the URL and will be populated when sharing,
      you can pass a defaultValue to the input by reading from searchParams.
      If you're using state to manage the value of an input, you'd use the value attribute instead
      to make it a controlled component. This means React would manage the input's state.
      However, since we're not using state, you can use defaultValue. This means the native input
      will manage its own state. This is okay since we're saving the search query to the URL
      instead of state. */}
      <input
        className=""
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('query')?.toString()}
      />
    </div>
  );
}
```

The above client component sets the search params in the URL. We can then access these search params in another client component using the `useSearchParams` hook, or in the `page.js` by accessing the `searchParams` prop which can then be passed to the server component that fetches and displays our search results.

```tsx
import Table from '@/app/ui/invoices/table';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import Search from '@/app/ui/search';
import { Suspense } from 'react';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="">
      <Search placeholder="Search invoices..." />
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}
```

Then in the component:

```tsx
import { fetchFilteredInvoices } from '@/app/lib/data';

export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const invoices = await fetchFilteredInvoices(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      {invoices?.map((invoice) => (
        // ...
      ))}
    </div>
  );
}
```

In this case the fetch uses the term:

```ts
const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}
```

Side note: it's best to debounce the `handleSearch` function since it's currently replacing the URL on every keystroke of the input, this triggers a new db query every time. We can use the [use-debounce](xhttps://github.com/xnimorz/use-debounce) library: `import { useDebouncedCallback } from 'use-debounce'`.

```tsx
  // npm install use-debounce
  const handleSearch = useDebouncedCallback((term => {
    // URLSearchParams is a Web API that provides utility methods for manipulating the
    // URL query parameters. Instead of creating a complex string literal, you can use
    // it to get the params string like ?page=1&query=a.
    const params = new URLSearchParams(searchParams);
    // Set the params string based on the user’s input. If the input is empty, you want to delete it:
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    // router.replace let's you perform a client-side navigation to the provided route
    // without adding a new entry into the browser’s history stack. The URL is updated
    // without reloading the page, thanks to Next.js's client-side navigation
    router.replace(`${pathname}?${params.toString()}`);
  }), 300)
```

## Pagination

This builds on the Search example above. The query `fetchFilteredInvoices` query is already set up the use the `currentPage` value in the SQL query: `LIMIT num OFFSET num` will only return the rows for a given page. To create pagination here, we're really just add a dynamic link that will change depending on the current page and total number of results.

First, since we will now be setting the `page` URL param in this new page component, we should reset it to `1` whenever we change the input (do a new search):

```tsx
  const handleSearch = useDebouncedCallback((term) => {
    // URLSearchParams is a Web API that provides utility methods for manipulating the
    // URL query parameters. Instead of creating a complex string literal, you can use
    // it to get the params string like ?page=1&query=a.
    const params = new URLSearchParams(searchParams);
    // Reset the page param (this is later set by the pagination component)
    params.set('page', '1');
    // ...
```

Next we need to get the total number of pages on the server and pass to the pagination client component. You don't want to fetch data on the client as this would expose your database secrets.

```tsx
import Table from '@/app/ui/invoices/table';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import Search from '@/app/ui/search';
import { fetchInvoicesPages } from '@/app/lib/data';
import { Suspense } from 'react';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className="">
      <Search placeholder="Search invoices..." />
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>

      <Pagination totalPages={totalPages} /> 
    </div>
  );
}
```

The `totalPages` query function look slike:

```ts 
export async function fetchInvoicesPages(query: string) {
  noStore();
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}
```

Then in our `Pagination` component:

```tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { generatePagination } from '@/app/lib/utils';

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <>
      <div className="">
        <PaginationArrow
          direction="left"
          href={createPageURL(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />

        <div className="">
          {allPages.map((page, index) => {
            let position: 'first' | 'last' | 'single' | 'middle' | undefined;
            if (index === 0) position = 'first';
            if (index === allPages.length - 1) position = 'last';
            if (allPages.length === 1) position = 'single';
            if (page === '...') position = 'middle';

            return (
              <PaginationNumber
                key={page}
                href={createPageURL(page)}
                page={page}
                position={position}
                isActive={currentPage === page}
              />
            );
          })}
        </div>

        <PaginationArrow
          direction="right"
          href={createPageURL(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        />
      </div>
    </>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: 'first' | 'last' | 'middle' | 'single';
  isActive: boolean;
}) {
  const className = clsx(
    // ...
  );

  return isActive || position === 'middle' ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className}>
      {page}
    </Link>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: 'left' | 'right';
  isDisabled?: boolean;
}) {
  const className = clsx(
    // ...
  );

  const icon =
    direction === 'left' ? (
      <ArrowLeftIcon className="w-4" />
    ) : (
      <ArrowRightIcon className="w-4" />
    );

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link className={className} href={href}>
      {icon}
    </Link>
  );
}
```

Finally, `generatePagination` which is just a utility function the outputs an array for the pagination depending on what the current page is and teh total number of pages.

```ts
export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};
```