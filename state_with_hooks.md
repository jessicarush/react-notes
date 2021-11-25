# React State with hooks

<https://reactjs.org/docs/hooks-state.html>

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Set initial state](#set-initial-state)
- [Read state](#read-state)
- [Update state](#update-state)
- [Form handling (controlled inputs)](#form-handling-controlled-inputs)
- [...](#)

<!-- tocstop -->

## Introduction

These notes for working with state in functional components using hooks, follow the notes in [state.md](https://github.com/jessicarush/react-notes/blob/master/state.md). As such, I'll skip the explanations of what state is and instead focus on how to do the same things with functions and hooks.

## Set initial state

In functional components, you set the initial state of each item using `useSate()`.

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

To update the state, use the function assigned from `useState()`:

```javascript
import React, { useState } from 'react';

function Example(props) {
  // Initial state
  const [name, setName] = useState('guest');
  const [count, setCount] = useState(0);

  function updateMyState() {
    // Update state
    setName('Bob');
    setCount(1);
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


## ...
