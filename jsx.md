# JSX

## Table of Contents

<!-- toc -->

- [Introduction](#introduction)
- [Rules](#rules)
- [Commenting](#commenting)
- [Javascript in JSX](#javascript-in-jsx)
  * [Functions](#functions)
  * [Conditionals](#conditionals)
  * [Loops](#loops)
- [Keys](#keys)
  * [uuid](#uuid)
- [Breaking code into chunks](#breaking-code-into-chunks)

<!-- tocstop -->

## Introduction

React components have a render function that specifies what the HTML output of the React component will be. *JavaScript Syntax eXtension* or *JavaScript XML* (JSX), is a React extension that allows us to write JavaScript that looks like HTML.


## Rules

JSX isn't legal JavaScript syntax. In order for our browser to translate this JSX syntax, we need to use/include the *babel* transpiler.

```html
<script src="https://unpkg.com/babel-standalone"></script>
```

You don't need to use JSX to write React, but it makes the code much simpler and easier to read. Fundamentally, JSX just provides *syntactic sugar* for the `React.createElement(component, props, ...children)` function.

For example, this JSX:

```javascript
<div className="sidebar">Hello</div>
```

compiles into this javascript:
```javascript
React.createElement(
  'div',
  {className: 'sidebar'},
  'Hello'
)
```
Note at <https://babeljs.io/repl> you can type in your JSX code to see what it actually transpiles to.

JSX is much more strict than HTML in that if the html element doesn't have an explicit closing tag, you *must* include the `/` at the end of the standalone tag. e.g `<input type="text" />`.

We should also always stick with double quotes when typing attributes or properties (see [properties.md](properties.md)).

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
```

## Commenting

If you want to write comments in your components, JSX requires that you use multiline JS/css style but wrapped in curly braces like so `{/* comment */}`:

```javascript
class App extends React.Component {
  render() {
    return (
      <div>
        {/* Here's my comment */}
        <Welcome name="Jessica" day="Thursday"/>
      </div>
    );
  }
}
```


## Javascript in JSX

You can include JavaScript expressions in JSX by using curly braces, for example:

```javascript
class JSXDemo extends React.Component {
  render() {
    return (
      <div>
        <h1>My number is {2 * 8}</h1>
      </div>
    );
  }
}
```

These curly braces can be used to call functions, run loops, conditionals, etc.

### Functions

```javascript
function getColor() {
  const colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'aquamarine',
    'purple'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

class JSXDemo extends React.Component {
  render() {
    return (
      <div>
        <h1>My color is {getColor()}</h1>
      </div>
    );
  }
}

ReactDOM.render(<JSXDemo />, document.getElementById('root'));
```

### Conditionals

[This article](https://blog.logrocket.com/conditional-rendering-in-react-c6b0e5af381e/) looks at 8 different ways of rendering with conditionals (e.g if/else, ternary operator, short-circuiting, etc).

Here's an example of the ternary operator:

```javascript
function getNum() {
  return Math.floor(Math.random() * 10) + 1;
}

class JSXDemo extends React.Component {
  render() {
    const num = getNum();
    return (
      <div>
        <h1>My number is... {num}</h1>
        <p>{num === 7 ? 'Woot!' : 'Meh.'}</p>
      </div>
    );
  }
}

ReactDOM.render(<JSXDemo />, document.getElementById('root'));
```

An example of short-circuiting, if we wanted to display an image only if the number if 7:

```javascript
function getNum() {
  return Math.floor(Math.random() * 10) + 1;
}

class JSXDemo extends React.Component {
  render() {
    const num = getNum();
    return (
      <div>
        <h1>My number is... {num}</h1>
        <p>{num == 7 ? 'Woot!' : 'Meh.'}</p>
        {num === 7 && <img src="img/photo.jpg" />}
      </div>
    );
  }
}

ReactDOM.render(<JSXDemo />, document.getElementById('root'));
```

This example uses an if/else to set a variable containing content. The content is then added at the end. Note that even in this variable (msg), we can return only one element. In other words, multiple elements should be wrapped in one.

```javascript
function getNum() {
  return Math.floor(Math.random() * 10) + 1;
}

class JSXDemo extends React.Component {
  render() {
    const num = getNum();
    let msg;
    if (num === 7) {
      msg =
        <div>
          <p>'Woot!'</p>
          <img src="img/photo.jpg" />
        </div>
    } else {
      <p>'Meh.'</p>
    }
    return (
      <div>
        <h1>My number is... {num}</h1>
        {msg}
      </div>
    );
  }
}

ReactDOM.render(<JSXDemo />, document.getElementById('root'));
```

### Loops

The most common way to loop in JSX is to use the `array.map()` function. For example lets say I'm passing properties into a component:

```javascript
class App extends React.Component {
  render() {
    return (
      <div>
        <Messages
          name="Jessica"
          msgs = {[
            {id: 1, text: 'Great'},
            {id: 2, text: 'Awesome'},
            {id: 3, text: 'Fantastic'},
            {id: 4, text: 'Super'}
          ]}
        />
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));
```

In the component I could use map to loop through the msgs:

```javascript
class Messages extends React.Component {
  render() {
    const { name, msgs } = this.props;
    return (
      <ul>
        <li>{ name }</li>
        { msgs.map(m => <li>{m.text}</li>) }
      </ul>
    );
  }
}
```

## Keys

Note that with the above, you'll get a **Warning** in the console that reads: `Warning: Each child in a list should have a unique "key" prop`.

The reason for this is...

> Keys help React identify which items have changed, are added, or are removed. Keys should be given to the elements inside the array to give the elements a stable identity

Using the example above, the solution is:
```javascript
// ...
        { msgs.map(m => <li key={m.id}>{m.text}</li>) }
// ...
```

Note that this seems to happen as a result of using `map()`. In the following example I received the same warning:

```javascript
<div className="Pokedex">

  {this.props.pokemon.map(p => (
    <Pokecard name={p.name} type={p.type} exp={p.base_experience} />
  ))}

</div>
```

When I add a key property, provided the key is unique, react will be satisfied. I this case, the names will always be unique, so they can be used for keys:

```javascript
<div className="Pokedex">

  {this.props.pokemon.map(p => (
    <Pokecard key={p.name} name={p.name} type={p.type} exp={p.base_experience} />
  ))}

</div>
```

### uuid

In the event that you don't have any obvious, easy id or name to use for keys, there are a couple of options. The first is to use the index number of the item. This index number can be accessed automatically as the second argument to the `map()` method:

```javascript
const todoItems = todos.map((todo, index) =>
  // Only do this as a last resort
  <li key={index}>{todo.text}</li>
);
```

> We don’t recommend using indexes for keys if the order of items may change. This can negatively impact performance and may cause issues with component state.

Instead, we can use an external library to help: [uuid](https://www.npmjs.com/package/uuid)

First you would need to install it:

```bash
npm install uuid
```

Then import it using the id version type of your choice. For example, v1 is a timestamp, v4 is random.

```javascript
import uuid from 'uuid/v4';
```

Then use the function call to generate it:

```javascript
let todos = [
  {id: uuid(), text: 'Water plants'},
  {id: uuid(), text: 'Get milk'}
]

const todoItems = todos.map(todo =>
  <li key={todo.id}>{todo.text}</li>
);
```


## Breaking code into chunks

With map rendered components the `render()` method of the parent component can get pretty long. Feel free to pull any sections out into their own functions or variables to help organize your code better. For example:

```javascript
class TestComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {id: 1, name: 'cream', qty: '3 cartons'},
        {id: 2, name: 'broccoli', qty: '1 bunch'},
        {id: 3, name: 'cucumber', qty: '2'}
      ]
    };
  }

  renderItems() {
    return (
      <ul>
        {this.state.items.map(item =>
          <li key={item.id}>{item.name} - {item.qty}</li>
        )}
      </ul>
    );
  }

  render() {
    return (
      <div>
        {this.renderItems()}
      </div>
    );
  }
}
```

Alternatively:
```javascript
class TestComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {id: 1, name: 'cream', qty: '3 cartons'},
        {id: 2, name: 'broccoli', qty: '1 bunch'},
        {id: 3, name: 'cucumber', qty: '2'}
      ]
    };
  }

  render() {
    const listItems = this,state.items.map(item =>
      <li key={item.id}>{item.name} - {item.qty}</li>
    );
    return (
      <div>
        <ul>
          {listItems}
        </ul>
      </div>
    );
  }
}
```

## Conditionally render content

Style-wise, there's a number of ways to conditionally render elements. For example, you could render one or another variable using the conditional operator:

```javascript
render() {
  const todo = (
    <div className="Todo">
      ...etc...
    </div>
  );
  const todoEdit = (
    <form className="Todo" onSubmit={this.handleSubmit}>
      ...etc...
    </form>
  );

  return this.props.editing === true ? todoEdit : todo;
}
```

Or, you could use if/else to set a single variable:

```javascript
render() {
  let result;
  if (this.props.editing) {
    result = (
      <div className="Todo">
        ...etc...
      </div>
    );
  } else {
    result = (
      <form className="Todo" onSubmit={this.handleSubmit}>
        ...etc...
      </form>
    );
  }

  return result;
}
```
