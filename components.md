# Components

Components are the building blocks of React.

> Components let you split the UI into independent, reusable pieces, and think about each piece in isolation.

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Class-based components](#class-based-components)
- [Function-based components](#function-based-components)

<!-- tocstop -->

## Introduction

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

ReactDOM.render(<Welcome/>, document.getElementById('root'));
```

Note that in the render function inside the class, you can only return one element. Therefor, if you're actually creating a bunch of elements, they should all be wrapped in one, e.g. a <div>:

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

ReactDOM.render(<Welcome/>, document.getElementById('root'));
```

## Function-based components

Historically these were used for simpler components as there were some things you couldn't do with function components that you could only do with classes including *state* and *lifecycle methods*. React v16.8 (released September, 2017) introduced *hooks*, which allow function-based components to have all the same features as class-based ones. More on hooks later.

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

ReactDOM.render(<Welcome/>, document.getElementById('root'));
```
