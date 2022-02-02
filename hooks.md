# Hooks in function components

- [Introduction to hooks](https://reactjs.org/docs/hooks-intro.html)
- [Built-in hooks](https://reactjs.org/docs/hooks-reference.html)
- [Rules for hooks](https://reactjs.org/docs/hooks-rules.html)
- [State hooks](https://reactjs.org/docs/hooks-state.html)


## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Rules](#rules)

<!-- tocstop -->

## Introduction

In React, there are basic built-in hooks:

- `useState` for creating stateful values as previously done with `this.state`
- `useEffect` for replicating lifecycle behavior
- `useContext` for creating common data that can be accessed throughout the component hierarchy without passing the props down manually to each level

Additional built-in hooks:

- `useReducer`
- `useCallback`
- `useMemo`
- `useRef`
- `useImperativeHandle`
- `useLayoutEffect`
- `useDebugValue`


## Rules

1. Only call Hooks at the top level. Don’t call Hooks inside loops, conditions, or nested functions.

> Don’t call Hooks inside loops, conditions, or nested functions. Instead, always use Hooks at the top level of your React function, before any early returns. By following this rule, you ensure that Hooks are called in the same order each time a component renders. That’s what allows React to correctly preserve the state of Hooks between multiple useState and useEffect calls.

2. Only call Hooks from React function components. Don’t call Hooks from regular JavaScript functions.

> Call Hooks from React function components or call Hooks from custom Hooks. By following this rule, you ensure that all stateful logic in a component is clearly visible from its source code.


## useState

See my notes [state_with_hooks.md](state_with_hooks.md) and [Using the State Hook](https://reactjs.org/docs/hooks-state.html) (React docs).

## useEffect

The [Effect Hook](https://reactjs.org/docs/hooks-effect.html) lets you perform *side effects* in function components. For example:

```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

### used for componentDidMount

In class components, you have the componentDidMount lifecycle method, where you can run code after everything has mounted. With react hooks, you can use `useEffect()` to accomplish the same thing. For example:

```javascript
import React, { useState, useEffect } from 'react';

useEffect(() => {
  console.log('I have been mounted')
}, [])
```

### used for setState callbacks

In class components you can optionally pass a callback to run after the state has been updated with `this.setState`. With react hooks, you can use `useEffect()` to accomplish the same thing. For example:

```javascript
const [counter, setCounter] = useState(0);

const doSomething = () => {
  setCounter(123);
}

useEffect(() => {
   console.log('Do something after counter has changed', counter);
}, [counter]);
```


## useContext

TODO


## Building your own hooks

Building your own Hooks lets you extract component logic into reusable functions.

This simple example creates a toggle hook that will toggle a boolean state value. Good practice is to create your custom hools in separate files in a `hooks` directory. It's also customary to name your hooh `use...` to follow React's built-in hooks.


```javascript
import { useState } from 'react';

function useToggle(initialValue=false) {
  // Set up state with initial value
  const [state, setState] = useState(initialValue);
  // Create a function that sets the value to something else
  // In this case, a toggle between true/false
  const toggleState = () => {
    setState(!state);
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


For more see the [React docs on building your own hooks](https://reactjs.org/docs/hooks-custom.html).
