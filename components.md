# Components

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Class-based components](#class-based-components)
- [Function-based components](#function-based-components)
- [Class and Functional component comparison](#class-and-functional-component-comparison)
  * [class component](#class-component)
  * [function component](#function-component)
- [Nested Components](#nested-components)

<!-- tocstop -->

## Introduction

Components are the building blocks of React.

> Components let you split the UI into independent, reusable pieces, and think about each piece in isolation.

We can create class-based components or function-based components. Class based components look something like this:

```javascript
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

Functions look like this:

```javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```


## Class-based components

Class-based is the more "traditional" method. The class must have a render method and it must return something. To *render* the component we add the render method, pass on the component class name in JSX syntax, and then the DOM node where it's to be rendered in your HTML page:

```javascript
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

ReactDOM.render(<Welcome />, document.getElementById('root'));
```

Note that in the render function inside the class, you can only return one element. Therefor, if you're creating a number of elements, they should all be wrapped in one, e.g. a `<div>`:

```javascript
class Welcome extends React.Component {
  render() {
    return (
      <div>
        <p>Hello...</p>
        <p>blah...</p>
        <p>blah...</p>
      </div>
    );
  }
}

ReactDOM.render(<Welcome />, document.getElementById('root'));
```

## Function-based components

Historically these were used for simpler components as there were some things you couldn't do with function components that you could only do with classes including *state* and *lifecycle methods*. React v16.8 (released September, 2017) introduced *hooks*, which allow function-based components to have all the same features as class-based ones. More on hooks later.

> We intend for Hooks to cover all existing use cases for classes, but we will keep supporting class components for the foreseeable future. At Facebook, we have tens of thousands of components written as classes, and we have absolutely no plans to rewrite them. Instead, we are starting to use Hooks in the new code side by side with classes.

Note, there is no render method in the function, we just return whatever it is we need to be rendered.

```javascript
function Welcome() {
  return (
    <div>
      <p>Hello...</p>
      <p>blah...</p>
      <p>blah...</p>
    </div>
  );
}

ReactDOM.render(<Welcome />, document.getElementById('root'));
```

## Class and Functional component comparison

In these two examples, I want to demonstrate how to access/define the following:

- props
- default props
- state
- lifecycle methods

### class component

```javascript
import React, { Component } from 'react';
import './Example.css';

class Example extends Component {
  // default props
  static defaultProps = {
  };
  constructor(props) {
    super(props);
    // state
    this.state = {};
  }
  // lifecycle method
  componentDidMount() {
  }
  render() {
    // props
    let name = this.props.name;
    return (
      <div className="Example">{name}</div>
    );
  }
}

export default Example;
```

### function component

Let's start with *props*:

```javascript
import './Example.css';

function Example(props) {
  // props
  let name = props.name;
  return (
    <div className="Example">{name}</div>
  );
}

export default Example;
```

Alternatively:

```javascript
import './Example.css';

function Example({name}) {
  return (
    <div className="Example">{name}</div>
  );
}

export default Example;
```

or...

```javascript
import './Example.css';

function Example(props) {
  const {name} = props;
  return (
    <div className="Example">{name}</div>
  );
}

export default Example;
```

Therefor, to define *default props*, use ES6 default parameters:

```javascript
import './Example.css';

// default props
function Example({name='stranger', color='red'}) {
  return (
    <div className="Example">{name} and {color}</div>
  );
}

export default Example;
```

or...

```javascript
import './Example.css';

// default props
function Example(props) {
  const {
    someProp, 
    anotherProp, 
    name='stranger', 
    color='red'
  } = props;
  return (
    <div className="Example">{name} and {color}</div>
  );
}

export default Example;
```

Note that you can also use *rest destructing* and the spread operator:

```javascript
import React from 'react';
import Card from './Card';

function Demo(props) {
  const { id, ...rest } = props;

  console.log(id);

  return (
    <div className="Demo">
      <Card {...rest} />
    </div>
  );
}

export default Demo;
```


Use the `useState()` hooks for storing *state* in a function component:

```javascript
import React, { useState } from 'react';

function Example(props) {
  // Initial state
  const [name, setName] = useState('');
  const [count, setCount] = useState(0);

  function updateMyState() {
    // Update state
    setName('foo');
    setCount(1);
  }

  return (
    <div className="Example">
      {/* Read State */}
      <p>{ name }, { count }</p>
      <button onClick={ updateMyState }>update state</button>
    </div>

  );
}

export default Example;
```

See <https://reactjs.org/docs/hooks-state.html> for a very good comparison between the two.

See [state_with_hooks.md](https://github.com/jessicarush/react-notes/blob/master/state_with_hooks.md) for my notes.

The `useEffect()` hook can be used to replicate lifecycle behavior. See: [hooks.md](hooks.md).

```javascript
import React, { useEffect, useState } from 'react';

function Example(props) {
  const [count, setCount] = useState(0);

  function updateMyState() {
    setCount(c => c + 1);
  }

  // Similar to lifecycle methods componentDidMount and componentDidUpdate :
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <div className="Example">
      <p>{ count }</p>
      <button onClick={ updateMyState }>update state</button>
    </div>

  );
}

export default Example;
```


## Nested Components

In addition to rendering components as a standalone element (e.g. `<Box />`), you can take any component and give it an opening tag and closing tag. For example, the following two Boxes will render the same:

```JavaScript
render() {
  return (
    <div className="Contact">
      <Box />
      <Box></Box>
    </div>
  );
```

The benefit of using an opening and closing tag is you can nest any additional content between those tags and have them render inside that component. For example:

```JavaScript
render() {
  return (
    <div className="Contact">
      <Box />
      <Box>
        <h1 className="Contact-header">About... </h1>
        <p>... </p>
      </Box>
    </div>
  );
```

To display the nested content, you will need to render {this.props.children} somewhere in the component:

```javascript
class Box extends Component {
  static defaultProps = {
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div className="Box">
        <h1 className="Box-header">
          This is my box component. The rest of the content in this box comes
          from this.props.children.
        </h1>
        {this.props.children}
      </div>
    );
  }
}

export default Box;
```

Note in a functional component you would just use `{props.children}`.

```javascript
function Box(props) {
  const { children } = props;
  return (
    <div className="Box">
      <h1 className="Box-header">
        This is my box component. The rest of the content in this box comes
        from props.children.
      </h1>
      {children}
    </div>
  );
}

export default Box;
```
