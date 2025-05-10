# Next.js 15 after

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)

<!-- tocstop -->

# Introduction

[`after`](https://nextjs.org/docs/app/api-reference/functions/after) allows you to schedule work to be executed after a response (or prerender) is finished. This is useful for tasks and other side effects that should not block the response, such as logging and analytics.

It can be used in Server Components, Server Actions, Route Handlers, and Middleware.

The function accepts a callback that will be executed after the response (or prerender) is finished:

```tsx
import { after } from 'next/server'
// Custom logging function
import { log } from '@/app/utils'
 
export default function Layout({ children }: { children: React.ReactNode }) {
  after(() => {
    // Execute after the layout is rendered and sent to the user
    log()
  })
  return <>{children}</>
}
```