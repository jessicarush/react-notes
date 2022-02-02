# Pure Components

Pure components are used when you want to prevent a component from re-rendering if their props haven't changed. If your React component’s `render()` function renders the same result given the same props and state, you can use React.PureComponent **for a performance boost in some cases**.

> A `React.PureComponent` is similar to `React.Component`. The difference between them is that `React.Component` doesn’t implement `shouldComponentUpdate()`, but `React.PureComponent` implements it with a shallow prop and state comparison.

## Example using Class Components

So here's the problem: Let's say I have a parent component that renders a number of child components. It keeps track of the children using state. Let's say the children can also be deleted. If one is deleted, the remaining children should NOT be re-rendered since they haven't changed... but by default, they do.

For example:

```javascript
import React, { Component } from 'react';
import TestPureChild from './TestPureChild';

class TestComponent extends Component {
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
      <div className="TestComponent">
        {this.state.children.map((c) => (
          <TestPureChild key={c} id={c} delete={this.deleteChild} />
        ))}
      </div>
    );
  }
}

export default TestComponent;
```

And my child component:

```javascript
import React, { Component } from "react";

class TestPureChild extends Component {
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
      <div className="TestPureChild">
        <button onClick={this.handleDelete}> delete</button> {this.props.id}
      </div>
    );
  }
}

export default TestPureChild;
```

When I click the delete button in one child I will see, by the `console.log`, that all the children get re-rendered.

```bash
# Initial render
Rendered A TestPureChild.js:29
Rendered B TestPureChild.js:29
Rendered C TestPureChild.js:29
Rendered D TestPureChild.js:29
Rendered E TestPureChild.js:29
# I delete E
Rendered A TestPureChild.js:29
Rendered B TestPureChild.js:29
Rendered C TestPureChild.js:29
Rendered D TestPureChild.js:29
```

So, to prevent this, in the Child component, I can simply extend `React.PureComponent` instead of `Component`.

```javascript
import React, { PureComponent } from "react";

class TestPureChild extends PureComponent {
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
      <div className="TestPureChild">
        <button onClick={this.handleDelete}> delete</button> {this.props.id}
      </div>
    );
  }
}

export default TestPureChild;
```

Now when I delete a child:

```bash
# Initial render
Rendered A TestPureChild.js:29
Rendered B TestPureChild.js:29
Rendered C TestPureChild.js:29
Rendered D TestPureChild.js:29
Rendered E TestPureChild.js:29
# I delete E
```

> Note React.PureComponent’s shouldComponentUpdate() only shallowly compares the objects. If these contain complex data structures, it may produce false-negatives for deeper differences. Only extend PureComponent when you expect to have simple props and state, or use forceUpdate() when you know deep data structures have changed. Or, consider using immutable objects to facilitate fast comparisons of nested data.

> Furthermore, React.PureComponent’s shouldComponentUpdate() skips prop updates for the whole component subtree. Make sure all the children components are also “pure”.


## Example using Functional Components

**Unsolved**

Continuing with the example from above, let's start by just converting the child component `TestPureChild` to a functional component, but leave the parent `TestComponent` as a class.

```javascript
import React from 'react';

function TestPureChild(props) {
  console.log(`Rendered ${props.id}`);

  function handleDelete() {
    props.delete(props.id);
  }

  return (
    <div className="TestPureChild">
      <button onClick={handleDelete}> delete</button> {props.id}
    </div>
  );
}

export default TestPureChild;
```

With this I get the same re-rendering problem:

```bash
# Initial render
Rendered A TestPureChild.js:29
Rendered B TestPureChild.js:29
Rendered C TestPureChild.js:29
Rendered D TestPureChild.js:29
Rendered E TestPureChild.js:29
# I delete E
Rendered A TestPureChild.js:29
Rendered B TestPureChild.js:29
Rendered C TestPureChild.js:29
Rendered D TestPureChild.js:29
```

So, to prevent this, in the Child component, I can simply extend wrap my component in `React.memo`.

```javascript
import React from 'react';

function TestPureChild(props) {
  console.log(`Rendered ${props.id}`);

  function handleDelete() {
    props.delete(props.id);
  }

  return (
    <div className="TestPureChild">
      <button onClick={handleDelete}> delete</button> {props.id}
    </div>
  );
}

export default React.memo(TestPureChild);
```

And with that I get the results I want:

```bash
# Initial render
Rendered A TestPureChild.js:29
Rendered B TestPureChild.js:29
Rendered C TestPureChild.js:29
Rendered D TestPureChild.js:29
Rendered E TestPureChild.js:29
# I delete E
```

However... if I try to also convert the parent component to a functional component, it doesn't work. For example:

```javascript
import React, { useState } from 'react';
import TestPureChild from "./TestPureChild";

function TestComponent() {
  const [children, setChildren] = useState(['A', 'B', 'C', 'D', 'E']);

  const deleteChild = (child) => {
    setChildren(children.filter(c => c !== child));
  };

  return (
    <div className="TestComponent">
      {children.map(c => <TestPureChild key={c} id={c} delete={deleteChild} />)}
    </div>
  );
}

export default TestComponent;
```

I'm guessing it has something to do with `useState` but I have not been able to figure out how to do this with both components being functions in my use case.

See also [Robin Wieruch's example](https://www.robinwieruch.de/react-memo/).

