# Databases

## Table of Contents

<!-- toc -->

- [Setting up a local PostgreSQL database](#setting-up-a-local-postgresql-database)
- [Check your new database using psql](#check-your-new-database-using-psql)
- [Set up a Next.js app with node-postgres](#set-up-a-nextjs-app-with-node-postgres)
  * [Set up `.env`](#set-up-env)
  * [Add you database variables to your `.env`](#add-you-database-variables-to-your-env)
  * [Quick test a node-postgres connection](#quick-test-a-node-postgres-connection)
  * [Managing connections](#managing-connections)
  * [Client](#client)
  * [Pool](#pool)
  * [Querying](#querying)
  * [Seeding using client](#seeding-using-client)
  * [Fetch data using pool](#fetch-data-using-pool)
  * [Server actions using pool](#server-actions-using-pool)
  * [Server Cleanup](#server-cleanup)
- [Setting up a Next.js app with a sqlite3 database](#setting-up-a-nextjs-app-with-a-sqlite3-database)

<!-- tocstop -->

## Setting up a local PostgreSQL database

- [Postgresql official documentation](https://www.postgresql.org/docs/)
- [pgAdmin 4 documentation](https://www.pgadmin.org/docs/)

To work with this database server, first you'll need to [download the installer for your OS](https://www.postgresql.org/download/). This installer includes the PostgreSQL server, pgAdmin; a graphical tool for managing and developing your databases, and StackBuilder; a package manager that can be used to download and install additional PostgreSQL tools and drivers.

Launch the installer and it will take you into the 'setup wizard'. Choose your installation directory, data directory, (by default these are `/Library/PostgreSQL/16`). Then you'll need to create a superuser password. The superuser is 'postgres' by default but you select the password. It's a good idea to record all this in a credentials file including the next item which is the port (by default 5432). 

The next question 'Set the locale to be used by the new database cluster'. There's a good [description of database clusters here](https://www.postgresql.org/docs/current/static/creating-cluster.html). Locale refers to an application respecting cultural preferences regarding alphabets, sorting, number formatting, etc. If your system is already set to use the locale that you want in your database cluster then there is nothing else you need to do. If you want to use a different locale you can select something else from the list. Note, you can't change this later. 

After the main install completes, it will ask you if you want some additional tools (Stack Builder). There's bunch of add-ons available here. You can access this current list of add-ons at any time by launching stackbuilder: `/Library/PostgreSQL/16/stackbuilder` 

Next, you'll need to use the pgAdmin tool to create a database. Launch it from `/Library/PostgreSQL/16/pdAmin 4.app`. Once the dashboard tool opens, right click on the PostgreSQL server in the left panel and choose 'Connect Server'. Type your password. Once connected, pop open the `Databases` group and you'll see one default database called `postgres`. To create a new one, right click on the `Databases` group and choose `Create' > Database...`. You will need to give it a name and make sure your superuser `postgres` is the owner. 

The OID field is the object identifier to be used for the new database. If this parameter is not specified, PostgreSQL will choose a suitable OID automatically. This parameter is primarily intended for internal use by `pg_upgrade`.

## Check your new database using psql 

[psql](https://www.postgresql.org/docs/current/app-psql.html) is the PostgreSQL interactive terminal. This is installed with the 'command line tools' option when you installed PostgreSQL. Before we can use it, you need to make sure the path is added to your `bash_profile` or `bash_rc`, for example:

```bash
# For Postgresql command line tools
export PATH=/Library/PostgreSQL/16/bin/:$PATH
```

Now you should be able to run `psql --help` to see commands.

To connect to your database:

```bash
psql -d database_name -U user_name
```

Now you can try creating a table:

```bash
CREATE TABLE my_table (
    id SERIAL PRIMARY KEY,
    column1 VARCHAR(50),
    column2 INT
);
```

Then use a psql command to list all your tables: `\dt` or `\dt+`.

You can go back to the pgAdmin tool to check that you can see your new table. First, right-click on the database name to `Refresh`, then look in `Schemas > Tables.

You can run `DROP TABLE my_table;` when this test is done.

Side note, if you have a `.sql` file with your SQL queries, you can execute it using psql with the following command:

```bash
psql -d database_name -U user_name -f path/to/your_file.sql
```

When done type `\q` to quit from the `psql` interactive shell.

## Set up a Next.js app with node-postgres

Once you have a barebones Next.js app running, install `node-postgres`:

```bash
npm install pg
npm i --save-dev @types/pg
```

### Set up `.env`

Firstly, know that Next.js will automatically look up environment variables in the following places, in order, stopping once the variable is found:

- `process.env`
- `.env.$(NODE_ENV).local`
- `.env.local` (Not checked when `NODE_ENV` is `test`.)
- `.env.$(NODE_ENV)`
- `.env`

So if you or a package needs to access an environment variable from your `.env`, it will happen automatically once you create the file. In fact, you will notice as soon as you create a `.env` in your root directory, the next time you `npm run dev` you should see:

```bash
 ▲ Next.js 14.1.0
   - Local:        http://localhost:3000
   - Environments: .env
```

As a side note, if you want to access environment vars in your code, keep in mind that these are by default, only available in server components. If you need to access a var client-side, then you must prefix it with `NEXT_PUBLIC_`. For example, my `.env` file:

```bash
TEST_ENV="my server-only environment variable"
NEXT_PUBLIC_TEST_ENV="my public environment variable"
```

And to access them:

```js
// Can be used server-side
const serverEnv = process.env.TEST_ENV;
console.log('TEST_ENV:', serverEnv);

// Can be used client-side
const clientEnv = process.env.NEXT_PUBLIC_TEST_ENV;
console.log('NEXT_PUBLIC_TEST_ENV:', clientEnv);
```

### Add you database variables to your `.env`

Finally, in your `.env` file add the following variables. These will be used by the `node-postgres` client and pool instances to connect to you database. Remember to use quotes when you have spaces.

```bash
PGHOST=localhost
PGUSER=postgres
PGDATABASE=postgres_test_1
PGPASSWORD="my password"
PGPORT=5432
```

### Quick test a node-postgres connection 

```tsx
'use server';

import { Client } from 'pg';

export default async function One() {
  const client = new Client();
  await client.connect();

  try {
    const query = 'SELECT now(), version()';
    const res = await client.query(query);
    console.log('Timestamp:', res.rows[0].now);
    console.log('Version:', res.rows[0].version);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }

  return (
    <main>
      <p>One.</p>
    </main>
  );
}
```

You should see "Hello World" in the server terminal.

### Managing connections 

With tools like `node-postrges`, you are responsible for managing the database connection lifecycle. This can be done using a [client](https://node-postgres.com/apis/client) or [pool](https://node-postgres.com/apis/pool). 

A `Client` instance represents a single connection to the PostgreSQL server. You manually manage this connection, including connecting (`client.connect()`) and disconnecting (`client.end()`) as necessary. This is suitable for scenarios where you have a short-lived application or task that only needs to connect to the database once or a few times. It gives you precise control over the connection lifecycle.

A `Pool` instance manages a set of client connections for you. It maintains a pool of active connections that can be reused for multiple queries, which can significantly improve performance, especially in a server or web application that handles many requests. When you execute a query using `pool.query()`, it automatically borrows a connection from the pool, executes the query, and then returns the connection to the pool. This abstraction simplifies connection management, as you don't need to explicitly connect and disconnect each time you run a query.

`Pool` is more suited for long-running applications, like web servers or applications that frequently interact with the database. It's the recommended approach for most server-side applications due to its efficiency in managing multiple concurrent database operations.

### Client 

When you create a new `Client` instance, it takes a config object. Every field of the config object is entirely optional since a Client instance will use environment variables for all missing values.

```ts
import { Client } from 'pg';

const client = new Client()
await client.connect()
const res = await client.query('SELECT NOW()')
await client.end()
```

The config object type looks like this:

```ts
type Config = {
  user?: string, // default process.env.PGUSER || process.env.USER
  password?: string or function, // default process.env.PGPASSWORD
  host?: string, // default process.env.PGHOST
  database?: string, // default process.env.PGDATABASE || user
  port?: number, // default process.env.PGPORT
  connectionString?: string, // e.g. postgres://user:password@host:5432/database
  ssl?: any, // passed directly to node.TLSSocket, supports all tls.connect options
  types?: any, // custom type parsers
  statement_timeout?: number, // number of milliseconds before a statement in query will time out, default is no timeout
  query_timeout?: number, // number of milliseconds before a query call will timeout, default is no timeout
  application_name?: string, // The name of the application that created this Client instance
  connectionTimeoutMillis?: number, // number of milliseconds to wait for connection, default is no timeout
  idle_in_transaction_session_timeout?: number // number of milliseconds before terminating any session with an open idle transaction, default is no timeout
}
```

Example client with specific connection information:

```ts
import { Client } from 'pg';
 
const client = new Client({
  host: 'my.database-server.com',
  port: 5334,
  database: 'database-name',
  user: 'database-user',
  password: 'secretpassword!',
})
```

Using a database URI from your environment vars:

```ts 
const client = new Client({
  connectionString: process.env.DATABASE_URL
})
```

or hard-coded:

```ts
const connectionString = 'postgresql://dbuser:secretpassword@database.server.com:3211/mydb'
const client = new Client({
  connectionString,
})
```

### Pool 

A `Pool` instance works the same as a `Client` in that it takes a config object where every field is optional because it defaults to using environment vars.

```ts
import { Pool } from 'pg';
 
const pool = new Pool();

const res = await pool.query('SELECT NOW()');
await pool.end();
```

The above will automatically grab (connect) a client from the pool and then release it when the query is done. If you need to to do a series of sequential queries that rely on one another then you would create your own client connection and then release it yourself when your done:

```ts
import { Pool } from 'pg';
 
const pool = new Pool();
 
const client = await pool.connect();
const res = await client.query('SELECT NOW()')
client.release()
```

In the context of PostgreSQL and most relational databases,a sequence of one or more SQL operations that need to be executed as a single, atomic unit of work, are called a transaction. With transactions, all steps should be completed successfully for the transaction to be considered successful. If any step fails, the entire operation should be undone to prevent data inconsistency. This is what you do:

- Acquire a single client from the pool.
- Start the transaction on that client.
- Perform all operations related to the transaction using that same client.
- Commit or roll back the transaction on that client.
- Release the client back to the pool.

The code would look like this:

```js
import { Pool } from 'pg';

const pool = new Pool();

async function transactionExample() {
  const client = await pool.connect();
  try {
    // Start the transaction
    await client.query('BEGIN');
    // Perform a series of queries within the transaction
    await client.query('SELECT NOW()');
    // Add more queries here as needed, for example:
    // await client.query('INSERT INTO ...');
    // await client.query('UPDATE ...');

    // Commit the transaction if all queries succeed
    await client.query('COMMIT'); 
  } catch (error) {
    // Roll back the transaction on error
    await client.query('ROLLBACK');
    // Rethrow the error for further handling
    throw error; 
  } finally {
    // Release the client back to the pool
    client.release();
  }
}
```

The config object is defined exactly the same as shown above in `Client` with a few additional options:

```ts
type Config = {
  // all valid client config options are also valid here
  // in addition here are the pool specific configuration parameters:
 
  // number of milliseconds to wait before timing out when connecting a new client
  // by default this is 0 which means no timeout
  connectionTimeoutMillis?: number
 
  // number of milliseconds a client must sit idle in the pool and not be checked out
  // before it is disconnected from the backend and discarded
  // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
  idleTimeoutMillis?: number
 
  // maximum number of clients the pool should contain
  // by default this is set to 10.
  max?: number
 
  // Default behavior is the pool will keep clients open & connected to the backend
  // until idleTimeoutMillis expire for each client and node will maintain a ref
  // to the socket on the client, keeping the event loop alive until all clients are closed
  // after being idle or the pool is manually shutdown with `pool.end()`.
  //
  // Setting `allowExitOnIdle: true` in the config will allow the node event loop to exit
  // as soon as all clients in the pool are idle, even if their socket is still open
  // to the postgres server. This can be handy in scripts & tests
  // where you don't want to wait for your clients to go idle before your process exits.
  allowExitOnIdle?: boolean
}
```

One last piece of the puzzle I haven't quite sorted out:

> Calling `pool.end` will drain the pool of all active clients, disconnect them, and shut down any internal timers in the pool. It is common to call this at the end of a script using the pool or when your process is attempting to shut down cleanly.

```js
import { Pool } from 'pg';
 
const pool = new Pool();
await pool.end();
```

See the [server cleanup section](#server-cleanup) below.

### Querying

Use the `.query()` method on your `client` or `pool` instance. To help prevent SQL injection, use *parameterized queries*: use placeholders for variables and pass the actual variable values as a separate argument.

```ts
const text = 'SELECT * FROM users WHERE id = $1';
const values = [userId];
const res = await client.query(text, values);
```

Here's another example with multiple values. The `RETURNING *` clause specifies that after the `INSERT` operation is executed, the database should return all columns (`*`) of the newly inserted row. This feature is particularly useful in PostgreSQL, allowing you to retrieve the state of the inserted row without having to perform a separate `SELECT` query.

```ts
const text = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING *'
const values = ['jessica', 'jessica@example.com']
 
const res = await client.query(text, values)
console.log(res.rows[0])
// { name: 'jessica', email: 'jessica@example.com' }
```

Use `as` to assign an alias to the result. For example in the returned object, specifically within the `rows` array, each row will have a property named `timestamp` that contains the value:

```ts
const res = await client.query('SELECT NOW() as timestamp');
console.log(res.rows[0].timestamp);
```

Parameters passed as the second argument to `query()` will be converted to raw data types using the following rules:

type | converts to
---- | -----------
`null`, `undefined` | `null` and `undefined` are both converted to `null`
`Date` | Custom conversion to a UTC date string
`Buffer`| Buffer instances are unchanged
`Array` | Converted to a string that describes a Postgres array
`Object` | If a parameterized value has the method `toPostgres` then it will be called and its return value will be used in the query. The signature of `toPostgres` is the following: `toPostgres (prepareValue: (value) => any): any`. The `prepareValue` function provided can be used to convert nested types to raw data types suitable for the database. Otherwise if no `toPostgres` method is defined then `JSON.stringify` is called on the parameterized value.
Everything else | All other parameterized values are converted by calling `value.toString` 

Note that PostgreSQL does not support parameters for identifiers (database, schema, table, column names, etc). For example:

```sql
-- This is supported:
SELECT * FROM users WHERE email = $1;
-- This is NOT supported:
SELECT * FROM $1;
```

If you need to have dynamic database, schema, table, or column names use a combination of *whitelisting* (employing a whitelist of allowed database objects) and an SQL query formatting package for handling escaping these values to ensure you do not have SQL injection. Unfortunately, the ones that have been suggested to me are both marked as "archived" on github: [pg-format](https://github.com/datalanche/node-pg-format) and [pg-escape](https://github.com/segmentio/pg-escape). So, cross that bridge when you come to it.

### Seeding using client 

I'm going to seed some users and hash the password using `bcrypt`:

```bash
npm install bcrypt
```

My `seed-data.js` looks like this:

```js
const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'Test user 1',
    email: 'testuser1@example.com',
    password: '12345678',
    role: 1,
  },
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442b',
    name: 'Test user 2',
    email: 'testuser2@example.com',
    password: 'hello world',
    role: 1,
  },
];

module.exports = {
  users,
};
```

The database is set up to automatically create a uuid ID for each new row using the [uuid-ossp](https://www.postgresql.org/docs/current/uuid-ossp.html) extension. However, for the seed users, we provide fixed IDs in the uuid format so that we can always know what they are and skip adding them if we seed the database again.

```js
const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { users } = require('./seed-data.js');

async function seedUsers(client) {
  try {
    // Install the "uuid-ossp" extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create the "users" table if it doesn't exist
    const createTable = await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role INT NOT NULL,
        cakeday DATE NOT NULL
      );
    `);

    console.log(`Created "users" table`);

    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        // Hash the password (the second arg is the saltRounds)
        const hashedPassword = await bcrypt.hash(user.password, 10);
        // Get the date and trim to only include "YYYY-MM-DD"
        const date = new Date().toISOString().split('T')[0];
        // Parameterize query values
        const values = [user.id, user.name, user.email, hashedPassword, user.role, date];
        // Insert users and if the IDs already exist, don't add them again
        return client.query(`
          INSERT INTO users (id, name, email, password, role, cakeday)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING;
        `, values);
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

async function main() {
  // Create database client and connect
  const client = new Client();
  await client.connect();
  // Run queries
  await seedUsers(client);
  // Close database connection
  await client.end();
}

main().catch((error) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    error,
  );
});

```

To run the script we will need to use access the `.env` variables outside of Next.js. For this we'll need `dotenv`:

```bash
npm install dotenv --save-dev
```

Then add a script to your `package.json`:

```json
{
  "scripts": {
    // ...
    "seed": "node -r dotenv/config ./scripts/seed.js"
  },
}
```

Then run `npm run seed`.

You should be able to see your new tables in pgAdmin 4. You can also view the data by right-clicking on the table and choosing `View/Edit Data`.

### Fetch data using pool

`app/_lib/database.ts`:

```ts
import { Pool } from 'pg';

const pool: Pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT || '5432', 10)
});

export default pool;
```

`app/_lib/definitions.ts`:

```ts
export type Item = {
  id: number;
  name: string;
  quantity: number;
  date: string;
}
```

`app/_lib/fetch-data.ts`:

```ts
import { unstable_noStore as noStore } from 'next/cache';
// This would be needed if we had a fetchItem function
// import { notFound } from 'next/navigation';
// import { QueryResult } from 'pg';
import pool from '@/app/_lib/database';
import type { Item } from '@/app/_lib/definitions';

export async function fetchItems(): Promise<Item[]> {
  noStore();

  try {
    // const result: QueryResult<Item> = await pool.query(`SELECT * FROM items;`);
    const result = await pool.query(`SELECT * FROM items;`);
    return result.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch items.');
  }
}
```

In my component:

```tsx
import ItemList from '@/app/_ui/ItemList';
import { fetchItems } from '@/app/_lib/fetch-data';

export default async function Home() {
  const items = await fetchItems();

  return (
    <main>
      <ItemList items={items} />
    </main>
  );
}
```

### Server actions using pool

Since we're dealing with forms here, we have a whole nunch of code related to validation and response messaging. See [nextjs_server_actions.md]() for more explantaion on that stuff.

`@/app/_lib/actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
// Use this if you want to redirect after revalidatePath
// import { redirect } from 'next/navigation';
import type { FormState } from '@/app/_lib/definitions';
import { ItemFormSchema } from '@/app/_lib/form-validation-schemas';
import pool from '@/app/_lib/database';


const AddItem = ItemFormSchema.omit({ id: true, date: true });

export async function addItem(prevState: FormState, formData: FormData): Promise<FormState> {
  // Extract the data from the formData object.
  const rawFormData = {
    name: formData.get('name'),
    quantity: formData.get('quantity')
  };

  // Validate form fields with Zod
  const validatedFields = AddItem.safeParse(rawFormData);

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      status: 'ERROR' as const,
      message: 'Missing Fields. Failed to add item.',
      errors: validatedFields.error.flatten().fieldErrors,
      timestamp: Date.now(),
    };
  }

  // Prepare data for insertion into the database
  const { name, quantity } = validatedFields.data;
  const date = new Date().toISOString().split('T')[0];
  const values = [name, quantity, date];

  // Insert the data and handle any errors.
  try {
    await pool.query(`
      INSERT INTO items (name, quantity, date)
      VALUES ($1, $2, $3);
    `, values);
  } catch (error) {
    return {
      status: 'ERROR' as const,
      message: 'Database Error: Failed to add item.',
      errors: {},
      timestamp: Date.now(),
    };
  }

  // Revalidate the cache
  revalidatePath('/');
  return {
    status: 'SUCCESS' as const,
    message: 'Item added.',
    errors: {},
    timestamp: Date.now(),
  };
}
```

`app/_lib/database.ts` is shown above. For completenees here is `FormState` and `ItemFormSchema`, which are needed for `useFormState` messaging and form validation:

```ts 
export type FormState = {
  status: 'UNSET' | 'SUCCESS' | 'ERROR';
  message: string;
  errors: {
    name?: string[];
    quantity?: string[];
  };
  timestamp: number;
};
```

```ts
import { z } from 'zod';

// Form validation using Zod.
// Messages are sent back to the form via the state from useFormState.
const ItemFormSchema = z.object({
  id: z.number(),
  name: z
    .string({
      required_error: 'Enter an item.',
      invalid_type_error: 'Enter an item name.'
    })
    .trim()
    .min(1, { message: 'Item name is required.' })
    .max(128, { message: 'Item names can be max 128 characters.' }),
  quantity: z.coerce
    .number({
      required_error: 'Quantity is required.',
      invalid_type_error: 'Quantity must be a number.'
    })
    .int({ message: 'Quantity must be an integer.' })
    .gt(0, { message: 'Enter a quantity greater than 0.' }),
  date: z.string()
});

export { ItemFormSchema };
```

### Server Cleanup 

It is hinted [in the node-postgres docs](https://node-postgres.com/apis/pool#poolend) and as well I am told by ChatGPT, that I need to make sure call `pool.end()` when my application shuts down to close all the connections in the pool.

> Generally, you don't need to manually shut down the pool, especially in a serverless production environment. However, in a development environment or if you're running a Next.js custom server (next start or a Node.js server script that uses next), you might want to properly close the pool when the server process is terminated. This can be achieved with process event listeners like SIGINT.

Implementing a *graceful shutdown* is crucial for long-running applications to release resources properly, which can help prevent issues related to resource leaks or locked connections. This can be done by listening to process termination signals (like `SIGINT` and `SIGTERM`) and then calling `pool.end()`.

```js
process.on('SIGINT', async () => {
  await pool.end();
  console.log('Pool has ended');
  process.exit(0);
});
```

If you plan to deploy your Next.js application on a Digital Ocean droplet (or any similar virtual server environment) and run it with `npm run start`, you are effectively running a Node.js server that serves your Next.js application in a more traditional server environment. This scenario is different from serverless deployments and brings your application closer to traditional web applications in terms of lifecycle management.

In this context, listening for `SIGINT` makes more sense because:

Long-running Process: Your Next.js server is a long-running process that can benefit from graceful shutdown procedures. This includes cleaning up resources like database connections or other tasks you need to ensure are handled properly before the server process exits.

Manual Interruptions and Deployments: During deployments, updates, or maintenance, you might manually stop the server using `Ctrl+C` or through scripts that send `SIGINT` or similar signals. Handling these signals allows you to ensure that your application shuts down gracefully, closing out resources like your PostgreSQL connection pool.

You can implement `SIGINT` handling in the main entry point of your application or in a specific module responsible for your server's setup and resource management. Here’s a basic approach:

Identify the Main Server File: This is typically the file where you start your Next.js application with a custom server setup. For a basic Next.js setup without custom server logic, you won't have this file, so you might be looking at adding some custom server logic.

**There's no solution/documentation yet for App Router**

In the Next.js docs for Pages Router, there are two sections that are exactly what I'm looking for to solve this problem:

- [Deploying > Manual Graceful Shutdowns](https://nextjs.org/docs/pages/building-your-application/deploying#manual-graceful-shutdowns)
- [Configuring > Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)

Both of these would work however, both sections are missing from the App Router documentation.

Regarding manual graceful shutdowns, I found these github issues:

- [Docs: App Router docs for gracefully handling shutdowns still requires pages/_document.js #51404](https://github.com/vercel/next.js/issues/51404): No solution, no activity. Someone mentions using a `server.js` instead of `pages/_document.js`. This `server.js` appears to be yet another Pages Router section that is missing in the App Router docs: [Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server).
- [Manual Graceful shutdowns do not work #56810](https://github.com/vercel/next.js/issues/56810): Has been marked as resolved even though the solution thread seems to be pages router based again.
- [Add NEXT_MANUAL_SIG_HANDLE handling to start-server.ts](https://github.com/vercel/next.js/pull/59117): The "solution" to the above issue #56810. It is a pages router fix not an app router solution.

Regarding a custom `server.js`:

- This article talks about creating a custom server (and server.js) with express: [Next.js Custom Server with Node.js](https://louispetrik.medium.com/next-js-custom-server-e1011c4142c9)
- This video talks about deploying: [How to Deploy a Next.js app to a Custom Server - NOT Vercel!](https://www.youtube.com/watch?v=HIb4Ucs_foQ)

## Setting up a Next.js app with a sqlite3 database
