# Hooks in function components

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Rules](#rules)
- [useState](#usestate)
- [useContext](#usecontext)
- [useEffect](#useeffect)
- [useEffectEvent](#useeffectevent)
- [useRef](#useref)
- [useImperativeHandle](#useimperativehandle)
- [useReducer](#usereducer)
- [useCallback](#usecallback)
- [useMemo](#usememo)
- [useLayoutEffect](#uselayouteffect)
- [useDebugValue](#usedebugvalue)
- [useId](#useid)
- [useTransition and useDeferredValue](#usetransition-and-usedeferredvalue)
- [useSyncExternalStore](#usesyncexternalstore)
- [Custom hooks](#custom-hooks)
  * [Custom hook example: localStorage](#custom-hook-example-localstorage)
- [Docs references](#docs-references)

<!-- tocstop -->

## Introduction

In React, there are basic [built-in hooks](https://react.dev/reference/react):

- `useState` for creating stateful values as previously done with `this.state`
- `useContext` for creating common data that can be accessed throughout the component hierarchy without passing the props down manually to each level
- `useEffect` for replicating lifecycle behavior or synchronizing a component with an external system
- `useEffectEvent` *experimental* to extract non-reactive logic out of your Effect
- `useRef` lets you reference a value that’s not needed for rendering
- `useImperativeHandle` lets you customize the handle exposed as a ref
- `useReducer` lets you add a reducer to your component
- `useCallback` for caching a function definition between re-renders
- `useMemo` lets you cache the result of a calculation between re-renders
- `useLayoutEffect` is a version of useEffect that fires before the browser repaints the screen
- `useDebugValue` lets you add a label to a custom Hook in React DevTools
- `useId` for generating unique IDs that can be passed to accessibility attributes
- `useTransition` lets you update the state without blocking the UI
- `useDeferredValue` lets you defer updating a part of the UI
- `useSyncExternalStore` lets you subscribe to an external store

And some that are intended for library/framework maintainers:

- `useInsertionEffect`


## Rules

1. Only call Hooks at the top level. Don’t call Hooks inside loops, conditions, or nested functions.

> Don’t call Hooks inside loops, conditions, or nested functions. Instead, always use Hooks at the top level of your React function, before any early returns. By following this rule, you ensure that Hooks are called in the same order each time a component renders. That’s what allows React to correctly preserve the state of Hooks between multiple useState and useEffect calls.

2. Only call Hooks from React function components. Don’t call Hooks from regular JavaScript functions.

> Call Hooks from React function components or call Hooks from custom Hooks. By following this rule, you ensure that all stateful logic in a component is clearly visible from its source code.


## useState

The [useState](https://react.dev/reference/react/useState) hook returns a stateful value, and a function to update it. See my notes in [state_with_hooks.md](state_with_hooks.md) and [Managing State](https://react.dev/learn/managing-state) in the React docs.


## useContext

Context provides a way to pass data through the component tree without having to pass props down manually at every level. See my notes in [context.md](context.md), [reducer_and_context.md](reducer_and_context.md) and the [useContext api reference](https://react.dev/reference/react/useContext).


## useEffect

The [Effect Hook](https://react.dev/reference/react/useEffect) lets you perform *side effects* in function components. Effects let you run some code **after rendering** and can be used to synchronize your component with a system outside of React. See my notes in [effects.md](effects.md) and [Escape Hatches](https://react.dev/learn/escape-hatches) in the React docs.


## useEffectEvent

The [useEffectEvent](https://react.dev/reference/react/experimental_useEffectEvent) is a new (experimental) hook to extract non-reactive logic out of your Effect. See [effects.md](effects.md).


## useRef 

[useRef](https://react.dev/reference/react/useRef) is used when:

1. You want a component to “remember” some information that doesn't trigger re-renders
2. You want to manipulate a DOM element

`useRef` returns a mutable ref object whose `.current` property is initialized to the passed argument (initialValue). The returned object will persist for the full lifetime of the component.

Essentially, `useRef` is like a “box” that can hold a value in its `.current` property and is handy for keeping any mutable value around. `useRef` doesn’t notify you when its content changes... mutating the `.current` property doesn’t cause a re-render. This is why it's useful in the `useEffect` examples above where we need to set a flag to keep track of renders and updates. In fact, if you try to assign a value to a normal variable inside `useEffect`:

> Assignments to the 'didMount' variable from inside React Hook useEffect will be lost after each render. To preserve the value over time, store it in a useRef Hook and keep the mutable value in the '.current' property. Otherwise, you can move this variable directly inside useEffect.

By using a ref, you ensure that:

- You can store information between re-renders (unlike regular variables, which reset on every render).
- Changing it does not trigger a re-render (unlike state variables, which trigger a re-render).
- The information is local to each copy of your component (unlike the variables outside, which are shared).

Since changing a ref does not trigger a re-render, they are not appropriate for storing information that you want to display on the screen. Use state for that instead. 

Note: Do not read or write `ref.current` during rendering. For example: 

```javascript
function MyComponent() {
  // ...
  // ❌ Don't write a ref during rendering
  myRef.current = 123;
  // ...
  // ❌ Don't read a ref during rendering
  return <h1>{myOtherRef.current}</h1>;
}
```

You can read or write refs from event handlers or effects instead:

```javascript
function MyComponent() {
  // ...
  useEffect(() => {
    // ✅ You can read or write refs in effects
    myRef.current = 123;
  });
  // ...
  function handleClick() {
    // ✅ You can read or write refs in event handlers
    doSomething(myOtherRef.current);
  }
  // ...
}
```

If you have to read or write something during rendering, use state instead.

> useRef is most commonly used when accessing React DOM elements. For example, if you’re trying to access an input element after it’s been mounted to the DOM, instead of using the traditional document.getElementById or any other document method to access to element (like you would in vanilla JS), you can use a useRef hook. [Source](https://medium.com/swlh/all-about-the-react-useref-hook-with-a-real-world-example-5500f2c805e)


```javascript
import React from "react";

const Form = (props) => {
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    console.log(inputRef.current);
    inputRef.current.focus();
    inputRef.current.scrollIntoView();
  }, []);

  return (
    <form>
      <input 
        type="text"
        placeholder="Enter Name" 
        name="name" 
        ref={inputRef} />
    </form>
  );
};

export default Form;
```

Note that a ref can be passed to a browser element using the `ref` attribute. However, if you try to pass a ref to your own component, it will not work. You need to use `.forwardRef` to pass the ref into the component then apply the ref to a browser element within. See [transitions.md](transitions.md) for an example.

In a nutshell:

```javascript
<MyInput ref={inputRef} />
```

MyInput:

```javascript
const MyInput = forwardRef((props, ref) => {
  return <input {...props} ref={ref} />;
});
```

For an example of refs used to hold data not required for rendering, here's a debounced button demo using useRef:

```javascript
import { useState, useRef } from 'react';

function DebouncedButton({ onClick, children }) {
  const timeoutID = useRef(null);

  return (
    <button onClick={() => {
      clearTimeout(timeoutID.current);
      timeoutID.current = setTimeout(() => {
        onClick();
      }, 1000);
    }}>
      {children}
    </button>
  );
}

function Demo() {
  return (
    <>
      <DebouncedButton
        onClick={() => alert('Spaceship launched!')}
      >
        Launch the spaceship
      </DebouncedButton>
      <DebouncedButton
        onClick={() => alert('Soup boiled!')}
      >
        Boil the soup
      </DebouncedButton>
    </>
  )
}

export default Demo;
```

While we're on the topic, here's a throttle example:

```javascript
import { useState, useRef } from 'react';

function ThrottledButton({ onClick, children }) {
  const lastCallTime = useRef(0);

  return (
    <button onClick={() => {
      const now = Date.now();
      if (now - lastCallTime.current >= 1000) {
        onClick();
        lastCallTime.current = now;
      }
    }}>
      {children}
    </button>
  );
}

function Demo() {
  return (
    <>
      <ThrottledButton
        onClick={() => alert('Soup boiled!')}
      >
        Boil the soup
      </ThrottledButton>
    </>
  )
}

export default Demo;
```


> Refs are an escape hatch. You should only use them when you have to “step outside React”. Common examples of this include managing focus, scroll position, measuring or calling browser APIs that React does not expose. [Source](https://react.dev/learn/manipulating-the-dom-with-refs#best-practices-for-dom-manipulation-with-refs)

When to use refs:

- Storing timeout IDs
- Storing and manipulating DOM elements
- Storing other objects that aren’t necessary to calculate the JSX.

See also:

- [Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs)
- [Manipulating the DOM with refs](https://react.dev/learn/escape-hatches#manipulating-the-dom-with-refs)
- [How to manage a list of refs using a ref callback](https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback)
- examples/useref_timeout_demo 
- examples/useref_scrollintoview_demo


## useImperativeHandle

[useImperativeHandle](https://react.dev/reference/react/useImperativeHandle) is a React Hook that lets you customize the handle exposed as a ref. See [Exposing a subset of the API with an imperative handle](https://react.dev/learn/manipulating-the-dom-with-refs#exposing-a-subset-of-the-api-with-an-imperative-handle).


## useReducer

[useReducer](https://react.dev/reference/react/useReducer) is an alternative to useState and is usually preferable when you have complex state logic that involves multiple sub-values or when the next state depends on the previous one. 

See:

- [useReducer.md](useReducer.md)
- [reducer_and_context.md](reducer_and_context.md)


## useCallback

Call [useCallback](https://react.dev/reference/react/useCallback#usecallback) at the top level of your component to cache a function definition between re-renders (until its dependencies change). It should only be used as a performance optimization.

```javascript
const cachedFn = useCallback(fn, dependencies);
```

In JavaScript, a `function () {}` or `() => {}` always creates a different function, similar to how the `{}` object literal always creates a new object. Normally, this wouldn’t be a problem, but it means that if the function is passed to a child component, its props will never be the same, and if you're trying to do a memo optimization, it won’t work. This is where `useCallback` comes in handy.

By wrapping a function in `useCallback`, you ensure that it’s the same function between the re-renders (until dependencies change). You don’t have to wrap a function in `useCallback` unless you do it for some specific reason. 

Caching a function with `useCallback` is only valuable in a few cases:

- You pass it as a prop to a component wrapped in memo. You want to skip re-rendering if the value hasn’t changed. Memoization lets your component re-render only if dependencies changed.
- The function you’re passing is later used as a dependency of some Hook. For example, another function wrapped in `useCallback` depends on it, or you depend on this function from useEffect.

There is no benefit to wrapping a function in `useCallback` in other cases. There is no significant harm to doing that either, so some teams choose to not think about individual cases, and memoize as much as possible. The downside is that code becomes less readable. Also, not all memoization is effective: a single value that’s “always new” is enough to break memoization for an entire component.

For example:

```javascript
'use client'

import { useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Modal.module.css';


function Modal({ children }) {
  const overlay = useRef();
  const router = useRouter();

  const closeModal = useCallback(() => {
    router.back();
  }, [router]);
  // const closeModal = () => {
  //   router.back();
  // };

  const onClick = useCallback((e) => {
    if (e.target === overlay.current) closeModal();
  }, [closeModal, overlay]);
  // const onClick = (e) => {
  //   if (e.target === overlay.current) closeModal();
  // };

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') closeModal();
  }, [closeModal]);
  // const onKeyDown = (e) => {
  //   if (e.key === 'Escape') closeModal();
  // };

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <div className={styles.wrapper} ref={overlay} onClick={onClick}>
      <div className={styles.content}>
        {children}
        <button className={styles.close} onClick={closeModal}>close</button>
      </div>
    </div>
  );
};

export default Modal;
```

## useMemo

`useMemo` is a hook that lets you cache the result of a calculation between re-renders.

```javascript
const cachedValue = useMemo(calculateValue, dependencies);
```

For example:

```javascript
function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');
  // ✅ This is absolutely fine if getFilteredTodos() is not slow.
  const visibleTodos = getFilteredTodos(todos, filter);
  // ...
}
```

Usually, this code is fine! In general, unless you’re creating or looping over thousands of objects, it’s probably not expensive. But if `getFilteredTodos()` is slow or you have a lot of todos. In that case you don’t want to recalculate `getFilteredTodos()` if some unrelated state variable like newTodo has changed.

You can cache (or “memoize”) an expensive calculation by wrapping it in a `useMemo` hook:

```javascript
import { useMemo, useState } from 'react';

function TodoList({ todos, filter }) {
  const [newTodo, setNewTodo] = useState('');
  const visibleTodos = useMemo(() => {
    // ✅ Does not re-run unless todos or filter change
    return getFilteredTodos(todos, filter);
  }, [todos, filter]);
  // ...
}
```


## useLayoutEffect

[useLayoutEffect](https://react.dev/reference/react/useLayoutEffect) can hurt performance. Prefer `useEffect` when possible.


## useDebugValue

TODO...


## useId 

New to React 18, [useId](https://react.dev/reference/react/useId) is a hook for generating unique IDs on both the client and server. For example:

```jsx
function Checkbox() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Do you like React?</label>
      <input id={id} type="checkbox" name="react"/>
    </>
  );
};
```

For multiple IDs in the same component, append a suffix using the same id:

```jsx
function NameFields() {
  const id = useId();
  return (
    <div>
      <label htmlFor={id + '-firstName'}>First Name</label>
      <div>
        <input id={id + '-firstName'} type="text" />
      </div>
      <label htmlFor={id + '-lastName'}>Last Name</label>
      <div>
        <input id={id + '-lastName'} type="text" />
      </div>
    </div>
  );
}
```

For some reason they are making sure to note this:

> useId is not for generating keys in a list. Keys should be generated from your data.

I'm not sure why they would say this given the examples they show in the docs. If you can use it to create and id for a piece of data, why would you not then use that id for a key?

Also:

> :warning: useId generates a string that includes the : token. This helps ensure that the token is unique, but is not supported in CSS selectors or APIs like querySelectorAll.


## useTransition and useDeferredValue

See [concurrent_features.md](concurrent_features.md) for `useTransition` and `useDeferredValue`.


## useSyncExternalStore

`useSyncExternalStore` is a hook that's specifically designed for subscribing to an external store/value. Most components will only read data from props, state, and context. However, sometimes a component needs to read some data from some store outside of React that changes over time. This includes:

- Third-party state management libraries that hold state outside of React.
- Browser APIs that expose a mutable value and events to subscribe to its changes.

```
useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
```

`subscribe`: A function that takes a single callback argument and subscribes it to the store. When the store changes, it should invoke the provided callback. This will cause the component to re-render. The subscribe function should return a function that cleans up the subscription.

`getSnapshot`: A function that returns a snapshot of the data in the store that’s needed by the component. While the store has not changed, repeated calls to getSnapshot must return the same value. If the store changes and the returned value is different (as compared by Object.is), React re-renders the component.

**optional** `getServerSnapshot`: A function that returns the initial snapshot of the data in the store. It will be used only during server rendering and during hydration of server-rendered content on the client. The server snapshot must be the same between the client and the server, and is usually serialized and passed from the server to the client. If you omit this argument, rendering the component on the server will throw an error.

Call useSyncExternalStore at the top level of your component to read a value from an external data store. It returns the snapshot of the data in the store.

This example uses `useSyncExternalStore` to create a custom hook.

```javascript
import { useSyncExternalStore } from 'react';

/**
 * useOnlineStatus.js
 *
 * - A custom hook that checks if network is online.
 * - For example:
 *   const isOnline = useOnlineStatus();
 *   // ...
 *   <p>Network status: { isOnline ? 'online' : 'offline' }</p>
 *
 * @returns {boolean} indicating if network is online
 */
function useOnlineStatus(initialValue=false) {
  return useSyncExternalStore(
    subscribe, // React won't resubscribe for as long as you pass the same function
    getSnapshot, // How to get the value on the client
    getServerSnapshot // How to get the value on the server (for the initial render)
  );
}

function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export default useOnlineStatus;
```


## Custom hooks

Building your own Hooks lets you extract component logic into reusable functions.

- Custom Hooks let you share stateful logic, not state itself.
- Hook names must start with use followed by a capital letter, like `useState` (built-in) or `useLocalStorage`. Hooks may return arbitrary values.
- Keep your custom Hooks focused on concrete high-level use cases.

The following example creates a toggle hook that will toggle a boolean state value. Good practice is to create your custom hooks in separate files in a `hooks` directory. It's also customary to name your hook `use...` to follow React's built-in hooks.


```javascript
import { useState } from 'react';

function useToggle(initialValue=false) {
  // Set up state with initial value
  const [state, setState] = useState(initialValue);
  // Create a function that sets the value to something else
  // In this case, a toggle between true/false
  const toggleState = () => {
    setState(s => !s);
  };
  // return the state value and the function that changes it
  return [state, toggleState];
}

export default useToggle;
```

To use the custom hook, import it and use it like you would `useState`:

```javascript
import useToggle from './hooks/useToggle';

function Demo() {
  const [mode, toggleMode] = useToggle(true);
  const [display, toggleDisplay] = useToggle(false);

  return (
    <div>
      <p onClick={toggleMode}>{mode ? 'light': 'dark'}</p>
      <p onClick={toggleDisplay}>{display ? 'open': 'closed'}</p>
    </div>

  )
}

export default Demo;
```

### Custom hook example: localStorage

The following custom hook will automatically update localStorage whenever a state value changes. When initializing the state value, it will check first to see if there is a local storage item.

```javascript
import { useState, useEffect } from 'react';

function useLocalStorage(key, defaultValue) {
  const [state, setState] = useState(() => {
    // Check if anything exists in localStorage, if not, use defaultValue
    let value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  });

  // update localStorage when state changes
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);
  // return state value and a function to update it
  return [state, setState];
}

export default useLocalStorage;
```

In use: 

```javascript
import useLocalStorage from './hooks/useLocalStorage';;

function Demo() {
  const [format, setFormat] = useLocalStorage('format', 'hex');
  const [colors, setColors] = useLocalStorage('colors', ['red', 'green', 'blue']);

  return (
    <div>
      <p>{colors}</p>
      <p>{format}</p>
      <button onClick={() => setFormat('rgb')}>change format</button>
    </div>
  )
}

export default Demo;
```

For another example of custom hooks, see the form handling example in [state_with_hooks.md](https://github.com/jessicarush/react-notes/blob/master/state_with_hooks.md#custom-hook-for-forms).


## Docs references

- [Built-in React Hooks](https://react.dev/reference/react)
- [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
