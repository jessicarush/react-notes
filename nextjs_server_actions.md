# Server actions

## Table of Contents

<!-- toc -->

- [Intro to server actions (experimental)](#intro-to-server-actions-experimental)
  * [Validation](#validation)
  * [Headers](#headers)
  * [Server Mutations](#server-mutations)

<!-- tocstop -->

## Intro to server actions (experimental)

> Server Functions called as an action on forms or form elements.

[Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) are an alpha feature in Next.js, built on top of [React Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions#actions). They enable server-side data mutations, reduced client-side JavaScript, and progressively enhanced forms.

app/actions.js

```javascript
'use server'

export async function addItem(data) {
  const cartId = cookies().get('cartId')?.value;
  await saveToDb({ cartId, data });
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

In addition to invoking with the `action` prop on a `<form>`, you can also invoke with the `formAction` prop to on elements such as `button`, `input type="submit"`, and `input type="image"`:

```javascript
 
import { addItem, addImage } from './actions.js';
 
// Server Action being called inside a Client Component
export default function AddToCart({ productId }) {
  return (
    <form action={addItem}>
      <input type="image" formAction={addImage} />
      <button type="submit">Add to Cart</button>
    </form>
  );
}
```

You can also do [custom invocation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions#custom-invocation-using-starttransition) with `startTransition`: Invoke Server Actions without using `action` or `formAction` by using `startTransition`.

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

- Inside the component that uses it (Server Components only)
- In a separate file (Client and Server Components), for reusability. You can define multiple Server Actions in a single file.


### Validation 

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


### Headers

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


### Server Mutations

> Server Actions that mutates your data and calls redirect, revalidatePath, or revalidateTag.

Have not been able to find good examples of this.