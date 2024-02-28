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
 
const pool = new Pool()
const res = await pool.query('SELECT NOW()')
await pool.end()
```

The config object is defined exactly the same as shown above in `Client`.

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

Then add a script to yout `package.json`:

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


### Server actions using pool


-----

WIP

-----











### Server Cleanup 

Particularly when not using connection pooling, but even with it, ensure that your application correctly handles shutdowns and cleans up resources. This includes ending pool connections when your application exits.

Handling Pool Shutdown in Next.js

    For Development: Generally, you don't need to manually shut down the pool, especially in a serverless production environment. However, in a development environment or if you're running a Next.js custom server (next start or a Node.js server script that uses next), you might want to properly close the pool when the server process is terminated. This can be achieved with process event listeners like SIGINT, but it's more relevant when you have a long-running server process, not typical in standard Next.js usage.

How to ensure ending pool connections when your application exits?

To gracefully shut down and release all the resources held by a connection pool when your application exits, you can listen to global events such as SIGINT (which is sent to terminate the process, for example, when you press Ctrl+C in the terminal) and then call pool.end() to close all the connections in the pool:

javascript

process.on('SIGINT', async () => {
  await pool.end();
  console.log('Pool has ended');
  process.exit(0);
});

If you plan to deploy your Next.js application on a Digital Ocean droplet (or any similar virtual server environment) and run it with npm run start, you are effectively running a Node.js server that serves your Next.js application in a more traditional server environment. This scenario is different from serverless deployments and brings your application closer to traditional web applications in terms of lifecycle management.


If you plan to deploy your Next.js application on a Digital Ocean droplet (or any similar virtual server environment) and run it with npm run start, you are effectively running a Node.js server that serves your Next.js application in a more traditional server environment. This scenario is different from serverless deployments and brings your application closer to traditional web applications in terms of lifecycle management.
Why Listening for SIGINT Makes Sense Here

In this context, listening for SIGINT makes more sense because:

    Long-running Process: Your Next.js server is a long-running process that can benefit from graceful shutdown procedures. This includes cleaning up resources like database connections or other tasks you need to ensure are handled properly before the server process exits.

    Manual Interruptions and Deployments: During deployments, updates, or maintenance, you might manually stop the server using Ctrl+C or through scripts that send SIGINT or similar signals. Handling these signals allows you to ensure that your application shuts down gracefully, closing out resources like your PostgreSQL connection pool.

How and Where to Implement SIGINT Handling

Given your deployment strategy, you can implement SIGINT handling in the main entry point of your application or in a specific module responsible for your server's setup and resource management. Here’s a basic approach:

    Identify the Main Server File: This is typically the file where you start your Next.js application with a custom server setup. For a basic Next.js setup without custom server logic, you might not have this file, but since you're considering handling SIGINT, you might be looking at adding some custom server logic.

    Implement SIGINT Handling: You can add the SIGINT listener in the same file where you set up your database connection pool if you're managing it manually or in your server's main file. 

    When deploying updates or making changes, gracefully stopping your server will ensure that database connections and other resources are properly closed, which can help prevent issues related to resource leaks or locked connections.

    Ensure that any other resources (like file streams, external API connections, etc.) are also gracefully handled in your shutdown procedure.

    How PM2 Manages Graceful Shutdown

PM2 sends a SIGINT signal to your application when stopping it, which is the standard signal for interrupting a process. Your application can listen for this signal to initiate a graceful shutdown, including closing database connections, saving state, or cleaning up resources before the process exits.

PM2 Configuration: When using PM2, you can specify how your application should be started, including setting up instances, watch mode, and more in an ecosystem configuration file (ecosystem.config.js or similar). PM2 automatically handles the rest, including restarting your application if it crashes and gracefully stopping it when required.

Using PM2 to Stop/Reload Your Application: To stop or reload your application gracefully, you would use PM2 commands. For example, to reload your application (which allows current connections to finish before restarting), you can use:

arduino

pm2 reload ecosystem.config.js

## Setting up a Next.js app with a sqlite3 database
