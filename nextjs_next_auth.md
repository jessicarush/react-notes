# Authentication with Next-auth 

[Next-auth](https://authjs.dev/reference/nextjs) abstracts away much of the complexity involved in managing sessions, sign-in and sign-out, and other aspects of authentication.

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Protecting routes with middleware](#protecting-routes-with-middleware)
- [Password hashing](#password-hashing)
- [Credentials provider](#credentials-provider)
- [Adding the sign in functionality](#adding-the-sign-in-functionality)
- [Updating the login form](#updating-the-login-form)
- [Adding the logout functionality](#adding-the-logout-functionality)

<!-- tocstop -->

## Introduction 

```bash
# beta version of NextAuth.js is compatible with Next.js 14
npm install next-auth@beta
```

Generate a secret key:

```bash
openssl rand -base64 32
```

And add this to your `.env`:

```text
AUTH_SECRET=your-secret-key
```

Create an `auth.config.ts` file at the root of our project that exports an `authConfig` object. This object will contain the configuration options for NextAuth.js. 

```ts
import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
};
```

Use the pages option to specify the route for custom sign-in, sign-out, and error pages. This is not required, but by adding `signIn: '/login'` into our pages option, the user will be redirected to your custom login page, rather than the NextAuth.js default page.


## Protecting routes with middleware

This will prevent users from accessing the dashboard pages unless they are logged in.

```ts
import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
```

The authorized callback is used to verify if the request is authorized to access a page via Next.js Middleware. It is called before a request is completed, and it receives an object with the `auth` and `request` properties. The `auth` property contains the user's session, and the `request` property contains the incoming request.

The `providers` option is an array where you list different login options. For now, it's an empty array to satisfy NextAuth config. 

Next, you will need to import the authConfig object into a middleware file (`project_root/middleware.ts`):

```ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth;
 
export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

Here you're initializing NextAuth.js with the authConfig object and exporting the auth property. You're also using the matcher option from Middleware to specify that it should run on specific paths.

The matcher is configured to apply the middleware to all paths **except**:

- Paths starting with /api (API routes).
- Paths starting with /_next/static (static files served by Next.js).
- Paths starting with /_next/image (Next.js image optimization routes).
- Paths that end with .png (PNG images).

## Password hashing

It's good practice to hash passwords before storing them in a database. 

You can use a package like [bcrypt](https://github.com/kelektiv/node.bcrypt.js#readme) to hash the user's password before storing. For example in this databsae seed file:

```ts
const { db } = require('@vercel/postgres');
const { customers } = require('../app/lib/placeholder-data.js');
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
```

You can then use it again later to compare that the password entered by the user matches the one in the database. However, you will need to create a separate file for the bcrypt package. This is because bcrypt relies on Node.js APIs not available in Next.js Middleware.

Create a new root file called `auth.ts` that spreads your authConfig object:

```ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
});
```

## Credentials provider

Next, you will need to add the `providers` option to `auth.ts`. `providers` is an array where you list different login options such as Google or GitHub. Here we'll focus on using the Credentials provider which allows users to log in with a username and a password.

```ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({})],
});
```

## Adding the sign in functionality

You can use the `authorize` function to handle the authentication logic. Similarly to Server Actions, you can use zod to validate the email and password before checking if the user exists in the database:

```ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
      },
    }),
  ],
});
```

After validating the credentials, create a new `getUser` function that queries the user from the database.

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
 
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
 
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
        }
      },
    }),
  ],
});
```

Then, call `bcrypt.compare` to check if the passwords match. If the password, return the user, otherwise, return `null` to prevent the user from logging in.

```ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
```

## Updating the login form

Now you need to connect the auth logic with your login form. In your `actions.ts` file, create a new action called `authenticate`. This action should import the `signIn` function from `auth.ts`:

```ts
// ...
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

// ...
```

If there's a `'CredentialsSignin'` error, you want to show an appropriate error message. See the [next-auth error documentation](https://authjs.dev/reference/core/errors/).

Finally, in your login-form.tsx component, you can use React's useFormState to call the server action and handle form errors, and use useFormStatus to handle the pending state of the form:

```tsx
'use client';
// ...
import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';

export default function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <form action={dispatch}>

        <h1>log in</h1>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Enter your email address"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="Enter password"
          required
          minLength={6}
        />

        <LoginButton />

        {errorMessage && (
          <p>{errorMessage}</p>
        )}
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button aria-disabled={pending}>Log in</Button>
  );
}
```

## Adding the logout functionality

To add the logout functionality, call the signOut function from `auth.ts` in a `<form>` element:

```tsx
import { signOut } from '@/auth';

export default function Logout() {
  return (
    <form action={async () => {'use server'; await signOut();}}>
      <button>Sign Out</button>
    </form>
  );
}
```