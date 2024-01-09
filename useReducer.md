# useReducer

The `useReducer` hook is an alternative to `useState`. A reducer lets you unify multiple state variables into a single object and consolidate all the related logic.

It accepts a reducer function like `(state, action) => newState` with the initial state (`initialArg`, `init`), and returns the current `state` paired with a `dispatch` method.

```javascript
const [state, dispatch] = useReducer(reducer, initialArg, init);
```

> useReducer is usually preferable to useState when you have complex state logic that involves multiple sub-values or when the next state depends on the previous one. useReducer also lets you optimize performance for components that trigger deep updates because you can pass dispatch down instead of callbacks.

See: 

- [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [useReducer API Reference](https://react.dev/reference/react/useReducer)


## Table of contents

<!-- toc -->

- [About Reducers](#about-reducers)
- [Initial State](#initial-state)
  * [Lazy initialization](#lazy-initialization)
- [When to use](#when-to-use)
  * [Next state depends on the previous](#next-state-depends-on-the-previous)
  * [Complex state shape](#complex-state-shape)
  * [Easy to test](#easy-to-test)

<!-- tocstop -->

## About Reducers

Regarding the reducer function:

> The first and most important thing to understand about a reducer is that it will always only return one value. The job of a reducer is to reduce. That one value can be a number, a string, an array or an object, but it will always only be one.

JavaScript's built-in array method `reduce()` follows the pattern `(accumulatedValue, currentValue) => nextAccumulatedValue`.

The reducer method passed to `useReducer` follows the pattern `(state, action) => newState`, where state is the current state and the action is used to determine how and if the state will be updated.

```javascript
const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':{
      return {count: state.count + 1};
    }
    case 'decrement': {
      return {count: state.count - 1};
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}
```

Note that the reducer function is defined *outside* of the component. This is intentional and recommended as it ensures the reducer is a *pure* function (which is better for testing).

Many `useReducer` examples out there seem to use `switch` statements. Apparently these are typically used as a remnant from reducers in Redux. You do not need to use switch statements though.

The above reducer function could also be written as:

```javascript
function reducer(state, action) {
  if (action.type === 'increment') {
    return {count: state.count + 1};
  }
  else if (action.type === 'decrement') {
    return {count: state.count - 1};
  }
  else {
    throw new Error(`Unhandled action type: ${action.type}`);
  };
}
```

Obviously you could pass additional data along with the action object:

```javascript
const initialState = {count: 0};

function reducer(state, action) {
  if (action.type === 'increment') {
    return {count: state.count + action.amount};
  }
  else if (action.type === 'decrement') {
    return {count: state.count - action.amount};
  }
  else {
    throw new Error(`Unhandled action type: ${action.type}`);
  };
}

function Counter() {
  const { someOtherValue } = useContext(LanguageContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'decrement', amount: 1})}>-</button>
      <button onClick={() => dispatch({type: 'increment', amount: 1})}>+</button>
    </>
  );
}
```

Note: if you are using switch statements in your reducer, React recommends you wrap each case block in curly braces `{...}` so that variables declared inside different cases don’t clash with each other. Also, a case should usually end with a return. If you forget to return, the code will “fall through” to the next case, which can lead to mistakes.


## Initial State

There are two different ways to initialize `useReducer` state. The simplest way is to pass the initial state as a second argument:

```javascript
const [state, dispatch] = useReducer(
  reducer,
  {count: initialCount}
);
```

### Lazy initialization

You can also create the initial state lazily. To do this, you can pass an `init` function as the third argument. The initial state will be set to `init(initialArg)`.

```javascript
function init(initialArg) {
  return {count: initialArg};
}

const [state, dispatch] = useReducer(reducer, initialArg, init);
```

This lets you extract the logic for calculating the initial state outside the reducer. This is also handy for resetting the state later in response to an action.


## When to use

Most of the time, you are well covered with just `useState()` method, which is built on top of `useReducer()`. But there cases when `useReducer()` is preferable. The old React docs say useReducer is good for *complex state logic* or when *the next state depends on the previous one*. The new React.dev docs however seem to shift the reasoning: *To reduce complexity and keep all your logic in one easy-to-access place*.

> **Comparing useState and useReducer** 
>
> - Code size: Generally, with useState you have to write less code upfront. With useReducer, you have to write both a reducer function and dispatch actions. However, useReducer can help cut down on the code if many event handlers modify state in a similar way.
> - Readability: useState is very easy to read when the state updates are simple. When they get more complex, they can bloat your component’s code and make it difficult to scan. In this case, useReducer lets you cleanly separate the how of update logic from the what happened of event handlers.
> - Debugging: When you have a bug with useState, it can be difficult to tell where the state was set incorrectly, and why. With useReducer, you can add a console log into your reducer to see every state update, and why it happened (due to which action). If each action is correct, you’ll know that the mistake is in the reducer logic itself. However, you have to step through more code than with useState.
> - Testing: A reducer is a pure function that doesn’t depend on your component. This means that you can export and test it separately in isolation. While generally it’s best to test components in a more realistic environment, for complex state update logic it can be useful to assert that your reducer returns a particular state for a particular initial state and action.
> - Personal preference: Some people like reducers, others don’t. That’s okay. It’s a matter of preference. You can always convert between useState and useReducer back and forth: they are equivalent!

### Next state depends on the previous

It is always better to use this method when the state depends on the previous one. It will give you a more predictable state transition.

```javascript
function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    default: return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
    </>
  );
}
```

### Complex state shape

When the state consists of more than primitive values, like nested object or arrays. For example:

```javascript
const [state, dispatch] = useReducer(
  fetchUsersReducer,
  {
    users: [
      { name: 'John', subscribed: false },
      { name: 'Jane', subscribed: true },
    ],
    loading: false,
    error: false,
  },
);
```

### Easy to test

Reducers are pure functions which means they have no side effects and must return the same outcome given the same arguments. It is easier to test them because they do not depend on React.

