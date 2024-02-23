# Databases

## Table of Contents 

<!-- toc -->

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

## Test

postgresql://username:password@host:port/database

## Setting up a Next.js app with a sqlite3 database