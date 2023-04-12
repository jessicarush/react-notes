# Properties (props)

> :warning: When I started learning React, it was all class components. As a result, the examples here use class components. I have left them in tact in case I ever have to deal with legacy code. That being said, the concepts are basically the same and when necessary, I've added function component examples as well and/or links to other notes.

## Table of Contents

<!-- toc -->

- [Introduction example](#introduction-example)
- [Props are Immutable](#props-are-immutable)
- [Props can be many types of data](#props-can-be-many-types-of-data)
- [Default properties](#default-properties)
- [Passing object as props with `...`](#passing-object-as-props-with-)

<!-- tocstop -->

## Introduction example

Properties are what we use to make a component configurable.

You can pass properties to a component like you would an attribute value pair:

```javascript
class App extends React.Component {
  render() {
    return (
      <div>
        <Welcome name="Jessica" day="Thursday" />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
```

You can access all the properties passed to a component via `this.props`:

```javascript
class Welcome extends React.Component {
  render() {
    // logs the property object which lists all the properties:
    console.log(this.props);  
    return (
      <div>
        <p>Welcome {this.props.name}, happy {this.props.day}.</p>
      </div>
    );
  }
}
```

To avoid typing `this.props` over and over, some people will assign it to a variable, for example:

```javascript
class Welcome extends React.Component {
  render() {
    const props = this.props;  
    return (
      <div>
        <p>Welcome {props.name}, happy {props.day}.</p>
      </div>
    );
  }
}
```

Similarly, you could *unpack* the variables with ES6 destructuring, for example:

```javascript
class Welcome extends React.Component {
  render() {
    const {name, day} = this.props;  
    return (
      <div>
        <p>Welcome {name}, happy {day}.</p>
      </div>
    );
  }
}
```

It's even tidier in functional components:

```javascript
function Welcome(props) {
  // logs the property object which lists all the properties:
  console.log(props);
  return (
    <div>
      <p>Welcome {props.name}, happy {props.day}.</p>
    </div>
  );
}
```

or:

```javascript
function Welcome(props) {
  const {name, day} = props;
  return (
    <div>
      <p>Welcome {name}, happy {day}.</p>
    </div>
  );
}
```

or: 

```javascript
function Welcome({name, day}) {
  return (
    <div>
      <p>Welcome {name}, happy {day}.</p>
    </div>
  );
}
```


## Props are Immutable

One major thing to note is that properties passed to components are immutable. In other words, you cannot assign a new value to them, they are read-only.


## Props can be many types of data

Properties passed in don't have to be strings, they can be numbers, booleans, arrays, expressions, ... For all these other types we use curly braces:

```javascript
class App extends React.Component {
  render() {
    return (
      <div>
        <Welcome
          name="Jessica"
          num={7}
          data={['one', 2, 3, 'four']}
          isSomething
          isAnotherThing={false}
          url="https://images.unsplash.com/photo-1564935915760-e6de3c1f2b95?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80"
        />
      </div>
    );
  }
}
```

Note that for `true` values, you don't need to assign a value at all. For example `isSomething` is the same as `isSomething={true}`.

To review; these properties can be placed anywhere using the same curly braces:

```javascript
class Welcome extends React.Component {
  render() {
    return (
      <div>
        <p>Welcome {this.props.name}</p>
        <img src={this.props.url} />
      </div>
    );
  }
}
```

## Default properties

Components can specify default values for properties.
To set default properties in a component:

```javascript
class Welcome extends React.Component {
  static defaultProps = {
    name: "human",
    color: "red",
    num: 5
  };
  render() {
    return (
      <div>
        <p>Welcome {this.props.name}</p>
        <p>number: {this.props.num}</p>
        <p>color: {this.props.color}</p>
      </div>
    );
  }
}
```

This component will now use the default values when the properties are missing:

```javascript
class App extends React.Component {
  render() {
    return (
      <div>
        <Welcome name="Jessica" />
        <Welcome name="Scott" num={13} color="orange" />
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));
```

In functional components, it's even tidier:

```javascript
function Welcome({name='human', num=5, color='red'}) {
  return (
    <div>
        <p>Welcome {name}</p>
        <p>number: {num}</p>
        <p>color: {color}</p>
      </div>
  );
}
```


## Passing object as props with `...`

Note if you have an object like:

```javascript
let palette = {
  paletteName: "Material UI Colors",
  id: "material-ui-colors",
  colors: [
    { name: "red", color: "#F44336" },
    { name: "pink", color: "#E91E63" },
    { name: "purple", color: "#9C27B0" },
  ]
};
```

You can pass it in as individual properties like:

```javascript
<Palette {...palette} />
```
