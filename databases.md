# Databases

## Table of Contents

<!-- toc -->

- [Setting up a local PostgreSQL database](#setting-up-a-local-postgresql-database)
- [Check your new database using psql](#check-your-new-database-using-psql)
- [Set up a Next.js app with node-postgres](#set-up-a-nextjs-app-with-node-postgres)
- [Set up `.env`](#set-up-env)
- [Add you database variables to your `.env`](#add-you-database-variables-to-your-env)
- [Quick test a node-postgres connection](#quick-test-a-node-postgres-connection)
- [Test](#test)
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

## Set up `.env`

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

## Add you database variables to your `.env`

Finally, in your `.env` file add the following variables. These will be used by the `node-postgres` client and pool instances to connect to you database. Remember to use quotes when you have spaces.

```bash
PGHOST=localhost
PGUSER=postgres
PGDATABASE=postgres_test_1
PGPASSWORD="my password"
PGPORT=5432
```

## Quick test a node-postgres connection 

```tsx
'use server';

import { Client } from 'pg';

export default async function One() {
  const client = new Client();
  await client.connect();

  try {
    const res = await client.query('SELECT $1::text as message', ['Hello world!']);
    console.log(res.rows[0].message); // Hello world!
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

-----

WIP

-----


A Client instance will use environment variables for all missing values.

```js
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

example to create a client with specific connection information:

```js
import { Client } from 'pg'
 
const client = new Client({
  host: 'my.database-server.com',
  port: 5334,
  database: 'database-name',
  user: 'database-user',
  password: 'secretpassword!!',
})
```

also URL strings

```js
import { Pool } from 'pg';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
```

postgresql://username:password@host:port/database

## Seeding

Lastly there is one situation where we will need to use access the `.env` variables outside of Next.js: when we seed the database. For this w dotenv 

```bash
npm install dotenv --
```

```json
{
  "scripts": {
    // ...
    "seed": "node -r dotenv/config ./scripts/seed.js"
  },
}
```

## Setting up a Next.js app with a sqlite3 database