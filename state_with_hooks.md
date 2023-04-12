# State with hooks

See: 

- [Managing State](https://react.dev/learn/managing-state)
- [useState API Reference](https://react.dev/reference/react/useState)

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Set initial state](#set-initial-state)
- [Read state](#read-state)
- [Update state](#update-state)
  * [Functional updates](#functional-updates)
- [Form handling (controlled inputs)](#form-handling-controlled-inputs)
  * [Custom hook for forms](#custom-hook-for-forms)
- [One or many state variables?](#one-or-many-state-variables)
- [setState callbacks](#setstate-callbacks)
- [Filtering Example](#filtering-example)

<!-- tocstop -->

## Introduction

These notes for working with state in functional components using hooks come after the notes in [state.md](state.md). As such, I'll skip the basic explanations of what state is and instead focus on how to do the same things with functions and hooks.

Principles for structuring state: 

1. Group related state. If you always update two or more state variables at the same time, consider merging them into a single state variable.
2. Avoid contradictions in state. When the state is structured in a way that several pieces of state may contradict and “disagree” with each other, you leave room for mistakes. Try to avoid this.
3. Avoid redundant state. If you can calculate some information from the component’s props or its existing state variables during rendering, you should not put that information into that component’s state.
4. Avoid duplication in state. When the same data is duplicated between multiple state variables, or within nested objects, it is difficult to keep them in sync. Reduce duplication when you can.
5. Avoid deeply nested state. Deeply hierarchical state is not very convenient to update. When possible, prefer to structure state in a flat way.

For examples see [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure#principles-for-structuring-state).

Questions for deciding when something should be state:

- Does it remain unchanged over time? If so, it isn’t state.
- Is it passed in from a parent via props? If so, it isn’t state.
- Can you compute it based on existing state or props in your component? If so, it isn’t state.

## Set initial state

In functional components, you can set the initial state of each item using `useSate()` (the *only* argument to `useState` is the initial state). The `useState` hook returns a pair: the current state value and a function that lets you update it.

```javascript
import React, { useState } from 'react';

function Example(props) {
  // Initial state
  const [name, setName] = useState('guest');
  const [count, setCount] = useState(0);

  return (
    <div className="Example"></div>
  );
}
```

Declaring state variables as a pair of `[something, setSomething]` is handy because it lets us give different names to different state variables.

That being said...

> You **don’t have to** use many state variables. State variables can hold objects and arrays just fine, so you can still group **related data** together. However, unlike `this.setState` in a class, updating a state variable always replaces it instead of merging it.

For example:

```javascript
import React, { useState } from 'react';

function Example(props) {
  // Initial state
  const [state, setState] = useState({
    name: 'guest',
    count: 0
  });

  return (
    <div className="Example"></div>
  );
}
```

The "replaces it instead of merging it" part is described below in [Update state](#update-state).


## Read state

Reading the state is easy:

```javascript
import React, { useState } from 'react';

function Example(props) {
  // Initial state
  const [name, setName] = useState('guest');
  const [count, setCount] = useState(0);

  return (
    // Read State
    <div className="Example">{ name } { count }</div>
  );
}
```

or...

```javascript
import React, { useState } from 'react';

function Example(props) {
  // Initial state
  const [state, setState] = useState({
    name: 'guest',
    count: 0
  });

  return (
    <div className="Example">{ state.name } { state.count }</div>
  );
}
```

## Update state

To update the state, use the function assigned from `useState()`. You can call this function from an event handler or somewhere else. It’s similar to `this.setState` in a class, except it doesn’t merge the old and new state together.

```javascript
import React, { useState } from 'react';

function Example(props) {
  // Initial state
  const [name, setName] = useState('guest');
  const [count, setCount] = useState(0);

  function updateMyState() {
    // Update state
    setName('Bob');
    // Note there's a better way to do this...functional updates
    setCount(count + 1);
  }

  return (
    // Read State
    <div className="Example">{ name } { count }</div>
    <button onClick={ updateMyState }>update state</button>
  );
}
```

As mentioned above, if you are using a single state object to mimic `this.setState` in a class, remember that **updating a state variable always replaces it instead of merging it**. What this means is with classes you could just pass in a new state `key: value` and it would *merge* it in with the rest:

```javascript
handleChange(e) {
    this.setState({count: 1});
  }
```

So, if we were to put all our state values into one object, we would need to use the spread operator on `...state` to ensure we don't loose our other values:


```javascript
import React, { useState } from 'react';

function Example(props) {
  // Initial state
  const [state, setState] = useState({
    name: 'guest',
    count: 0
  });

  function updateMyState() {
    // Update state
    setState({...state, name: 'Bob'});
  }

  return (
    // Read State
    <div className="Example">{ state.name } { state.count }</div>
    <button onClick={ updateMyState }>update state</button>
  );
}
```

### Functional updates 

If the new state is computed using the previous state, you can pass a function to setState. The function will receive the previous value, and return an updated value. Here’s an example of a counter component that uses both forms of setState:

```jsx
function Counter({initialCount}) {
  const [count, setCount] = useState(initialCount);
  return (
    <>
      Count: {count}
      <button onClick={() => setCount(initialCount)}>Reset</button>
      <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
      <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
    </>
  );
}
```

According to the [React docs here](https://reactjs.org/docs/hooks-reference.html#functional-updates):

> The ”+” and ”-” buttons use the functional form, because the updated value is based on the previous value. But the “Reset” button uses the normal form, because it always sets the count back to the initial value.

However, I have seen them also use `setCount(count + 1)`, sometimes [in the same section](https://reactjs.org/docs/hooks-reference.html#usetransition). So I'm not really sure if this is a rule or a suggestion. I'm guessing there are situations where the value may not be current so using the previous state value through this functional update is safer. The pattern seems to be to use one character like so:

```jsx
setCount(c => c + 1);
setFlag(f => !f);
```


## Form handling (controlled inputs)

To create controlled form elements:

- Define a state for the input value
- Create an onChange event handler that updates the state when the input value changes
- Assign the input field with the state value and attach the event handler

```javascript
import React, { useState } from 'react';

function Example(props) {
  // Define a state for the input value
  const [name, setName] = useState('guest');
  // Create an onChange event handler that updates
  // the state when the input value changes
  function updateName(e) {
    setName(e.target.value);
  }

  return (
    <div className="Example">
      // Assign the input field with the state value
      // and attach the event handler
      <input
        type="text"
        value={ name }
        onChange={ updateName }
      />
    </div>
  );
}
```

Slightly shorter syntax for the event handler:

```javascript
const updateName = e => setName(e.target.value);
```

Or inline arrow function:

```javascript
input
  type="text"
  value={ name }
  onChange={ e => setName(e.target.value) }
/>
```

Note that for simplicity, React has made it so [select menus can be controlled in the same way](https://reactjs.org/docs/forms.html#the-select-tag): set the value attribute on the `<select>` element to identify which `<option>` is selected.

```javascript
function Example() {

  const [units, setUnits] = useState('px');
  const updateUnits = (e) => setUnits(e.target.value);

  const unitsOptions = ['cm', 'in', 'mm', 'px', 'pt']

  return (
    <div className="Example">
      <select value={value} onChange={onChange}>
        {/* We don't need to add the selected attribute to an option */}
        {unitsOptions.map((option) => (<option key={uuid()}>{option}</option>))}
      </select>
    </div>
  );
}
```

With classes we would typically see controlled inputs all handled by one method like so:

```javascript
handleChange(e) {
  this.setState({[e.target.name]: e.target.value});
}
```

If we were to put all our state values in one object called state, we could still do this, we just remember to add `...state`:

```javascript
import React, { useState } from 'react';

function Form() {
  const [user, setUser] = useState({
    username: '',
    email: ''
  });

  const handleChange = (e) => {
    setState({...state, [e.target.name]: e.target.value});
  };

  return (
    <div className="Form">
      <input type="text" name="username" value={state.username} onChange={handleChange} />
      <input type="email" name="email" value={state.email} onChange={handleChange} />
    </div>
  )
}

export default Form;
```

You should only group up state values like this in an object when they are related. Unrelated values should be created with separate `useState()` calls.

### Custom hook for forms

Form handling can also be elegantly handled with a custom hook:

```javascript
import { useState } from 'react';

function useInput(initialValue='') {
  // Set up state
  const [value, setValue] = useState(initialValue);
  // A function to handle input change
  const handleChange = (e) => {
    setValue(e.target.value);
  };
  // A function to clear the input
  const reset = () => {
    setValue('');
  };
  return [value, handleChange, reset];
}

export default useInput;

```

This make sour form code a little tidier:

```javascript
import useInput from './hooks/useInput';

function Form() {
  const [email, updateEmail, resetEmail] = useInput('');
  const [user, updateUser, resetUser] = useInput('');

  return (
    <div className="Form">
      <input type="text" name="user" value={user} onChange={updateUser} />
      <input type="email" name="email" value={email} onChange={updateEmail} />
    </div>
  )
}

export default Form;
```


## One or many state variables?

If you’re coming from classes, you might be tempted to always call `useState()` once and put all state into a single object. You can do it if you’d like. However, the React docs recommend you split **state into multiple state variables based on which values tend to change together**.

> Both putting all state in a single useState call, and having a useState call per each field can work. Components tend to be most readable when you find a balance between these two extremes, and group related state into a few independent state variables


## setState callbacks

In class component you could optionally pass a callback to run after the state has been updated. For example:

```javascript
setState(
  { counter: 123},
  () => console.log('Do something after counter has changed')
);
```

With react hooks, you would use the `useEffect()` hook instead, passing in the state value as a dependency. For example:

```javascript
const [counter, setCounter] = useState(0);

const doSomething = () => {
  setCounter(123);
}

useEffect(() => {
   console.log('Do something after counter has changed', counter);
}, [counter]);
```

Read more about `useEffect()` in [effects.md](effects.md).


## Filtering Example

This example comes from [Dimitri](https://dmitripavlutin.com/controlled-inputs-using-react-hooks/), who seems like a pretty cool guy. It uses a state value in a `filter()`. As a result, whenever the state value changes, the `filter()` result get updated.

For example in *App.js*:

```javascript
import FilterStudents from './FilterStudents';
import './App.css';

function App() {
  const students = [
    "Jennifer Pantano",
    "Glen Legaspi",
    "Meagan Whiteman",
    "Matthew King",
    "Cynthia Thomas",
    "Ray Schaefer",
    "Marco Rucker",
    "Tim Howard",
    "Rosalyn Tyson"
  ];
  return (
    <div className="App">
      <h1 className="App-header">Filter demo</h1>
      <FilterStudents students={ students } />
    </div>
  );
}

export default App;
```

Then in *FilterStudents.js*

```javascript
import React, { useState } from 'react';
// import './FilterStudents.css';


function FilterStudents(props) {
  const [query, setQuery] = useState('');
  const updateQuery = e => setQuery(e.target.value);

  const filteredStudents = props.students.filter(name => {
    return name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="FilterStudents">
      <input
        type="text"
        value={ query }
        onChange={ updateQuery }
      />
      <h2>Student list</h2>
      <div className="FilterStudents-list">
        { filteredStudents.map(name => <div>{ name }</div>) }
      </div>

    </div>
  );
}

export default FilterStudents;
```
