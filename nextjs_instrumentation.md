# Instrumentation.js|ts 

The instrumentation file, with the `register()` API, allows users to tap into the Next.js server lifecycle to monitor performance, track the source of errors, and deeply integrate with observability libraries like [OpenTelemetry](https://opentelemetry.io/). To use it, place the file in the root of your application or inside the `src` folder if using one.

As of Next.js 15 this feature is stable. See [Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation) in the docs.


## Table of Contents

<!-- toc -->

- [register](#register)
- [onRequestError](#onrequesterror)

<!-- tocstop -->

## register

The file exports a `register` function that is called once when a new Next.js server instance is initiated. `register` can be an async function.

```ts
export async function register() {
  console.log('Instrumentation: running');

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('Instrumentation: running in node');

    const { db } = await import('./app/_lib/database');

    if (process.env.NEXT_MANUAL_SIG_HANDLE) {
      process.on('SIGTERM', async () => {
        console.log('Received SIGTERM: cleaning up')
        // Perform your cleanup tasks here
        await db.destroy();
        process.exit(0)
      })
      process.on('SIGINT', async () => {
        console.log('Received SIGINT: cleaning up')
        // Perform your cleanup tasks here
        await db.destroy();
        process.exit(0)
      })
    }
  }
}
```

## onRequestError

Next.js has added a new `onRequestError` hook that can be used to:

- Capture important context about all errors thrown on the server, including:
  - Router: Pages Router or App Router
  - Server context: Server Component, Server Action, Route Handler, or Middleware
- Report the errors to your favorite observability provider.


```ts
export async function onRequestError(err, request, context) {
  await fetch('https://...', {
    method: 'POST',
    body: JSON.stringify({ message: err.message, request, context }),
    headers: { 'Content-Type': 'application/json' },
  });
}
 
export async function register() {
  // init your favorite observability provider SDK
}
```

