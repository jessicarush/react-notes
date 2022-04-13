# React Suspense Features

**New to React 18**

Server rendering is an important performance optimization for React apps that let's users see content faster. Suspense on the server allows you to show critical content first and let slower components pop in as content becomes available. Basically, parts of the app can be served asynchronously.


## Table of Contents

<!-- toc -->

- [Backstory](#backstory)
- [Suspense Component](#suspense-component)
- [Suspense with Transitions](#suspense-with-transitions)
- [Links](#links)

<!-- tocstop -->

## Backstory

To understand the usefulness of these 'Suspense on the server' features, we need to be clear on the stages from page request to interacting in a React app.

Fetch Data => Render as HTML => Load JavaScript => Hydrate

> In web development, hydration is a technique in which client-side JavaScript converts a static HTML web page, delivered either through static hosting or server-side rendering, into a dynamic web page by attaching event handlers to the HTML elements. Because the HTML is pre-rendered on a server, this allows for a fast "first contentful paint" (when useful data is first displayed to the user), but there is a period of time afterward where the page appears to be fully loaded and interactive, but is not until the client-side JavaScript is executed and event handlers have been attached. [Source](https://en.wikipedia.org/wiki/Hydration_(web_development))

In a nutshell:

- You need to fetch everything before you can show anything.
- You need to load everything before you can hydrate anything. 
- You need to hydrate everything before you can interact with anything.

If you have a component that involves expensive API requests for large amount of data, this can slow down every stage of the process and result in a blank white screen before your app loads. 

As of React 18, we can break up the work so that different components go through this process asynchronously.

<Navbar>  Fetch Data => Render as HTML => Load JavaScript => Hydrate
<Sidebar> Fetch Data => Render as HTML => Load JavaScript => Hydrate
<Posts>   Fetch Data => Render as HTML => Load JavaScript => Hydrate

This all happens automatically when you wrap a component in `Suspense`. 


## Suspense Component

The Suspense component allows us to specify what we want our users to see until another component is ready. It looks like this:

```jsx
<Suspense fallback={<Spinner />}>
  <SlowDataComponent />
</Suspense>
```

You can have as many components wrapped in Suspense as you want. Components not wrapped in Suspense will render, load and hydrate all in one pass as usual. For example:

```jsx 
<Layout>

  <Navbar />

  <Suspense fallback={<Skeleton />}>
    <Sidebar />
  </Suspense>

  <Suspense fallback={<Spinner />}>
    <Posts />
  </Suspense>

  <Footer />

</Layout>
```

## Suspense with Transitions 

> Suspense in React 18 works best when combined with the transition API. If you suspend during a transition, React will prevent already-visible content from being replaced by a fallback. Instead, React will delay the render until enough data has loaded to prevent a bad loading state.

In other words: 

For content that is already shown to the user, switching back to a loading indicator can be disorienting. It is sometimes better to keep showing the old content while the new content is being prepared. To do this, we can use the new transition APIs (startTransition and useTransition) to mark updates as transitions and avoid unexpected fallbacks.

Consider this tab switcher:

```jsx
function handleClick() {
  setTab('comments');
}

<Suspense fallback={<Spinner />}>
  {tab === 'photos' ? <Photos /> : <Comments />}
</Suspense>
```

In this example, if the tab gets set to from 'photos' to 'comments', but Comments suspends, the user will see a spinner. This makes sense because Comments is not ready to render anything, and React has no choice but to show the Spinner above.

However, sometimes this user experience is not desirable. This is a good example of how sometimes better to show the "old" UI while the new UI is being prepared. You can use the new startTransition API to make React do this:

```jsx
function handleClick() {
  startTransition(() => {
    setTab('comments');
  });
}
```

Here, you tell React that setting tab to 'comments' is not an "urgent" update, but is a "transition" that may take some time. React will then keep the old UI in place and interactive, and will switch to showing <Comments /> when it is ready.

## Links 

<https://github.com/reactjs/rfcs/blob/main/text/0213-suspense-in-react-18.md>