# Pure Components

Pure components are used when you want to prevent a component from re-rendering if their props haven't changed. If your React component’s `render()` function renders the same result given the same props and state, you can use React.PureComponent **for a performance boost in some cases**.

> A `React.PureComponent` is similar to `React.Component`. The difference between them is that `React.Component` doesn’t implement `shouldComponentUpdate()`, but `React.PureComponent` implements it with a shallow prop and state comparison.


## Table of Contents

<!-- toc -->

- [Background](#background)
- [Example using Class Components](#example-using-class-components)
- [Example using Functional Components](#example-using-functional-components)

<!-- tocstop -->

## Background 

In computer science (and especially the world of functional programming), a pure function is a function with the following characteristics:

- It minds its own business: It does not change any objects or variables that existed before it was called.
- Same inputs, same output: Given the same inputs, a pure function should always return the same result.

Pure functions don’t mutate variables outside of the function’s scope or objects that were created before the call.


## Example using Class Components

So here's the problem: Let's say I have a parent component that renders a number of child components. It keeps track of the children using state. Let's say the children can also be deleted. If one is deleted, the remaining children should NOT be re-rendered since they haven't changed... but by default, they do.

For example:

```javascript
import React, { Component } from 'react';
import ChildComponent from './ChildComponent';

class ParentComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {children: ['A', 'B', 'C', 'D', 'E']};
    this.deleteChild = this.deleteChild.bind(this);
  }

  deleteChild(child) {
    let newChildren = this.state.children.filter(c => c !== child);
    this.setState({children: newChildren});
  }

  render() {
    return (
      <div className="ParentComponent">
        {this.state.children.map((c) => (
          <ChildComponent key={c} id={c} delete={this.deleteChild} />
        ))}
      </div>
    );
  }
}

export default ParentComponent;
```

And my child component:

```javascript
import React, { Component } from "react";

class ChildComponent extends Component {
  constructor(props) {
    super(props);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete() {
    this.props.delete(this.props.id);
  }

  render() {
    console.log(`Rendered ${this.props.id}`);
    return (
      <div className="ChildComponent">
        <button onClick={this.handleDelete}> delete</button> {this.props.id}
      </div>
    );
  }
}

export default ChildComponent;
```

When I click the delete button in one child I will see, by the `console.log`, that all the children get re-rendered.

```bash
# Initial render
Rendered A ChildComponent.js:29
Rendered B ChildComponent.js:29
Rendered C ChildComponent.js:29
Rendered D ChildComponent.js:29
Rendered E ChildComponent.js:29
# I delete E
Rendered A ChildComponent.js:29
Rendered B ChildComponent.js:29
Rendered C ChildComponent.js:29
Rendered D ChildComponent.js:29
```

So, to prevent this, in the Child component, I can simply extend `React.PureComponent` instead of `Component`.

```javascript
import React, { PureComponent } from "react";

class ChildComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete() {
    this.props.delete(this.props.id);
  }

  render() {
    console.log(`Rendered ${this.props.id}`);
    return (
      <div className="ChildComponent">
        <button onClick={this.handleDelete}> delete</button> {this.props.id}
      </div>
    );
  }
}

export default ChildComponent;
```

Now when I delete a child:

```bash
# Initial render
Rendered A ChildComponent.js:29
Rendered B ChildComponent.js:29
Rendered C ChildComponent.js:29
Rendered D ChildComponent.js:29
Rendered E ChildComponent.js:29
# I delete E
```

> Note React.PureComponent’s shouldComponentUpdate() only shallowly compares the objects. If these contain complex data structures, it may produce false-negatives for deeper differences. Only extend PureComponent when you expect to have simple props and state, or use forceUpdate() when you know deep data structures have changed. Or, consider using immutable objects to facilitate fast comparisons of nested data.

> Furthermore, React.PureComponent’s shouldComponentUpdate() skips prop updates for the whole component subtree. Make sure all the children components are also “pure”.


## Example using Functional Components

**Unsolved**

Continuing with the example from above, let's start by just converting the child component `ChildComponent` to a functional component, but leave the parent `ParentComponent` as a class.

```javascript
import React from 'react';

function ChildComponent(props) {
  console.log(`Rendered ${props.id}`);

  function handleDelete() {
    props.delete(props.id);
  }

  return (
    <div className="ChildComponent">
      <button onClick={handleDelete}> delete</button> {props.id}
    </div>
  );
}

export default ChildComponent;
```

With this I get the same re-rendering problem:

```bash
# Initial render
Rendered A ChildComponent.js:29
Rendered B ChildComponent.js:29
Rendered C ChildComponent.js:29
Rendered D ChildComponent.js:29
Rendered E ChildComponent.js:29
# I delete E
Rendered A ChildComponent.js:29
Rendered B ChildComponent.js:29
Rendered C ChildComponent.js:29
Rendered D ChildComponent.js:29
```

So, to prevent this, in the Child component, I can simply extend wrap my component in `React.memo`.

> Note: Don't mistake React's memo API with React's useMemo Hook. While React memo is used to wrap React components to prevent re-renderings, useMemo is used to memoize values

```javascript
import React from 'react';

function ChildComponent(props) {
  console.log(`Rendered ${props.id}`);

  function handleDelete() {
    props.delete(props.id);
  }

  return (
    <div className="ChildComponent">
      <button onClick={handleDelete}> delete</button> {props.id}
    </div>
  );
}

export default React.memo(ChildComponent);
```

And with that I get the results I want:

```bash
# Initial render
Rendered A ChildComponent.js:29
Rendered B ChildComponent.js:29
Rendered C ChildComponent.js:29
Rendered D ChildComponent.js:29
Rendered E ChildComponent.js:29
# I delete E
```

However... if I try to also convert the parent component to a functional component, it doesn't work. For example:

```javascript
import React, { useState } from 'react';
import ChildComponent from "./ChildComponent";

function ParentComponent() {
  const [children, setChildren] = useState(['A', 'B', 'C', 'D', 'E']);

  const deleteChild = (child) => {
    setChildren(children => children.filter(c => c !== child));
  };

  return (
    <div className="ParentComponent">
      {children.map(c => <ChildComponent key={c} id={c} delete={deleteChild} />)}
    </div>
  );
}

export default ParentComponent;
```

I have not been able to figure out how to do this with both components being functions in my use case.

> React.memo only checks for prop changes. If your function component wrapped in React.memo has a useState, useReducer or useContext Hook in its implementation, it will still rerender when state or context change.

See also [Robin Wieruch's example](https://www.robinwieruch.de/react-memo/).

