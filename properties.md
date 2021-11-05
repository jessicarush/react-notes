# Properties (props)

## Table of Contents

<!-- toc -->

- [Introduction example](#introduction-example)
- [Props are Immutable](#props-are-immutable)
- [Props can be many types of data](#props-can-be-many-types-of-data)
- [Default properties](#default-properties)

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
        <p>Welcome {this.props.name}.</p>
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
