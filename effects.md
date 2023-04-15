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
- [When to not use useEffect](#when-to-not-use-useeffect)
  * [Initializing the application](#initializing-the-application)
  * [To transform data for rendering](#to-transform-data-for-rendering)
  * [To handle user events](#to-handle-user-events)
  * [To reset state when a prop changes](#to-reset-state-when-a-prop-changes)
  * [To adjust some state when a prop changes](#to-adjust-some-state-when-a-prop-changes)
  * [Subscribing to an external store](#subscribing-to-an-external-store)
- [Final thoughts](#final-thoughts)
- [Reference](#reference)

<!-- tocstop -->

## Effects as lifecycle methods

If comparing to class component lifecycle methods, `useEffect` can be used to simulate `componentDidMount`, `componentDidUpdate` and `componentWillUnmount` but it is not a lifecycle method, as in it does not follow a components lifecycle but has its own synchronization cycle. See [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects).

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

And finally, with a **loading** indicator:

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

> "Subscribing to events" typically refers to the process of registering a component as a listener for a specific event emitted by some other part of the application (e.g., a DOM element, a WebSocket connection, or a custom event emitter). This involves using a function like addEventListener() to register the component as a listener for the event, and providing a callback function that will be called when the event occurs.

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

If your Effect fetches something, the cleanup function should either **abort** the fetch or **ignore** its result:

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

See *hooks/usefetch* for a functioning example using the `fetch()` API.

Here's an example of the [AbortController API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) implemented with [axios](https://axios-http.com/docs/cancellation):

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

> Note that there are other things to consider when fetching data, like caching responses (so that the user can click Back and see the previous screen instantly), how to fetch data on the server (so that the initial server-rendered HTML contains the fetched content instead of a spinner), and how to avoid network waterfalls (so that a child can fetch data without waiting for every parent). These issues apply to any UI library, not just React. Solving them is not trivial, which is why modern frameworks provide more efficient built-in data fetching mechanisms than fetching data in Effects


## When to not use useEffect 

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

### Subscribing to an external store 

First of all, the following example may seem similar to the [Subscribing to events](#subscribing-to-events), but the difference here is in the former we are subscribing to a *browser event* (i.e., the scroll event), where in the following example we are subscribing to a *browser API*.

In the context of React, "subscribing" typically refers to the process of registering a component as a listener for changes to some external *data source* or *event source*. 

*Subscribing to events* typically refers to the process of registering a component as a listener for a specific event emitted by some other part of the application (e.g., a DOM element, a WebSocket connection, or a custom event emitter). This involves using a function like `addEventListener()` to register the component as a listener for the event, and providing a callback function that will be called when the event occurs.

*Subscribing to an external store* typically refers to the process of connecting a component to a data source outside of React. This could be a third-party state management library like Redux or MobX, which allows the component to receive updates whenever the store's state changes. In this case, the component subscribes to the store by using a special function provided by the library (e.g., `connect()` in Redux), which sets up a subscription behind the scenes. 

We can also think of built-in browser APIs as being like external stores. For example, the `navigator.geolocation` API can be used to get the user's current location, and this location data is external to your React component's state. Similarly, the `navigator.onLine` API used below is also external to your component's state, since it represents the online/offline status of the browser, rather than some state managed by your React component.

```javascript
function useOnlineStatus() {
  // Not ideal: Manual store subscription in an Effect
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    function updateState() {
      setIsOnline(navigator.onLine);
    }

    updateState();

    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);
    return () => {
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);
    };
  }, []);
  return isOnline;
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```

Although it’s common to use Effects for this, React has a purpose-built Hook for subscribing to an external store that is preferred instead. Delete the Effect and replace it with a call to `useSyncExternalStore`:

```javascript
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

function useOnlineStatus() {
  // ✅ Good: Subscribing to an external store with a built-in Hook
  return useSyncExternalStore(
    subscribe, // React won't resubscribe for as long as you pass the same function
    getSnapshot, // How to get the value on the client
    getServerSnapshot // How to get the value on the server (for the initial render)
  );
}

function ChatIndicator() {
  const isOnline = useOnlineStatus();
  // ...
}
```

This approach is less error-prone than manually syncing mutable data to React state with an Effect. Typically, you’ll write a custom Hook like `useOnlineStatus()` above so that you don’t need to repeat this code in the individual components. See also: [hooks.md#usesyncexternalstore](hooks.md#usesyncexternalstore)

## Effect events 

Things get more tricky when you want to mix reactive logic with non-reactive logic. For example, imagine that you want to show a notification when the user connects to the chat. You read the current theme (dark or light) from the props so that you can show the notification in the correct color:

```javascript
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    connection.connect();
    // ...
```

If we add the theme as a dependency, any time the theme changes, the effect will run again and a new connection will be made. Not what we want. Instead, we can extract this bit out and use a `useEffectEvent` hook:

```javascript
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
  });

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      onConnected();
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // ✅ All dependencies declared
  // ...
```

You can think of Effect Events as being very similar to event handlers. The main difference is that event handlers run in response to a user interactions, whereas Effect Events are triggered by you from Effects. Effect Events let you “break the chain” between the reactivity of Effects and code that should not be reactive.

Another example would be if you have an analytics function that logs visits. This effect might happen whenever `url` changes. If you then decided to send additional information, like the number of items currently in a cart. However, you don’t want the `logVisit` call to be reactive to `numberOfItems` so you put this in a `useEffectEvent`.

```javascript
function Page({ url }) {
  const { items } = useContext(ShoppingCartContext);
  const numberOfItems = items.length;

  const onVisit = useEffectEvent(visitedUrl => {
    logVisit(visitedUrl, numberOfItems);
  });

  useEffect(() => {
    onVisit(url);
  }, [url]); // ✅ All dependencies declared
  // ...
}
```

Then there's the example of the [dot that should only move when the box is checked](https://react.dev/learn/separating-events-from-effects#is-it-okay-to-suppress-the-dependency-linter-instead). 

The first example puts the function in the Effect and lists `canMove` as a dependency so if it changes, the effect is re-run and the ability to move the dot is added or not through the condition:

```javascript
import { useState, useEffect } from 'react';

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  useEffect(() => {
    function handleMove(e) {
      if (canMove) {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    }
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [canMove]);

  return (
    <>
      <label>
        <input type="checkbox"
          checked={canMove}
          onChange={e => setCanMove(e.target.checked)} 
        />
        The dot is allowed to move
      </label>
      <hr />
      <div style={{
        position: 'absolute',
        backgroundColor: 'pink',
        borderRadius: '50%',
        opacity: 0.6,
        transform: `translate(${position.x}px, ${position.y}px)`,
        pointerEvents: 'none',
        left: -20,
        top: -20,
        width: 40,
        height: 40,
      }} />
    </>
  );
}
```

However this might be better:

```javascript
import { useState, useEffect } from 'react';
import { experimental_useEffectEvent as useEffectEvent } from 'react';

export default function App() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canMove, setCanMove] = useState(true);

  const onMove = useEffectEvent(e => {
    if (canMove) {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  });

  useEffect(() => {
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  // ...
}
```

This makes sense because we don't want the Effect’s code to be reactive `canMove`. That’s why it makes sense to extract an Effect Event.

Effect Events are very limited in how you can use them:

- Only call them from inside Effects.
- Never pass them to other components or Hooks.

Always declare Effect Events directly next to the Effects that use them.


## Removing unnecessary dependencies

Ask yourself:

- Should this code move to an event handler? 
- Is your Effect doing several unrelated things? If so, split the logic into separate Effects.
- Are you reading some state to calculate the next state (e.g. `setMessages([...messages, receivedMessage])`)? If so, do a function update like `setMessages(msgs => [...msgs, receivedMessage])`.
- Do you want to read a value without “reacting” to its changes? If so, move that logic into an Effect Event.
- Does some reactive value change unintentionally? For example, an object defined outside an effect is considered reactive because it is created from scratch on every re-render. In JavaScript, each newly created object or function is considered distinct from all the others. It doesn’t matter that the contents inside of them may be the same! This is why, whenever possible, you should try to avoid objects and functions as your Effect’s dependencies. Instead, try moving them outside the component, inside the Effect, or extracting primitive values out of them.


## Final thoughts

- By default, Effects run after every render (including the initial one).
- Effects are reactive blocks of code. They re-synchronize when the values you read inside of them change. Unlike event handlers, which only run once per interaction, Effects run whenever synchronization is necessary.
- React will call your cleanup function before the Effect runs next time, and during the unmount.
- Each Effect in your code should represent a separate and independent synchronization process.
- Code that runs because a component was displayed should be in Effects, the rest should be in event handlers.
- You can’t “choose” your dependencies. Your dependencies are determined by every *reactive* value you read in the Effect.
- Props, state, and all variables declared in the component body are *reactive*.
- Logic inside event handlers is not reactive. It will not run again unless the user performs the same interaction (e.g. a click) again. Event handlers can read reactive values without “reacting” to their changes.
- Logic inside Effects is reactive. If your Effect reads a reactive value, you have to specify it as a dependency. Then, if a re-render causes that value to change, React will re-run your Effect’s logic with the new value.
- If a `const` is defined outside the component body, it is not a dependency, because it will never change on a re-render.
- A variable defined inside the Effect isn't a dependency. They aren’t calculated during rendering, so they’re not reactive.
- A mutable value like `ref.current` can’t be a dependency, because it is not reactive (doesn’t trigger a re-render).
- A mutable value like `location.pathname` can’t be a dependency, because it is not reactive. Instead, you should read and subscribe to an external mutable value with `useSyncExternalStore`.
- React will skip the Effect if all of its dependencies have the same values as during the last render.
- You can move non-reactive logic from Effects into Effect Events but only call Effect Events from inside Effects.
- Try to avoid object and function dependencies. Move them outside the component or inside the Effect, or extract primitive values out of them.


## Reference 

- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)
- [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects)
- [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies)

