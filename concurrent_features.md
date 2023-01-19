# Concurrent Features API 

**New to React 18**

Some new APIs in React let you mark some state updates as non-urgent in order to improve performance, and keep the browser responsive.

- startTransition()
- useTransition()
- useDeferredValue()

You can use startTransition to navigate between screens without blocking user input. Or useDeferredValue to throttle expensive re-renders.

> Transitions are a new concurrent feature introduced in React 18. They allow you to mark updates as transitions, which tells React that they can be interrupted and avoid going back to Suspense fallbacks for already visible content. [Source](https://reactjs.org/docs/react-api.html#transitions)

Note that last piece of information will make more sense if you review [suspense_component.md](suspense_component.md).

> However, long term, we expect the main way you’ll add concurrency to your app is by using a concurrent-enabled library or framework. In most cases, you won’t interact with concurrent APIs directly. For example, instead of developers calling startTransition whenever they navigate to a new screen, router libraries will automatically wrap navigations in startTransition. [Source](https://reactjs.org/blog/2022/03/29/react-v18.html#gradually-adopting-concurrent-features)

## Table of Contents

<!-- toc -->

- [Transitions](#transitions)
- [useDeferredValue](#usedeferredvalue)

<!-- tocstop -->

## Transitions 

A transition is a new concept in React to distinguish between urgent and non-urgent updates.

- Urgent updates reflect direct interaction, like typing, clicking, pressing, and so on.
- Transition updates transition the UI from one view to another.

For example, when you select a filter in a dropdown, you expect the filter button itself to respond immediately when you click. However, the actual results may transition separately. Typically, for the best user experience, a single user input should result in both an urgent update and a non-urgent one. 


```jsx
import { startTransition } from 'react';

// Urgent: Show what was typed
setInputValue(input);

// Mark any state updates inside as transitions
startTransition(() => {
  // Transition: Show the results
  setSearchQuery(input);
});
```

Updates wrapped in startTransition are handled as non-urgent and will be interrupted if more urgent updates like clicks or key presses come in. If a transition gets interrupted by the user (for example, by typing multiple characters in a row), React will throw out the stale rendering work that wasn’t finished and render only the latest update.

There are two transition APIs:

- useTransition() hook to start transitions, including a value to track the pending state.
- startTransition() method to start transitions when the hook cannot be used.

The example from the React API docs is pretty uninspired. I can't quite see what benefit it provides here and not sure how or when I would apply this.

```jsx
import React, { useState, useTransition } from 'react';
import Spinner from './Spinner';

function DemoTransitions() {
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(0);

  const handleClick = () => {
    startTransition(() => {
      setCount(c => c + 1);
    });
  };

  return (
    <div>
      <p>Transition Content</p>
      <button onClick={handleClick}>{count}</button>
      {isPending && <Spinner />}
    </div>
  );
}

export default DemoTransitions;
```

Hopefully in time, there will be better, more practical demos out there.

In summary:

- Updates in a transition yield to more urgent updates such as clicks.
- Updates in a transitions will not show a fallback for re-suspended content, allowing the user to continue interacting while rendering the update.

See also: [suspense_component.md](suspense_component.md)

## useDeferredValue

> useDeferredValue lets you defer re-rendering a non-urgent part of the tree. It is similar to debouncing, but has a few advantages compared to it. There is no fixed time delay, so React will attempt the deferred render right after the first render is reflected on the screen. The deferred render is interruptible and doesn’t block user input. [Source](https://reactjs.org/blog/2022/03/29/react-v18.html#usedeferredvalue)

> useDeferredValue accepts a value and returns a new copy of the value that will defer to more urgent updates. If the current render is the result of an urgent update, like user input, React will return the previous value and then render the new value after the urgent render has completed. [Source](https://reactjs.org/docs/hooks-reference.html#usedeferredvalue)

In simpler terms `useDeferredValue` only kicks in when/if the computer is slow. 

```jsx
const [items, setItems] = React.useState(defaultItems);
const deferredItems = React.useDeferredValue(items);
```