# Next.js 15 updates

- [What's new in Next.js 15](https://nextjs.org/blog/next-15)
- [What's new in React 19](https://react.dev/blog/2024/04/25/react-19)
- [Next.js 15 upgrade guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)

## Table of contents

<!-- toc -->

- [@next/codemod](#nextcodemod)
- [`useFormState` has been replaced by `useActionState`](#useformstate-has-been-replaced-by-useactionstate)
- [`useFormStatus` now includes additional keys](#useformstatus-now-includes-additional-keys)
- [`ssr: false` not allowed in sever components](#ssr-false-not-allowed-in-sever-components)
- [Always use controlled inputs with `useActionState`](#always-use-controlled-inputs-with-useactionstate)
- [TypeScript: server actions should only return a Promise if using `useActionState`](#typescript-server-actions-should-only-return-a-promise-if-using-useactionstate)
- [Async request APIs](#async-request-apis)
- [`fetch` requests are no longer cached by default](#fetch-requests-are-no-longer-cached-by-default)
- [`GET` functions in route handlers are no longer cached by default](#get-functions-in-route-handlers-are-no-longer-cached-by-default)
- [Turbopack](#turbopack)
- [Instrumentation.js|ts](#instrumentationjsts)
- [`Form` component](#form-component)

<!-- tocstop -->

## @next/codemod 

A CLI that helps upgrade to the latest Next.js and React versions. Codemods (automated code transformations) are included with every major Next.js release to help automate upgrading breaking changes.

```bash
npx @next/codemod@canary upgrade latest
```

The CLI will update your dependencies, show available codemods, and guide you through applying them. The `canary` tag uses the latest version of the codemod while the `latest` specifies the Next.js version. Add `--dry` to do a dry-run, no code will be edited

Read more about the [codemod CLI](https://nextjs.org/docs/app/building-your-application/upgrading/codemods).

## `useFormState` has been replaced by `useActionState`

The `useFormState` hook is still available in React 19, but it is deprecated and will be removed in a future release. [useActionState](https://react.dev/reference/react/useActionState) is recommended and includes additional properties like reading the `pending` state directly.

See [hooks.md](hooks.md).

> Note: I have noticed that with the Next.js 15 update, when error messages are passed to the component, the input fields are re-rendered to an empty state. This means we have to use controlled inputs in order to retain the user's input when there is a validation error.

## `useFormStatus` now includes additional keys 

These include: `data`, `method`, and `action`. Prior to React 19, only the `pending` key was available. See the [useFormStatus reference](https://react.dev/reference/react-dom/hooks/useFormStatus).

```ts
const { pending, data, method, action } = useFormStatus();
```

- `pending`: A boolean. If `true`, this means the parent `<form>` is pending submission. Otherwise, `false`.
- `data`: An object implementing the [FormData interface](https://developer.mozilla.org/en-US/docs/Web/API/FormData) that contains the data the parent `<form>` is submitting. If there is no active submission or no parent `<form>`, it will be `null`.
- `method`: A string value of either 'get' or 'post'. This represents whether the parent `<form>` is submitting with either a GET or POST HTTP method. By default, a `<form>` will use the GET method and can be specified by the method property.
- `action`: A reference to the function passed to the action prop on the parent `<form>`. If there is no parent `<form>`, the property is `null`. If there is a URI value provided to the action prop, or no action prop specified, status.action will be `null`.

For example:

```tsx
export const SubmitButton = (props: SubmitButtonProps) => {
  const { pending, data, method, action } = useFormStatus();

  console.log(`
    pending: ${pending}
    data: ${data ? JSON.stringify(Array.from(data.entries())) : data}
    method: ${method}
    action: ${action}
    `);

  return (
    <button type='submit' className={className} disabled={pending}>
      {props.children}
    </button>
  );
};
```

## Use controlled inputs with `useActionState`

Discovered that with this update, native browser managed `input` elements are now resetting to a blank fields when there are validation errors. To fix this, you have two options:

1. Use controlled inputs

2. Pass the `rawFormData` back to the client via the `useActionState` response object and set that data on the field using the `defaultValue` attribute. However, there is an issue here. We have to update the `ActionState` type with the new return formData. The trouble is the `formData` is typed to be `string` or `undefined`. The `defaultValue` attribute can accept `string` or `undefined`. But the `formData.get()` in the `rawFormData` gives us `FormDataEntryValue` | `null`. This requires a helper function to convert the `rawFormData` before passing back to the client. After all this is feels like any less work than controlled inputs.

See leerob's [Forms with React 19 and Next.js](https://www.youtube.com/watch?v=KhO4VjaYSXU&t=261s). He doesn't address the TypeScript issue.

## `Form` component

The new `<Form>` component extends the HTML `<form>` element with prefetching, client-side navigation, and progressive enhancement.

It is useful for forms that navigate to a new page, such as a search form that leads to a results page.

```tsx
import Form from 'next/form';
 
export default function Page() {
  return (
    <Form action="/search">
      <input name="query" />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

The `<Form>` component comes with:

- Prefetching: When the form is in view, the layout and loading UI are prefetched, making navigation fast.
- Client-side Navigation: On submission, shared layouts and client-side state are preserved.
- Progressive Enhancement: If JavaScript hasn't loaded yet, the form still works via full-page navigation

See the documentation for [`<Form>`](https://nextjs.org/docs/app/api-reference/components/form).

## TypeScript: server actions should only return a Promise if using `useActionState`

Discovered with this update, you will now get a Typescript error on a `<form>` using a server action if that action returns an object and that object is not being consumed by the form via the `useActionState` mechanism. This was the case with a `logout` action which was using the same return pattern for consistency but technically didn't need to use `useActionState`. Fixed by using a `redirect` instead of returning a state object and removed the return type `Promise<FormState>`. 

## Async request APIs 

To enable optimizations such as server components rendering before a request happens, APIs that rely on request-specific data are now asynchronous. These include:

- `cookies`
- `headers`
- `draftMode`
- `params` in `layout.js`, `page.js`, `route.js`, `default.js`, `generateMetadata`, and `generateViewport`
- `searchParams` in `page.js`

For example:

```ts
import { cookies } from 'next/headers';
 
export async function AdminPanel() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  // ...
}
```

and params:

```tsx
interface PageProps {
  params: Promise<{ token: string }>;
};

export default async function PasswordResetPage(props: PageProps) {
  const params = await props.params;
  // ...
```

See more [examples in the upgrade guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15#async-request-apis-breaking-change).

## `fetch` requests are no longer cached by default

See [fetch requests in the upgrade guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15#fetch-requests).

To opt specific fetch requests into caching, you can pass the `cache: 'force-cache'` option.

```tsx
export default async function RootLayout() {
  const a = await fetch('https://...') // Not Cached
  const b = await fetch('https://...', { cache: 'force-cache' }) // Cached
 
  // ...
}
```

## `GET` functions in route handlers are no longer cached by default

To opt `GET` methods into caching, you can use a route config option such as `export const dynamic = 'force-static'` in your Route Handler file.


## `ssr: false` not allowed in sever components

Error: `ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a client component.

```tsx
// https://nextjs.org/docs/messages/react-hydration-error
const ThemeToggle = dynamic(() => import('./theme-toggle'), {
  ssr: false,
  loading: () => <ThemeToggleSkeleton size='medium' />
});
```

## Turbopack 

When creating a new project with `npx create-next-app@latest` you will now be given the option to use Turbopack instead of webpack.

```bash
# ...
✔ Would you like to use Turbopack for next dev? No / Yes
```

Read [more about Turbopack here](https://nextjs.org/blog/turbopack-for-development-stable).

## Instrumentation.js|ts

[instrumentation.js|ts](https://nextjs.org/blog/next-15#instrumentationjs-stable) is now stable and the `experimental.instrumentationHook` config option can be removed. The instrumentation file, with the `register()` API, allows users to tap into the Next.js server lifecycle to monitor performance, track the source of errors, and deeply integrate with observability libraries like [OpenTelemetry](https://opentelemetry.io/).

See [instrumentation.md](instrumentation.md).
