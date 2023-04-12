# Effects 

The [Effect Hook](https://react.dev/reference/react/useEffect) lets you perform *side effects* in function components. Effects let you run some code **after rendering** and can be used to synchronize your component with a system outside of React.

> Effects let you specify side effects that are caused by rendering itself, rather than by a particular event. Imagine a ChatRoom component. Sending a message in the chat is an event because it is directly caused by the user clicking a specific button. However, setting up a server connection is an Effect because it should happen no matter which interaction caused the component to appear. Effects run at the end of a commit (to the DOM) after the screen updates. This is a good time to synchronize the React components with some external system (like network or a third-party library).


## Table of Contents

<!-- toc -->

- [Effects as lifecycle methods](#effects-as-lifecycle-methods)
- [UseEffect API example](#useeffect-api-example)
- [Adding a cleanup function](#adding-a-cleanup-function)
  * [Common patterns that use cleanup functions](#common-patterns-that-use-cleanup-functions)
    + [Controlling non-React widgets](#controlling-non-react-widgets)
    + [Subscribing to events](#subscribing-to-events)
    + [Triggering animations](#triggering-animations)
    + [Fetching data](#fetching-data)
- [When NOT to useEffect](#when-not-to-useeffect)
  * [Initializing the application](#initializing-the-application)
  * [To transform data for rendering](#to-transform-data-for-rendering)
  * [To handle user events](#to-handle-user-events)
  * [To reset state when a prop changes](#to-reset-state-when-a-prop-changes)
  * [To adjust some state when a prop changes](#to-adjust-some-state-when-a-prop-changes)

<!-- tocstop -->

## Effects as lifecycle methods

If comparing to class component lifecycle methods, you can think of `useEffect` as `componentDidMount`, `componentDidUpdate` and `componentWillUnmount` combined.

See also:

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

## UseEffect API example

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

And finally, with a loading indicator:

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

## Adding a cleanup function

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

React will call your cleanup function each time before the Effect runs again, and **one final time when the component unmounts** (gets removed). 

See the [Fetching data](#fetching-data) section below for how to add a cleanup function to a fetch request.


### Common patterns that use cleanup functions

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

## When NOT to useEffect 

### Initializing the application 

Some logic should only run once when the application starts. You can put it outside your components.This guarantees that such logic only runs once after the browser loads the page.

```javascript
if (typeof window !== 'undefined') { // Check if we're running in the browser.
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

### To transform data for rendering

> For example, let’s say you want to filter a list before displaying it. You might feel tempted to write an Effect that updates a state variable when the list changes. However, this is inefficient. When you update the state, React will first call your component functions to calculate what should be on the screen. Then React will “commit” these changes to the DOM, updating the screen. Then React will run your Effects. If your Effect also immediately updates the state, this restarts the whole process.
>
> To avoid the unnecessary render passes, transform all the data at the top level of your components. That code will automatically re-run whenever your props or state change.

### To handle user events

> For example, let’s say you want to send a POST request to /api/buy and show a notification when the user buys a product. In the Buy button click event handler, you know exactly what happened. By the time an Effect runs, you don’t know what the user did (for example, which button was clicked). This is why you’ll usually always handle user events in the corresponding event handlers.

When you choose whether to put some logic into an event handler or an Effect, the main question you need to answer is what kind of logic it is from the user’s perspective. If this logic is caused by a particular interaction, keep it in the event handler. If it’s caused by the user seeing the component on the screen, keep it in the Effect.

### To reset state when a prop changes

Note that when you pass a prop to component, if that prop changes, anywhere that prop is being used will be updated but any other state values in that component will not be affected. This is normal; React preserves the state when the same component is rendered in the same spot.

That said, if you decide you want to reset a state value whenever certain prop changes, `useEffect` is not the correct answer. Instead, you would pass that prop as a `key` to the component. This tells React to treat components with different keys as completely different and that they should not share any state.

See my code example in [jsx.md#keys-identify-components-as-being-unique](jsx.md#keys-identify-components-as-being-unique) and demo in examples/component_key_demo.

### To adjust some state when a prop changes

This List component receives a list of items as a prop, and tracks the selected item in the selection state variable. You want to reset the selection to null whenever the items prop receives a different array.

```javascript
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selection, setSelection] = useState(null);

  // 🔴 Avoid: Adjusting state on prop change in an Effect
  useEffect(() => {
    setSelection(null);
  }, [items]);
  // ...
}
```

This, too, is not ideal. Every time the items change, the List and its child components will render with a stale selection value at first. Then React will update the DOM and run the Effects. Finally, the setSelection(null) call will cause another re-render of the List and its child components, restarting this whole process again.

Always check whether you can reset all state with a key or calculate everything during rendering instead. For example, instead of storing (and resetting) the selected item, you can store the selected item ID:

```javascript
function List({ items }) {
  const [isReverse, setIsReverse] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  // ✅ Best: Calculate everything during rendering
  const selection = items.find(item => item.id === selectedId) ?? null;
  // ...
}
```

React documentation suggests that it might be better to avoid this pattern when possible. The reason for this is that updating state in response to a prop change can sometimes cause unnecessary re-renders, especially if the state update is computationally expensive.
