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
- [Validation](#validation)
- [Headers](#headers)
- [Server Mutations](#server-mutations)

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

In addition to invoking with the `action` prop on a `<form>`, you can also invoke with the `formAction` prop on elements such as `button`, `input type="submit"`, and `input type="image"`:

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

For now you can enable Server Actions in your Next.js project by enabling the experimental serverActions flag.

next.config.js

```
module.exports = {
  experimental: {
    serverActions: true,
  },
}
```

By default, the maximum size of the request body sent to a Server Action is 1MB. This prevents large amounts of data being sent to the server, which consumes a lot of server resource to parse. However, you can configure this limit using the experimental serverActionsBodySizeLimit option.

```
module.exports = {
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: '2mb',
  },
}
```

Server Actions can be defined in two places:

- Inside the component that uses it (**Server Components only**)
- In a separate 'server-only' file. You can define multiple Server Actions in a single file and both client and server components can import and use them.


## Implementation process  

1. Create a form to capture the user's input.
1. Create a Server Action and invoke it from the form.
1. Inside the Server Action, extract the data from the formData object.
1. Validate and prepare the data to be inserted into your database.
1. Insert the data and handle any errors.
1. Revalidate the cache and redirect the user back to invoices page.



### Create a form to capture the user's input.

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

You can then pass your rawFormData to CreateInvoice to validate the types:

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
### Revalidate the cache and redirect the user back to invoices page.


## Validation 

Data passed to a Server Action can be validated or sanitized before invoking the action. For example, you can create a wrapper function that receives the action as its argument, and returns a function that invokes the action if it's valid.

app/actions.js

```javascript
'use server'
 
import { withValidate } from 'lib/form-validation';
 
export const action = withValidate((data) => {
  // ...
});
```

lib/form-validation.js

```javascript
export function withValidate(action) {
  return async (formData) => {
    'use server'
 
    const isValidData = verifyData(formData);
 
    if (!isValidData) {
      throw new Error('Invalid input.')
    }
 
    const data = process(formData);
    return action(data);
  }
}
```


## Headers

You can read incoming request headers such as cookies and headers within a Server Action.

```javascript
'use server'

import { cookies } from 'next/headers';
 
export async function addItem(data) {
  const cartId = cookies().get('cartId')?.value;
  await saveToDb({ cartId, data });
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


## Server Mutations

> Server Actions that mutates your data and calls redirect, revalidatePath, or revalidateTag.

Have not been able to find good examples of this.