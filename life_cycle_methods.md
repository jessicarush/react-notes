# React Lifecycle Methods

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Mounting](#mounting)
  * [constructor](#constructor)
  * [getDerivedStateFromProps](#getderivedstatefromprops)
  * [render](#render)
  * [componentDidMount](#componentdidmount)
- [Updating](#updating)
  * [getDerivedStateFromProps](#getderivedstatefromprops-1)
  * [shouldComponentUpdate](#shouldcomponentupdate)
  * [render](#render-1)
  * [getSnapshotBeforeUpdate](#getsnapshotbeforeupdate)
  * [componentDidUpdate](#componentdidupdate)
- [Unmounting](#unmounting)
  * [componentWillUnmount](#componentwillunmount)
- [Lifecycle methods in Function Components](#lifecycle-methods-in-function-components)

<!-- tocstop -->

## Introduction

Every component has access to methods that allow you to update application state to reflect UI changes before & after React "events". More specifically, each component in React has a *lifecycle* which you can monitor and manipulate during its three main phases: **Mounting**, **Updating**, and **Unmounting**.


## Mounting

Mounting refers to the initial rendering of elements into the DOM.

React has four built-in methods that get called, in this order, when mounting a component:

1. `constructor()`
2. static `getDerivedStateFromProps()`
3. `render()`
4. `componentDidMount()`

The `render()` method is required and will always be called, the others are optional and will be called if you define them.

### constructor

The `constructor()` method is called first, when the component is initiated, and it is the natural place to set up the initial state and other initial values. The `constructor()` method is called with the `props`, as arguments, and you should always start by calling `super(props)` before anything else, this will initiate the parent's constructor method and allows the component to inherit methods from `React.Component`.

```javascript
class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {color: "red"};
  }
  render() {
    return (
      <h1>My favourite color is {this.state.color}</h1>
    );
  }
}
```

### getDerivedStateFromProps

The `getDerivedStateFromProps()` method is called right before rendering the element(s) in the DOM. This is the natural place to set the state object based on the initial props. It takes state as an argument, and returns an object with changes to the state.

> This method exists for rare use cases where the state depends on changes in props over time. For example, it might be handy for implementing a `<Transition>` component that compares its previous and next children to decide which of them to animate in and out.

The example below starts with the color being "red", but the `getDerivedStateFromProps()` method updates the  color based on the `favcol` attribute:

```javascript
class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {color: "red"};
  }
  static getDerivedStateFromProps(props, state) {
    return {color: props.favcol };
  }
  render() {
    return (
      <h1>My favourite color is {this.state.color}</h1>
    );
  }
}
```

### render

The `render()` method is required, and is the method that outputs HTML to the DOM.

### componentDidMount

The `componentDidMount()` method is called after the component is rendered. This is where you run statements that require that the component is already placed in the DOM (for example to load AJAX data: see [ajax.md](ajax.md)). Note that if you were to call `setState()` here, it would actually trigger a re-render (update).

```javascript
class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {color: "red"};
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({color: "yellow"})
    }, 2000);
  }
  render() {
    return (
      <h1>My favourite color is {this.state.color}</h1>
    );
  }
}
```

## Updating

The next phase in the lifecycle is when a component is updated. A component is updated whenever there is a change in the component's *props*, *state* using `setState()`, or by using the `forceUpdate()` method.

React has five built-in methods that are called, in this order, when a component is updated:

1. static `getDerivedStateFromProps()`
2. `shouldComponentUpdate()`
3. `render()`
4. `getSnapshotBeforeUpdate()`
5. `componentDidUpdate()`

As with mounting, the `render()` method is the only one that is required and will always be called.

### getDerivedStateFromProps

The first method that's called when a component gets updated.

The example below has a button that changes the favourite color to blue, but since the `getDerivedStateFromProps()` method is called, the favourite color is rendered with the color from `props.favcol`.

```javascript
class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {color: "red"};
  }
  static getDerivedStateFromProps(props, state) {
    return {color: props.favcol };
  }
  changeColor = () => {
    this.setState({color: "blue"});
  }
  render() {
    return (
      <div>
        <h1>My favourite color is {this.state.color}</h1>
        <button type="button" onClick={this.changeColor}>Change color</button>
      </div>
    );
  }
}
```

### shouldComponentUpdate

In the `shouldComponentUpdate()` method you can return a Boolean value that specifies whether React should continue with the rendering or not. The default value is `true`. If you were to simply return `false`, the component wouldn't update at all.

```javascript
class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = {color: "red"};
  }
  shouldComponentUpdate() {
    return false;
  }
  changeColor = () => {
    this.setState({color: "blue"});
  }
  render() {
    return (
      <div>
        <h1>My favourite color is {this.state.color}</h1>
        <button type="button" onClick={this.changeColor}>Change color</button>
      </div>
    );
  }
}
```

### render

The `render()` method is of course called when a component actually gets updated, it has to re-render the HTML to the DOM, with the new changes.

### getSnapshotBeforeUpdate

In the `getSnapshotBeforeUpdate()` method you have access to the `props` and `state` before the update, meaning that even after the update, you can check what the values were before the update. If the `getSnapshotBeforeUpdate()` method is present, you should also include the `componentDidUpdate()` method, otherwise you will get an error.

```javascript
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {color: "red"};
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {
   document.getElementById("p1").innerHTML =
   "Before the update, the favorite was " + prevState.color;
  }
  componentDidUpdate() {
    document.getElementById("p2").innerHTML =
    "After the update, the favorite was " + this.state.color;
  }
  changeColor = () => {
    this.setState({color: "blue"});
  }
  render() {
    return (
      <div>
        <h1>My favourite color is {this.state.color}</h1>
        <button type="button" onClick={this.changeColor}>Change color</button>
        <p id="p1"></p>
        <p id="p2"></p>
      </div>
    );
  }
}
```

### componentDidUpdate

The `componentDidUpdate()` method is called after the component is updated in the DOM. This can be a good place to perform any *side effect* operations like syncing to localStorage or a database, auto-saving or updating the DOM if working with [uncontrolled from components](https://reactjs.org/docs/uncontrolled-components.html). This method also has access to `prevProps` and `prevState`. Reminder, a component will update if:

- `setState()` has been called
- new `props` have been passed in from the parent component
- `forceUpdate()` has been called


```javascript
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {color: "red"};
  }
  componentDidUpdate(prevProps, prevState) {
    console.log('Updated!');
    console.log(`previous color: ${prevState.color}`);
  }
  changeColor = () => {
    this.setState({color: "blue"});
  }
  render() {
    return (
      <div>
        <h1>My favourite color is {this.state.color}</h1>
        <button type="button" onClick={this.changeColor}>Change color</button>
      </div>
    );
  }
}
```


## Unmounting

The next phase in the lifecycle is when a component is removed from the DOM. React calls this *unmounting*.

React has only one built-in method that gets called when a component is unmounted:

- `componentWillUnmount()`

### componentWillUnmount

The `componentWillUnmount()` method is called when the component is about to be removed from the DOM. This is a good place to perform *cleanup* actions such as invalidating timers, canceling network requests, or cleaning up any subscriptions that were created in `componentDidMount()`.

*Parent component*

```javascript
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {showChild: true};
  }
  removeChild = () => {
    this.setState({showChild: false});
  }
  render() {
    let child;
    if (this.state.showChild) {
      child = <Child />;
    }
    return (
      <div>
        {child}
        <button type="button" onClick={this.removeChild}>Remove child</button>
      </div>
    );
  }
}
```

*Child component*

```javascript
class Child extends Component {
  componentWillUnmount() {
    alert("The Child component is about to be unmounted.");
  }
  render() {
    return (
      <h1>Child</h1>
    );
  }
}
```


## Lifecycle methods in Function Components

In functional components, the `useEffect()` hook can be used to replicate lifecycle behavior.

> If you’re familiar with React class lifecycle methods, you can think of useEffect Hook as componentDidMount, componentDidUpdate, and componentWillUnmount combined.

See [Using the Effect hook](https://reactjs.org/docs/hooks-effect.html) in the React docs.

```javascript
import React, { useEffect } from 'react';

function Example(props) {

  // componentDidMount (note the empty array)
  useEffect(() => {
    console.log('I have been mounted')
  }, [])

  return (
    <div className="Example"></div>
  );
}
```

If you wanted the useEffect code to run whenever there was an update of any kind, you would pass nothing as the dependency:

```javascript
import React, { useEffect } from 'react';

function Example(props) {

  // componentDidMount and componentDidUpdate
  useEffect(() => {
    console.log('I will run whenever anything changes')
  })

  return (
    <div className="Example"></div>
  );
}
```

If you need the function/code to update when a state value is updated, pass that value in as a dependency:

```javascript
import React, { useState, useEffect } from 'react';

function Example(props) {
  const [name, setName] = useState('');

  // componentDidUpdate
  useEffect(() => {
    console.log('I will run whenever name changes')
  }, [name])

  return (
    <div className="Example"></div>
  );
}
```

Lastly...

```javascript
import React, { useState, useEffect } from 'react';

function Example(props) {
  const [name, setName] = useState('');

  // componentWillUnmount
  useEffect(() => {
    return () => {
     console.log('I am unmounting')
    }
  }, [name])

  return (
    <div className="Example"></div>
  );
}
```

See also: [hooks.md]

