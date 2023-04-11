# Hooks in function components

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Rules](#rules)
- [useState](#usestate)
- [useContext](#usecontext)
- [useEffect](#useeffect)
  * [UseEffect API example](#useeffect-api-example)
  * [used with a loading indicator](#used-with-a-loading-indicator)
  * [Add a cleanup function if needed](#add-a-cleanup-function-if-needed)
  * [Common Effect patterns](#common-effect-patterns)
    + [Controlling non-React widgets](#controlling-non-react-widgets)
    + [Subscribing to events](#subscribing-to-events)
    + [Triggering animations](#triggering-animations)
    + [Fetching data](#fetching-data)
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

The [Effect Hook](https://react.dev/reference/react/useEffect) lets you perform *side effects* in function components. Effects let you run some code **after rendering** and can be used to synchronize your component with a system outside of React.

> Effects let you specify side effects that are caused by rendering itself, rather than by a particular event. Imagine a ChatRoom component. Sending a message in the chat is an event because it is directly caused by the user clicking a specific button. However, setting up a server connection is an Effect because it should happen no matter which interaction caused the component to appear. Effects run at the end of a commit (to the DOM) after the screen updates. This is a good time to synchronize the React components with some external system (like network or a third-party library).

If comparing to class component lifecycle methods, you can think of `useEffect` as `componentDidMount`, `componentDidUpdate` and `componentWillUnmount` combined.

See also:

- [You might not need an Effect](https://react.dev/learn/you-might-not-need-an-effect)  
- [Robin Wieruch's post on useEffect](https://www.robinwieruch.de/react-useeffect-hook/)  
- [life_cycle_methods.md](https://github.com/jessicarush/react-notes/blob/master/life_cycle_methods.md#lifecycle-methods-in-function-components)  

For example:

```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    console.log('I will run every time the component mounts or updates');
  });

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}
```

Note that it's the lack of an optional second argument passed to `useEffect` that causes it to run on every update. If you only wanted code to run on the initial mount, pass an empty array as the second argument.

```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount:
  useEffect(() => {
    console.log('I will run once when the component first mounts');
  }, []);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}
```

We can also tell `useEffect` run whenever a specific state value is updated:

```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('I will run when the component mounts and whenever count updates');
  }, [count]);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}
```

Using another hook, `useRef`, we can run only on updates (skipping the initial mount):

```javascript
import React, { useEffect, useState, useRef } from 'react';

function Example(props) {
  const [count, setCount] = useState(0);
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      console.log('I will run only when count updates');
    } else {
      didMount.current = true;
    }
  }, [count]);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}
```

Finally, you could run only on the very first update:

```javascript
function Example(props) {
  const [count, setCount] = useState(0);
  const didMount = useRef(false);
  const updatedOnce = useRef(false);

  useEffect(() => {
    if (updatedOnce.current) {
      return
    } else if (didMount.current) {
      console.log('I will run only when count updates the first time');
      updatedOnce.current = true;
    } else {
      didMount.current = true;
    }
  }, [count]);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}
```

### UseEffect API example

A one-time api call:

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function Demo() {
  const [zen, setZen] = useState('');

  // Similar to componentDidMount
  useEffect(() => {
    console.log('I will run once when the component is first rendered.');
    axios.get("https://api.github.com/zen").then(response => {
      setZen(response.data);
    });
  }, []);

  return (
    <div className="Demo">
      <p>{zen}</p>
    </div>
  );
}

export default Demo;
```

Note that in the above example, if I didn't pass the empty array argument, the `setZen()` function would create and endless looping trigger of `useEffect` because, without that second arg, it gets called anytime there's an update, in this case to a state value.

If you want to use **async/await**, you need to define a function inside `useEffect`:

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function Demo() {
  const [zen, setZen] = useState('');

  useEffect(() => {
    console.log('I will run once when the component is first rendered.');
    async function getZen() {
      let response = await axios.get('https://api.github.com/zen');
      setZen(response.data);
    }
    getZen();
  }, []);

  return (
    <div className="Demo">
      <p>{zen}</p>
    </div>
  );
}

export default Demo;
```

To be thorough... here's with the **try/catch** included:

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function Demo() {
  const [zen, setZen] = useState('');

  useEffect(() => {
    console.log('I will run once when the component is first rendered.');
    async function getZen() {
      try {
        let response = await axios.get('https://api.github.com/zen');
        setZen(response.data);
      } catch (err) {
        console.log(`something went wrong: ${err}`);
      }
    }
    getZen();
  }, []);

  return (
    <div className="Demo">
      <p>{zen}</p>
    </div>
  );
}

export default Demo;
```

### used with a loading indicator

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Demo() {
  const [zen, setZen] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // componentDidMount
  useEffect(() => {
    async function getZen() {
      setIsLoading(true);
      try {
        let response = await axios.get('https://api.github.com/zen');
        setZen(response.data);
      } catch (err) {
        console.log(`something went wrong: ${err}`);
      }
      setIsLoading(false);
    }
    getZen();
  }, []);

  return (
    <div className="Demo">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <p>{zen}</p>
      )}
    </div>
  );
}

export default Demo;
```

### Add a cleanup function if needed

> Some Effects need to specify how to stop, undo, or clean up whatever they were doing. For example, “connect” needs “disconnect”, “subscribe” needs “unsubscribe”, and “fetch” needs either “cancel” or “ignore”. [Source](https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed)

Consider a ChatRoom component that needs to connect to the chat server when it appears.

```javascript
useEffect(() => {
  const connection = createConnection();
  connection.connect();
}, []);
```

Imagine the ChatRoom component is a part of a larger app with many different screens. If the user navigates to another screen then comes back to teh ChatRoom, it will create a second connection, since the first was never destroyed. As the user navigates across the app, the connections would keep piling up. Bugs like this are easy to miss without extensive manual testing. To help you spot them quickly, in development React remounts every component once immediately after its initial mount.

To fix the issue, return a cleanup function from your Effect:

```javascript
useEffect(() => {
  const connection = createConnection();
  connection.connect();
  return () => {
    connection.disconnect();
  };
  }, []);
```

React will call your cleanup function each time before the Effect runs again, and one final time when the component unmounts (gets removed). 

### Common Effect patterns 

#### Controlling non-React widgets 

Sometimes you need to add UI widgets that aren’t written to React.

```javascript
useEffect(() => {
  const map = mapRef.current;
  map.setZoomLevel(zoomLevel);
}, [zoomLevel]);
```

Note that there is no cleanup needed in this case. In development, React will call the Effect twice, but this is not a problem because calling setZoomLevel twice with the same value does not do anything.

Some APIs may not allow you to call them twice in a row. For example, the `showModal` method of the built-in `<dialog>` element throws if you call it twice. Implement the cleanup function and make it close the dialog:

```javascript
useEffect(() => {
  const dialog = dialogRef.current;
  dialog.showModal();
  return () => dialog.close();
}, []);
```

#### Subscribing to events 

If your Effect subscribes to something, the cleanup function should unsubscribe:

```javascript
useEffect(() => {
  function handleScroll(e) {
    console.log(window.scrollX, window.scrollY);
  }
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

In development, your Effect will call `addEventListener()`, then immediately `removeEventListener()`, and then `addEventListener()` again with the same handler. So there would be only one active subscription (handler) at a time.

#### Triggering animations 

If your Effect animates something in, the cleanup function should reset the animation to the initial values:

```javascript
useEffect(() => {
  const node = ref.current;
  node.style.opacity = 1; // Trigger the animation
  return () => {
    node.style.opacity = 0; // Reset to the initial value
  };
}, []);
```

#### Fetching data

If your Effect fetches something, the cleanup function should either abort the fetch or ignore its result:

```javascript
useEffect(() => {
  let ignore = false;

  async function startFetching() {
    const json = await fetchTodos(userId);
    if (!ignore) {
      setTodos(json);
    }
  }

  startFetching();

  return () => {
    ignore = true;
  };
}, [userId]);
```

Here's an example of the [AbortController API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) implemented through [axios](https://axios-http.com/docs/cancellation).

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function GithubZen(props) {
  const [zen, setZen] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const controller = new AbortController(); // create a controller

    async function getZen() {
      console.log('fetching...');
      const config = { signal: controller.signal } // pass config to axios.get()
      try {
        let response = await axios.get('https://api.github.com/zen', config);
        setZen(response.data);
      } catch (err) {
        console.log(`Something went wrong: ${err}`);
      }
      setIsLoading(false);
    }
    getZen();

    // Return a "cleanup" function that cancels the fetch call.
    return () => {
      console.log('aborting...');
      controller.abort() // Abort fetch!
    }
  }, []);

  return (
    <div>
      { isLoading ? 'loading...' : zen }
    </div>
  );
}

export default GithubZen;
```

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

TODO...

## useMemo

TODO...


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

TODO...

## Custom hooks

Building your own Hooks lets you extract component logic into reusable functions.

This simple example creates a toggle hook that will toggle a boolean state value. Good practice is to create your custom hooks in separate files in a `hooks` directory. It's also customary to name your hook `use...` to follow React's built-in hooks.


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

This custom hook will automatically update localStorage whenever a state value changes. When initializing the state value, it will check first to see if there is a local storage item.

```javascript
import { useState, useEffect, useRef } from 'react';

function useLocalStorage(key, defaultValue) {
  const itemKey = useRef(key);
  const [state, setState] = useState(() => {
    // Check if anything exists in localStorage, if not, use defaultValue
    let value = window.localStorage.getItem(itemKey);
    return value ? JSON.parse(value) : defaultValue;
  });

  // update localStorage when state changes
  useEffect(() => {
    window.localStorage.setItem(itemKey, JSON.stringify(state));
  }, [state]);
  // return state value and a function to update it
  return [state, setState];
}

export default useLocalStorage;
```

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
