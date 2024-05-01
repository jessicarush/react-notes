# Server actions

## Table of Contents

<!-- toc -->

- [Intro to server actions](#intro-to-server-actions)
- [Using server actions](#using-server-actions)
- [Implementation process](#implementation-process)
  * [Create a form to capture the user's input.](#create-a-form-to-capture-the-users-input)
  * [Create a Server Action and invoke it from the form.](#create-a-server-action-and-invoke-it-from-the-form)
  * [Inside the Server Action, extract the data from the formData object.](#inside-the-server-action-extract-the-data-from-the-formdata-object)
  * [Validate and prepare the data to be inserted into your database.](#validate-and-prepare-the-data-to-be-inserted-into-your-database)
  * [Insert the data and handle any errors.](#insert-the-data-and-handle-any-errors)
  * [Revalidate the cache and redirect the user back to invoices page.](#revalidate-the-cache-and-redirect-the-user-back-to-invoices-page)
- [Single button forms](#single-button-forms)
- [Validation](#validation)
- [Client-side validation](#client-side-validation)
- [Server-side validation](#server-side-validation)
- [Resetting form fields](#resetting-form-fields)
- [Adding toast messages](#adding-toast-messages)
- [Disabling submit buttons with useFormState](#disabling-submit-buttons-with-useformstate)
- [Actions can be called outside of forms](#actions-can-be-called-outside-of-forms)
- [Headers](#headers)
- [Resources](#resources)

<!-- tocstop -->

## Intro to server actions

> Server Functions called as an action on forms or form elements.

[Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) are an alpha feature in Next.js, built on top of [React Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions#actions). React Server Actions allow you to run asynchronous code directly on the server. They eliminate the need to create API endpoints to mutate your data. Instead, you write asynchronous functions that execute on the server and can be invoked from your Client or Server Components.

## Using server actions

In React, you can use the action attribute in the `<form>` element to invoke actions. The action will automatically receive the native `FormData` object, containing the captured data.

app/actions.js

```javascript
'use server'

export async function addItem(formData: FormData) {
  // extract raw data from FormData
  // validate and prepare data for db
  // send data to db and handle any errors
  // revalidate cache with revalidatePath or revalidateTag
  // redirect to page
}
```

app/add-to-cart.js

```javascript
'use client'
 
import { addItem } from './actions.js';
 
// Server Action being called inside a Client Component
export default function AddToCart({ productId }) {
  return (
    <form action={addItem}>
      <button type="submit">Add to Cart</button>
    </form>
  );
}
```

In addition to invoking with the `action` prop on a `<form>`, you can also invoke with the `formAction` prop on elements such as `button`, `input type="submit"`, and `input type="image"`. This is useful in cases where you want to call multiple server actions within a form. For example, you can create a specific `<button>` element for saving a post draft in addition to publishing it.

```javascript
'use client'

import { addItem, addImage } from './actions.js';
 
export default function AddToCart({ productId }) {
  return (
    <form action={addItem}>
      <input type="image" formAction={addImage} />
      <button type="submit">Add to Cart</button>
    </form>
  );
}
```
Server Actions can be defined in two places:

- Inside the component that uses it (**Server Components only**)
- In a separate 'server-only' file. You can define multiple Server Actions in a single file and both client and server components can import and use them.

Server Actions became a stable feature in Next.js 14, and are enabled by default. By default, the maximum size of the request body sent to a Server Action is 1MB. This prevents large amounts of data being sent to the server, which consumes a lot of server resource to parse. However, you can configure this limit in `next.config.js`.

```js
module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}
```

## Implementation process  

1. Create a form to capture the user's input.
1. Create a Server Action and invoke it from the form.
1. Inside the Server Action, extract the data from the formData object.
1. Validate and prepare the data to be inserted into your database.
1. Insert the data and handle any errors.
1. Revalidate the cache and redirect the user back to a page.

### Create a form to capture the user's input.

```tsx
export default function Form({ customers }: FormProps) {
  return (
    <form>
      {/* Customer Name */}
      <label htmlFor="customer">Choose customer</label>
      <select id="customer" name="customerId" defaultValue="">
        <option value="" disabled>Select a customer</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>{customer.name}</option>
        ))}
      </select>

      {/* Invoice Amount */}
      <label htmlFor="amount">Choose an amount</label>
      <input
        id="amount"
        name="amount"
        type="number"
        step="0.01"
        placeholder="Enter USD amount"
      />

      {/* Invoice Status */}
      <fieldset>
        <legend>Set the invoice status</legend>
        <input id="pending" name="status" type="radio" value="pending"/>
        <label htmlFor="pending">Pending</label>
        <input id="paid" name="status" type="radio" value="paid" />
        <label htmlFor="paid">Paid</label>
      </fieldset>

      <Button type="submit">Create Invoice</Button>
    </form>
  );
}
```

### Create a Server Action and invoke it from the form.

app/_lib/actions.ts:

```ts
'use server';

export async function createInvoice(formData: FormData) {
  // ...
}
```

Form component:

```tsx
// ...
import { createInvoice } from '@/app/lib/actions';

export default function Form({ customers }: FormProps) {
  return (
    <form action={createInvoice}>
    // ...
```

> In HTML, you'd normally pass a URL to the action attribute. This URL would be the destination where your form data should be submitted (usually an API endpoint). However, in React, the action attribute is considered a special prop - meaning React builds on top of it to allow actions to be invoked. Behind the scenes, Server Actions create a POST API endpoint. This is why you don't need to create API endpoints manually when using Server Actions. [source](https://nextjs.org/learn/dashboard-app/mutating-data)

If you need to pass an argument along with to the server action, they say to use `bind`. This will ensure that any values passed to the server action are encoded. 

```tsx
// ...
import { updateInvoice } from '@/app/lib/actions';
 
export default function EditInvoiceForm({ invoice }: { invoice: InvoiceForm }) {
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
 
  return (
    <form action={updateInvoiceWithId}>
      // ...
    </form>
  );
}
```

The action:

```ts
export async function updateInvoice(id: string, formData: FormData) {
  // ...
}
```

### Inside the Server Action, extract the data from the formData object.

There are [a few different methods](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) for extracting data from `FormData`. Here we'll use `get(name)`:

```ts
'use server';
 
export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
}
```

> Tip: If you're working with forms that have many fields, you may want to consider using the entries() method with JavaScript's Object.fromEntries(). 
> For example: `const rawFormData = Object.fromEntries(formData.entries())`

### Validate and prepare the data to be inserted into your database.

To handle type validation, you can manually validate types or use a type validation library which can save you time and effort. For your example, [Zod](https://zod.dev/), a TypeScript-first validation library.

In your `actions.ts` file, import Zod and define a schema that matches the shape of your form object. This schema will validate the formData before saving it to a database.

```ts
'use server';

import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  // ...
```

The `amount` field is specifically set to coerce (change) from a string to a number while also validating its type.

You can then pass your `rawFormData` to `CreateInvoice` to validate the types:

```ts
export async function createInvoice(formData: FormData) {
  const rawFormData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  };
  const { customerId, amount, status } = CreateInvoice.parse(rawFormData);
}
```

If the validation fails it will raise a `ZodError` with details on what field failed. We should also be doing validation on our forms. See the [Validation](#validation) section below.

It's usually good practice to store monetary values in cents in your database to eliminate JavaScript floating-point errors and ensure greater accuracy. We might then also add a field like the date. We could also write the rawFormData object directly as the args to `CreateInvoice.parse()` since that variable won't be used anywhere else:

```ts
export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
}
```

### Insert the data and handle any errors.

```ts
'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';

// ...

export async function createInvoice(formData: FormData) {
  // ...
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    return { message: 'Database Error: Failed to Create Invoice.', };
  }
}
```

Note that this is safeguarded against SQL injection. When you use a tagged template literal for SQL queries (`sql` in this case), the library prepares the query by treating the variables (`${customerId}`, `${amountInCents}`, `${status}`, `${date}`) as parameters rather than part of the SQL command itself. This separation ensures that the inputs are not executed as SQL code, regardless of their content, effectively mitigating the risk of SQL injection.

An `error.tsx` file can be used to define a UI boundary for a route segment (`app/dashboard/invoices/error.tsx`). It serves as a catch-all for unexpected errors and allows you to display a fallback UI.

Another way you can handle errors gracefully is by using the `notFound` function. While `error.tsx` is useful for catching all errors, `notFound` can be used when you try to fetch a resource that doesn't exist.

For example, in a page that edits an invoice:

```tsx
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';
// ...

export default async function Page({ params }: PageProps ) {
  const id = params.id;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    // ...
  );
}
```

Then we create a `not-found.tsx` for that specific route segment (`app/dashboard/invoices/[id]/edit/not-found.tsx`):

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="">
      <h2 className="">404 Not Found</h2>
      <p>Could not find the requested invoice.</p>
      <Link href="/dashboard/invoices">Go Back</Link>
    </main>
  );
}
```

`notFound` will take precedence over error.tsx, so you can reach out for it when you want to handle more specific errors!

TODO: Add example using something other than `@vercel/postrgres`?

### Revalidate the cache and redirect the user back to invoices page.

> Next.js has a Client-side Router Cache that stores the route segments in the user's browser for a time. Along with prefetching, this cache ensures that users can quickly navigate between routes while reducing the number of requests made to the server. Since you're updating the data displayed in the invoices route, you want to clear this cache and trigger a new request to the server. You can do this with the revalidatePath function from Next.js [source](https://nextjs.org/learn/dashboard-app/mutating-data#6-revalidate-and-redirect)


```ts
'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ...

export async function createInvoice(formData: FormData) {
  // ...
  try {
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    return { message: 'Database Error: Failed to Create Invoice.', };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
```

## Single button forms

While this may be obvious, it's good to note that if you have a single button that needs to do something like delete an item, to get access to server actions, wrap that one button in a form:

```tsx
import { deleteInvoice } from '@/app/lib/actions';
 
// ...
 
export function DeleteInvoice({ id }: { id: string }) {
  const deleteInvoiceWithId = deleteInvoice.bind(null, id);
 
  return (
    <form action={deleteInvoiceWithId}>
      <button className="">
        <span className="sr-only">Delete</span>
        <TrashIcon className="" />
      </button>
    </form>
  );
}
```

## Validation 

Validating form input can be done on the client or the server.

## Client-side validation 

There are a couple of ways you can validate forms on the client. The simplest would be to rely on the form validation provided by the browser, using html attributes:

attribute | description
--------- | -----------
`required` | Specifies form field that must be filled in before the form can be submitted
`minlength`, `maxlength` | Specifies the minimum and maximum length for text inputs (strings)
`min`, `max` | Specifies the minimum and maximum values of number inputs
`type` | Specifies whether the data needs to be a specific type (`button`, `checkbox`, `color`, `data`, `datetime-local`, `email`, `file`, `hidden`, `image`, `month`, `number`, `password`, `radio`, `range`, `reset`, `search`, `submit`, `tel`, `text`, `time`, `url`, `week`)
`pattern` | Specifies a regular expression that defines a pattern the entered data needs to follow

When an element is valid, the following things are true:

- The element matches the `:valid` CSS pseudo-class, which lets you apply a specific style to valid elements.
- If the user tries to send the data, the browser will submit the form, provided there is nothing else stopping it from doing so.

When an element is invalid, the following things are true:

- The element matches the `:invalid` CSS pseudo-class, and sometimes other UI pseudo-classes (e.g., `:out-of-range`) depending on the error, which lets you apply a specific style to invalid elements.
- If the user tries to send the data, the browser will block the form and display an error message.

Another way to implement client-side validation would be to write your own JavaScript. See [Validating forms using JavaScript](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#validating_forms_using_javascript).

## Server-side validation

By validating forms on the server, you can:

- Reduce the risk of malicious users bypassing client-side validation.
- Have one source of truth for what is considered valid data.

In your form component, import the `useFormState` hook from react-dom. Since `useFormState` is a hook, you will need to turn your form into a client component:

```tsx
'use client';
// ...
import { useFormState } from 'react-dom';
 
export default function Form({ customers }: { customers: CustomerField[] }) {
  const [state, dispatch] = useFormState(createInvoice, initialState);
 
  return <form action={dispatch}>...</form>;
}
```

The `useFormState` hook takes two arguments: `(action, initialState)`, and returns two values: `[state, dispatch]` - similar to [useReducer](https://react.dev/reference/react/useReducer).

Pass your action (`createInvoice`) as the first arg of `useFormState`, and pass the `dispatch` to the form action attribute `<form action={}>`.

The `initialState` can be anything you define. In this case, create an object with two empty keys: `message` and `errors`.

```tsx
export default function Form({ customers }: { customers: CustomerField[] }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createInvoice, initialState);

  // ...
}
```

In your `action.ts` file, you can use [Zod](https://zod.dev/) to validate the form data. Update your FormSchema as follows:

```ts
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
```

- `customerId` - Zod let's add a message if the user doesn't select a customer.
- `amount` - Since we are coercing the amount type from string to number, it'll default to zero if the string is empty. You can tell Zod we always want the amount greater than 0 with the `.gt()` function.
- `status` - Zod already throws an error if the status field is empty as it expects "pending" or "paid". We'll just add a message if the user doesn't select a status.

Next, update your action to accept two parameters:

```ts
// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(PrevState: State, formData: FormData) {
  // ...
}
```

`prevState` contains the state passed from the `useFormState` hook. We won't be using it in this example, but it's a required prop.

Next, change the Zod `parse()` function to `safeParse()`. This will return an object containing either a `success` or `error` field. This will help handle validation more gracefully without having put this logic inside the try/catch block. If the parse is successful, we can then get our individual fields from `.data`:

```ts
export async function createInvoice(formData: FormData) {
  // Validate form fields with Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // ...
}
```

To display the errors in your form component:

```tsx
<select
  id="customer"
  name="customerId"
  aria-describedby="customer-error"
>
...
</select>

<div id="customer-error" aria-live="polite" aria-atomic="true">
  {state.errors?.customerId &&
    state.errors.customerId.map((error: string) => (
      <p className="" key={error}>
        {error}
      </p>
    ))}
</div>
```

`aria-describedby="customer-error"`: This establishes a relationship between the select element and the error message container. Screen readers will read this description when the user interacts with the select box to notify them of errors.

`aria-live="polite"`: The screen reader should politely notify the user when the error inside the div is updated. When the content changes (e.g. when a user corrects an error), the screen reader will announce these changes, but only when the user is idle so as not to interrupt them.

`aria-atomic="true"`: present the entire changed region as a whole, including the author-defined label if one exists.

To print the messages `console.log` the `state` inside your component to check the structure of the object. For example, when there are no errors:

```console
{ message: null, errors: {} }
```

When the form is submitted with empty fields:

```console
{
  errors: {
    customerId: [ 'Please select a customer.' ],
    amount: [ 'Please enter an amount greater than $0.' ],
    status: [ 'Please select an invoice status.' ]
  },
  message: 'Missing Fields. Failed to Create Invoice.'
}
```

## Resetting form fields

One approach is seen in [Robin's progressive enhancement solution](https://www.robinwieruch.de/next-forms/):

First, I need to update the `PrevState` type to include a couple more fields: `status` and `timestamp`. I also decided to call this `FormState` instead of just `State`:

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

We also need to make sure the `initialState` passed to `useFormState` has the same fields:

```ts
export const initialFormState: FormState = {
  status: 'UNSET' as const,
  message: '',
  errors: {},
  timestamp: Date.now(),
};
```

I also modified all the actions to make sure they always return this type of object. Note I've switched to `node-postgres` here:

```ts
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

Then we make a form reset hook:

```ts
import { useRef, useEffect } from 'react';
import type { FormState } from '@/app/_lib/definitions';

const useFormReset = (formState: FormState) => {
  const formRef = useRef<HTMLFormElement>(null);
  const prevTimestamp = useRef(formState.timestamp);

  useEffect(() => {
    if (!formRef.current) return;
    if (formState.status === 'SUCCESS' && formState.timestamp !== prevTimestamp.current) {
      formRef.current.reset();
      prevTimestamp.current = formState.timestamp;
    }
  }, [formState.status, formState.timestamp]);

  return formRef;
};

export { useFormReset };
```

Then in the form, we call the hook and pass the result to the form `ref`:

```tsx
'use client';

import { useFormState } from 'react-dom';
import { initialFormState } from '@/app/_lib/utils';
import { addItem } from '@/app/_lib/actions';
import { useFormReset } from '@/app/_hooks/useFormReset';

function ItemAdd() {
  const [state, dispatch] = useFormState(addItem, initialFormState);
  const formRef = useFormReset(state);

  return (
    <div className='ItemAdd'>
      <form ref={formRef} action={dispatch}>
      // ...
```

I used the same pattern in a case were instead of clearing the form on a successful submit, I wanted to update state:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { useFormState } from 'react-dom';
import { initialFormState } from '@/app/_lib/utils';
import { updateItem } from '@/app/_lib/actions';
import type { Item } from '@/app/_lib/definitions';

type Props = {
  item: Item;
  editItem: (id: null) => void; // <- updates state
};

function ItemEdit({ item, editItem }: Props) {
  // Bind in order to pass args to the server action
  const updateItemWithId = updateItem.bind(null, item.id);
  const [state, dispatch] = useFormState(updateItemWithId, initialFormState);

  const formRef = useRef<HTMLFormElement>(null);
  const prevTimestamp = useRef(state.timestamp);

  useEffect(() => {
    if (!formRef.current) return;
    if (state.status === 'SUCCESS' && state.timestamp !== prevTimestamp.current) {
      editItem(null);
      prevTimestamp.current = state.timestamp;
    }
  }, [state.status, state.timestamp, editItem]);


  return (
    <div className='ItemEdit'>
      <form action={dispatch} ref={formRef}>
      // ...
```

An alternate approach altogether can be found in [github issue #58448](https://github.com/vercel/next.js/discussions/58448#discussioncomment-9110468). This feels more straightforward in that it uses React's key trick as described in [jsx.md#keys-identify-components-as-being-unique](jsx.md#keys-identify-components-as-being-unique). The react docs mention this technique in [Resetting the form with a key](https://react.dev/learn/preserving-and-resetting-state#resetting-a-form-with-a-key) and in [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes).

```tsx
"use client";

import { useFormState } from "react-dom";
import { addPost } from "./actions";

export default function Home() {
  const [state, action] = useFormState(addPost, { error: null });

  return (
    <main>
      <form action={action} key={state?.resetKey}>
        <input type="text" placeholder="Title" name="title" />
        <button>Submit</button>
      </form>
    </main>
  );
}
```

Server action:

```ts
"use server";

import { redirect } from "next/navigation";

export const addPost = (prevState, formData: FormData) => {
  const title = formData.get("title")?.toString();
  if (!title) {
    return {
      resetKey: prevState.resetKey,
      error: "Title is required",
    };
  }
  
  const post = createPost(title);

  return {
    error: null,
    data: post,
    resetKey: post.id,
  };
};

function createPost(title: string) {
  return {
    id: Date.now(),
    title,
  };
}
```

## Adding toast messages 

In addition to displaying field `errors` using Zod's schema parsing, we can also show the general `message` to the user, for example when something was successfully created, deleted, updated or when something went wrong.

```ts
export type FormState = {
  status: 'UNSET' | 'SUCCESS' | 'ERROR';
  message: string;  // Display with toast
  errors: {
    name?: string[]; 
    quantity?: string[];
  };
  timestamp: number;
};
```

Install:

```bash 
npm install react-hot-toast
```

Create a new component which will be used as a provider for the toast messages:

```tsx
'use client';

import { Toaster } from 'react-hot-toast';

type Props = {
  children: React.ReactNode;
};

export default function ToastProvider({children}: Props) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
```

> There may be the question about why we didn't use the <Toaster> directly in the RootLayout. The reason is that the Toaster is a third-party component from a library which is not declared as client component (yet) within the library but should be declared as client component in this new paradigm of RSCs, because it makes use of React's useContext Hook. Hence we created our own wrapper component Provider for it, where we declared the component as client component, and thus all child components of it become automatically client components too. [Source](https://www.robinwieruch.de/next-forms/)

Add the new Provider to the `RootLayout`:

```tsx
// ...

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${main_font.variable} ${mono_font.variable} ${alt_font.variable}`}>
      <body>
        <Navbar />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
```

Use React's useEffect Hook to show the toast message where the status determines whether the message is a styled success or error message. We also use a the timestamp to make sure the hook runs again, even when the message hasn't changed. Put this in a reusable hook:

```tsx
import { useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FormState } from '@/app/_lib/definitions';

const useToastMessage = (formState: FormState) => {
  const prevTimestamp = useRef(formState.timestamp);
  const showToast = formState.message && formState.timestamp !== prevTimestamp.current;

  useEffect(() => {
    if (showToast) {
      if (formState.status === 'ERROR') {
        toast.error(formState.message);
      } else {
        toast.success(formState.message);
      }

      prevTimestamp.current = formState.timestamp;
    }
  }, [formState, showToast]);
};

export { useToastMessage };
```

Use the new custom hook in the form component and provide it with the form state:

```tsx
'use client';
// ...
import { useToastMessage } from '@/app/_hooks/useToastMessage';


function ItemAdd() {
  const [state, dispatch] = useFormState(addItem, initialFormState);
  // Toast hook will display general state.message from our server actions
  useToastMessage(state);

  // ...
```

## Disabling submit buttons with useFormState

TODO...

## Actions can be called outside of forms

Imagine I have item components that contain their own delete button that calls a server action that deletes the given item from the database, then revalidates the path, updating the UI.

```ts
export async function deleteItem(id: number): Promise<FormState> {
  const values = [id];
  try {
    await pool.query(`DELETE FROM items WHERE id = $1;`, values);
    revalidatePath('/');
    return {
      status: 'SUCCESS' as const,
      message: 'Item deleted.',
      errors: {},
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      status: 'ERROR' as const,
      message: 'Database Error. Failed to Delete Item.',
      errors: {},
      timestamp: Date.now(),
    };
  }
}
```

This works great until I decide I want to display the returned message on successful delete. The problem is that on `revalidatePath` the form and is associated `useFormSatus` no longer exist to receive the message and call `toast.success`. The solution here is to call the server action in a parent component, and pass the handler down to the item component:

```tsx
'use client';
// ...
import { deleteItem } from "@/app/_lib/actions";
import { toast } from 'react-hot-toast';

// ...

export default function ItemList({ items }: Props) {
  // ...
  const removeItem = async (id: number) => {
    const res = await deleteItem(id);
    if (res.status === 'SUCCESS') {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className='ItemList'>
      <p>Items:</p>
      {items.map((item) => {
        const isEditable = item.id === editableItemId;

        return (
          <div key={item.id} className='ItemList__item'>
            {isEditable ? (
              <ItemEdit item={item} editItem={editItem} />
            ) : (
              <ItemView item={item} editItem={editItem} deleteItem={removeItem} />
            )}
          </div>
        );
      })}
      <ItemAdd />
    </div>
  );
}
```

Then in my item component:

```tsx
'use client';

import { formatDateToLocal } from '@/app/_lib/utils';
import { DeleteButton, EditButton } from '@/app/_ui/ItemButtons';
import type { Item } from '@/app/_lib/definitions';

type Props = {
  item: Item;
  editItem: (id: number) => void;
  deleteItem: (id: number) => void;
  // children: React.ReactElement;
};

function ItemView({ item, editItem, deleteItem }: Props) {

  const handleEditItem = () => {
    editItem(item.id);
  };

  const handleDeleteItem = () => {
    deleteItem(item.id);
  }

  return (
    <div className='ItemView' style={{ display: 'inline-flex', alignItems: 'baseline', gap: '10px' }}>
      <span>
        {item.name}, qty: {item.quantity}, date added: {formatDateToLocal(item.date)}
      </span>
      <EditButton onClick={handleEditItem} />
      <DeleteButton onClick={handleDeleteItem} />
    </div>
  );
}

export default ItemView;
```

## Headers

You can read incoming request headers such as cookies and headers within a Server Action.

```javascript
'use server'

import { cookies } from 'next/headers';
 
export async function addItem(data) {
  const cartId = cookies().get('cartId')?.value;
}
```

You can also modify cookies inside a server action:

```javascript
'use server'

import { cookies } from 'next/headers';

export async function create(data) {

  const cart = await createCart():
  cookies().set('cartId', cart.id)
  // or
  cookies().set({
    name: 'cartId',
    value: cart.id,
    httpOnly: true,
    path: '/'
  })
}
```

## Resources 

- [Exploring Next.js Forms with Server Actions - Robin Wieruch](https://www.robinwieruch.de/next-forms/)
