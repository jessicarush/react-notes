# State with hooks

<https://reactjs.org/docs/hooks-state.html>

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Set initial state](#set-initial-state)
- [Read state](#read-state)
- [Update state](#update-state)
- [Form handling (controlled inputs)](#form-handling-controlled-inputs)
- [Filtering Example](#filtering-example)

<!-- tocstop -->

## Introduction

These notes for working with state in functional components using hooks, follow the notes in [state.md](https://github.com/jessicarush/react-notes/blob/master/state.md). As such, I'll skip the explanations of what state is and instead focus on how to do the same things with functions and hooks.

## Set initial state

In functional components, you set the initial state of each item using `useSate()` (the *only* argument to `useState` is the initial state). The `useState` hook returns a pair: the current state value and a function that lets you update it.

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
    setCount(count + 1);
  }

  return (
    // Read State
    <div className="Example">{ name } { count }</div>
    <button onClick={ updateMyState }>update state</button>
  );
}
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


## Filtering Example

This example comes from [Dimitri](https://dmitripavlutin.com/controlled-inputs-using-react-hooks/), who seems like a pretty cool guy. It uses a state value in a `filter()`. As a result, whenever the state value changes, the `filter)` result get updated.

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
