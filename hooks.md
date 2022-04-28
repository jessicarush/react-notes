# Hooks in function components

- [Introduction to hooks](https://reactjs.org/docs/hooks-intro.html)
- [Built-in hooks](https://reactjs.org/docs/hooks-reference.html)
- [Rules for hooks](https://reactjs.org/docs/hooks-rules.html)
- [State hooks](https://reactjs.org/docs/hooks-state.html)


## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Rules](#rules)
- [useState](#usestate)
- [useContext](#usecontext)
- [useEffect](#useeffect)
  * [used for setState callbacks](#used-for-setstate-callbacks)
- [useLayoutEffect](#uselayouteffect)
- [useId](#useid)
- [Custom hooks](#custom-hooks)
  * [Custom hook example: localStorage](#custom-hook-example-localstorage)

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
- `useId`
- `useTransition`
- `useDeferredValue`

See [concurrent_features.md](concurrent_features.md) for `useTransition` and `useDeferredValue`.


## Rules

1. Only call Hooks at the top level. Don’t call Hooks inside loops, conditions, or nested functions.

> Don’t call Hooks inside loops, conditions, or nested functions. Instead, always use Hooks at the top level of your React function, before any early returns. By following this rule, you ensure that Hooks are called in the same order each time a component renders. That’s what allows React to correctly preserve the state of Hooks between multiple useState and useEffect calls.

2. Only call Hooks from React function components. Don’t call Hooks from regular JavaScript functions.

> Call Hooks from React function components or call Hooks from custom Hooks. By following this rule, you ensure that all stateful logic in a component is clearly visible from its source code.


## useState

The `useState` hook returns a stateful value, and a function to update it. See my notes [state_with_hooks.md](state_with_hooks.md) and [Using the State Hook](https://reactjs.org/docs/hooks-state.html) (React docs).


## useContext

Context provides a way to pass data through the component tree without having to pass props down manually at every level. See my notes in [context.md](context.md) and the [Hook API Reference](https://reactjs.org/docs/hooks-reference.html#usecontext) (React docs).


## useEffect

The [Effect Hook](https://reactjs.org/docs/hooks-effect.html) lets you perform *side effects* in function components. If comparing to class component lifecycle methods, you can think of `useEffect` as `componentDidMount`, `componentDidUpdate` and `componentWillUnmount` combined.

See also: [life_cycle_methods.md](https://github.com/jessicarush/react-notes/blob/master/life_cycle_methods.md#lifecycle-methods-in-function-components)

See also: [Robin Wieruch's post on useEffect()](https://www.robinwieruch.de/react-useeffect-hook/)

For example:

```javascript
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    console.log('I will run everytime the component renders or updates');
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Count</button>
    </div>
  );
}
```

Note that it's the lack of an optional second argument passed to `useEffect` that causes it to run on every update. If you only wanted code to run on the initial mount, pass an empty array as the second argument.

For example, if we want a one-time api call:

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function Demo() {
  const [zen, setZen] = useState('');

  // componentDidMount
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

If you want to use async/await, you need to define a function inside `useEffect`:

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function Demo() {
  const [zen, setZen] = useState('');

  // componentDidMount
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

To be thorough... here's with the try/catch included:

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function Demo() {
  const [zen, setZen] = useState('');

  // componentDidMount
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


### used for setState callbacks

In class components you can optionally pass a callback to run after the state has been updated with `this.setState`. With react hooks, you can use `useEffect()` to accomplish the same thing. For example:

```javascript
const [counter, setCounter] = useState(0);

const doSomething = () => {
  setCounter(123);
}

useEffect(() => {
  console.log('I will run on initial render and whenever counter gets updated.', counter);
}, [counter]);
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


## useLayoutEffect

TODO


## useId 

New to React 18, `useId` is a hook for generating unique IDs on both the client and server. For example:

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

For some reason they are making sure to note:

> useId is not for generating keys in a list. Keys should be generated from your data.

I'm not sure why they would say this given the examples they show in the docs. If you can use it to create and id for a piece of data, why would you not then use that id for a key?

> :warning: useId generates a string that includes the : token. This helps ensure that the token is unique, but is not supported in CSS selectors or APIs like querySelectorAll.


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
import { useState, useEffect } from 'react';

function useLocalStorage(key, defaultValue) {
  // Set up state
  const [state, setState] = useState(() => {
    // Check if anything exists in localStorage, if not, use defaultValue
    let value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  });

  // update localStorage when state changes
  // Note that we also hve to pass they key into the depenency array. 
  // Without it, the side-effect may run with an outdated key (also called stale)
  // if the key changed between renders.
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [state, key]);

  // return state value and a function to toggle it
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

For more see the [React docs on building your own hooks](https://reactjs.org/docs/hooks-custom.html).
